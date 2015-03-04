
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
         var mixer  = {value: Math.abs(gl.cursor.x) + Math.abs(gl.cursor.y), max: 1};
         var filter = {value: Math.abs(gl.cursor.x) + Math.abs(gl.cursor.y), max: 1};
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

   ['uTime','uCursor', 'uSphere', 'uTranSphere', 'uInterSphere', 'uF'].forEach(function(name) {
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
var f = 5;

var rx = 1;
var ry = 1;

   var uInterSphere = [];
   uInterSphere[0] = {x: 0., y: Math.sqrt(3.), z: -10., r: 2.};
   uInterSphere[1] = {x: -1., y: 0., z: -10., r: 2.};
   uInterSphere[2] = {x: 1., y: 0., z: -10., r: 2.};
   uInterSphere[3] = {x: 0., y: 1./Math.sqrt(3.), z: 2.*Math.sqrt(2.)/Math.sqrt(3.)-10., r: 2.};

   var middle = {x: 0, y:0, z:0};
   for(var i = 0; i < uInterSphere.length; i++){
  	 middle.x += uInterSphere[i].x/uInterSphere.length;
  	 middle.y += uInterSphere[i].y/uInterSphere.length;
  	 middle.z += uInterSphere[i].z/uInterSphere.length;
   }
   


function gl_update(gl) {
   
   if(mouseDown){
  	 rx = gl.cursor.x;
  	 ry = gl.cursor.y;
		 startTime = (new Date()).getTime();
		 mouseDown = false;
   }

   var time = ((new Date()).getTime() - startTime) / 1000;            // Set uniform variables

   tt = (new Date()).getTime()/1000;

  	 rx = gl.cursor.x;
  	 ry = gl.cursor.y;
   
   uSphere = [middle.x, middle.y - 53., middle.z - 5., 50];
   uTranSphere = [2.3*Math.sin(tt/1.7) + middle.x, middle.y, 2.3*Math.cos(tt/1.7) + middle.z, 1.];
   gl.uniform4fv(gl.uTranSphere, uTranSphere);
   gl.uniform4fv(gl.uSphere, uSphere);
   gl.uniform1f(gl.uF, f);
   
   function rotate(a, b, pos){
  	 pos.x -= middle.x;
  	 pos.y -= middle.y;
  	 pos.z -= middle.z;

  	 var y = Math.cos(a) * pos.y - Math.sin(a) * pos.z;
  	 var z = Math.sin(a) * pos.y + Math.cos(a) * pos.z;
  	 pos.y = y;
  	 pos.z = z;
  	 
  	 var x = Math.cos(b) * pos.x - Math.sin(b) * pos.z;
         z = Math.sin(b) * pos.x + Math.cos(b) * pos.z;
  	 pos.x = x;
  	 pos.z = z;

  	 pos.x += middle.x;
  	 pos.y += middle.y;
  	 pos.z += middle.z;
   }
   
   var arr = []
   for(var i = 0; i < uInterSphere.length; i++){
  	 rotate(-Math.PI*ry*0.01, -Math.PI*rx*0.01, uInterSphere[i])
  	 arr.push(uInterSphere[i].x)
  	 arr.push(uInterSphere[i].y)
  	 arr.push(uInterSphere[i].z)
  	 arr.push(uInterSphere[i].r)
   }

   gl.uniform4fv(gl.uInterSphere, arr);
   

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

