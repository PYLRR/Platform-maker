class Ghost {
    /**
     * Creates a ghost at (0,1,0) in block-grid coordinates
     */
    constructor() {
        this.mesh = new OBJ.Mesh(objStr);
        this.vertices = this.mesh.vertices;
        this.normals = this.mesh.vertexNormals;
        this.indices = this.mesh.indices;
        this.UVcoordinates = [];

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
        // creates UV coordinates
        for(let i=0; i<this.vertices.length; i+=3){
            // scales the ghost
            this.UVcoordinates.push(0.0);
            this.UVcoordinates.push(1.0);
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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVcoordinates), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(uvAttributeLocation);
        gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

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

        // these two components are used to know speed in the new coordinates after a rotation
        this.speedXAfterRotate=0;
        this.speedZAfterRotate=0;

        let now = (new Date).getTime();
        this.lastUpdate=now;
    }

    // moves the ghost according to the elapsed time since this.lastUpdate
    computeTranslate(){
        currentTime = (new Date).getTime();
        let delta = (currentTime - this.lastUpdate) / 1000.0;

        let dx = delta * this.speedXAfterRotate;
        let dz = delta * this.speedZAfterRotate;
        let dy = delta * this.speedY;

        // computation for collision
        // formulas of expected coordinates : current+speed+offsetGhostDimensions+offsetStartingPos
        let dirx = Math.sign(this.speedXAfterRotate/this.maxSpeed);
        let xGrid = Math.ceil(ghost.x/STEP)-1;
        let xGridExpected = Math.ceil(ghost.x/STEP+dx/STEP+7*dirx/16-0.95);

        let diry = Math.sign(dy-0.01); // always look down if we are not moving, because of gravity
        let yGrid = Math.ceil(ghost.y/STEP)-1;
        let yGridExpected = Math.ceil(ghost.y/STEP+dy/STEP+diry*0.4-1.0);

        let dirz = Math.sign(this.speedZAfterRotate/this.maxSpeed);
        let zGrid = Math.ceil(ghost.z/STEP)-1;
        let zGridExpected = Math.ceil(ghost.z/STEP+dz/STEP+dirz*0.45-0.95);

        if(getBlockAt(xGridExpected, yGrid, zGrid) == null) {
            this.x += dx;
        }
        if(getBlockAt(xGrid, yGrid, zGridExpected) == null) {
            this.z += dz;
        }
        // y is a special case : we have to take gravity into account
        if(getBlockAt(xGrid, yGridExpected, zGrid) == null) {
            if(this.speedY>-this.maxSpeed){
                dy += Math.pow(delta,2)*GRAVITY_A/2;
                this.speedY = Math.max(-this.maxSpeed,this.speedY+delta*GRAVITY_A);
            }
            this.y += dy;
        }else{
            this.speedY = 0;
        }


        this.lastUpdate = currentTime;
        this.translate = utils.MakeTranslateMatrix(this.x,this.y,this.z);
    }

    // rotates the ghost according to a given angle
    computeRotate(angle){
        ghost.yRotate += angle;

        this.speedXAfterRotate = this.speedXAfterRotate*Math.cos(utils.degToRad(angle)) -
            this.speedZAfterRotate*Math.sin(utils.degToRad(angle));
        this.speedZAfterRotate = this.speedZAfterRotate*Math.cos(utils.degToRad(angle)) +
            this.speedXAfterRotate*Math.sin(utils.degToRad(angle));
    }

    // changes the speed of the ghost, taking rotation into account
    changeSpeed(dx, dy, dz){
        this.speedX = dx;
        this.speedY = dy;
        this.speedZ = dz;
        this.speedXAfterRotate = this.speedX*Math.cos(utils.degToRad(this.yRotate)) -
            this.speedZ*Math.sin(utils.degToRad(this.yRotate));
        this.speedZAfterRotate = this.speedZ*Math.cos(utils.degToRad(this.yRotate)) +
            this.speedX*Math.sin(utils.degToRad(this.yRotate));
    }
}