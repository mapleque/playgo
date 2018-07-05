export default class Component {
  constructor(label, x, y, w, h, onTouch) {
    this.label = label
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.touch = onTouch
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

  render(ctx) {
    ctx.clearRect(this.x,this.y,this.w,this.h)
    ctx.fillStyle = '#abc'
    ctx.fillRect(this.x, this.y, this.w, this.h)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = '14px arial'
    ctx.fillText(this.label, this.x+this.w/2, this.y+this.h/2+4)
  }
}