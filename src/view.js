// pre-declared vars to avoid garbage collector overhead when drawing
var currentTime;
let final_cx;
let final_cy;
let final_cz;
var aspect;
var zNear;
var zFar;
var fieldOfViewDeg;
var viewWorld;
var lightDirMatrix;
var normalMatrix;
var directionalLight;
var directionalLightTransformed;

// parameters for the FPS calculation
var elapsedTime = 0;
var frameCount = 0;
var lastTime = 0;

function drawScene() {

    // center view on the ghost if we're playing
    if(PLAY_MODE){
        cx = ghost.x;
        cy = ghost.y;
        cz = ghost.z;
    }



    worldMatrix = utils.MakeWorld(0.0,0.0,0.0,0.0,0.0,Rz,S);

    final_cx = cx + lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    final_cy = cy + lookRadius * Math.sin(utils.degToRad(-elevation));
    final_cz = cz + lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    viewMatrix = utils.MakeView(final_cx, final_cy, final_cz, elevation, angle);
    // Compute the matrix
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    zNear = 1;
    zFar = 2000;
    fieldOfViewDeg = 40;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    viewWorld = utils.multiplyMatrices(viewMatrix, worldMatrix);
    projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorld);
    lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));
    normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorld));
    directionalLight = [Math.cos(theta) * Math.cos(phi),
        Math.sin(theta),Math.cos(theta) * Math.sin(phi)];
    directionalLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4((lightDirMatrix)), directionalLight);

    gl.uniformMatrix4fv(pMatrixLocation, gl.FALSE, utils.transposeMatrix(viewWorld));
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(nMatrixLocation, gl.FALSE, utils.transposeMatrix(normalMatrix));
    
    // Parameters to pass to Fragment Shader for direct light
    gl.uniform3fv(dirLocation,directionalLightTransformed);
    gl.uniform4fv(lightColorLocation,lightColor);
    gl.uniform4fv(specularColorLocation,specularColor);
    gl.uniform4fv(ambientLightColorLocation,ambientLightColor);
    gl.uniform1f(specShineLocation,specShine);
    gl.uniform1f(orenNayarRoughnessLocation,orenNayarRoughness);
    gl.uniform3f(eyePosLocation, final_cx, final_cy, final_cz);

    // set transform to identity
    gl.uniformMatrix4fv(tMatrixLocation, gl.FALSE, utils.identityMatrix());

    // cursor
   if(!PLAY_MODE) {
        gl.uniform1f(transparencyLocation, 0.75);
        drawObject(cursor.positionBuffer, cursor.indicesBuffer, cursor.indices.length, cursor.colorBuffer,
            cursor.uvBuffer, cursor.normalsBuffer, gl.TRIANGLES, cursor.texture);
        gl.uniform1f(transparencyLocation, 1.0); // unset transparency
    }

    // blocks
    for(var i = 0; i<blocks.length; i++) {
        drawObject(blocks[i].positionBuffer, blocks[i].indicesBuffer, blocks[i].indices.length, blocks[i].colorBuffer,
            blocks[i].uvBuffer, blocks[i].normalsBuffer, gl.TRIANGLES,blocks[i].texture);
    }

    // ghost
    if(PLAY_MODE) {
        // compute current transforms given current time
        ghost.computeTranslate();

        // set transforms
        gl.uniformMatrix4fv(tMatrixLocation, gl.FALSE, utils.transposeMatrix(
                utils.multiplyMatrices(ghost.translate,utils.MakeRotateYMatrix(ghost.yRotate+90)))
        );

        drawObject(ghost.positionBuffer, ghost.indicesBuffer, ghost.indices.length ,ghost.colorBuffer,
            null, ghost.normalsBuffer, gl.TRIANGLES, 1);
    }

    // FPS count
    var now = new Date().getTime();
    frameCount++;
    elapsedTime += (now - lastTime);
    lastTime = now;
    if(elapsedTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        elapsedTime = 0;
        document.getElementById('fps').innerHTML = "FPS : "+fps;
    }


    window.requestAnimationFrame(drawScene);
}

function drawObject(positionBuffer, indicesBuffer, nbIndices, colorBuffer, uvBuffer, normalsBuffer, mode, texture){
    //Set for texture
    gl.bindTexture(gl.TEXTURE_2D, texturesVector[texture]);
    gl.uniform1i(textLocation, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    if(uvBuffer != null) {
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.enableVertexAttribArray(uvAttributeLocation);
        gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // blocks
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

    gl.drawElements(mode, nbIndices, gl.UNSIGNED_SHORT, 0 );
}



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
uniform float OrenNayarRoughness;
uniform float Transparency;
uniform vec3 eyePos;

out vec4 outColor;

uniform sampler2D u_texture;

vec4 compDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyeDirVec, vec4 diffColor) {
	// Diffuse
	// --> Lambert
	vec4 diffuseLambert = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	// --> Oren-Nayar
	// 2 parameters
	float sigma = OrenNayarRoughness; // roughness
	vec4 md = diffColor; // main color
	
	float tetai = acos(dot(normalVec,lightDir));
	float tetar = acos(dot(normalVec,eyeDirVec));
	float alpha = max(tetai,tetar);
	float beta = min(tetai,tetar);
	float A = 1.0 - 0.5*sigma*sigma/(sigma*sigma+0.33);
	float B = 0.45*sigma*sigma/(sigma*sigma+0.09);
	vec3 vi = normalize(lightDir - dot(normalVec,lightDir)*normalVec);
	vec3 vr = normalize(eyeDirVec - dot(normalVec,eyeDirVec)*normalVec);
	float G = max(0.0, dot(vi,vr));
	vec4 L = md*clamp(dot(normalVec, lightDir),0.0,1.0);
	vec4 diffuseOrenNayar = L*(A+B*G*sin(alpha)*tan(beta));
	
	// ----> Select final component
	return diffuseOrenNayar;
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
	vec4 diffuse = compDiffuse(nLightDirection, lightColor, normalVec, eyedirVec, texcol);
  // Specular
	// --> Phong
	vec4 specular = compSpecular(nLightDirection, lightColor, normalVec, eyedirVec);
  vec4 out_color = clamp(ambient + diffuse + specular, 0.0, 1.0);

  outColor = vec4(out_color.rgb, Transparency);
}
`;