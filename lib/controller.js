// adds a square where (x,y) is its bottom left corner, with a given textureID
function addSquare(x,y, textureID) {
    var vertices = [x*step,y*step,0.0,
        (x+1)*step,y*step,0.0,
        (x+1)*step,(y+1)*step,0.0,
        x*step,(y+1)*step,0.0];
    var indices = [0,1,2,2,3,0];
    var colors = blockDefaultColor;

    if(blockAtCoord.has(x*(maxX+1)+y)){
        console.log("a block already exists here");
    }else {
        var block = new Block(x, y, vertices, indices, colors, textureID);
        blocks.push(block);
        blockAtCoord.set(x * (maxX + 1) + y, block);
    }
}

function keyFunction(e){

    switch (e.keyCode) {
        case 13:  // enter
            addSquare(cursorx, cursory, 0);
            break;
        case 37:  // left
            cursorx -= 1;
            break;
        case 38:  // up
            cursory += 1;
            break;
        case 39:  // right
            cursorx += 1;
            break;
        case 40:  // down
            cursory -= 1;
            break;
    }
    // redraw the cursor
    cursorVertices = [cursorx*step,cursory*step,0.0,
        (cursorx+1)*step,cursory*step,0.0,
            (cursorx+1)*step,(cursory+1)*step,0.0,
        cursorx*step,(cursory+1)*step,0.0];


    window.requestAnimationFrame(drawScene);
}