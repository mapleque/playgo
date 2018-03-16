package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"golang.org/x/net/context"
	"golang.org/x/net/websocket"
	"google.golang.org/grpc"
)

func RunWsGateway(serveAddr, serverAddr string) {
	// connect to grpc server
	conn, err := grpc.Dial(serverAddr, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("failed to dial server %v", err)
	}
	defer conn.Close()

	client := NewPlaygoServiceClient(conn)
	stream, err := client.Operation(context.Background())
	if err != nil {
		log.Fatalf("failed to call method operation %v", err)
	}

	// run a websocket serve
	http.Handle("/", websocket.Handler(func(ws *websocket.Conn) {
		go func() {
			for {
				message, err := stream.Recv()
				if err == io.EOF {
					break
				}
				if err != nil {
					log.Fatalf("failed to receive from server %v", err)
				}
				if err := websocket.Message.Send(ws, encodeWsMessage(message)); err != nil {
					log.Printf("failed to write websocket %v", err)
					break
				}
			}
		}()
		for {
			var message string
			err := websocket.Message.Receive(ws, &message)
			if err == io.EOF {
				break
			}
			if err != nil {
				log.Printf("failed to read websocket %v", err)
				break
			}
			op, err := wrapperOperationRequest(message)
			if err != nil {
				log.Printf("failed to wrapper op %v", message)
				break
			}
			if err := stream.Send(op); err != nil {
				log.Printf("failed to send data to method operation %v", err)
				break
			}
		}
	}))
	log.Printf("goplay web socket server listen on: ws://%v/", serveAddr)
	if err := http.ListenAndServe(serveAddr, nil); err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
}

func encodeWsMessage(message interface{}) string {
	enc, _ := json.Marshal(message)
	return string(enc)
}

func wrapperOperationRequest(message string) (*OperationRequest, error) {
	log.Printf("receive message %s", message)
	op := &OperationRequest{}
	if err := json.Unmarshal([]byte(message), op); err != nil {
		return nil, err
	}
	return op, nil
}
