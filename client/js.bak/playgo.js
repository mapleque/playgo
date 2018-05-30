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

    start(token,who) {
        this.token = token
        this.who = who
        this.conn.send({
            token:this.token,
            cmd:1,
        })
    }

    put(x, y) {
        this.round++
        this.conn.send({
            token:this.token,
            cmd:2,
            chess:{lon:x,lat:y,who:this.who},
        })
    }

    pass() {
        this.conn.send({
            token:this.token,
            cmd:3,
            chess:{who:this.who},
        })
    }

    giveup() {
        this.conn.send({
            token:this.token,
            cmd:4,
            chess:{who:this.who},
        })
    }

    back() {
        this.conn.send({
            token:this.token,
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
        this.eventMap = {}
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

        var gd = this.go2d = new go2d(context, w, h)
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
            var cmd = gd.currentCmd(playgo.who === 1, pos.x, pos.y)
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
            var op = gd.decodeCmd(0, cmd)
            if (op) {
                playgo.put(op.x,op.y)
            }
        }
        canvas.addEventListener('mousemove', onmove, false)
        canvas.addEventListener('touchmove', onmove, false)
        canvas.addEventListener('mouseup', onup, false)
        canvas.addEventListener('touchend', onup, false)

        document.getElementById('start').onclick = () => {
            let pannel = document.getElementById('welcome')
            pannel.style.display = 'none'
        }

        document.getElementById('go').onclick = () => {
            let who = parseInt(Array.from(document.getElementsByName('who')).filter(item => item.checked)[0].value)
            let pannel = document.getElementById('option-pannel')
            let token = document.getElementById('token').value
            if (token === '' || !token) {
                alert('invalid token')
                return
            }
            pannel.style.display = 'none'
            let f = this.eventMap['go']
            f && f(token, who)
        }
        document.getElementById('pass').onclick = () => {
            let f = this.eventMap['pass']
            f && f()
        }
        document.getElementById('giveup').onclick = () => {
            let f = this.eventMap['giveup']
            f && f()
        }
        document.getElementById('back').onclick = () => {
            let f = this.eventMap['back']
            f && f()
        }
    }
    render(frame) {
        if (frame.steps) {
            this.go2d.render(frame.steps.map((item,seq)=>({
                seq:seq,
                x:item.lon,
                y:item.lat,
                wb:item.who===1,
            })))
        }
    }
    showTips(tips) {
        let pannel = document.getElementById('tips')
        pannel.innerHTML = tips
        pannel.style.display = ''
    }
    hideTips() {
        let pannel = document.getElementById('tips')
        pannel.innerHTML = ''
        pannel.style.display = 'none'
    }
    bindEvent(eventName, f) {
        this.eventMap[eventName] = f
    }
}

(function(){
    let MaxReconnectTimes = 1;
    let connectTimes = 0;
    let playgo = new Playgo()
    let view = new View(playgo)

    view.initView()

    let conn = window.conn = new Server('ws://127.0.0.1:9998')
    view.showTips('connecting...')
    conn.connect()
    playgo.bindServer(conn)
    view.bindEvent('go',(token,who)=>{
        if (token && who) {
            playgo.start(token, who)
        }
    })
    view.bindEvent('pass',()=>playgo.pass())
    view.bindEvent('giveup',()=>playgo.giveup())
    view.bindEvent('back',()=>playgo.back())

    conn.setConfig({
        onopen: () => {
            view.hideTips()
            playgo.online()
            connectTimes = 0
        },
        onclose: () => {
            playgo.offline()
            view.showTips('offline now, reconnect after 5s')
            connectTimes++
            if (connectTimes > MaxReconnectTimes) {
                view.showTips('stop retry cause too much times, please reload the page if nessesury')
                return
            }
            setTimeout(() => {
                view.showTips('connecting...')
                conn.connect()
            }, 5000)
        },
        onmessage: (resp) => {
            let frame = JSON.parse(resp.data)
            if (frame.code) {
                view.showTips('error['+frame.code+']:'+frame.tips)
                setTimeout(()=>{view.hideTips()},3000)
                return
            }
            view.render(frame)
        }
    })
})();
