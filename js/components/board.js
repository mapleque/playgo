export default class Component {
  constructor(databus) {
    this.x = 0
    this.y = databus.getBoardY()
    this.w = canvas.width
    this.h = canvas.width
    this.size = databus.getBoardSize()
    this.offset = 20
    this.width = canvas.width - 2 * this.offset
    this.unit = Math.floor(this.width / this.size)
    this.width = this.size * this.unit
    this.origin = {
      x: (this.w - this.width) / 2,
      y: this.y + (this.w - this.width) / 2,
    }
    this.databus = databus
    this.eventListeners = []
  }
  // 判断当前坐标是否在button范围内
  isIn(x, y) {
    if (x > this.x &&
      y > this.y &&
      x < this.x + this.w &&
      y < this.y + this.h
    ) {
      return true
    }
    return false
  }
  touch (x, y) {
    const point = this.toPoint(x, y)
    this.databus.doTry(point)
  }
  toPoint (x, y) {
    let xi = Math.round((x - this.origin.x) / this.unit)
    let yi = Math.round((y - this.origin.y) / this.unit)
    return {
      x: xi + 1,
      y: yi + 1,
    }
  }
  drawLine (ctx, num) {
    ctx.beginPath()
    ctx.fillStyle = '#000'
    ctx.strokeStyle = '#000'
    let sx = this.origin.x + num * this.unit
    let sy = this.origin.y + num * this.unit
    ctx.moveTo(sx, this.origin.y)
    ctx.lineTo(sx, this.origin.y + this.width)
    ctx.moveTo(this.origin.x, sy)
    ctx.lineTo(this.origin.x + this.width, sy)
    ctx.closePath()
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.font = '10px arial'
    ctx.fillText(num + 1, sx, this.origin.y - 5)
    ctx.fillText(num + 1, sx, this.origin.y + this.width + 15)
    ctx.textAlign = 'right'
    ctx.fillText(num + 1, this.origin.x - this.unit / 4, sy + 5)
    ctx.textAlign = 'left'
    ctx.fillText(num + 1, this.origin.x + this.width + this.unit / 4, sy + 5)
  }
  drawStar (ctx, x, y) {
    if (x < 0) {
      x += this.size
    }
    if (y < 0) {
      y += this.size
    }
    let sx = this.origin.x + x * this.unit
    let sy = this.origin.y + y * this.unit
    ctx.beginPath()
    ctx.fillStyle = '#000'
    ctx.strokeStyle = '#000'
    ctx.arc(sx, sy, this.unit / 10, 0, 2 * Math.PI, false)
    ctx.closePath()
    ctx.fill()
  }
  drawChess (ctx, seq, wb, x, y) {
    let sx = this.origin.x + (x - 1) * this.unit
    let sy = this.origin.y + (y - 1) * this.unit
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = !wb ? '#000' : '#fff'
    ctx.fillStyle = !wb ? '#000' : '#fff'
    ctx.arc(sx, sy, this.unit * 3 / 8, 0, 2 * Math.PI, false)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    if (this.databus.isShowSequence()) {
      ctx.textAlign = 'center'
      ctx.fillStyle = wb ? '#000' : '#fff'
      ctx.font = 'small-caps 10px arial'
      ctx.fillText(seq, sx, sy + 5)
    }
  }
  render(ctx) {
    this.eventListeners = []
    ctx.clearRect(this.x, this.y, this.w, this.h)
    // background
    ctx.fillStyle = '#fad99e'
    ctx.fillRect(this.x, this.y, this.w, this.h)

    for (let i = 0; i <= this.size; i++) {
      this.drawLine(ctx, i)
    }
    let o = Math.floor(this.size / 2)
    let stars = [
      [3, 3],
      [-3, 3],
      [3, -3],
      [-3, -3],
      [o, o],
      [3, o],
      [-3, o],
      [o, 3],
      [o, -3]
    ]
    stars.forEach(e => {
      this.drawStar(ctx, e[0], e[1])
    })
    this.databus.getShowChesses().forEach(chess => {
      this.drawChess(ctx, chess.sequence, chess.wb, chess.x, chess.y)
    })
    const chess = this.databus.getTryChesses()
    if (chess != null) {
      this.drawChess(ctx, '?', chess.wb, chess.x, chess.y)
    }
  }
}