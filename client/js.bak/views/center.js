import Button from '../components/button'
export default class Component {
  constructor(databus) {
    this.x = 0
    this.y = 50
    this.w = canvas.width
    this.h = canvas.height - 50
    this.databus = databus
    this.gameList = []
    this.eventListeners = []

  }

  nextPage() {
    this.databus.nextPage(gameList => {
      this.gameList = gameList
    })
  }

  listen(button) {
    this.eventListeners.push(button)
  }

  touchHandler(x, y) {
    this.eventListeners.forEach(e => {
      if (e.isIn(x, y)) {
        e.touch()
      }
    })
  }

  handleNextPageBtn = () => {
    this.nextPage()
  }
  handleNewGameBtn = () => {
    this.databus.newGame()
  }

  handleEnterGame = (game) => {
    return () => {
      this.databus.enterGame(game)
    }
  }
  render(ctx) {
    this.nextPage()
    ctx.clearRect(this.x, this.y, this.w, this.h)
    ctx.fillStyle = this.databus.getBackgroundStyle()
    ctx.fillRect(this.x, this.y, this.w, this.h)
    this.eventListeners = []
    const nextPageBtn = new Button(
      this.databus.getNextPageBtnLabel(),
      this.databus.getNextPageBtnX(),
      this.databus.getNextPageBtnY(),
      this.databus.getNextPageBtnW(),
      this.databus.getNextPageBtnH(),
      this.handleNextPageBtn
    )
    nextPageBtn.render(ctx)
    this.listen(nextPageBtn)
    const newGameBtn = new Button(
      this.databus.getNewGameBtnLabel(),
      this.databus.getNewGameBtnX(),
      this.databus.getNewGameBtnY(),
      this.databus.getNewGameBtnW(),
      this.databus.getNewGameBtnH(),
      this.handleNewGameBtn
    )
    newGameBtn.render(ctx)
    this.listen(newGameBtn)
    this.gameList.forEach((game, i) => {
      const gameBtn = new Button(
        game.name,
        this.databus.getGameBtnX(i),
        this.databus.getGameBtnY(i),
        this.databus.getGameBtnW(i),
        this.databus.getGameBtnH(i),
        this.handleEnterGame(game)
      )
      gameBtn.render(ctx)
      this.listen(gameBtn)
    })
  }
}
