class Block {
    /**
     * Creates a block object
     * @param x,y coordinates in a grid of squares of size "step"
     * @param vertices 4 vertices that contains the block
     * @param indices 6 indices that contains the block (2 triangles)
     * @param colors 4 colors that contains the block
     * @param texture the UV texture to apply, taken from TextureIDEnum
     */
    constructor(x,y,vertices, indices, colors, texture) {
        this.x = x;
        this.y = y;
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
        this.texture = texture;
    }
}