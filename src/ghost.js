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
        this.y=STEP*1.4;
        this.z=STEP/2;

        this.translate=utils.MakeTranslateMatrix(this.x,this.y,this.z);
        this.yRotate = 0;

        this.maxSpeed=STEP*5;

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

    // initialize variables such as lastUpdate (important for gravity !)
    init(){
        this.speedX=0;
        this.speedY=-this.maxSpeed;
        this.speedZ=0;

        let now = (new Date).getTime();
        this.lastUpdate=now;
    }

    // moves the ghost according to the elapsed time since this.lastUpdate
    computeTranslate(){
        currentTime = (new Date).getTime();
        let delta = (currentTime - this.lastUpdate) / 1000.0;

        let dx = delta * this.speedX;
        let dz = delta * this.speedZ;
        // y is a special case : we have to take gravity into account
        let dy = delta * this.speedY;
        if(this.speedY>-this.maxSpeed){
            dy += Math.pow(delta,2)*GRAVITY_A/2;
            this.speedY = Math.max(-this.maxSpeed,this.speedY+delta*GRAVITY_A);
        }

        // formulas of expected coordinates : current+speed+offsetGhostDimensions+offsetStartingPos
        let dirx = Math.sign(this.speedX/this.maxSpeed);
        let xGrid = Math.ceil(ghost.x/STEP)-1;
        let xGridExpected = Math.ceil(ghost.x/STEP+dx/STEP+7*dirx/16-0.95);

        let diry = Math.sign(dy/this.maxSpeed);
        let yGrid = Math.ceil(ghost.y/STEP)-1;
        let yGridExpected = Math.ceil(ghost.y/STEP+dy/STEP+diry/2-0.85);

        let dirz = Math.sign(this.speedZ/this.maxSpeed);
        let zGrid = Math.ceil(ghost.z/STEP)-1;
        let zGridExpected = Math.ceil(ghost.z/STEP+dz/STEP+dirz/2-0.9);

        if(getBlockAt(xGridExpected, yGrid, zGrid) == null) {
            this.x += dx;
        }
        if(getBlockAt(xGrid, yGrid, zGridExpected) == null) {
            this.z += dz;
        }
        if(getBlockAt(xGrid, yGridExpected, zGrid) == null) {
            this.y += dy;
        }


        this.lastUpdate = currentTime;
        this.translate = utils.MakeTranslateMatrix(this.x,this.y,this.z);
    }

    // rotates the ghost according to a given angle
    computeRotate(angle){
        ghost.yRotate += angle;

        this.speedX = this.speedX*Math.cos(utils.degToRad(angle)) -
            this.speedZ*Math.sin(utils.degToRad(angle));
        this.speedZ = this.speedZ*Math.cos(utils.degToRad(angle)) +
            this.speedX*Math.sin(utils.degToRad(angle));
    }

    // changes the speed of the ghost, taking rotation into account
    changeSpeed(ddx, ddy, ddz){
        this.speedX = ddx*Math.cos(utils.degToRad(this.yRotate)) -
            ddz*Math.sin(utils.degToRad(this.yRotate));
        this.speedY = ddy;
        this.speedZ = ddz*Math.cos(utils.degToRad(this.yRotate)) +
            ddx*Math.sin(utils.degToRad(this.yRotate));
    }
}