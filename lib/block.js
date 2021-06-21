// adds a cube where (x,y,z) is its bottom left and farest corner, with a given textureID and color. Returns it
function makeBlock(x,y,z, textureID, colors) {
    vertices = [x*STEP,y*STEP,z*STEP,(x+1)*STEP,y*STEP,z*STEP,(x+1)*STEP,(y+1)*STEP,z*STEP,x*STEP,(y+1)*STEP,z*STEP,
        x*STEP,(y+1)*STEP,z*STEP,x*STEP,y*STEP,z*STEP,x*STEP,y*STEP,(z+1)*STEP,x*STEP,(y+1)*STEP,(z+1)*STEP,
        x*STEP,(y+1)*STEP,(z+1)*STEP,x*STEP,y*STEP,(z+1)*STEP,(x+1)*STEP,y*STEP,(z+1)*STEP,(x+1)*STEP,(y+1)*STEP,(z+1)*STEP,
        (x+1)*STEP,(y+1)*STEP,(z+1)*STEP,(x+1)*STEP,(y+1)*STEP,z*STEP,(x+1)*STEP,y*STEP,(z+1)*STEP,(x+1)*STEP,y*STEP,z*STEP,
        (x+1)*STEP,y*STEP,z*STEP,(x+1)*STEP,y*STEP,(z+1)*STEP,x*STEP,y*STEP,z*STEP,x*STEP,y*STEP,(z+1)*STEP,
        x*STEP,(y+1)*STEP,z*STEP,x*STEP,(y+1)*STEP,(z+1)*STEP,(x+1)*STEP,(y+1)*STEP,z*STEP,(x+1)*STEP,(y+1)*STEP,(z+1)*STEP]

    normals = [0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,
        -1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,
        0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,
        1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,
        0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,0.0,-1.0,0.0,
        0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0,]

    indices = [2,1,0, 3,2,0, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 14,13,12, 13,14,15, 16,17,18, 19,18,17, 21,22,20, 23,22,21];

    UVcoordinates = [0.3333,0.0,0.3333,0.25,0.667,0.25,0.6667,0.0, // behind
        0.6667,1.0,0.3333,1.0,0.3333,0.75,0.6667,0.75,  // left
        0.6667,0.5,0.3333,0.5,0.3333,0.75,0.6667,0.75, // front
        0.6667,0.25,0.667,0.5,0.3333,0.25,0.3333,0.5, // right
        0.3333,0.5,0.3333,0.75,0.0,0.5,0.0,0.75, // bottom
        1.0,0.5,1.0,0.75,0.6667,0.5,0.6667,0.75]; // top

    return new Block(x, y, z, vertices, normals, indices, colors, textureID, UVcoordinates);
}

class Block {
    /**
     * Creates a block object
     * @param x,y,z coordinates in a grid of squares of size "step"
     * @param vertices 24 vertices that contains the block
     * @param normals 24 normal vectors for the block
     * @param indices 36 indices that contains the block
     * @param colors 4 colors that contains the block
     * @param texture the UV texture to apply, taken from TextureIDEnum
     * @param UVcoordinates the UV coordinates of the vertices of the block
     */
    constructor(x,y,z,vertices, normals, indices, colors, texture,UVcoordinates) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.colors = colors;
        this.texture = texture;
        this.UVcoordinates = UVcoordinates;
    }
}