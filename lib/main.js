var canvas;
var gl = null;
var program = null;
var matrixLocation;


var projectionMatrix, 
  perspectiveMatrix,
  viewMatrix, worldMatrix,positionAttributeLocation, colorAttributeLocation,uvAttributeLocation,textLocation;

//Objects will be localized in a grid of squares of this size, centralized at opengl (0,0)
var STEP = 0.25;
var MAX_X = 100;
var MAX_Y = 100;
var MAX_Z = 100;

//Parameters cursor. Its coordinates are in the global grid
var cursorColor = [0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0];
var cursor = makeBlock(0,0,0,0,cursorColor);

//Parameters for blocks
var blocks = [];
var blockAtCoord = new Map(); // to find a block with its coords. Key must me x+y*(maxX+1)+z*(maxY*(maxX+1)+1)
var blockDefaultColor = [1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
  1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
  1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
  1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
  1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
  1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0];

//List of available textures, freeze is to avoid we modify it
//There should be a file called NAMETEXTURE.png
var textureIDEnum = Object.freeze(
    ["dirt","sand","stasi","bianco"]
);
var texturesVector = []; // will contain the different textures

//Parameters for Camera
// translation offsets of rotation center. Beginning at STEP/2 to center on the block (0,0)
var cx = STEP/2;
var cy = STEP/2;
var cz = STEP/2;
var elevation = 0.0;
var angle = 0.0;

var lookRadius = 2.0;

var delta = 0.1;

var S = 1.0;
var Rz = 0.0;

var vertexShaderSource = `#version 300 es

in vec3 a_position;
in vec3 a_color;
in vec2 a_uv;

out vec2 uvFS;
out vec3 colorV;

uniform mat4 matrix; 
void main() {
  colorV = a_color;
  uvFS = a_uv;
  gl_Position = matrix * vec4(a_position,1.0);
}
`;

var fragmentShaderSource = `#version 300 es

precision mediump float;


in vec3 colorV;
in vec2 uvFS;

out vec4 outColor;

uniform sampler2D u_texture;

void main() {
  //outColor = vec4(colorV,1.0);
  outColor = texture(u_texture, uvFS) * vec4(colorV,1.0);
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
  // Removes default behavior of mouse wheel
  window.addEventListener("wheel", e => e.preventDefault(), { passive:false })

  // Get a WebGL context
  canvas = document.getElementById("c");
  // handle mouse mouve
  canvas.addEventListener("mousedown", doMouseDown, false);
  canvas.addEventListener("mouseup", doMouseUp, false);
  canvas.addEventListener("mousemove", doMouseMove, false);
  canvas.addEventListener("wheel", doMouseWheel, false);

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


  // load the different texture files
  var imagesToLoad = textureIDEnum.length;
  var path = window.location.pathname;
  var page = path.split("/").pop();
  var baseDir = window.location.href.replace(page, '');
  for(var i=0; i<textureIDEnum.length;i++){
    let texture = gl.createTexture();
    texturesVector[i] = texture;
    texture.image = new Image();
    texture.image.src = baseDir + textureIDEnum[i] + ".png";
    texture.image.onload = (function()
    {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

      gl.bindTexture(gl.TEXTURE_2D, null);
      imagesToLoad--;
      if(imagesToLoad===0){
        drawScene();
      }
    });
  }



  // look up where the vertex data needs to go.
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
  colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  uvAttributeLocation = gl.getAttribLocation(program, "a_uv");  
  matrixLocation = gl.getUniformLocation(program, "matrix");
  textLocation = gl.getUniformLocation(program, "u_texture");


  }



window.onload = main;
//'window' is a JavaScript object (if "canvas", it will not work)
window.addEventListener("keyup", keyFunction, false);

