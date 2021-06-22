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
            null, ghost.normalsBuffer, gl.TRIANGLES, 0);
    }

    //setTimeout(drawScene,100);
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