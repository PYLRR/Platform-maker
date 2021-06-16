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