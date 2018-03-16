class Server {
    constructor(url) {
        this.url = url
        this.conf = {}
        this.ws = null
    }
    setConfig(conf = {}) {
        this.conf = conf
    }
    connect() {
        this.ws = new WebSocket(this.url)
        this.ws.onopen = () => {
            console.log('ws open')
            this.conf.onopen && this.conf.onopen()
        }
        this.ws.onmessage = (message) => {
            console.log('ws receive message', message)
            this.conf.onmessage && this.conf.onmessage(message)
        }
        this.ws.onerror = () => {
            console.log('ws error')
            this.conf.onerror && this.conf.onerror()
        }
        this.ws.onclose = () => {
            console.log('ws close')
            this.conf.onclose && this.conf.onclose()
        }
    }

    send(message) { return this.ws.send(JSON.stringify(message))}
    close() { return this.ws.close()}
}

class Playgo {
    constructor() {
        this.conn = null
        this.enable = false
    }

    bindServer(conn) {
        this.conn = conn
    }

    start() {
        this.conn.send({cmd:1})
    }

    put(x, y, wh) {
        this.conn.send({
            cmd:2,
            chess:{lon:x,lat:y,who:wh},
        })
    }

    pass(wh) {
        this.conn.send({
            cmd:3,
            chess:{who:wh},
        })
    }

    giveup(wh) {
        this.conn.send({
            cmd:4,
            chess:{who:wh},
        })
    }

    pass(wh) {
        this.conn.send({
            cmd:5,
            chess:{who:wh},
        })
    }

    online() {
        this.enable = true
    }

    offline() {
        this.enable = false
    }
}

let bindEvent = () => {
    // TODO
}

(function(){
    let playgo = new Playgo()
    bindEvent(playgo)

    let conn = new Server('ws://127.0.0.1:9998')
    conn.connect()
    playgo.bindServer(conn)
    conn.setConfig({
        onopen: () => {
            playgo.online()
        },
        onclose: () => {
            playgo.offline()
            console.log('offline now, reconnect after 5s')
            setTimeout(() => {conn.connect()}, 5000)
        }
    })

    window.playgo = playgo
})();
