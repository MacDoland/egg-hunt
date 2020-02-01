class UI {

    constructor(canvas) {
        this.pickPosition = { x: 0, y: 0 };
        this.canvas = canvas;
        this.picking = false;
        this.mousePosition;
    }

    init(sceneManager) {
        this.sceneManager = sceneManager;
        this.canvas = this.sceneManager.getCanvasElement();
        var sceneRotationControl = document.body.querySelector('#scene-rotation-control');
        var scenePanControl = document.body.querySelector('#scene-pan-control');
        this.gameElement = document.body.querySelector('#egg-hunt-game .game-container');
        var degrees = parseFloat(sceneRotationControl.value);
        var height = parseFloat(scenePanControl.value);
        var rotationSpeed = 0.35;
        var panSpeed = 0.75;
        var mouseDown = false;
        var zoom = this.sceneManager.getZoom();
        var zoomSpeed = 2;

        this.sceneManager.pan(height / 100);

        sceneRotationControl.oninput = function () {
            sceneManager.rotateTo(this.value);
            window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
        }

        scenePanControl.oninput = function () {
            var value = this.value;
            if (typeof (this.value === "string")) {
                value = parseFloat(this.value);
            }

            sceneManager.pan(value / 100);
            window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
        }

        this.gameElement.addEventListener('mousedown', (e) => {
            mouseDown = true;
            this.gameElement.classList.add('grabbing');
        });

        document.body.addEventListener('mouseup', (e) => {
            mouseDown = false;
            this.gameElement.classList.remove('grabbing');
        });

        document.body.addEventListener('mousemove', (e) => {
            if (mouseDown) {
                degrees += e.movementX * rotationSpeed;
                height -= e.movementY * panSpeed;
                height = THREE.Math.clamp(height, parseFloat(scenePanControl.min), parseFloat(scenePanControl.max));

                if (degrees > 359) {
                    degrees = 0;
                }

                if (degrees < 0) {
                    degrees = 359;
                }

                sceneRotationControl.value = degrees;
                scenePanControl.value = height;

                sceneManager.rotateTo(degrees);
                sceneManager.pan(height / 100);
                window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
            }
        });

        this.gameElement.addEventListener("wheel", e => {
            e.preventDefault();
            zoom -= (e.deltaY /1000) * zoomSpeed;
            zoom = THREE.Math.clamp(zoom, 1, 3);
            sceneManager.zoom(zoom);
            window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
        });


        window.addEventListener('mouseover', this.startPicking.bind(this));
        window.addEventListener('mousemove', this.updatePosition.bind(this));
        window.addEventListener('mouseout', this.clearPickPosition.bind(this));
        window.addEventListener('mouseleave', this.clearPickPosition.bind(this));
        this.clearPickPosition();
    }

    getPickPosition() {
        return this.pickPosition;
    }

    getGameContainer() {
        return this.gameElement;
    }

    getCanvasRelativePosition(position, canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: position.x - rect.left,
            y: position.y - rect.top,
        };
    }

    startPicking(event) {
        this.picking = true;
        this.mousePosition = this.getCanvasRelativePosition({
            x: event.clientX,
            y: event.clientY
        },
        this.canvas);
        this.setPickPosition.bind(this)();
    }

    updatePosition(event){
        this.mousePosition = this.getCanvasRelativePosition({
            x: event.clientX,
            y: event.clientY
        },
        this.canvas);
    }

    setPickPosition() {
        var that = this;
        this.pickPosition.x = (this.mousePosition.x / this.canvas.clientWidth) * 2 - 1;
        this.pickPosition.y = (this.mousePosition.y / this.canvas.clientHeight) * -2 + 1;  // note we flip Y

        if (this.picking) {
            requestAnimationFrame(() => { that.setPickPosition() });
        }
    }

    clearPickPosition() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        this.picking = false;
        this.pickPosition.x = -100000;
        this.pickPosition.y = -100000;
    }
}


export default UI;