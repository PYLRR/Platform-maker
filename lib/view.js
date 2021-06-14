function drawScene() {

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


    // blocks
    for(var i = 0; i<blocks.length; i++) {
        drawObject(blocks[i].vertices, blocks[i].indices, blocks[i].colors, blocks[i].UVcoordinates, gl.TRIANGLES);
    }

    // cursor
    var fakeUVcoordinates = [0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0];
    drawObject(cursorVertices,cursorIndices,cursorColor, fakeUVcoordinates, gl.LINES); //I pass fakeUVcoordinates to pass something
                                                                                    // also if uv are useless for the cursor
}

function drawObject(vertices, indices, colors, UVcoordinates, mode){
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

    // blocks
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.drawElements(mode, indices.length, gl.UNSIGNED_SHORT, 0 );
}