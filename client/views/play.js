import Status from '../components/status.js'
import Board from '../components/board.js'
import Operation from '../components/operation.js'

export default class Component {
  constructor(databus) {
    this.databus = databus
    this.status = new Status(databus)
    this.board = new Board(databus)
    this.operation = new Operation(databus)
  }

  touchHandler(x, y) {
    if (this.board.isIn(x,y)) {
      this.board.touch(x,y)
    }
    this.operation.eventListeners.forEach(e=>{
      if (e.isIn(x, y)) {
        e.touch()
      }
    })
  }
  render(ctx) {
    this.status.render(ctx)
    this.board.render(ctx)
    this.operation.render(ctx)
  }
}