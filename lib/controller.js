// adds a square where (x,y) is its bottom left corner
function addSquare(x,y,size) {
    blockVertices = blockVertices.concat([[x,y,0.0,
        x+size,y,0.0,
        x+size,y+size,0.0,
        x,y+size,0.0]]);

    blockIndices = blockIndices.concat([[0,1,2,2,3,0]]);

    blockColors = blockColors.concat([blockDefaultColor]);
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
    cursorVertices = [cursorx,cursory,0.0,
        cursorx+cursorStep,cursory,0.0,
        cursorx+cursorStep,cursory+cursorStep,0.0,
        cursorx,cursory+cursorStep,0.0];


    window.requestAnimationFrame(drawScene);
}