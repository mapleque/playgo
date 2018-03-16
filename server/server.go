package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net"
	"strconv"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type PlaygoGrpcServer struct {
	Signal chan int64
	Sets   sync.Map
}

func RunGrpcServer(addr string) {
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	pgs := NewPlaygoGrpcServer()
	RegisterPlaygoServiceServer(grpcServer, pgs)
	reflection.Register(grpcServer)
	log.Printf("goplay grpc server listen on: %v", addr)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to server: %v", err)
	}
}

func NewPlaygoGrpcServer() *PlaygoGrpcServer {
	return &PlaygoGrpcServer{
		Signal: make(chan int64),
	}
}

func NewFrame() *Frame {
	// rand a token
	timestamp := []byte(strconv.FormatInt(time.Now().Unix(), 10))
	prefix := []byte(strconv.Itoa(rand.Intn(10000)))
	surfix := []byte(strconv.Itoa(rand.Intn(10000)))
	src := bytes.Join([][]byte{prefix, timestamp, surfix}, []byte(""))
	h := md5.New()
	h.Write(src)
	data := h.Sum(nil)
	dst := make([]byte, hex.EncodedLen(len(data)))
	hex.Encode(dst, data)
	token := string(dst)

	return &Frame{
		Token:   token,
		Steps:   []*Chess{},
		Chesses: []*Chess{},
		Next:    Turn_BLACK,
		Giveup:  Turn_EMPTY,
		Pass:    Turn_EMPTY,
	}
}

func (this *PlaygoGrpcServer) Operation(stream PlaygoService_OperationServer) error {
	for {
		op, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		var setHandle *Frame
		switch op.Cmd {
		case Cmd_CREATE:
			setHandle = NewFrame()
			this.Sets.Store(setHandle.Token, setHandle)
		default:
			if set, exist := this.Sets.Load(op.Token); exist {
				setHandle = set.(*Frame)
				if err := setHandle.do(op); err != nil {
					// error
					stream.Send(setHandle.buildErrorFrame(FrameResponse_UNKNOW, err.Error()))
				}
				this.Sets.Store(setHandle.Token, setHandle)
			} else {
				// error
				stream.Send(setHandle.buildErrorFrame(FrameResponse_UNKNOW, "can not find set with token "+op.Token))
			}
		}
		// success
		stream.Send(setHandle.buildFrame())
	}
	return nil
}

func (this *Frame) buildErrorFrame(code FrameResponse_Code, tips string) *FrameResponse {
	resp := this.buildFrame()
	resp.Code = code
	resp.Tips = tips
	return resp
}

func (this *Frame) buildFrame() *FrameResponse {
	return &FrameResponse{
		Frame: this,
	}
}

func (this *Frame) do(op *OperationRequest) error {
	if this.Next != op.Chess.Who {
		return fmt.Errorf("not your turn now")
	}
	switch op.Cmd {
	case Cmd_PUT:
		if !this.put(op.Chess) {
			return fmt.Errorf("put illegal %v", op)
		}
		this.rerenderChesses()
		this.turn()
	case Cmd_PASS:
		this.pass()
		this.turn()
	case Cmd_GIVEUP:
		this.giveup()
	case Cmd_BACK:
		if !this.back() {
			return fmt.Errorf("no step to back")
		}
		this.rerenderChesses()
	default:
	}
	return nil
}

func (this *Frame) put(chess *Chess) bool {
	if this.illegal(chess) {
		return false
	}
	this.Steps = append(this.Steps, chess)
	this.Pass = Turn_EMPTY
	return true
}

func (this *Frame) back() bool {
	l := len(this.Steps)
	if l < 1 {
		return false
	}
	// back other step
	if this.Steps[l-1].Who != this.Next {
		this.Steps = this.Steps[0 : l-1]
	}
	// back self step
	l = len(this.Steps)
	if l > 0 && this.Steps[l-1].Who == this.Next {
		this.Steps = this.Steps[0 : l-1]
	}
	this.Pass = Turn_EMPTY
	return true
}

func (this *Frame) pass() {
	if this.Pass != Turn_EMPTY {
		this.result()
		return
	}
	this.Pass = this.Next
}

func (this *Frame) turn() {
	switch this.Next {
	case Turn_BLACK:
		this.Next = Turn_WHITE
	case Turn_WHITE:
		this.Next = Turn_BLACK
	default:
		// do nothing
	}
}

func (this *Frame) giveup() {
	// TODO
}

func (this *Frame) illegal(chess *Chess) bool {
	// TODO check step is legal
	return false
}

func (this *Frame) rerenderChesses() {
	// TODO render chesses
}

func (this *Frame) result() {
	// TODO calculate result
}
