class Ghost {
    /**
     * Creates a ghost at (0,1,0) in block-grid coordinates
     */
    constructor() {
        this.mesh = new OBJ.Mesh(objStr);
        this.vertices = this.mesh.vertices;
        this.normals = this.mesh.vertexNormals;
        this.indices = this.mesh.indices;

        // correction of vertices
        for(let i=0; i<this.vertices.length; i+=3){
            // scales the ghost
            this.vertices[i] *= STEP/1.25;
            this.vertices[i+1] *= STEP/1.25;
            this.vertices[i+2] *= STEP/1.25;
            // rotates the ghost (it is not horizontal when loaded)
            this.vertices[i+1] = Math.cos(0.14)*this.vertices[i+1] + Math.sin(0.14)*this.vertices[i+2];
            this.vertices[i+2] = Math.cos(0.14)*this.vertices[i+2] - Math.sin(0.14)*this.vertices[i+1];
        }

        // ghost painted in white
        this.colors=[];
        for(let i=0; i<this.vertices.length; i++){
            this.colors.push(1.0);
            this.colors.push(1.0);
            this.colors.push(1.0);
        }

        this.x=STEP/2;
        this.y=STEP+0.5*STEP/1.25;
        this.z=STEP/2;

        this.translate=utils.MakeTranslateMatrix(this.x,this.y,this.z);
        this.quaternion=Quaternion.fromEuler(utils.degToRad(0),utils.degToRad(0),utils.degToRad(-90), "ZXY");

        this.maxSpeed=STEP*5;
        this.speedX=0;
        this.speedY=0;
        this.speedZ=0;
        this.lastUpdateX=0;
        this.lastUpdateY=0;
        this.lastUpdateZ=0;

        // init buffers
        this.positionBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
        this.normalsBuffer = gl.createBuffer();
        this.indicesBuffer = gl.createBuffer();
        this.updateBuffers();
    }

    updateBuffers(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    computeTranslate(){
        currentTime = (new Date).getTime();
        let deltaX = (currentTime - this.lastUpdateX) / 1000.0;
        let deltaY = (currentTime - this.lastUpdateY) / 1000.0;
        let deltaZ = (currentTime - this.lastUpdateZ) / 1000.0;
        this.x += deltaX*this.speedX;
        this.y += deltaY*this.speedY;
        this.z += deltaZ*this.speedZ;
        this.lastUpdateX = currentTime;
        this.lastUpdateY = currentTime;
        this.lastUpdateZ = currentTime;
        this.translate = utils.MakeTranslateMatrix(this.x,this.y,this.z);
    }
}