function Editor(canvasId, SplineObj){
    this.canvas = initCanvas(canvasId);
    var rect = this.canvas.getBoundingClientRect();
    var s = rect.height/2;
    this.canvas.dotLs = [];
    var dotR = 5;
    this.canvas.currDot = false;
    this.canvas.showDot= true;

    this.show = function(){
        this.canvas.showDot = false;
    }

    this.canvas.getMousePos = function(evt) {
      var rect = this.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }
    this.canvas.addEventListener('mousedown', function(evt) {
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
            this.dotLs.push(mousePos);
        }
    }, false);

    this.canvas.addEventListener('mouseup', function(evt) {
        this.currDot = false;
    }, false);

    this.canvas.addEventListener('mousemove', function(evt) {
        if(this.currDot !== false){
            this.dotLs[this.currDot] = this.getMousePos(evt);
        }
    }, false);


    this.canvas.update = function(g){
        var x = this.cursor.x, y = this.cursor.y;

        if(this.showDot){
            for(var di = 0; di < this.dotLs.length; di++){
                g.beginPath();
                g.arc(this.dotLs[di].x, this.dotLs[di].y, dotR, 0, 2 * Math.PI, false);
                g.fillStyle = 'pink';
                g.fill();
            }
        }

        var i = 0;
        while(i+3 < this.dotLs.length){
            var spline = SplineObj(this.dotLs[i+0], this.dotLs[i+1], this.dotLs[i+2], this.dotLs[i+3]);
            spline.draw(g, 'rgb(256, 256, 128)');
            i += 4;
        }

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
