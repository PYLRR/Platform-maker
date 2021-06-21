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



function drawScene() {


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
    gl.uniform3f(eyePosLocation, final_cx, final_cy, final_cz);

    // set transform to identity
    gl.uniformMatrix4fv(tMatrixLocation, gl.FALSE, utils.identityMatrix());

    // cursor
    drawObject(cursor.vertices,cursor.indices,cursor.colors, cursor.UVcoordinates, cursor.normals, gl.TRIANGLES,cursor.texture);

    // blocks
    for(var i = 0; i<blocks.length; i++) {
        drawObject(blocks[i].vertices, blocks[i].indices, blocks[i].colors, blocks[i].UVcoordinates, blocks[i].normals, gl.TRIANGLES,blocks[i].texture);
    }

    // ghost
    // compute current transforms
    currentTime = (new Date).getTime();
    deltaX = (currentTime - lastUpdateX) / 1000.0;
    deltaY = (currentTime - lastUpdateY) / 1000.0;
    deltaZ = (currentTime - lastUpdateZ) / 1000.0;
    ghostX += deltaX*ghostSpeedX;
    ghostY += deltaY*ghostSpeedY;
    ghostZ += deltaZ*ghostSpeedZ;
    lastUpdateX = currentTime;
    lastUpdateY = currentTime;
    lastUpdateZ = currentTime;
    ghostTranslate = utils.MakeTranslateMatrix(ghostX,ghostY,ghostZ);
    // set transforms
    gl.uniformMatrix4fv(tMatrixLocation, gl.FALSE, utils.transposeMatrix(
        utils.multiplyMatrices(ghostTranslate,ghostQuaternion.toMatrix4()))
    );
    if(PLAY_MODE) {
        drawObject(ghostMesh.vertices, ghostMesh.indices, ghostColors, null, ghostMesh.vertexNormals, gl.TRIANGLES, 0);
    }

    window.requestAnimationFrame(drawScene);
}

function drawObject(vertices, indices, colors, UVcoordinates, normals, mode, texture){
    //Set for texture
    gl.bindTexture(gl.TEXTURE_2D, texturesVector[texture]);
    gl.uniform1i(textLocation, 0);

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

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(UVcoordinates), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // blocks
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.drawElements(mode, indices.length, gl.UNSIGNED_SHORT, 0 );
}