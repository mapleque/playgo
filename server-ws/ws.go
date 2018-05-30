package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/mapleque/playgo"
	"golang.org/x/net/websocket"
)

type RequestType string

const (
	RequestType_CONNECT RequestType = "connect"
	RequestType_NEW                 = "new"
	RequestType_ENTER               = "enter"
	RequestType_DO                  = "do"
	RequestType_PASS                = "pass"
	RequestType_GIVEUP              = "giveup"
	RequestType_BACK                = "back"
)

type ResponseType string

const (
	ResponseType_GAME      ResponseType = "game"
	ResponseType_GAME_LIST              = "game_list"
)

type PlaygoRequestProto struct {
	Type RequestType
	Data json.RawMessage
}

type PlaygoResponseProto struct {
	Type  ResponseType `json:"type"`
	Data  interface{}  `json:"data"`
	Token string       `json:"token"`
}

type WsServer struct {
	pool   map[string]*user
	playgo *playgo.GameCenter
}

func NewWsServer() *WsServer {
	server := &WsServer{
		pool: map[string]*user{},
	}
	service := playgo.NewGameCenter(server)
	server.playgo = service
	return server
}

func (this *WsServer) randToken() string {
	timestamp := []byte(strconv.FormatInt(time.Now().Unix(), 10))
	prefix := []byte(strconv.Itoa(rand.Intn(10000)))
	surfix := []byte(strconv.Itoa(rand.Intn(10000)))
	h := md5.New()
	h.Write(bytes.Join([][]byte{prefix, timestamp, surfix}, []byte("")))
	data := h.Sum(nil)
	dst := make([]byte, hex.EncodedLen(len(data)))
	hex.Encode(dst, data)
	token := string(dst)
	// to avoid duplicate
	if _, exist := this.pool[token]; exist {
		return this.randToken()
	}
	return token
}

type user struct {
	token string
	game  string
	ws    *websocket.Conn
}

func (this *WsServer) Run(serveAddr string) {
	http.Handle("/", websocket.Handler(func(ws *websocket.Conn) {
		// save in conn pool
		u := &user{
			token: this.randToken(),
			ws:    ws,
		}
		log.Printf("web socket connect %v\n", u.token)
		this.pool[u.token] = u
		// playgo recieve message
		this.playgo.SyncGameList()
		this.serve(u)
		log.Printf("web socket disconnect %v\n", u.token)
		delete(this.pool, u.token)
		ws.Close()
	}))
	log.Printf("goplay web socket server listen on: ws://%v/\n", serveAddr)
	if err := http.ListenAndServe(serveAddr, nil); err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
}

func bind(param interface{}, raw json.RawMessage) {
	data, _ := raw.MarshalJSON()
	if err := json.Unmarshal(data, param); err != nil {
		panic(err)
	}
}

type GameParam struct {
	GameToken string `json:"game_token"`
}

type DoParam struct {
	X int `json:"x"`
	Y int `json:"y"`
}

func (this *WsServer) serve(u *user) {
	for {
		var message string
		err := websocket.Message.Receive(u.ws, &message)
		log.Printf("receive message %s\n", message)
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("failed to read websocket %v\n", err)
			break
		}
		req := &PlaygoRequestProto{}
		if err := json.Unmarshal([]byte(message), req); err != nil {
			log.Printf("failed to decode message %v\n", err)
		} else {
			switch req.Type {
			case "new":
				u.game = this.playgo.NewGame(u.token)
				log.Printf("%s new game %s", u.token, u.game)
			case "enter":
				// get enter param
				param := &GameParam{}
				bind(param, req.Data)
				u.game = param.GameToken
				this.playgo.Enter(u.game, u.token)
				log.Printf("%s enter game %s", u.token, u.game)
			case "do":
				param := &DoParam{}
				bind(param, req.Data)
				this.playgo.Do(u.game, u.token, param.X, param.Y)
			case "back":
				this.playgo.Back(u.game, u.token)
			case "pass":
				this.playgo.Pass(u.game, u.token)
			case "giveup":
				this.playgo.Giveup(u.game, u.token)
			default:
				log.Printf("unregist proto type %s\n", req.Type)
			}
		}
	}
}

func resp(respType ResponseType, data interface{}, token string) string {
	ret, _ := json.Marshal(&PlaygoResponseProto{respType, data, token})
	return string(ret)
}

// BroadcastGameList implement playgo.Connector
func (this *WsServer) BroadcastGameList(data interface{}) {
	for token, u := range this.pool {
		if err := websocket.Message.Send(u.ws, resp(ResponseType_GAME_LIST, data, token)); err != nil {
			log.Printf("failed to broadcase gamelist to %s cause of %v\n", token, err)
		}
	}
}

// PushGame implement playgo.Connector
func (this *WsServer) PushGame(users []string, data interface{}) {
	for _, token := range users {
		if u, exist := this.pool[token]; exist {
			if err := websocket.Message.Send(u.ws, resp(ResponseType_GAME, data, token)); err != nil {
				log.Printf("failed to sync game to %s cause of %v\n", token, err)
			}
		} else {
			log.Printf("user %s connection was broken\n", token)
		}
	}
}

func main() {
	server := NewWsServer()
	server.Run("0.0.0.0:9998")
}
