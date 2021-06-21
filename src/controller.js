// adds a cube where (x,y,z) is its bottom left and farest corner, with a given textureID and color. Adds it to the list
function addBlock(x, y, z, textureID, colors) {
    if(blockAtCoord.has(x+y*(MAX_X+1)+z*(MAX_Y*(MAX_X+1)+1))){
        console.log("a block already exists here");
    }else {
        var block = makeBlock(x,y,z,textureID,colors);
        blocks.push(block);
        blockAtCoord.set(x+y*(MAX_X+1)+z*(MAX_Y*(MAX_X+1)+1), block);
        console.log("block added");
    }
}

// using the hashmap blockAtCoord, returns the block of coordinates (x,y,z) or null
function getBlockAt(x,y,z){
    key = x+y*(MAX_X+1)+z*(MAX_Y*(MAX_X+1)+1);
    if(blockAtCoord.has(key)){
        return blockAtCoord.get(key);
    }
    return null;
}

// key press
function keyDownFunction(e){
    let deltax=0;
    let deltay=0;
    let deltaz=0;
    switch (e.keyCode) {
        case 13:  // enter : add a block with default texture
            addBlock(cursor.x, cursor.y, cursor.z, cursor.texture, blockDefaultColor);
            break;
        case 16: // maj
            deltay=1;
            break;
        case 17: // ctrl
            deltay=-1;
            break;
        case 32:  // space
            PLAY_MODE = true;
            break;
        case 37:  // left
            deltax=-1;
            break;
        case 38:  // up
            deltaz=-1;
            break;
        case 39:  // right
            deltax=1;
            break;
        case 40:  // down
            deltaz=1;
            break;
        case 46:  // suppr : delete a block
            block = getBlockAt(cursor.x, cursor.y, cursor.z);
            if(block != null){
                index = blocks.indexOf(block);
                if(index > -1){
                    blocks.splice(index,1);
                }
                blockAtCoord.delete(cursor.x+cursor.y*(MAX_X+1)+cursor.z*(MAX_Y*(MAX_X+1)+1));
                console.log("block removed");
            }else{
                console.log("no block to remove");
            }
            break;
        case 68:  // d : for play mode
            if(PLAY_MODE){
                ghost.speedX = ghost.maxSpeed;
                ghost.lastUpdateX = (new Date).getTime();
            }
            break;
        case 81: // q : for play mode
            if(PLAY_MODE){
                ghost.speedX = -ghost.maxSpeed;
                ghost.lastUpdateX = (new Date).getTime();
            }
            break;
        case 82:  // r : change texture of a block
            block = getBlockAt(cursor.x, cursor.y, cursor.z);
            if(block != null){
                index = textureIDEnum.indexOf(block.texture);
                block.texture = (block.texture+1) % textureIDEnum.length;
                console.log("texture changed to "+textureIDEnum[block.texture]);
                cursor.texture = block.texture;
            }else{
                cursor.texture = (cursor.texture+1) % textureIDEnum.length;
                console.log("texture of cursor changed to "+textureIDEnum[cursor.texture]);
            }
            break;
        case 83:  // s : for play mode
            if(PLAY_MODE){
                ghost.speedZ = ghost.maxSpeed;
                ghost.lastUpdateZ = (new Date).getTime();
            }
            break;
        case 90: // z : for play mode
            if(PLAY_MODE){
                ghost.speedZ = -ghost.maxSpeed;
                ghost.lastUpdateZ = (new Date).getTime();
            }
            break;

    }
    // trigonometric computations to change direction of cursor/camera translations depending on the current angle
    let ta = utils.degToRad(angle);
    let dx = Math.round(Math.cos(-ta)*deltax+Math.sin(-ta)*deltaz);
    let dz = Math.round(-Math.sin(-ta)*deltax+Math.cos(-ta)*deltaz);
    
    deltax=dx;
    deltaz=dz;

    cx += deltax*STEP;
    cy += deltay*STEP;
    cz += deltaz*STEP;

    // updates cursor position in our grid coordinates system
    cursor.x+=deltax;
    cursor.y+=deltay;
    cursor.z+=deltaz;

    // updates cursor position in world coordinates handled by openGL
    for(i=0; i<cursor.vertices.length; i+=3){
        cursor.vertices[i]+=deltax*STEP;
        cursor.vertices[i+1]+=deltay*STEP;
        cursor.vertices[i+2]+=deltaz*STEP;
    }
    cursor.updateBuffers();

    window.requestAnimationFrame(drawScene);
}

// key release
function keyUpFunction(e){
    switch (e.keyCode) {
        case 68:  // d : for play mode
            if(PLAY_MODE)
                ghost.speedX = 0;
            break;
        case 81: // q : for play mode
            if(PLAY_MODE)
                ghost.speedX = 0;
            break;
        case 83:  // s : for play mode
            if(PLAY_MODE)
                ghost.speedZ = 0;
            break;
        case 90: // z : for play mode
            if(PLAY_MODE)
                ghost.speedZ = 0;
            break;

    }
}

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
    lastMouseX = event.pageX;
    lastMouseY = event.pageY;
    mouseState = true;
}
function doMouseUp(event) {
    lastMouseX = -100;
    lastMouseY = -100;
    mouseState = false;
}
function doMouseMove(event) {
    if(mouseState) {
        var dx = event.pageX - lastMouseX;
        var dy = lastMouseY - event.pageY;
        lastMouseX = event.pageX;
        lastMouseY = event.pageY;

        if((dx != 0) || (dy != 0)) {
            angle = angle + 0.5 * dx;
            elevation = Math.min(Math.max(elevation + 0.5 * dy, -90), 90);
        }
        drawScene();
    }
}
function doMouseWheel(event) {
    var nLookRadius = lookRadius + Math.sign(event.deltaY);
    if((nLookRadius > STEP+0.75) && (nLookRadius < STEP*50)) {
        lookRadius = nLookRadius;
    }
    drawScene();
}
