
// Define a general purpose 3D vector object.

function Vector3() {
   this.x = 0;
   this.y = 0;
   this.z = 0;
}
Vector3.prototype = {
   set : function(x,y,z) {
      this.x = x;
      this.y = y;
      this.z = z;
   },
}

function start_gl(canvas_id, vertexShader, fragmentShader) {
   setTimeout(function() {
      try {
         var canvas = document.getElementById(canvas_id);
         var gl = canvas.getContext("experimental-webgl");
      } catch (e) { throw "Sorry, your browser does not support WebGL."; }

      // Catch mouse events that go to the canvas.

      function setMouse(event, eventZ) {
         var r = event.target.getBoundingClientRect();
         gl.cursor.x = (event.clientX - r.left  ) / (r.right - r.left) * 2 - 1;
         gl.cursor.y = (event.clientY - r.bottom) / (r.top - r.bottom) * 2 - 1;
         if (eventZ !== undefined){
        	 gl.cursor.z = eventZ;
        	 mouseDown = true;
         }
      }
      gl.cursor = new Vector3();
      canvas.onmousedown = function(event) { setMouse(event, 1); } // On mouse press, set z to 1.
      canvas.onmousemove = function(event) { setMouse(event) ; }
      canvas.onmouseup   = function(event) { setMouse(event, 0); } // On mouse press, set z to 0.

      // Initialize gl. Then start the frame loop.

      gl_init(gl, vertexShader, fragmentShader);
      gl_update(gl);

   }, 100); // Wait 100 milliseconds before starting gl.
}

// Function to create and attach a shader to a gl program.

function addshader(gl, program, type, src) {
   var shader = gl.createShader(type);
   gl.shaderSource(shader, src);
   gl.compileShader(shader);
   if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
   gl.attachShader(program, shader);
};

// Initialize gl and create a square, given vertex and fragment shader defs.

function gl_init(gl, vertexShader, fragmentShader) {

   // Create and link the gl program, using the application's vertex and fragment shaders.

   var program = gl.createProgram();
   addshader(gl, program, gl.VERTEX_SHADER  , vertexShader  );
   addshader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
   gl.linkProgram(program);
   if (! gl.getProgramParameter(program, gl.LINK_STATUS))
      throw "Could not link the shader program!";
   gl.useProgram(program);

   // Create vertex data for a square, as a strip of two triangles.

   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,0, 1,1,0, -1,-1,0, 1,-1,0 ]), gl.STATIC_DRAW);

   // Assign value of attribute aPosition for each of the square's vertices.

   gl.aPosition = gl.getAttribLocation(program, "aPosition");
   gl.enableVertexAttribArray(gl.aPosition);
   gl.vertexAttribPointer(gl.aPosition, 3, gl.FLOAT, false, 0, 0);

   // Get the address in the fragment shader of each of my uniform variables.

   ['uTime','uCursor', 'uPos', 'uPos1', 'uF'].forEach(function(name) {
      gl[name] = gl.getUniformLocation(program, name);
   });

/*
     gl['uTime'];
     gl["uTime"];
     gl.uTime;
*/
}

// Update is called once per animation frame.
var mouseDown = false;
var yf = -2; // floor
var f = 5;

var x0 = -2;
var y0 = 2;
var z = -10;
var r0 = 0.5;
var vx = 0.2;
var vy = 0;
var g = 0.8;

var x1 = 0.5;
var r1 = 1;
var y1 = yf + r1;

var ballAudio = new Audio('ball.mp3');
ballAudio.load();


function gl_update(gl) {
   
   if(mouseDown){
  	 x0 = gl.cursor.x*(f - z)/f;
  	 y0 = gl.cursor.y*(f - z)/f;
  	 vx = 0.2;
  	 vy = 0;
		 startTime = (new Date()).getTime();
		 mouseDown = false;
   }

   var time = ((new Date()).getTime() - startTime) / 1000;            // Set uniform variables

	 var x = x0+(vx*time);
	 var y = y0+(vy*time - 0.5*g*time*time)

	 if(y < yf + r0){ // bounce on the floor
		 x0 = x;
		 y0 = yf + r0;
		 vx = 0.9*vx;
		 vy = -0.7*(vy-g*time);
		 startTime = (new Date()).getTime();
		 if(Math.abs(vy > 0.1)){
			 ballAudio.play();
		 }
	 }
	 
	 var dist = Math.pow(Math.pow(x - x1, 2) + Math.pow(y - y1, 2), 0.5); // distance between two balls
	 if(dist < r0 + r1){ // bounce with big ball
	     var nx = (x - x1)/dist;
	     var ny = (y - y1)/dist;

		 	 x0 = x1 + nx*(r0 + r1);
		 	 y0 = y1 + ny*(r0 + r1);

		 	 vx = vx;
		 	 vy = vy - g*time;

	     var product = vx*nx + vy*ny;
	     vx = vx - 2 * product * nx;
	     vy = vy - 2 * product * ny;
		   startTime = (new Date()).getTime();
		   ballAudio.play();
	 }

   gl.uniform4f(gl.uPos, x, y, z, r0);
   gl.uniform4f(gl.uPos1, x1, y1, z, r1);
   gl.uniform1f(gl.uF, f);

   gl.uniform1f(gl.uTime  , time);                                    // in fragment shader.
   gl.uniform3f(gl.uCursor, gl.cursor.x, gl.cursor.y, gl.cursor.z);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);                            // Render the square.
   requestAnimFrame(function() { gl_update(gl); });                   // Animate.
}

// A browser-independent way to call a function after 1/60 second.

requestAnimFrame = (function(callback) {
      return requestAnimationFrame
          || webkitRequestAnimationFrame
          || mozRequestAnimationFrame
          || oRequestAnimationFrame
          || msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 1000 / 60); }; })();

// Remember what time we started, so we can pass relative time to shaders.

var startTime = (new Date()).getTime();

