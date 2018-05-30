import Button from './button.js'
export default class Component {
  constructor(databus) {
    this.x = 0
    this.y = 150+canvas.width
    this.w = canvas.width
    this.h = canvas.height - this.y
    this.databus = databus
    this.eventListeners = []
  }

  listen(button) {
    this.eventListeners.push(button)
  }

  handlePassBtn() {
    this.databus.pass()
  }
  handleGiveupBtn () {
    this.databus.giveup()
  }
  handleBackBtn () {
    this.databus.back()
  }
  handleCalcBtn () {
    this.databus.calc()
  }
  handleConfirmBtn () {
    this.databus.confirm()
  }
  
  render(ctx) {
    ctx.clearRect(this.x, this.y, this.w, this.h)
    // background
    ctx.fillStyle = this.databus.getBackgroundStyle()
    ctx.fillRect(this.x, this.y, this.w, this.h)

    this.eventListeners = []
    const passBtn = new Button(
      this.databus.getPassBtnLabel(),
      this.databus.getPassBtnX(),
      this.databus.getPassBtnY(),
      this.databus.getPassBtnW(),
      this.databus.getPassBtnH(),
      this.handlePassBtn.bind(this)
    )
    passBtn.render(ctx)
    this.listen(passBtn)
    const giveupBtn = new Button(
      this.databus.getGiveupBtnLabel(),
      this.databus.getGiveupBtnX(),
      this.databus.getGiveupBtnY(),
      this.databus.getGiveupBtnW(),
      this.databus.getGiveupBtnH(),
      this.handleGiveupBtn.bind(this)
    )
    giveupBtn.render(ctx)
    this.listen(giveupBtn)
    const backBtn = new Button(
      this.databus.getBackBtnLabel(),
      this.databus.getBackBtnX(),
      this.databus.getBackBtnY(),
      this.databus.getBackBtnW(),
      this.databus.getBackBtnH(),
      this.handleBackBtn.bind(this)
    )
    backBtn.render(ctx)
    this.listen(backBtn)
    const calcBtn = new Button(
      this.databus.getCalcBtnLabel(),
      this.databus.getCalcBtnX(),
      this.databus.getCalcBtnY(),
      this.databus.getCalcBtnW(),
      this.databus.getCalcBtnH(),
      this.handleCalcBtn.bind(this)
    )
    calcBtn.render(ctx)
    this.listen(calcBtn)
    if (this.databus.showConfirmBtn()) {
      const confirmBtn = new Button(
        this.databus.getConfirmBtnLabel(),
        this.databus.getConfirmBtnX(),
        this.databus.getConfirmBtnY(),
        this.databus.getConfirmBtnW(),
        this.databus.getConfirmBtnH(),
        this.handleConfirmBtn.bind(this)
      )
      confirmBtn.render(ctx)
      this.listen(confirmBtn)
    }
  }
}