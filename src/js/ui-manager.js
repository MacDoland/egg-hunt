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
        var degrees = sceneRotationControl ? parseFloat(sceneRotationControl.value) : 180;
        var height = scenePanControl ? parseFloat(scenePanControl.value) : -200;
        var rotationSpeed = 0.35;
        var panSpeed = 0.75;
        var mouseDown = false;
        var zoom = this.sceneManager.getZoom();
        var zoomSpeed = 2;
        var maxHeight = scenePanControl ? scenePanControl.max : 600;
        var minHeight = scenePanControl ? scenePanControl.min : -1500;

        this.sceneManager.pan(height / 100);


        if (sceneRotationControl) {
            sceneRotationControl.oninput = function () {
                sceneManager.rotateTo(this.value);
                window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
            }
        }

        if (scenePanControl) {
            scenePanControl.oninput = function () {
                var value = this.value;
                if (typeof (this.value === "string")) {
                    value = parseFloat(this.value);
                }

                sceneManager.pan(value / 100);
                window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
            }
        }

        let mouseStart = (e) => {
            mouseDown = true;
            this.gameElement.classList.add('grabbing');
        }

        let mouseEnd = (e) => {
            mouseDown = false;
            this.gameElement.classList.remove('grabbing');
        };

        var touchStartPoint;
        var previousTouchX = 0;
        var previousTouchY = 0;
    

        let touchStart = (e) => {
            mouseDown = true;
            touchStartPoint = event.touches[0];
            previousTouchX =  event.touches[0].clientX;
            previousTouchY =  event.touches[0].clientY;
            this.gameElement.classList.add('grabbing');
            e.preventDefault();
        }

        let touchEnd = (e) => {
            mouseDown = false;
            this.gameElement.classList.remove('grabbing');
            e.preventDefault();
        };

        let mouseMove = (e) => {
            if (mouseDown) {
                degrees += e.movementX * rotationSpeed;
                height -= e.movementY * panSpeed;

                height = THREE.Math.clamp(height, parseFloat(minHeight), parseFloat(maxHeight));

                if (degrees > 359) {
                    degrees = 0;
                }

                if (degrees < 0) {
                    degrees = 359;
                }

                if (sceneRotationControl) {
                    sceneRotationControl.value = degrees;
                }

                if (scenePanControl) {
                    scenePanControl.value = height;
                }

                sceneManager.rotateTo(degrees);
                sceneManager.pan(height / 100);
                window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
                e.preventDefault();
            }
        };

       

        let touchMove = (e) => {
            if (mouseDown) {
                degrees +=  (event.touches[0].clientX - previousTouchX) * rotationSpeed;
                height -= (event.touches[0].clientY - previousTouchY) * panSpeed;

                height = THREE.Math.clamp(height, parseFloat(minHeight), parseFloat(maxHeight));

                if (degrees > 359) {
                    degrees = 0;
                }

                if (degrees < 0) {
                    degrees = 359;
                }

                if (sceneRotationControl) {
                    sceneRotationControl.value = degrees;
                }

                if (scenePanControl) {
                    scenePanControl.value = height;
                }

                sceneManager.rotateTo(degrees);
                sceneManager.pan(height / 100);
                window.requestAnimationFrame(sceneManager.render.bind(sceneManager));

                previousTouchX = event.touches[0].clientX;
                previousTouchY = event.touches[0].clientY;
            }
        };

        this.gameElement.addEventListener('mousedown', mouseStart);
        this.gameElement.addEventListener('touchstart', touchStart);
        document.body.addEventListener('mouseup', mouseEnd);
        document.body.addEventListener('touchend', touchEnd);
        document.body.addEventListener('mousemove', mouseMove);
        document.body.addEventListener('touchmove', touchMove);

        this.gameElement.addEventListener("wheel", e => {
            e.preventDefault();
            zoom -= (e.deltaY / 1000) * zoomSpeed;
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

    updatePosition(event) {
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