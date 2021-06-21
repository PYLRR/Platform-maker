var canvas;
var gl = null;
var program = null;
var pMatrixLocation,tMatrixLocation,matrixLocation,nMatrixLocation;


var projectionMatrix, 
  perspectiveMatrix,
  viewMatrix, worldMatrix,
  positionAttributeLocation, colorAttributeLocation,uvAttributeLocation,textLocation,normalAttributeLocation,
  dirLocation,lightColorLocation,eyePosLocation,specularColorLocation,specShineLocation,ambientLightColorLocation;

//Objects will be localized in a grid of squares of this size, centralized at opengl (0,0)
var STEP = 0.25;
var MAX_X = 100;
var MAX_Y = 100;
var MAX_Z = 100;

// Control parameters
// boolean telling if we are playing
PLAY_MODE = false;

// Ghost
var ghost;

//Parameters cursor. Its coordinates are in the global grid
var cursorColor = [0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
  0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0];
var cursor;

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
//There should be a file called NAMETEXTUREcube.png
var textureIDEnum = Object.freeze(
    ["dirt","sand"]
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

//Parameters for the direct light
var theta = -utils.degToRad(60);
var phi = -utils.degToRad(45);
var lightColor = [1.0,1.0,1.0,1.0];
var specularColor = [1.0,1.0,1.0,1.0];
var ambientLightColor = [0.1,0.1,0.1,1.0];
var specShine = 300.0;

var vertexShaderSource = `#version 300 es

in vec3 a_position;
in vec3 a_color;
in vec2 a_uv;
in vec3 a_norm;

out vec2 uvFS;
out vec3 colorV;
out vec3 fs_norm;
out vec3 fs_pos;

uniform mat4 pMatrix;
uniform mat4 matrix;
uniform mat4 tMatrix;
uniform mat4 nMatrix;

void main() {
  colorV = a_color;
  uvFS = a_uv;
  fs_norm = mat3(nMatrix) * a_norm;
  fs_pos = (pMatrix * vec4(a_position, 1.0)).xyz;
  gl_Position = matrix * tMatrix * vec4(a_position,1.0);
}
`;

var fragmentShaderSource = `#version 300 es

precision mediump float;


in vec3 colorV;
in vec2 uvFS;
in vec3 fs_norm;
in vec3 fs_pos;

uniform vec3 Dir;
uniform vec4 lightColor;
uniform vec4 specularColor;
uniform vec4 ambientLightColor;
uniform float SpecShine;
uniform vec3 eyePos;

out vec4 outColor;

uniform sampler2D u_texture;

vec4 compDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec4 diffColor) {
	// Diffuse
	// --> Lambert
	vec4 diffuseLambert = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	// ----> Select final component
	return diffuseLambert;
}

vec4 compSpecular(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyedirVec) {
	// Specular
	// --> Blinn
	vec3 halfVec = normalize(lightDir + eyedirVec);
	vec4 specularBlinn = lightCol * pow(max(dot(normalVec, halfVec), 0.0), SpecShine) * specularColor;

	// ----> Select final component
	return specularBlinn;
}

void main() {
  //outColor = vec4(colorV,1.0);
  vec4 texcol = texture(u_texture, uvFS) * vec4(colorV,1.0);
  
  vec3 normalVec = normalize(fs_norm);
  vec3 eyedirVec = normalize(-fs_pos);
  vec3 nLightDirection = normalize(-Dir);
  
  // Ambient
	vec4 ambient = ambientLightColor * texcol;
  // Diffuse
	vec4 diffuse = compDiffuse(nLightDirection, lightColor, normalVec, texcol);
  // Specular
	// --> Phong
	vec4 specular = compSpecular(nLightDirection, lightColor, normalVec, eyedirVec);
  vec4 out_color = clamp(ambient + diffuse + specular, 0.0, 1.0);

  outColor = vec4(out_color.rgb, 1.0);
}
`;
var posb;
var cb;
var nb;
var ib;

function main() {
  // Removes default behavior of arrow keys and space bar
  window.addEventListener("keydown", function(e) {
      // space and arrow keys
      if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
      }
  }, false);
  // Removes default behavior of mouse wheel
  window.addEventListener("wheel", e => e.preventDefault(), { passive:false });
  window.addEventListener('contextmenu', event => event.preventDefault());

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
    texture.image.src = baseDir + textureIDEnum[i] + "cube.png";
    texture.image.onload = (function()
    {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

      gl.bindTexture(gl.TEXTURE_2D, null);
      imagesToLoad--;
      if(imagesToLoad===0){
        drawScene();
      }
    });
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // look up where the vertex data needs to go.
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
  colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
  normalAttributeLocation = gl.getAttribLocation(program, "a_norm");  
  pMatrixLocation = gl.getUniformLocation(program, "pMatrix");
  matrixLocation = gl.getUniformLocation(program, "matrix");
  tMatrixLocation = gl.getUniformLocation(program, "tMatrix");
  nMatrixLocation = gl.getUniformLocation(program, 'nMatrix');
  textLocation = gl.getUniformLocation(program, "u_texture");
  dirLocation = gl.getUniformLocation(program, "Dir");
  lightColorLocation = gl.getUniformLocation(program, "lightColor");
  eyePosLocation = gl.getUniformLocation(program,"eyePos");
  specularColorLocation = gl.getUniformLocation(program, "specularColor");
  specShineLocation = gl.getUniformLocation(program, "SpecShine");
  ambientLightColorLocation = gl.getUniformLocation(program, "ambientLightColor");


  cursor = makeBlock(0,0,0,0,cursorColor);
  ghost = new Ghost();
}


window.onload = main;
//'window' is a JavaScript object (if "canvas", it will not work)
window.addEventListener("keyup", keyUpFunction, false);
window.addEventListener("keydown", keyDownFunction, false);

