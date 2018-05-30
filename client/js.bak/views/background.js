class Background {
  constructor(databus) {
    this.databus = databus
  }
  render(ctx) {
    // clear all
    ctx.clearRect(
      this.databus.getBackgroundOriginX(),
      this.databus.getBackgroundOriginY(),
      this.databus.getBackgroundWidth(),
      this.databus.getBackgroundHeight()
    )
    ctx.fillStyle = this.databus.getBackgroundStyle()
    ctx.fillRect(
      this.databus.getBackgroundOriginX(),
      this.databus.getBackgroundOriginY(),
      this.databus.getBackgroundWidth(),
      this.databus.getBackgroundHeight()
    )
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = this.databus.getTitleFont()
    ctx.fillText(
      this.databus.getTitle(),
      this.databus.getTitleX(),
      this.databus.getTitleY()
    )
  }
}
