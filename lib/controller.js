// adds a square where (x,y) is its bottom left corner, with a given textureID
function addSquare(x,y, textureID) {
    vertices = [x*STEP,y*STEP,0.0,
        (x+1)*STEP,y*STEP,0.0,
        (x+1)*STEP,(y+1)*STEP,0.0,
        x*STEP,(y+1)*STEP,0.0];
    indices = [0,1,2,2,3,0];
    colors = blockDefaultColor;
    UVcoordinates = [0.0,1.0,1.0,1.0,1.0,0.0,0.0,0.0];

    if(blockAtCoord.has(x*(MAX_X+1)+y)){
        console.log("a block already exists here");
    }else {
        var block = new Block(x, y, vertices, indices, colors, textureID, UVcoordinates);
        blocks.push(block);
        blockAtCoord.set(x * (MAX_X + 1) + y, block);
        console.log("block added")
    }
}

// using the hashmap blockAtCoord, returns the block of coordinates (x,y) or null
function getBlockAt(x,y){
    key = cursorx * (MAX_X + 1) + cursory;
    if(blockAtCoord.has(key)){
        return blockAtCoord.get(key);
    }
    return null;
}

function keyFunction(e){

    switch (e.keyCode) {
        case 13:  // enter : add a block with default texture
            addSquare(cursorx, cursory, cursorTexture);
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
        case 46:  // suppr : delete a block
            block = getBlockAt(cursorx, cursory);
            if(block != null){
                index = blocks.indexOf(block);
                if(index > -1){
                    blocks.splice(index,1);
                }
                blockAtCoord.delete(cursorx * (MAX_X + 1) + cursory);
                console.log("block removed");
            }else{
                console.log("no block to remove");
            }
            break;
        case 82:  // r : change texture of a block
            block = getBlockAt(cursorx, cursory);
            if(block != null){
                index = textureIDEnum.indexOf(block.texture);
                block.texture = (block.texture+1) % textureIDEnum.length;
                console.log("texture changed to "+textureIDEnum[block.texture]);
            }else{
                cursorTexture = (cursorTexture+1) % textureIDEnum.length;
                console.log("texture of cursor changed to "+textureIDEnum[cursorTexture]);
            }
            break;
    }

    // redraw the cursor
    cursorVertices = [cursorx*STEP,cursory*STEP,0.0,
        (cursorx+1)*STEP,cursory*STEP,0.0,
            (cursorx+1)*STEP,(cursory+1)*STEP,0.0,
        cursorx*STEP,(cursory+1)*STEP,0.0];


    window.requestAnimationFrame(drawScene);
}