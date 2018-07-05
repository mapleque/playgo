package server

import (
	"testing"
)

// 先test那些基础方法
func TestIsIn(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true),
		NewChess(1, 0, 0, true),
		NewChess(2, 0, 0, true),
		NewChess(3, 0, 0, true),
	}

	if !isIn(arr, NewChess(2, 0, 0, true)) {
		t.Error("3 should in arr")
	}
	if isIn(arr, NewChess(4, 0, 0, true)) {
		t.Error("5 should not in arr")
	}
}

func TestRemove(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true),
		NewChess(1, 0, 0, true),
		NewChess(2, 0, 0, true),
		NewChess(3, 0, 0, true),
	}
	set := []*Chess{
		NewChess(1, 0, 0, true),
		NewChess(2, 0, 0, true),
	}
	ret := remove(arr, set)
	if len(ret) != 2 ||
		!isIn(arr, NewChess(0, 0, 0, true)) ||
		!isIn(arr, NewChess(3, 0, 0, true)) {
		t.Error("remove error")
	}
}

func TestNotAllSelfAround(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true),
		NewChess(1, 0, 1, true),
		NewChess(2, 0, 2, true),
		NewChess(3, 1, 0, true),
		NewChess(4, 1, 1, true), // false
		NewChess(5, 1, 2, true),
		NewChess(6, 1, 3, false), // ignore
		NewChess(7, 2, 1, true),
		NewChess(8, 2, 2, true),
		NewChess(9, 2, 3, true),
	}
	m := buildBoardChesses(arr)
	for i, c := range arr {
		switch i {
		case 4:
			if notAllSelfAround(m, true, c.X, c.Y) {
				t.Error("test faild")
			}
		case 6:
		default:
			if !notAllSelfAround(m, true, c.X, c.Y) {
				t.Error("test faild")
			}
		}
	}
}

func TestHasBlankAround(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true), // false
		NewChess(1, 0, 1, true), // false
		NewChess(2, 0, 2, true),
		NewChess(3, 1, 0, true),
		NewChess(4, 1, 1, true),  // false
		NewChess(5, 1, 2, true),  // false
		NewChess(6, 1, 3, false), // ignore
		NewChess(7, 2, 1, true),
		NewChess(8, 2, 2, true),
		NewChess(9, 2, 3, true),
	}
	m := buildBoardChesses(arr)
	for i, c := range arr {
		switch i {
		case 0, 1, 4, 5:
			if hasBlankAround(m, c.X, c.Y) {
				t.Error("test faild")
			}
		case 2, 3, 7, 8, 9:
			if !hasBlankAround(m, c.X, c.Y) {
				t.Error("test faild")
			}
		}
	}
}

func TestFoundNabour(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true),
		NewChess(1, 0, 1, true),
		NewChess(2, 0, 2, true),
		NewChess(3, 1, 0, true),
		NewChess(4, 1, 1, true),
		NewChess(5, 1, 2, true),
		NewChess(6, 1, 3, false),
		NewChess(7, 2, 1, true),
		NewChess(8, 2, 2, true),
		NewChess(9, 2, 3, true),
	}
	m := buildBoardChesses(arr)
	n := foundNabour(m, arr[0])
	for i, c := range arr {
		switch i {
		case 1, 3:
			if !isIn(n, c) {
				t.Error("test faild")
			}
		default:
			if isIn(n, c) {
				t.Error("test faild")
			}
		}
	}
}

func TestGetBlockChesses(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true),
		NewChess(1, 0, 1, true),
		NewChess(2, 0, 2, true),
		NewChess(3, 1, 0, true),
		NewChess(4, 1, 1, true),
		NewChess(5, 1, 2, true),
		NewChess(6, 1, 3, false),
		NewChess(7, 2, 1, true),
		NewChess(8, 2, 2, true),
		NewChess(9, 2, 3, true),
	}
	m := buildBoardChesses(arr)
	b := getBlockChesses(m, arr[0])
	for i, c := range arr {
		switch i {
		case 6:
			if isIn(b, c) {
				t.Error("test faild")
			}
		default:
			if !isIn(b, c) {
				t.Error("test faild")
			}
		}
	}
}

func TestGetOutlineChesses(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true),
		NewChess(1, 0, 1, true),
		NewChess(2, 0, 2, true),
		NewChess(3, 1, 0, true),
		NewChess(4, 1, 1, true),
		NewChess(5, 1, 2, true),
		NewChess(6, 1, 3, false),
		NewChess(7, 2, 1, true),
		NewChess(8, 2, 2, true),
		NewChess(9, 2, 3, true),
	}
	m := buildBoardChesses(arr)
	b := getBlockChesses(m, arr[0])
	o := getOutlineChesses(m, b)
	for i, c := range arr {
		switch i {
		case 4, 6:
			if isIn(o, c) {
				t.Error("test faild")
			}
		default:
			if !isIn(o, c) {
				t.Error("test faild")
			}
		}
	}
}

func TestGetDieChessesGroups(t *testing.T) {
	arr := []*Chess{
		NewChess(0, 0, 0, true), // die
		NewChess(1, 0, 1, false),
		NewChess(2, 0, 2, true),
		NewChess(3, 1, 0, false),
		NewChess(4, 1, 1, true),
		NewChess(5, 1, 2, false),
		NewChess(7, 2, 0, true),
		NewChess(8, 2, 1, false),
		NewChess(9, 2, 2, false),
	}
	m := buildBoardChesses(arr)
	d := getDieChessesGroups(m)
	if len(d) != 4 {
		t.Error("test faild", d)
	}
}

func TestProcess(t *testing.T) {
	p1 := "token1"
	p2 := "token2"
	g := NewGame(p1)
	g.Enter(p2)

	g.Do(p1, 0, 0) // 1 die
	g.Do(p2, 0, 1) // 2
	g.Do(p1, 0, 2) // 3
	g.Do(p2, 1, 0) // 4
	g.Do(p1, 1, 1) // 5 die
	g.Do(p2, 1, 2) // 6
	g.Do(p1, 2, 0) // 7 die
	g.Do(p2, 2, 1) // 8
	g.Do(p1, 2, 2) // 9
	g.Do(p2, 3, 0) // 10

	if len(g.TotalChesses) != 10 {
		t.Error("test faild")
	}
	if len(g.AliveChesses) != 7 {
		t.Error("test faild", g.AliveChesses)
	}
	if len(g.DiedChesses) != 3 {
		t.Error("test faild", g.DiedChesses)
	}

	g.Back(p1)
	if len(g.TotalChesses) != 8 {
		t.Error("test faild")
	}
	if len(g.AliveChesses) != 6 {
		t.Error("test faild", g.AliveChesses)
	}
	if len(g.DiedChesses) != 2 {
		t.Error("test faild", g.DiedChesses)
	}

	g.Pass(p1)
	g.Do(p2, 3, 0)
	if len(g.TotalChesses) != 9 {
		t.Error("test faild")
	}
	if len(g.AliveChesses) != 6 {
		t.Error("test faild", g.AliveChesses)
	}
	if len(g.DiedChesses) != 3 {
		t.Error("test faild", g.DiedChesses)
	}
	g.Back(p1)
	if len(g.TotalChesses) != 8 {
		t.Error("test faild", g.TotalChesses)
	}
	if len(g.AliveChesses) != 6 {
		t.Error("test faild", g.AliveChesses)
	}
	if len(g.DiedChesses) != 2 {
		t.Error("test faild", g.DiedChesses)
	}
	g.Back(p1)
	if len(g.TotalChesses) != 6 {
		t.Error("test faild", g.TotalChesses)
	}
	if len(g.AliveChesses) != 5 {
		t.Error("test faild", g.AliveChesses)
	}
	if len(g.DiedChesses) != 1 {
		t.Error("test faild", g.DiedChesses)
	}

	if g.Do(p1, 1, 0) == nil {
		t.Error("test faild")
	}
	g.Pass(p1)
	g.Do(p2, 2, 1)
	if g.Do(p1, 0, 0) == nil {
		t.Error("test faild")
	}
	if g.Do(p2, 4, 4) == nil {
		t.Error("test faild")
	}
	if g.Pass(p2) == nil {
		t.Error("test faild")
	}
	if g.Back(p2) == nil {
		t.Error("test faild")
	}
	g.Back(p1)
	g.Back(p1)
	g.Back(p1)
	g.Back(p1)
	if g.Back(p1) == nil {
		t.Error("test faild", g.TotalChesses)
	}

	g.Pass(p1)
	g.Pass(p2)
}
