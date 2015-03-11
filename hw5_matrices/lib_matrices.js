function Vector4(x, y, z, w) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
    this.set(x, y, z, w);
}
Vector4.prototype = {
    set : function(x, y, z, w) {
              if (x !== undefined) this.x = x;
              if (y !== undefined) this.y = y;
              if (z !== undefined) this.z = z;
              if (w !== undefined) this.w = w;
          },
}

function Matrix(){
    this.identity();
}
Matrix.prototype = {
    identity : function(){
        this.arr = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    },
    multiply : function(m){
        var temp = new Matrix();
        for(var i = 0; i < this.arr.length; i++){
            for(var j = 0; j < this.arr.length; j++){
                temp.arr[i][j] = 0;
                for(var k = 0; k < this.arr.length; k++){
                    temp.arr[i][j] += m.arr[i][k] * this.arr[k][j];
                }
            }
        }
        this.arr = temp.arr;
    },
    translate : function(x, y, z){
        this.arr[0][3] = x;
        this.arr[1][3] = y;
        this.arr[2][3] = z;
    },
    rotateX : function(theta){
        var m = new Matrix();
        m.arr[1][1] = Math.cos(theta);
        m.arr[1][2] = -Math.sin(theta);
        m.arr[2][1] = Math.sin(theta);
        m.arr[2][2] = Math.cos(theta);
        this.multiply(m);
    },
    rotateY : function(theta){
        var m = new Matrix();
        m.arr[0][0] = Math.cos(theta);
        m.arr[0][2] = Math.sin(theta);
        m.arr[2][0] = -Math.sin(theta);
        m.arr[2][2] = Math.cos(theta);
        this.multiply(m);
    },
    rotateZ : function(theta){
        var m = new Matrix();
        m.arr[0][0] = Math.cos(theta);
        m.arr[0][1] = -Math.sin(theta);
        m.arr[1][0] = Math.sin(theta);
        m.arr[1][1] = Math.cos(theta);
        this.multiply(m);
    },
    scale : function(x, y, z){
        var m = new Matrix();
        m.arr[0][0] = x;
        m.arr[1][1] = y;
        m.arr[2][2] = z;
        this.multiply(m);
    },
    transform : function(src, dst){
        dst.x = this.arr[0][0] * src.x + this.arr[0][1] * src.y + this.arr[0][2] * src.z + this.arr[0][3] * src.w;
        dst.y = this.arr[1][0] * src.x + this.arr[1][1] * src.y + this.arr[1][2] * src.z + this.arr[1][3] * src.w;
        dst.z = this.arr[2][0] * src.x + this.arr[2][1] * src.y + this.arr[2][2] * src.z + this.arr[2][3] * src.w;
        dst.w = this.arr[3][0] * src.x + this.arr[3][1] * src.y + this.arr[3][2] * src.z + this.arr[3][3] * src.w;
    }
}

function Obj(){
    this.vLs = [];
    this.transVLs = [];
    this.eLs = [];
    this.sLs = [];
}
Obj.prototype = {
    addVertex : function(x, y, z){
        this.vLs.push(new Vector4(x,y,z,1));
        this.transVLs.push(new Vector4(x,y,z,1));
    },
    addEdge : function(i, j){
        this.eLs.push([i, j]);
    },
    transform : function(m){
        for(var i = 0; i < this.vLs.length; i++){
            m.transform(this.vLs[i], this.transVLs[i]);
        }
    },
    draw : function(g, color){
        g.strokeStyle = color;
        for(var i = 0; i < this.eLs.length; i++){
            u = this.transVLs[this.eLs[i][0]];
            v = this.transVLs[this.eLs[i][1]];
            g.beginPath();
            g.moveTo(u.x, u.y);
            g.lineTo(v.x, v.y);
            g.stroke();
        }
    },
    sync : function(){
        for(var i = 0; i < this.vLs.length; i++){
            this.vLs[i].x = this.transVLs[i].x;
            this.vLs[i].y = this.transVLs[i].y;
            this.vLs[i].z = this.transVLs[i].z;
            this.vLs[i].w = this.transVLs[i].w;
        }
    }
}

function Cube(size){
    this.set(size);
}

Cube.prototype = {
    set : function(size){
        this.obj = new Obj();
        this.obj.addVertex(-size/2,-size/2, size/2);
        this.obj.addVertex( size/2,-size/2, size/2);
        this.obj.addVertex(-size/2, size/2, size/2);
        this.obj.addVertex( size/2, size/2, size/2);
        this.obj.addVertex(-size/2,-size/2,-size/2);
        this.obj.addVertex( size/2,-size/2,-size/2);
        this.obj.addVertex(-size/2, size/2,-size/2);
        this.obj.addVertex( size/2, size/2,-size/2);

        this.obj.addEdge(0, 1);
        this.obj.addEdge(1, 3);
        this.obj.addEdge(3, 2);
        this.obj.addEdge(2, 0);

        this.obj.addEdge(4, 5);
        this.obj.addEdge(5, 7);
        this.obj.addEdge(7, 6);
        this.obj.addEdge(6, 4);

        this.obj.addEdge(0, 4);
        this.obj.addEdge(1, 5);
        this.obj.addEdge(2, 6);
        this.obj.addEdge(3, 7);
    },
    transform : function(m){
        this.obj.transform(m);
    },
    sync : function(){
        this.obj.sync();
    },
    draw : function(g, color){
        this.obj.draw(g, color);
    }
}

function MagicCube(){
    this.set();
}

MagicCube.prototype = {
    set : function(){
        this.size = 3;
        this.cubeLs = [];
        var mid = 1;
        for(var i = 0; i < this.size; i++){
            this.cubeLs[i] = [];
            for(var j = 0; j < this.size; j++){
                this.cubeLs[i][j] = [];
                for(var k = 0; k < this.size; k++){
                    this.cubeLs[i][j][k] = new Cube(1);
                    var m = new Matrix();
                    m.translate(i - mid, j - mid, k - mid);
                    this.cubeLs[i][j][k].transform(m);
                    this.cubeLs[i][j][k].sync();
                }
            }
        }
    },
    transform : function(m){
        for(var i = 0; i < this.size; i++){
            for(var j = 0; j < this.size; j++){
                for(var k = 0; k < this.size; k++){
                    this.cubeLs[i][j][k].transform(m);
                }
            }
        }
    },
    draw : function(g, color){
        for(var i = 0; i < this.size; i++){
            for(var j = 0; j < this.size; j++){
                for(var k = 0; k < this.size; k++){
                    this.cubeLs[i][j][k].draw(g, color);
                }
            }
        }
    },
    rotate : function(dir, layer, theta){
        if(dir == 0){
            var m = new Matrix();
            m.rotateX(theta);
            for(var i = 0; i < this.size; i++){
                for(var j = 0; j < this.size; j++){
                    this.cubeLs[layer][i][j].transform(m);
                    this.cubeLs[layer][i][j].sync();
                }
            }
        }
        else if(dir == 1){
            var m = new Matrix();
            m.rotateY(theta);
            for(var i = 0; i < this.size; i++){
                for(var j = 0; j < this.size; j++){
                    this.cubeLs[j][layer][i].transform(m);
                    this.cubeLs[j][layer][i].sync();
                }
            }
        }
        else if(dir == 2){
            var m = new Matrix();
            m.rotateZ(theta);
            for(var i = 0; i < this.size; i++){
                for(var j = 0; j < this.size; j++){
                    this.cubeLs[i][j][layer].transform(m);
                    this.cubeLs[i][j][layer].sync();
                }
            }
        }
    },
    rotateIdx : function(dir, layer){
        if(dir == 0){
            for(var i = 0; i < this.size-1; i++){
                var temp = this.cubeLs[layer][0][i];
                this.cubeLs[layer][0][i] = this.cubeLs[layer][this.size-1-i][0];
                this.cubeLs[layer][this.size-1-i][0] = this.cubeLs[layer][this.size-1][this.size-1-i];
                this.cubeLs[layer][this.size-1][this.size-1-i] = this.cubeLs[layer][i][this.size-1];
                this.cubeLs[layer][i][this.size-1] = temp;
            }
        }
        else if(dir == 1){
            for(var i = 0; i < this.size-1; i++){
                var temp = this.cubeLs[i][layer][0];
                this.cubeLs[i][layer][0] = this.cubeLs[0][layer][this.size-1-i];
                this.cubeLs[0][layer][this.size-1-i] = this.cubeLs[this.size-1-i][layer][this.size-1];
                this.cubeLs[this.size-1-i][layer][this.size-1] = this.cubeLs[this.size-1][layer][i];
                this.cubeLs[this.size-1][layer][i] = temp;
            }
        }
        else if(dir == 2){
            for(var i = 0; i < this.size-1; i++){
                var temp = this.cubeLs[0][i][layer];
                this.cubeLs[0][i][layer] = this.cubeLs[this.size-1-i][0][layer];
                this.cubeLs[this.size-1-i][0][layer] = this.cubeLs[this.size-1][this.size-1-i][layer];
                this.cubeLs[this.size-1][this.size-1-i][layer] = this.cubeLs[i][this.size-1][layer];
                this.cubeLs[i][this.size-1][layer] = temp;
            }
        }
    },
}

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];
function initCanvas(id) {
    var canvas = document.getElementById(id);
    canvas.setCursor = function(x, y, z) {
        var r = this.getBoundingClientRect();
        this.cursor.set(x - r.left, y - r.top, z);
    }
    canvas.cursor = new Vector4(0, 0, 0, 1);
    canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
    canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
    canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
    canvases.push(canvas);
    return canvas;
}

function tick() {
    time = (new Date()).getTime() / 1000 - startTime;
    for (var i = 0 ; i < canvases.length ; i++)
        if (canvases[i].update !== undefined) {
            var canvas = canvases[i];
            var g = canvas.getContext('2d');
            g.clearRect(0, 0, canvas.width, canvas.height);
            canvas.update(g);
        }
    setTimeout(tick, 1000 / 60);
}
tick();

