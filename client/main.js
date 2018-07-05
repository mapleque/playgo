import Result from './views/result.js'
import Center from './views/center.js'
import Play from './views/play.js'
import Background from './views/background.js'
import DataBus from './databus.js'
import Connection from './connection.js'

let ctx   = canvas.getContext('2d')
let databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    this.background = new Background(databus)
    this.result = new Result(databus)
    this.center = new Center(databus)
    this.play = new Play(databus)

    databus.useDatasource(new Connection())

    this.background.render(ctx)
    // 注册绘制函数
    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
    this.touchHandler = this.touchEventHandler.bind(this)
    canvas.addEventListener('touchstart', this.touchHandler)
    canvas.addEventListener('click', this.touchHandler)
  }

  touchEventHandler(e) {
    e.preventDefault()
    let x,y
    if (e.type === 'click') {
      x = e.clientX
      y = e.clientY
    } else if (e.type === 'touchstart') {
      x = e.touches[0].clientX
      y = e.touches[0].clientY
    }
    
    switch (databus.getScence()) {
      case databus.SCENCE_BEFORE:
        this.center.touchHandler(x,y)
        break
      case databus.SCENCE_GAMING:
        this.play.touchHandler(x, y)
        break
      case databus.SCENCE_FINISH:
        this.result.touchHandler(x, y)
        break
    }
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    switch(databus.getScence()) {
      case databus.SCENCE_BEFORE:
        this.center.render(ctx)
        break
      case databus.SCENCE_GAMING:
        this.play.render(ctx)
        break
      case databus.SCENCE_FINISH:
        this.result.render(ctx)
        break
    }
  }

  // 客户端更新数据
  update() {
    databus.updateTimer()
  }

  // 实现游戏帧循环
  loop() {
    databus.nextFrame()

    this.update()
    this.render()

    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }
}
