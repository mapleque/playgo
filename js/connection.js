export default class Connection {
  constructor() {
    this.ws = new WebSocket('ws://127.0.0.1:9998')
    this.ws.onopen = (msg) => {
      console.log('ws open', msg)
    }
    this.ws.onmessage = (msg) => {
      this.onMessage(JSON.parse(msg.data))
    }
    this.ws.onerror = (msg) => {
      console.log('ws error', msg)
    }
    this.ws.onclose = (msg) => {
      console.log('ws close', msg)
    }
    this.send = (msg) => {
      this.ws.send(JSON.stringify(msg))
    }
  }

  onMessage(message) {
    // implement in databus
    console.log(message.data)
  }
  newGame() {
    // server should push a new game
    this.send({
      type: 'new',
      data: {}
    })
  }
  enterGame(game) {
    // server should send message
    this.send({
      type: 'enter',
      data: {
        game_token: game.token
      }
    })
  }
  do(x, y) {
    // server should push a chess and compute live and die
    this.send({
      type: 'do',
      data: {
        x: x,
        y: y
      }
    })
  }
  back() {
    // server should back a chess and compute live and die
    this.send({
      type: 'do',
      data: {}
    })
  }
  giveup() {
    // server should record result
    this.send({
      type: 'giveup',
      data: {}
    })
  }
  pass() {
    this.send({
      type: 'pass',
      data: {}
    })
  }
}