export class MainScene {
    constructor() {
        this.canvas = this.createCanvas();
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        this.scene.collisionsEnabled = true;
        this.camera = this.createCamera();
        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
        this.light.specular = new BABYLON.Color3(0, 0, 0);
        this.box = null;
        this.main();
        this.ground = this.createGround();
        this.createGroundMaterial();
        this.createWalls();
        this.createBox();
    };

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.classList.add('renderCanvas');
        document.body.append(canvas);
        return canvas;
    };

    createCamera() {
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
        camera.attachControl(this.canvas, true);
        camera.setPosition(new BABYLON.Vector3(-10, 10, 10));
        camera.upperBetaLimit = 1.3;
        camera.lowerRadiusLimit = 10;
        return camera;
    };

    createGround () {
        const ground = new BABYLON.MeshBuilder.CreateGround("ground", {width:5, height:10});
        ground.checkCollisions = true;
        return ground;
    };

    createWalls() {
    const frontWall =  BABYLON.MeshBuilder.CreatePlane('wall', {height: 2.5, width: 10, depth: 2, sideOrientation: BABYLON.Mesh.BACKSIDE}, this.scene);
    this.setEdge(frontWall)
    frontWall.position = new BABYLON.Vector3(2.5, 1.25, 0);
    frontWall.rotation = new BABYLON.Vector3(0, Math.PI / -2.0, 0);

    const rigthWall =  BABYLON.MeshBuilder.CreatePlane('wall', {height: 2.5, width: 5, depth: 2}, this.scene);
    this.setEdge(rigthWall)
    rigthWall.position = new BABYLON.Vector3(0, 1.25, 5);

    const leftWall =  BABYLON.MeshBuilder.CreatePlane('wall', {height: 2.5, width: 5, depth: 2, sideOrientation: BABYLON.Mesh.BACKSIDE}, this.scene);
    this.setEdge(leftWall)
    leftWall.position = new BABYLON.Vector3(0, 1.25, -5);
    };

    createGroundMaterial () {
        const groundMaterial = new BABYLON.StandardMaterial("floorMaterial");
        groundMaterial.diffuseTexture = new BABYLON.Texture("../assets/images/floortexture.jpg");
        groundMaterial.diffuseTexture.uScale = 3;
        this.ground.material = groundMaterial;
    };

    setEdge(wall) {
        wall.enableEdgesRendering();	
        wall.edgesWidth = 5;
        wall.edgesColor = new BABYLON.Color4(1, 1, 1, 1);
        wall.edgesRenderer._lineShader.zOffset = -2;
    };

    createBox () {
        const box = new BABYLON.MeshBuilder.CreateBox("box", {});
        box.position = new BABYLON.Vector3(0, 0.5, 0);
        box.material = new BABYLON.StandardMaterial('mat', this.scene);
        box.material.emissiveColor = new BABYLON.Color3(0,0,1);
        const pointerDragBehavior = new BABYLON.PointerDragBehavior();
        pointerDragBehavior.useObjectOrientationForDragging = false;
        box.addBehavior(pointerDragBehavior);
        box.checkCollisions = true;
        this.box = box;
        let walls = this.scene.meshes;
        pointerDragBehavior.onDragObservable.add((event)=>{
            for (let i = 0; i < walls.length; i++) {
                if(walls[i].name === "wall" && box.intersectsMesh(walls[i])) {
                    this.castRay(pointerDragBehavior);
                }
            };
        });

        pointerDragBehavior.onDragEndObservable.add((event)=>{
            this.checkCollision (pointerDragBehavior);
        });
    };

    checkCollision (pointerDragBehavior) {
        const boxWhidth = 0.5;
        const gWidth = this.ground._width/2 - boxWhidth;
        const gHeight = this.ground._height/2 - boxWhidth;
        const x = pointerDragBehavior.lastDragPosition.x;
        const y = pointerDragBehavior.lastDragPosition.y;
        const z = pointerDragBehavior.lastDragPosition.z;
        if(y < 0.5) {
            this.box.position.y = boxWhidth;
        };
        if(y > 2.5) {
            this.box.position.y = 2;
        };
        if(z >= gHeight) {
            this.box.position.z = gHeight;
        };
        if(z <= -gHeight) {
            this.box.position.z = -gHeight;
        };
        if(x >= gWidth) {
            this.box.position.x = gWidth;
        }
        pointerDragBehavior.enabled = true;
    };

    castRay(pointerDragBehavior){       
        var origin = this.box.position;
    
        var forward = new BABYLON.Vector3(0,0,1);		
        forward = this.vecToLocal(forward, this.box);
    
        var direction = forward.subtract(origin);
        direction = BABYLON.Vector3.Normalize(direction);
    
        var length = 2;
    
        var ray = new BABYLON.Ray(origin, direction, length);

        var hit = this.scene.pickWithRay(ray);

        if (hit.pickedMesh){
            pointerDragBehavior.enabled = false;
            this.checkCollision(pointerDragBehavior);
        };
    };

    vecToLocal(vector, mesh){
        var matrix = mesh.getWorldMatrix();
        var coord = BABYLON.Vector3.TransformCoordinates(vector, matrix);
		return coord;		 
    };

    main(){
    this.engine.runRenderLoop(() => {
        this.scene.render();
    });

    window.addEventListener('resize', () => {
        this.engine.resize();
    });
    };
}