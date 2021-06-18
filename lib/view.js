function drawScene() {

    worldMatrix = utils.MakeWorld(0.0,0.0,0.0,0.0,0.0,Rz,S);

    let final_cx = cx + lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    let final_cy = cy + lookRadius * Math.sin(utils.degToRad(-elevation));
    let final_cz = cz + lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    viewMatrix = utils.MakeView(final_cx, final_cy, final_cz, elevation, angle);
    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var fieldOfViewDeg = 40;
    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zNear, zFar);
    var viewWorld = utils.multiplyMatrices(viewMatrix, worldMatrix);
    projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorld);

    gl.uniformMatrix4fv(pMatrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(wMatrixLocation, gl.FALSE, utils.transposeMatrix(worldMatrix));
    
    // Parameters to pass to Fragment Shader for direct light
    gl.uniform3f(dirLocation,Math.sin(theta)*Math.sin(phi) ,Math.cos(theta),
        Math.sin(theta)*Math.cos(phi));
    gl.uniform4fv(lightColorLocation,lightColor);
    gl.uniform4fv(specularColorLocation,specularColor);
    gl.uniform4fv(ambientLightColorLocation,ambientLightColor);
    gl.uniform1f(specShineLocation,specShine);
    gl.uniform3f(eyePosLocation, final_cx, final_cy, final_cz);

    // cursor
    drawObject(cursor.vertices,cursor.indices,cursor.colors, cursor.UVcoordinates, cursor.normals, gl.TRIANGLES,cursor.texture);

    // blocks
    for(var i = 0; i<blocks.length; i++) {
        drawObject(blocks[i].vertices, blocks[i].indices, blocks[i].colors, blocks[i].UVcoordinates, blocks[i].normals, gl.TRIANGLES,blocks[i].texture);
    }

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