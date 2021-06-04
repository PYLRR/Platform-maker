var canvas;
var gl = null;
var program = null;
var vao;
var indexBuffer;
var matrixLocation;

var projectionMatrix, 
  perspectiveMatrix,
  viewMatrix, worldMatrix,positionAttributeLocation, colorAttributeLocation;

//Parameters for level editor
var cursorx = 0.0;
var cursory = 0.0;
var cursorStep = 0.25;

//Default objects
var vertices = [0.0,0.0,0.0,
    cursorStep,0.0,0.0,
    cursorStep,cursorStep,0.0,
    0.0,cursorStep,0.0];

var indices = [];

var colors = [1.0,0.0,0.0,
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

// adds a square where (x,y) is its bottom left corner
function addSquare(x,y,size) {
    var index = vertices.length/3;
    vertices = vertices.concat([x,y,0.0]);
    vertices = vertices.concat([x+size,y,0.0]);
    vertices = vertices.concat([x+size,y+size,0.0]);
    vertices = vertices.concat([x,y+size,0.0]);

    indices = indices.concat([index,index+1, index+2]);
    indices = indices.concat([index+2,index+3, index]);

    colors = colors.concat([0.0, 1.0, 1.0]);
    colors = colors.concat([0.0, 1.0, 1.0]);
    colors = colors.concat([0.0, 1.0, 1.0]);
    colors = colors.concat([0.0, 1.0, 1.0]);
}

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


  function drawScene() {

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // blocks
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); 

    worldMatrix = utils.MakeWorld(0.0,0.0,0.0,0.0,0.0,Rz,S);
    viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var fieldOfViewDeg = 40;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    var viewWorld = utils.multiplyMatrices(viewMatrix, worldMatrix);
    projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorld);

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix)); 

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );

    // cursor
    indexBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,1,2,2,3,3,0]), gl.STATIC_DRAW);

    gl.drawElements(gl.LINES, 8, gl.UNSIGNED_SHORT, 0 );

  }

function keyFunction(e){

    switch (e.keyCode) {
        case 13:  // enter
            addSquare(cursorx, cursory, cursorStep);
            break;
        case 37:  // left
            cursorx -= cursorStep;
            break;
        case 38:  // up
            cursory += cursorStep;
            break;
        case 39:  // right
            cursorx += cursorStep;
            break;
        case 40:  // down
            cursory -= cursorStep;
            break;
    }
    // redraw the cursor
    vertices[0] = cursorx;
    vertices[3] = cursorx + cursorStep;
    vertices[6] = cursorx + cursorStep;
    vertices[9] = cursorx;
    vertices[1] = cursory;
    vertices[4] = cursory;
    vertices[7] = cursory + cursorStep;
    vertices[10] = cursory + cursorStep;


    window.requestAnimationFrame(drawScene);
}

window.onload = main;
//'window' is a JavaScript object (if "canvas", it will not work)
window.addEventListener("keyup", keyFunction, false);

