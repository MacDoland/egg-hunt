import { Math } from "three";

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
        var panSpeed = 1;
        var mouseDown = false;
        var zoom = this.sceneManager.getZoom();
        var zoomSpeed = 2;
        var maxHeight = scenePanControl ? scenePanControl.max : 600;
        var minHeight = scenePanControl ? scenePanControl.min : -1500;
        // var debuggerElement = document.body.querySelector('#debugger');
        var hammertime = new Hammer(document.body, {});
        hammertime.get('pinch').set({ enable: true });
        hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });

        this.sceneManager.pan(height / 100);

        let lastDeltaRotation = 0;
        let deltaRotation = 0;
        let lastDeltaXL = 0;
        let deltaXL = 0;

        let lastDeltaPan = 0;
        let deltaPan = 0;
        let lastDeltaXD = 0;
        let deltaXD = 0;

        // debuggerElement.innerHTML = debuggerElement.innerHTML + " init";

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

        this.gameElement.addEventListener('mousedown', mouseStart);
        document.body.addEventListener('mouseup', mouseEnd);


        let panHorizontal = (degrees, delta) => {
            degrees += delta;

            if (degrees > 359) {
                degrees = 0;
            }

            if (degrees < 0) {
                degrees = 359;
            }

            return degrees
        }

        let panVertical = (height, delta, min, max) => {
            height -= delta;
            height = Math.clamp(height, parseFloat(min), parseFloat(max));
            return height
        }

        let pan = (ev) => {
            deltaRotation = ev.deltaX - lastDeltaRotation;
            deltaPan = ev.deltaY - lastDeltaPan;
            degrees = panHorizontal(degrees, deltaRotation * rotationSpeed);
            height = panVertical(height, deltaPan * panSpeed, minHeight, maxHeight);
            sceneManager.rotateTo(degrees);
            sceneManager.pan(height / 100);
            window.requestAnimationFrame(sceneManager.render.bind(sceneManager));

            lastDeltaRotation = ev.deltaX;
            lastDeltaPan = ev.deltaY;
        }

        hammertime.on('panstart', function (ev) {
            lastDeltaRotation = 0;
            deltaRotation = 0;
            lastDeltaPan = 0;
            deltaPan = 0;
        })

        hammertime.on('panleft', pan);
        hammertime.on('panright', pan);
        hammertime.on('panup', pan);
        hammertime.on('pandown', pan);

        this.gameElement.addEventListener("wheel", e => {
            e.preventDefault();
            zoom -= (e.deltaY / 1000) * zoomSpeed;
            zoom = Math.clamp(zoom, 1, 3);
            sceneManager.zoom(zoom);
            window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
        });

        hammertime.on('pinch', function (ev) {
            zoom += (ev.scale - 1) * 0.5;
            zoom = Math.clamp(zoom, 1, 3);
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