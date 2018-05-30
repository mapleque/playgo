package playgo

type WB bool

const (
	WB_BLACK WB = false
	WB_WHITE    = true
)

type Game struct {
	passing bool

	Users        []string `json:"users"`
	Player1      string   `json:"player1"`
	Player2      string   `json:"player2"`
	Token        string   `json:"token"`
	TotalChesses []*Chess `json:"total_chesses"`
	AliveChesses []*Chess `json:"alive_chesses"`
	DiedChesses  []*Chess `json:"died_chesses"`
	Turn         WB       `json:"turn"`
	IsFinish     bool     `json:"is_finish"`
	IsGiveup     bool     `json:"is_giveup"`
	GiveupWB     WB       `json:"giveup"` // who giveup,avilable when IsGiveup is true
}

type Chess struct {
	Sequence int `json:"sequence"`
	X        int `json:"x"`
	Y        int `json:"y"`
	WB       WB  `json:"wb"`
}

func NewChess(seq, x, y int, wb WB) *Chess {
	return &Chess{seq, x, y, wb}
}

func NewGame(token string) *Game {
	return &Game{
		Users:        []string{token},
		Token:        token,
		Player1:      token,
		Player2:      "",
		TotalChesses: []*Chess{},
		AliveChesses: []*Chess{},
		DiedChesses:  []*Chess{},
		Turn:         WB_BLACK,
	}
}

func (this *Game) sync(conn Connector) {
	conn.PushGame(this.Users, this)
}

func (this *Game) Enter(token string) {
	this.Users = append(this.Users, token)
	if this.Player2 == "" {
		this.Player2 = token
	}
}

func (this *Game) Do(token string, x, y int) {
	wb := this.who(token)
	if this.illegal(wb, x, y) {
		panic("invalid x y")
	}
	this.TotalChesses = append(this.TotalChesses, NewChess(len(this.TotalChesses)+1, x, y, wb))
	this.passing = false
	this.Turn = !this.Turn
	this.processChesses()
}

func (this *Game) Pass(token string) {
	wb := this.who(token)
	if this.passing {
		this.result(wb)
		return
	}
	this.Turn = !this.Turn
	this.passing = true
}

func (this *Game) Giveup(token string) {
	wb := this.who(token)
	this.giveup(wb)
}

func (this *Game) Back(token string) {
	wb := this.who(token)
	l := len(this.TotalChesses)
	if l < 1 {
		panic("can not back")
	}
	if this.TotalChesses[l-1].WB != wb {
		this.TotalChesses = this.TotalChesses[:l-1]
	}
	l = len(this.TotalChesses)
	if l > 0 && this.TotalChesses[l-1].WB == wb {
		this.TotalChesses = this.TotalChesses[:l-1]
	}
	this.passing = false
	this.processChesses()
}

func (this *Game) who(token string) WB {
	if this.Player1 == token || this.Player2 == token {
		return this.Player2 == token
	}
	panic("invalid token")
}

func (this *Game) illegal(wb WB, x, y int) bool {
	return false // FIXME just for test
}

func (this *Game) processChesses() {
	this.AliveChesses = this.TotalChesses // FIXME just for test
}

func (this *Game) result(wb WB) {
	this.IsFinish = true
}

func (this *Game) giveup(wb WB) {
	this.IsGiveup = true
	this.IsFinish = true
	this.GiveupWB = wb
}
