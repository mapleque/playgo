import Button from '../components/button.js'
export default class Component {
  constructor(databus) {
    this.x = 0
    this.y = 50
    this.w = canvas.width
    this.h = 100
    this.eventListeners = []
    this.databus = databus
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
  handleReturnBtn () {
    this.databus.return()
  }
  render(ctx) {
    ctx.clearRect(this.x, this.y, this.w, this.h)
    ctx.fillStyle = this.databus.getBackgroundStyle()
    ctx.fillRect(this.x, this.y, this.w, this.h)
    ctx.clearRect(this.x, 150 + canvas.width, this.w, 150 + canvas.width + canvas.height)
    ctx.fillStyle = this.databus.getBackgroundStyle()
    ctx.fillRect(this.x, 150 + canvas.width, this.w, 150 + canvas.width + canvas.height)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = '14px arial'
    ctx.fillText(
      this.databus.getResultLabel(),
      this.x + this.w / 2,
      this.y + this.h / 2 + 4
    )
    this.eventListeners = []
    const returnBtn = new Button(
      this.databus.getReturnBtnLabel(),
      this.databus.getReturnBtnX(),
      this.databus.getReturnBtnY(),
      this.databus.getReturnBtnW(),
      this.databus.getReturnBtnH(),
      this.handleReturnBtn.bind(this)
    )
    returnBtn.render(ctx)
    this.listen(returnBtn)
  }
}
