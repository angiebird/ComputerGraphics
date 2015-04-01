function moveDot(dot, rat, P){
    rat.x = P.x + rat.x-dot.x; 
    rat.y = P.y + rat.y-dot.y; 
    dot.x = P.x;
    dot.y = P.y;
}
function drawDotLs(g, showDot, dotLs, dotR, SplineObj){
    var i = 0;
    while(i+3 < dotLs.length){
        var spline = SplineObj(dotLs[i+0], dotLs[i+1], dotLs[i+2], dotLs[i+3]);
        g.lineWidth=5;
        spline.draw(g, 'rgb(256, 256, 128)');
        g.lineWidth=1;
        i += 4;
    }
    if(showDot){
        for(var di = 0; di < dotLs.length; di++){
            g.beginPath();
            g.arc(dotLs[di].x, dotLs[di].y, dotR, 0, 2 * Math.PI, false);
            if(di %2 == 0){
                g.fillStyle = 'blue';
            }
            else{
                g.fillStyle = 'pink';
            }
            g.fill();
            if(di %2 == 1){
                g.setLineDash([1,2]);
                g.strokeStyle = 'pink';
                g.beginPath();
                g.moveTo(dotLs[di-1].x,dotLs[di-1].y);
                g.lineTo(dotLs[di].x,dotLs[di].y);
                g.stroke();
                g.setLineDash([]);
            }
        }
    }
}

function dotLsToButtle(dotLs, SplineObj, xm){
    var obj = new Obj();
    var vLs = []
    var i = 0;
    while(i+3 < dotLs.length){
        var spline = SplineObj(dotLs[i+0], dotLs[i+1], dotLs[i+2], dotLs[i+3]);
        vLs = vLs.concat(spline.vLs);
        i += 4;
    }

    var n = vLs.length;
    var m = 50;
    for(var i = 0; i < n; i++){
        var y = vLs[i].y;
        var r = vLs[i].x - xm;
        for(var j = 0; j < m; j++){
            var v = 1/m*j;
            var theta = 2 * Math.PI * v;

            var x = r * Math.sin(theta);
            var z = r * Math.cos(theta);

            obj.addVertex(x, y, z);


            var curr = i * m + j;

            // down
            if(i+1 < n){
                var down = (i+1) * m + j;
                obj.addEdge(curr, down);
            }

            // right
            var right= i * m + (j+1)%m
            obj.addEdge(curr, right);
        }
    }
    return obj;
}

function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}
function Editor(canvasId, SplineObj){
    this.canvas = initCanvas(canvasId);
    var rect = this.canvas.getBoundingClientRect();
    var s = rect.height/2;
    this.canvas.lineLs = [];
    this.canvas.dotLs = [];
    var dotR = 5;
    this.canvas.currDot = false;
    this.canvas.showDot= true;


    this.show = function(){
        this.canvas.showDot = !this.canvas.showDot;
    }
    this.canvas.getMousePos = function(evt) {
      var rect = this.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }
    this.canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
    this.canvas.addEventListener('mousedown', function(evt) {
        console.log(evt.button);
        if(evt.button === 2){
            //console.log("hello right");
            //this.lineLs.push(this.dotLs);
            this.dotLs = [];
            //console.log(this.lineLs[0]);
        }
        else if(evt.button === 1){
            this.showDot = !this.showDot;
        }
        else if(evt.button === 0){
            //console.log("hello left");
            var mousePos = this.getMousePos(evt);
            var addFlg = true;
            var minDist = 2*dotR;
            for(var di = 0; di < this.dotLs.length; di++){
                var dist = Math.abs(this.dotLs[di].x - mousePos.x) + Math.abs(this.dotLs[di].y - mousePos.y);
                if(dist < minDist){
                    miniDist = dist;
                    addFlg = false;
                    this.currDot = di;
                }
            }
            if(addFlg){
                var idx = this.dotLs.length;
                if(idx % 4 == 0 && idx >= 4){
                    var P = {};
                    var R = {};
                    P.x = this.dotLs[idx-2].x;
                    P.y = this.dotLs[idx-2].y;
                    R.x = P.x + P.x - this.dotLs[idx-1].x;
                    R.y = P.y + P.y - this.dotLs[idx-1].y;
                    this.dotLs.push(P);
                    this.dotLs.push(R);
                    this.dotLs.push(mousePos);

                    var RR = {};
                    RR.x = (this.dotLs[idx-1].x + mousePos.x)/2;
                    RR.y = (this.dotLs[idx-1].y + mousePos.y)/2;
                    this.dotLs.push(RR);
                }
                else if(idx %4 == 1){
                    var R = {};
                    R.x = (this.dotLs[idx-1].x + mousePos.x)/2;
                    R.y = (this.dotLs[idx-1].y + mousePos.y)/2;
                    this.dotLs.push(R);
                    this.dotLs.push(mousePos);
                    this.dotLs.push(R);
                }
                else{
                    this.dotLs.push(mousePos);
                }
            }
        }
    }, false);

    this.canvas.addEventListener('mouseup', function(evt) {
        this.currDot = false;
    }, false);

    this.canvas.addEventListener('mousemove', function(evt) {
        if(this.currDot !== false){
            if(this.currDot % 4 == 2 && this.currDot + 2 < this.dotLs.length){
                //this.dotLs[this.currDot+2] = this.getMousePos(evt);
                moveDot(this.dotLs[this.currDot+2], this.dotLs[this.currDot+3], this.getMousePos(evt))
                moveDot(this.dotLs[this.currDot], this.dotLs[this.currDot+1], this.getMousePos(evt))
            }
            else if(this.currDot % 4 == 0 && this.currDot - 2 >= 0){
                moveDot(this.dotLs[this.currDot-2], this.dotLs[this.currDot-1], this.getMousePos(evt))
                moveDot(this.dotLs[this.currDot], this.dotLs[this.currDot+1], this.getMousePos(evt))
            }
            else{
            this.dotLs[this.currDot] = this.getMousePos(evt);
            }
        }
    }, false);

    this.canvas.addEventListener('dblclick', function(evt) {
        var mousePos = this.getMousePos(evt);
        var minDist = 2*dotR;
        var currDot = false;
        for(var di = 0; di < this.dotLs.length; di++){
            var dist = Math.abs(this.dotLs[di].x - mousePos.x) + Math.abs(this.dotLs[di].y - mousePos.y);
            if(dist < minDist){
                miniDist = dist;
                currDot = di;
            }
        }
        if(currDot !== false){
            if(currDot >= 2){
                if((currDot % 4) == 0){
                    this.dotLs[currDot] = clone(this.dotLs[currDot-2]);
                }
                else if((currDot % 4) == 1){
                    this.dotLs[currDot].x = 2*this.dotLs[currDot-1].x  - this.dotLs[currDot-2].x;
                    this.dotLs[currDot].y = 2*this.dotLs[currDot-1].y  - this.dotLs[currDot-2].y;
                }
                else if((currDot % 4) == 2){
                    if(currDot + 2 < this.dotLs.length){
                        this.dotLs[currDot] = clone(this.dotLs[currDot+2]);
                    }
                }
                else if((currDot % 4) == 3){
                    if(currDot + 2 < this.dotLs.length){
                        this.dotLs[currDot].x = 2*this.dotLs[currDot+1].x  - this.dotLs[currDot+2].x;
                        this.dotLs[currDot].y = 2*this.dotLs[currDot+1].y  - this.dotLs[currDot+2].y;
                    }
                }
            }
        }
    }, false);


    this.canvas.update = function(g){
        var x = this.cursor.x, y = this.cursor.y;

        for(var li = 0; li < this.lineLs.length; li++){
            drawDotLs(g, this.showDot, this.lineLs[li], dotR, SplineObj);
        }
        drawDotLs(g, this.showDot, this.dotLs, dotR, SplineObj);

        var buttle = dotLsToButtle(this.dotLs, SplineObj, s);
        var T = new Matrix();
        T.scale(.5,.5,.5);
        T.translate(s/2, 0, 0);
        buttle.transform(T);
        buttle.draw(g, "pink");

        var time = (new Date()).getTime() / 1000;
        T = new Matrix();
        T.scale(.5,.5,.5);
        T.translate(0, -s/2, 0);
        T.rotateX(Math.PI/4);
        T.rotateY(time);
        T.translate(0, s/2, 0);
        T.translate(s/2, s, 0);
        buttle.transform(T);
        buttle.draw(g, "pink");


        var w = this.width;
        var h = this.height;

        g.strokeStyle = 'green';
        g.beginPath();
        g.moveTo(0,h/2);
        g.lineTo(w,h/2);
        g.stroke();

        g.beginPath();
        g.moveTo(w/2,0);
        g.lineTo(w/2,h);
        g.stroke();

        // draw the outer box
        g.strokeStyle = 'blue';
        g.beginPath();
        g.moveTo(0,0);
        g.lineTo(this.width,0);
        g.lineTo(this.width,this.height);
        g.lineTo(0,this.height);
        g.lineTo(0,0);
        g.stroke();
    }
    return this;
}
