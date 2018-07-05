export default class Component { 
  constructor(databus) {
    this.x = 0
    this.y = 50
    this.w = canvas.width
    this.h = 100
    this.databus = databus
  }
  
  render (ctx) {
    ctx.clearRect(this.x, this.y, this.w, this.h)
    // background
    ctx.fillStyle = this.databus.getBackgroundStyle()
    ctx.fillRect(this.x, this.y, this.w, this.h)

    // timer
    ctx.fillStyle = '#abc'
    ctx.fillRect(
      this.databus.getTimerX(),
      this.databus.getTimerY(),
      this.databus.getTimerW(),
      this.databus.getTimerH(),
    )
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = '14px arial'
    ctx.fillText(
      this.databus.getTimerLabel(),
      this.databus.getTimerX() + this.databus.getTimerW() / 2,
      this.databus.getTimerY() + this.databus.getTimerH() / 2 + 4
    )
    // round
    ctx.fillStyle = '#abc'
    ctx.fillRect(
      this.databus.getRoundSelfX(),
      this.databus.getRoundSelfY(),
      this.databus.getRoundSelfW(),
      this.databus.getRoundSelfH(),
    )
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = '14px arial'
    ctx.fillText(
      this.databus.getRoundSelfLabel(),
      this.databus.getRoundSelfX() + this.databus.getRoundSelfW() / 2,
      this.databus.getRoundSelfY() + this.databus.getRoundSelfH() / 2 + 4
    )
    ctx.fillStyle = '#abc'
    ctx.fillRect(
      this.databus.getRoundOtherX(),
      this.databus.getRoundOtherY(),
      this.databus.getRoundOtherW(),
      this.databus.getRoundOtherH(),
    )
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = '14px arial'
    ctx.fillText(
      this.databus.getRoundOtherLabel(),
      this.databus.getRoundOtherX() + this.databus.getRoundOtherW() / 2,
      this.databus.getRoundOtherY() + this.databus.getRoundOtherH() / 2 + 4
    )
  }
}