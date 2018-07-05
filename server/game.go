package server

import (
	"fmt"
)

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

func (this *Chess) String() string {
	return fmt.Sprintf("(%d %d %d %v) ", this.Sequence, this.X, this.Y, this.WB)
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

func (this *Game) Do(token string, x, y int) error {
	wb := this.who(token)
	if this.Turn != wb {
		return fmt.Errorf("not your turn")
	}
	if this.illegal(wb, x, y) {
		return fmt.Errorf("invalid x y %s %v %d %d", token, wb, x, y)
	}
	curChess := NewChess(len(this.TotalChesses)+1, x, y, wb)
	this.TotalChesses = append(this.TotalChesses, curChess)
	this.AliveChesses = append(this.AliveChesses, curChess)
	this.passing = false
	this.Turn = !this.Turn
	this.processChesses()
	return nil
}

func (this *Game) Pass(token string) error {
	wb := this.who(token)
	if this.Turn != wb {
		return fmt.Errorf("not your turn")
	}
	if this.passing {
		this.result(wb)
		return nil
	}
	this.Turn = !this.Turn
	this.passing = true
	return nil
}

func (this *Game) Giveup(token string) {
	wb := this.who(token)
	this.giveup(wb)
}

func (this *Game) Back(token string) error {
	wb := this.who(token)
	if this.Turn != wb {
		return fmt.Errorf("not your turn")
	}
	l := len(this.TotalChesses)
	if l < 1 {
		return fmt.Errorf("can not back")
	}
	if this.TotalChesses[l-1].WB != wb {
		this.TotalChesses = this.TotalChesses[:l-1]
	}
	l = len(this.TotalChesses)
	if l > 0 && this.TotalChesses[l-1].WB == wb {
		this.TotalChesses = this.TotalChesses[:l-1]
	}
	this.passing = false

	// 这里需要重新走一遍
	cacheChesses := []*Chess{}
	for _, chess := range this.TotalChesses {
		cacheChesses = append(cacheChesses, chess)
	}
	this.AliveChesses = []*Chess{}
	this.DiedChesses = []*Chess{}
	this.TotalChesses = []*Chess{}
	for _, chess := range cacheChesses {
		this.TotalChesses = append(this.TotalChesses, chess)
		this.AliveChesses = append(this.AliveChesses, chess)
		this.processChesses()
	}
	return nil
}

func (this *Game) who(token string) WB {
	if this.Player1 == token || this.Player2 == token {
		return this.Player2 == token
	}
	panic("invalid token")
}

// 判断当前点是否不可以落子
// 可以落子的前提是：
//  当前点无子
//  当前点有气
//  当前点无气但与之连接的一片棋有气
//  当前点落子后可以吃棋
func (this *Game) illegal(wb WB, x, y int) bool {
	currentChess := NewChess(len(this.TotalChesses)+1, x, y, wb)
	aliveChessesMap := buildBoardChesses(this.AliveChesses)
	if aliveChessesMap[x][y] != nil {
		// 当前点有子，显然不能行棋
		return true
	}
	aliveChessesMap[x][y] = currentChess
	// 当前点有气
	if hasBlankAround(aliveChessesMap, x, y) {
		return false
	}
	// 当前点无气但与之连接的一片棋有气
	blockChesses := getBlockChesses(aliveChessesMap, currentChess)
	outlineChesses := getOutlineChesses(aliveChessesMap, blockChesses)
	for _, chess := range outlineChesses {
		if hasBlankAround(aliveChessesMap, chess.X, chess.Y) {
			return false
		}
	}
	//  当前点落子后可以吃棋
	dieChessesGroups := getDieChessesGroups(aliveChessesMap)
	if len(dieChessesGroups) > 1 {
		return false
	}
	return true
}

// 处理当前盘面上的棋子
//  重新计算活棋有哪些
//  重新计算死棋有哪些
func (this *Game) processChesses() {
	if len(this.TotalChesses) < 1 {
		return
	}
	aliveChessesMap := buildBoardChesses(this.AliveChesses)
	dieChessesGroups := getDieChessesGroups(aliveChessesMap)
	lastChess := this.TotalChesses[len(this.TotalChesses)-1]
	for _, dieChesses := range dieChessesGroups {
		// 最后一个落子的棋不是死棋
		if !isIn(dieChesses, lastChess) {
			this.AliveChesses = remove(this.AliveChesses, dieChesses)
			this.DiedChesses = append(this.DiedChesses, dieChesses...)
		}
	}
}

func (this *Game) result(wb WB) {
	this.IsFinish = true
}

func (this *Game) giveup(wb WB) {
	this.IsGiveup = true
	this.IsFinish = true
	this.GiveupWB = wb
}

func buildBoardChesses(chesses []*Chess) [19][19]*Chess {
	ret := [19][19]*Chess{}
	for _, chess := range chesses {
		ret[chess.X][chess.Y] = chess
	}
	return ret
}

// 计算当前盘面上的所有死棋，并分组返回
func getDieChessesGroups(m [19][19]*Chess) [][]*Chess {
	ret := [][]*Chess{}
	willFound := []*Chess{}
	for _, row := range m {
		for _, chess := range row {
			if chess != nil {
				willFound = append(willFound, chess)
			}
		}
	}
	for len(willFound) > 0 {
		for _, tar := range willFound {
			blockChesses := getBlockChesses(m, tar)
			// 这里边的都找过了
			willFound = remove(willFound, blockChesses)
			outlineChesses := getOutlineChesses(m, blockChesses)
			alive := false
			for _, chess := range outlineChesses {
				if hasBlankAround(m, chess.X, chess.Y) {
					alive = true
					break
				}
			}
			if !alive {
				// 如果执行到这里，说明这片是死棋
				ret = append(ret, blockChesses)
			}
		}
	}
	return ret
}

// 获取一片棋的边界上所有棋子
func getOutlineChesses(m [19][19]*Chess, block []*Chess) []*Chess {
	// 找到这些棋的边界
	outline := []*Chess{}
	for _, chess := range block {
		if notAllSelfAround(m, chess.WB, chess.X, chess.Y) {
			outline = append(outline, chess)
		}
	}
	return outline
}

// 获取与当前棋所连接的一片棋子
func getBlockChesses(m [19][19]*Chess, needle *Chess) []*Chess {
	// 找到相连的所有棋
	hasFound := []*Chess{needle}
	willFound := []*Chess{needle}
	for len(willFound) > 0 {
		found := []*Chess{}
		for _, tar := range willFound {
			nabours := foundNabour(m, tar)
			if !isIn(hasFound, tar) {
				hasFound = append(hasFound, tar)
			}
			for _, nabour := range nabours {
				if !isIn(found, nabour) && !isIn(hasFound, nabour) {
					found = append(found, nabour)
				}
			}
		}
		willFound = found
	}
	return hasFound
}

// 找与之相连接的棋子
func foundNabour(m [19][19]*Chess, chess *Chess) []*Chess {
	ret := []*Chess{}
	if chess.X > 0 {
		n := m[chess.X-1][chess.Y]
		if n != nil && n.WB == chess.WB {
			ret = append(ret, n)
		}
	}
	if chess.Y > 0 {
		n := m[chess.X][chess.Y-1]
		if n != nil && n.WB == chess.WB {
			ret = append(ret, n)
		}
	}
	if chess.X < 18 {
		n := m[chess.X+1][chess.Y]
		if n != nil && n.WB == chess.WB {
			ret = append(ret, n)
		}
	}
	if chess.Y < 18 {
		n := m[chess.X][chess.Y+1]
		if n != nil && n.WB == chess.WB {
			ret = append(ret, n)
		}
	}
	return ret
}

// 周围有空就返回true
func hasBlankAround(m [19][19]*Chess, x, y int) bool {
	switch {
	case
		x > 0 && m[x-1][y] == nil,
		x < 18 && m[x+1][y] == nil,
		y > 0 && m[x][y-1] == nil,
		y < 18 && m[x][y+1] == nil:
		return true
	default:
		return false
	}
}

// 周围不全是自己的棋，或者是边界，就返回true
// 用于找一块棋的边界
func notAllSelfAround(m [19][19]*Chess, wb WB, x, y int) bool {
	switch {
	case
		x == 0, x == 18, y == 0, y == 18,
		m[x-1][y] == nil,
		m[x+1][y] == nil,
		m[x][y-1] == nil,
		m[x][y+1] == nil,
		m[x-1][y].WB != wb,
		m[x+1][y].WB != wb,
		m[x][y-1].WB != wb,
		m[x][y+1].WB != wb:
		return true
	default:
		return false
	}
}

func isIn(arr []*Chess, needle *Chess) bool {
	for _, item := range arr {
		if needle.Sequence == item.Sequence {
			return true
		}
	}
	return false
}

func remove(arr []*Chess, set []*Chess) []*Chess {
	ret := []*Chess{}
	for _, item := range arr {
		if !isIn(set, item) {
			ret = append(ret, item)
		}
	}
	return ret
}
