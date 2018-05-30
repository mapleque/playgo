let instance

/**
 * 全局状态管理器
 */
class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.SCENCE_BEFORE = 0
    this.SCENCE_GAMING = 1
    this.SCENCE_FINISH = 2
    this.BLACK = 0
    this.WHITE = 1

    this.reset()
  }

  reset() {
    this.frame = 0
    this.timer = new Date()
    this.startTime = new Date()
    this.trying = true
    this.waiting = false
    this.try = null
    this.wh = this.BLACK
    this.scence = this.SCENCE_BEFORE
    // TODO: load data from server
    this.currentShowGameList = []
    this.showChesses = [{
      seq: 1,
      wb: true,
      x: 16,
      y: 3,
    }]
  }

  useDatasource = (conn) => {
    this.conn = conn
    this.conn.onMessage = message => {
      console.log("recieve message", message)
      switch (message.type) {
        case 'game_list': this.updateGameList(message.data)
          break
        case 'game': this.updateGame(message.data)
          break
      }
    }
  }
  connect = () => {
    this.conn.connect()
  }
  updateGame = (game) => {
    this.timer = new Date()
    this.startTime = new Date()
    this.wh = game.who
    this.waiting = game.who != game.turn
    this.trying = !this.waiting
    this.showChesses = game.aliveChesses
  }
  updateGameList = (data) => {
    this.currentShowGameList = data.list
  }

  getScence() { return this.scence }
  nextFrame() { this.frame++ }
  updateTimer() { this.timer = new Date() }

  nextPage(callback) {
    // 给返回当前页面的game列表，这里需要控制翻页和数据请求
    callback(this.currentShowGameList)
  }
  newGame() {
    console.log('new game')
    this.conn.newGame()
    this.scence = this.SCENCE_GAMING
  }
  enterGame(game) {
    console.log('enter game', game)
    this.conn.enterGame(game)
    this.scence = this.SCENCE_GAMING
  }
  showConfirmBtn() {
    return this.try != null && this.trying
  }
  doTry (p) {
    this.try = p
    this.try.wb = this.wh
  }
  pass() {
    console.log('pass')
    this.conn.pass()
    this.timer = new Date()
    this.startTime = new Date()
  }
  giveup() {
    console.log('giveup')
    this.conn.giveup()
    this.scence = this.SCENCE_FINISH
  }
  back() {
    console.log('back')
    this.conn.back()
  }
  confirm() {
    console.log('confirm')
    this.conn.do(this.try.x, this.try.y)
    this.try = null
  }
  return() {
    console.log('return')
    this.scence = this.SCENCE_BEFORE
  }

  // 用于控制页面样式的获取属性方法
  getBackgroundOriginX() { return 0 }
  getBackgroundOriginY() { return 0 }
  getBackgroundWidth() { return canvas.width }
  getBackgroundHeight() { return canvas.height }
  getBackgroundStyle() { return '#eee' }
  getTitle() { return 'Mapleque Playgo' }
  getTitleX() { return canvas.width / 2 }
  getTitleY() { return 30 }
  getTitleFont() { return '20px arial' }
  getNewGameBtnLabel() { return 'new' }
  getNewGameBtnX() { return 20 }
  getNewGameBtnY() { return 100 }
  getNewGameBtnW() { return canvas.width/2 - 40 }
  getNewGameBtnH() { return canvas.width / 2 - 100 }
  getNextPageBtnLabel() { return 'refresh' }
  getNextPageBtnX() { return 20 }
  getNextPageBtnY() { return canvas.width + 50 }
  getNextPageBtnW() { return canvas.width - 40 }
  getNextPageBtnH() { return 70 }
  getGameBtnX(i) { return canvas.width/2*((i+1)%2) + 20 }
  getGameBtnY(i) { return 100 + (canvas.width / 2 - 100+20)*(parseInt((i+1)/2)) }
  getGameBtnW(i) { return canvas.width / 2 - 40 }
  getGameBtnH(i) { return canvas.width / 2 - 100 }
  getTimerX() { return canvas.width/2 - 40 }
  getTimerY() { return 80 }
  getTimerW() { return 80 }
  getTimerH() { return 30 }
  getTimerLabel() { return Math.round((this.timer.getTime() - this.startTime.getTime())/1000)}
  getRoundSelfX() { return canvas.width - 10 - 120 }
  getRoundSelfY() { return 80 }
  getRoundSelfW() { return 120 }
  getRoundSelfH() { return 30 }
  getRoundSelfLabel() { return "自己："+(this.wh == this.BLACK ? '黑方' : '白方') + (this.waiting ? '，等待' : '，行棋') }
  getRoundOtherX() { return  10 }
  getRoundOtherY() { return 80 }
  getRoundOtherW() { return 120 }
  getRoundOtherH() { return 30 }
  getRoundOtherLabel() { return "对手：" + (this.wh != this.BLACK ? '黑方' : '白方') + (!this.waiting ? '，等待' : '，行棋') }
  getBoardY() { return 130}
  getBoardSize() { return 19 - 1}
  getPassBtnLabel() { return '过' }
  getPassBtnX() { return 10 }
  getPassBtnY() { return 150 + canvas.width + 70 }
  getPassBtnW() { return canvas.width/4 - 20 }
  getPassBtnH() { return 40 }
  getGiveupBtnLabel() { return '认输' }
  getGiveupBtnX() { return canvas.width /4 + 10 }
  getGiveupBtnY() { return 150 + canvas.width + 70 }
  getGiveupBtnW() { return canvas.width / 4 - 20 }
  getGiveupBtnH() { return 40 }
  getBackBtnLabel() { return '悔棋' }
  getBackBtnX() { return canvas.width /2 + 10 }
  getBackBtnY() { return 150 + canvas.width + 70 }
  getBackBtnW() { return canvas.width / 4 - 20 }
  getBackBtnH() { return 40 }
  getCalcBtnLabel() { return '局势' }
  getCalcBtnX() { return canvas.width * 3 / 4 + 10 }
  getCalcBtnY() { return 150 + canvas.width + 70 }
  getCalcBtnW() { return canvas.width / 4 - 20 }
  getCalcBtnH() { return 40 }
  getConfirmBtnLabel() { return '确认落子' }
  getConfirmBtnX() { return canvas.width / 2 - canvas.width / 4 }
  getConfirmBtnY() { return 150+canvas.width +20 }
  getConfirmBtnW() { return canvas.width / 2 }
  getConfirmBtnH() { return 40 }
  getResultLabel() { return (this.wh != this.BLACK ? '黑方' : '白方') + '胜'}
  getReturnBtnLabel() { return '返回首页' }
  getReturnBtnX() { return canvas.width / 2 - canvas.width / 4 }
  getReturnBtnY() { return 150 + canvas.width + 20 }
  getReturnBtnW() { return canvas.width / 2 }
  getReturnBtnH() { return 40 }
  getShowChesses() { return this.showChesses }
  getTryChesses() { return this.try == null ? null : this.try}
  isShowSequence() { return true }
}

