var canvas;
var gl = null;
var program = null;
var matrixLocation;

var projectionMatrix, 
  perspectiveMatrix,
  viewMatrix, worldMatrix,positionAttributeLocation, colorAttributeLocation;

//Objects will be localized in a grid of squares of this size, centralized at opengl (0,0)
var step = 0.25;
var maxX = 100;
var maxY = 100;

//Parameters cursor. Its coordinates are in the global grid
var cursorx = 0;
var cursory = 0;
var cursorVertices = [0.0,0.0,0.0,
    step,0.0,0.0,
    step,step,0.0,
    0.0,step,0.0];
var cursorIndices = [0,1,1,2,2,3,3,0];
var cursorColor = [0.0,0.0,0.0,
  0.0,0.0,0.0,
  0.0,0.0,0.0,
  0.0,0.0,0.0];

//Parameters for blocks
var blocks = [];
var blockAtCoord = new Map(); // to find a block with its coords. Key must me x*(maxX+1)+y
var blockDefaultColor = [1.0,0.0,0.0,
1.0,0.0,0.0,
1.0,0.0,0.0,
1.0,0.0,0.0];


//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 3.0;
var elevation = 0.0;
var angle = 0.0;

var delta = 0.1;

var S = 1.0;
var Rz = 0.0;

var vertexShaderSource = `#version 300 es

in vec3 a_position;
in vec3 a_color;
out vec3 colorV;

uniform mat4 matrix; 
void main() {
  colorV = a_color;
  gl_Position = matrix * vec4(a_position,1.0);
}
`;

var fragmentShaderSource = `#version 300 es

precision mediump float;


in vec3 colorV;
out vec4 outColor;

void main() {
  outColor = vec4(colorV,1.0);
}
`;



function main() {

  // Removes default behavior of arrow keys and space bar
  window.addEventListener("keydown", function(e) {
      // space and arrow keys
      if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
      }
  }, false);

  // Get a WebGL context
  canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }
  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  //Setting the size for the canvas equal to half the browser window
  var w=canvas.clientWidth;
  var h=canvas.clientHeight;
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.viewport(0.0, 0.0, w, h);

  // create GLSL shaders, upload the GLSL source, compile the shaders and link them
  var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = utils.createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
  colorAttributeLocation = gl.getAttribLocation(program, "a_color");  
  matrixLocation = gl.getUniformLocation(program, "matrix");

  drawScene();
  }



window.onload = main;
//'window' is a JavaScript object (if "canvas", it will not work)
window.addEventListener("keyup", keyFunction, false);

