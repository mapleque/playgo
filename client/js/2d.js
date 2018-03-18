(function(){
    var go2d = function (context, w, h) {
        var self = this
        self.ctx = context
        self.size = 18
        self.cw = w
        self.ch = h
        var resize = function () {
            var length = Math.min(self.cw,self.ch) * 0.8
            self.unit = Math.floor(length / self.size)
            self.length = self.unit * self.size
            self.oplength = Math.floor(self.length/8)
            self.origin = {
                x:Math.floor(self.cw/2) - Math.floor(length/2),
                y:Math.floor(self.ch/2) - Math.floor(length/2),
            }
        }
        resize()

        var bx = ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T']
        var wx = ['a','b','c','d','e','f','g','h','j','k','l','m','n','o','p','q','r','s','t']
        // @param seq int # put num
        // @param cmd A1-T19 a1-t19
        // @return op
        var decodeCmd = self.decodeCmd = function (seq, cmd) {
            var wb,x,y
            y = parseInt(cmd.substring(1))
            for (var i=0;i<=self.size;i++) {
                switch (cmd[0]) {
                    case bx[i]:x=i+1;wb=true;break;
                    case wx[i]:x=i+1;wb=false;break;
                }
            }
            return {
                seq:seq,
                cmd:cmd,
                x:x,// 1-19
                y:y,// 1-19
                wb:wb, // ture|false
            }
        }
        self.filled = [] // [op...]
        self.try = null // op

        self.currentCmd = function (wb, px, py) {
            var xi = Math.round((px - self.origin.x)/self.unit)
            var yi = Math.round((py - self.origin.y)/self.unit)
            if (xi >= 0 && yi >= 0 && xi < 19 && yi < 19) {
                return (wb ? bx[xi] : wx[xi]) + (yi + 1)
            }
            return 'unknow'
        }

        var draw = function () {
            var drawBoard = function () {
                var drawBackground = function () {
                    self.ctx.fillStyle = '#fad99e'
                    self.ctx.fillRect(
                        self.origin.x - self.unit,
                        self.origin.y - self.unit,
                        self.length + 2*self.unit,
                        self.length + 2*self.unit)
                }
                var drawLine = function (num) {
                    self.ctx.beginPath()
                    self.ctx.fillStyle = '#000'
                    self.ctx.strokeStyle = '#000'
                    var sx = self.origin.x + num * self.unit
                    var sy = self.origin.y + num * self.unit
                    self.ctx.moveTo(sx, self.origin.y)
                    self.ctx.lineTo(sx, self.origin.y+self.length)
                    self.ctx.moveTo(self.origin.x, sy)
                    self.ctx.lineTo(self.origin.x+self.length, sy)
                    self.ctx.closePath()
                    self.ctx.stroke()
                    self.ctx.textAlign = 'center'
                    self.ctx.font = 'small-caps 10px arial'
                    self.ctx.fillText(bx[num], sx, self.origin.y-5)
                    self.ctx.fillText(wx[num], sx, self.origin.y + self.length + 15)
                    self.ctx.textAlign = 'right'
                    self.ctx.fillText(num+1, self.origin.x - self.unit/4, sy + 5)
                    self.ctx.textAlign = 'left'
                    self.ctx.fillText(num+1, self.origin.x + self.length + self.unit/4, sy + 5)
                }
                var drawStar = function (x, y) {
                    if (x < 0) {
                        x += self.size
                    }
                    if (y < 0) {
                        y+= self.size
                    }
                    var sx = self.origin.x + x * self.unit
                    var sy = self.origin.y + y * self.unit
                    self.ctx.beginPath()
                    self.ctx.fillStyle = '#000'
                    self.ctx.strokeStyle = '#000'
                    self.ctx.arc(sx,sy, self.unit/10, 0, 2*Math.PI, false)
                    self.ctx.closePath()
                    self.ctx.fill()
                }
                drawBackground()
                for (var i=0;i<=self.size;i++) {
                    drawLine(i)
                }
                drawStar(3,3)
                drawStar(-3,3)
                drawStar(3, -3)
                drawStar(-3,-3)
                var o = Math.floor(self.size/2)
                drawStar(o,o)
                drawStar(3,o)
                drawStar(o,3)
                drawStar(-3,o)
                drawStar(o,-3)
            }
            var drawChess = function (num, wb, x, y) {
                var sx = self.origin.x + (x-1) * self.unit
                var sy = self.origin.y + (y-1) * self.unit
                self.ctx.beginPath()
                self.ctx.lineWidth = 1
                self.ctx.strokeStyle = wb ? '#000' : '#fff'
                self.ctx.fillStyle = wb ? '#000' : '#fff'
                self.ctx.arc(sx,sy, self.unit*3/8, 0, 2*Math.PI, false)
                self.ctx.closePath()
                self.ctx.fill()
                self.ctx.stroke()

                self.ctx.textAlign = 'center'
                self.ctx.fillStyle = !wb ? '#000' : '#fff'
                self.ctx.font = 'small-caps 10px arial'
                self.ctx.fillText(num,sx,sy+5)
            }
            var drawTry = function (wb, x, y) {
                var sx = self.origin.x + (x-1) * self.unit
                var sy = self.origin.y + (y-1) * self.unit
                self.ctx.beginPath()
                self.ctx.lineWidth = 1
                self.ctx.strokeStyle = wb ? '#000' : '#fff'
                self.ctx.fillStyle = wb ? '#000' : '#fff'
                self.ctx.arc(sx,sy, self.unit*3/8, 0, 2*Math.PI, false)
                self.ctx.closePath()
                self.ctx.fill()
                self.ctx.stroke()
            }
            drawBoard()
            for (var i=0;i<self.filled.length;i++) {
                var op = self.filled[i]
                drawChess(op.seq,op.wb,op.x,op.y)
            }
            if (self.try !== null) {
                var op = self.try
                drawTry(op.wb,op.x,op.y)
            }
        //    var drawButton = function() {
        //        for (var i=0;i<self.button.length;i++){
        //            var button = self.button[i]
        //            self.ctx.beginPath()
        //            self.ctx.lineWidth = 1
        //            self.ctx.strokeStyle = '#ccc'
        //            self.ctx.fillStyle = '#fff'
        //            self.ctx.rect(button.x,button.y,button.w,button.h)
        //            self.ctx.closePath()
        //            self.ctx.fill()
        //            self.ctx.stroke()

        //            self.ctx.textAlign = 'left'
        //            self.ctx.fillStyle = '#000'
        //            self.ctx.font = 'small-caps 16px arial'
        //            var text = typeof button.text === 'function' ? button.text() : button.text
        //            self.ctx.fillText(text,button.x+button.w/4,button.y+button.h*5/8)
        //        }
        //    }
        //    drawButton()
        //    var drawLabel = function() {
        //        for (var i=0;i<self.label.length;i++){
        //            var button = self.label[i]
        //            self.ctx.beginPath()
        //            self.ctx.lineWidth = 1
        //            self.ctx.strokeStyle = '#ccc'
        //            self.ctx.fillStyle = '#fff'
        //            self.ctx.rect(button.x,button.y,button.w,button.h)
        //            self.ctx.closePath()
        //            self.ctx.fill()
        //            self.ctx.stroke()

        //            self.ctx.textAlign = 'left'
        //            self.ctx.fillStyle = '#000'
        //            self.ctx.font = 'small-caps 16px arial'
        //            var text = typeof button.text === 'function' ? button.text() : button.text
        //            self.ctx.fillText(text,button.x+button.w/4,button.y+button.h*5/8)
        //        }
        //    }
        //    drawLabel()
        }
        self.resize = function (w,h) {
            self.cw = w
            self.ch = h
            resize()
            draw()
        }
        self.put = function(seq, cmd) {
            var op = decodeCmd(seq, cmd)
            if (op != null) {
                self.try = null
                self.filled.push(op)
                draw()
            }
        }
        self.preview = function(cmd) {
            var op = decodeCmd(0, cmd)
            if (op !== null) {
                self.try = op
                draw()
            }
        }
       // self.button = [] // button
       // self.addButton = function(text, onclick) {
       //     var existButton = self.button.length + 1
       //     self.button.push({
       //         text:text,
       //         onclick:onclick,
       //         x:self.cw - self.oplength,
       //         y:self.ch - self.oplength/2 - existButton * self.oplength,
       //         w:self.oplength,
       //         h:self.oplength/2,
       //     })
       // }
       // self.label = [] // label
       // self.addLabel = function(text) {
       //     var existLabel = self.label.length + 1
       //     self.label.push({
       //         text:text,
       //         x:0,
       //         y:existLabel * self.oplength,
       //         w:self.oplength,
       //         h:self.oplength/2,
       //     })
       // }
        draw()
    }
    window.go2d= go2d
})()
