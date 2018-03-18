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
        this.hasStart = false

        this.token = null
        this.who = 0
        this.next = 0
        this.round = 0
        this.steps = []
        this.chesses = []

        this.giveup = 0
        this.pass = 0
    }

    bindServer(conn) {
        this.conn = conn
    }

    start() {
        this.conn.send({cmd:1})
        // TODO who
        this.who = 1
    }
    setWho(wh) {
        this.who = wh
    }

    put(x, y) {
        this.round++
        this.conn.send({
            cmd:2,
            chess:{lon:x,lat:y,who:this.who},
        })
    }

    pass() {
        this.conn.send({
            cmd:3,
            chess:{who:this.who},
        })
    }

    giveup() {
        this.conn.send({
            cmd:4,
            chess:{who:this.who},
        })
    }

    pass() {
        this.conn.send({
            cmd:5,
            chess:{who:this.who},
        })
    }

    online() {
        this.enable = true
    }

    offline() {
        this.enable = false
    }
}

class View {
    constructor(playgo) {
        this.playgo = playgo
    }
    initView() {
        var playgo = this.playgo
        var canvas = document.getElementById('canvas')
        var context = canvas.getContext('2d')
        var w,h
        var opWidth = 50
        var isHorizon = true
        var resizeCanvas = function () {
            w = window.innerWidth
            h = window.innerHeight
            canvas.setAttribute("width", w)
            canvas.setAttribute("height", h)
        }
        resizeCanvas()

        var gd = new go2d(context, w, h)
       // gd.addButton('option', () => {})
       // gd.addButton('join', () => {})
       // gd.addButton('pass', () => {})
       // gd.addButton('giveup', () => {})
       // gd.addLabel(()=>playgo.who === playgo.next ? 'you' : 'wait...')
        window.onresize = function () {
            resizeCanvas()
            gd.resize(w, h)
        }
        var onmove = (t) => {
            if (t.type === 'touchmove') {
                t = t.targetTouches[0]
            }
            var pos = {
                x: Math.round(t.clientX),
                y: Math.round(t.clientY)
            }
            var cmd = gd.currentCmd(playgo.who, pos.x, pos.y)
            gd.preview(cmd)
        }
        var onup = (t) => {
            if (t.type === 'touchend') {
                t = t.changedTouches[0]
            }
            var pos = {
                x: Math.round(t.clientX),
                y: Math.round(t.clientY)
            }
            var cmd = gd.currentCmd(playgo.who === 1, pos.x, pos.y)
            gd.put(playgo.round+1, cmd)
            op = gd.decodeCmd(0, cmd)
            playgo.put(op.x,op.y)
        }
        canvas.addEventListener('mousemove', onmove, false)
        canvas.addEventListener('touchmove', onmove, false)
        canvas.addEventListener('mouseup', onup, false)
        canvas.addEventListener('touchend', onup, false)

        document.getElementById('option-button').onclick = () => {
            let pannel = document.getElementById('option-pannel')
            pannel.style.display = pannel.style.display === 'none' ? '':'none'
        }
    }
}

(function(){
    let MaxReconnectTimes = 10;
    let connectTimes = 0;
    let playgo = new Playgo()
    let view = new View(playgo)

    view.initView()

    let conn = new Server('ws://127.0.0.1:9998')
    conn.connect()
    playgo.bindServer(conn)
    conn.setConfig({
        onopen: () => {
            console.log('online now')
            playgo.online()
            connectTimes = 0
        },
        onclose: () => {
            playgo.offline()
            console.log('offline now, reconnect after 5s')
            connectTimes++
            if (connectTimes > MaxReconnectTimes) {
                console.log('stop retry cause too much times, please reload the page if nessesury')
                return
            }
            setTimeout(() => {conn.connect()}, 5000)
        }
    })
})();
