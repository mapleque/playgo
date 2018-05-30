package playgo

type Connector interface {
	BroadcastGameList(data interface{})
	PushGame(users []string, data interface{})
}

type GameCenter struct {
	gameMap map[string]*Game
	conn    Connector
}

func NewGameCenter(conn Connector) *GameCenter {
	return &GameCenter{
		gameMap: map[string]*Game{},
		conn:    conn,
	}
}

func (this *GameCenter) NewGame(token string) string {
	game := NewGame(token)
	this.gameMap[token] = game
	this.SyncGameList()
	return game.Token
}

func (this *GameCenter) SyncGameList() {
	gameList := []*Game{}
	for _, game := range this.gameMap {
		gameList = append(gameList, game)
	}
	this.conn.BroadcastGameList(map[string]interface{}{"list": gameList})
}

func (this *GameCenter) Enter(gameToken, userToken string) {
	if game, exist := this.gameMap[gameToken]; exist {
		game.Enter(userToken)
		game.sync(this.conn)
		this.SyncGameList()
	}
}

func (this *GameCenter) Do(gameToken, userToken string, x, y int) {
	if game, exist := this.gameMap[gameToken]; exist {
		game.Do(userToken, x, y)
		game.sync(this.conn)
	}
}

func (this *GameCenter) Pass(gameToken, userToken string) {
	if game, exist := this.gameMap[gameToken]; exist {
		game.Pass(userToken)
		game.sync(this.conn)
	}
}

func (this *GameCenter) Giveup(gameToken, userToken string) {
	if game, exist := this.gameMap[gameToken]; exist {
		game.Giveup(userToken)
		game.sync(this.conn)
	}
}

func (this *GameCenter) Back(gameToken, userToken string) {
	if game, exist := this.gameMap[gameToken]; exist {
		game.Back(userToken)
		game.sync(this.conn)
	}
}
