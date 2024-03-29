import { PerspectiveCamera, Scene, WebGLRenderer, Vector3, Math, MeshBasicMaterial, DoubleSide, PCFShadowMap, sRGBEncoding } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PostProcessingManager from './post-processing-manager';

import EventDispatcher from './event-dispatcher';
import Utility from './utility';

class SceneManager {
    constructor() {
        this.eventDispatcher = new EventDispatcher();
        this.events = {
            afterInit: 'event-after-init',
            onModelsLoaded: 'event-on-models-loaded',
            onUpdatedSceneMaterials: 'event-on-updated-scene-materials',
            onRender: 'event-on-render'
        };
        var aspect = 1;
        var depth = 0.45;
        this.width = 1024;
        this.height = 768;

        this.usePostProcessing = false;

        this.container = document.body.querySelector('#egg-hunt-game .game-container')

        this.scene = new Scene({
            // background: texture
        });

        this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
        // this.renderer.setClearColor(0x87CEEB, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.rotation = 0;

        // this.stats = new Stats();
        // this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        // document.body.appendChild(this.stats.dom);
    }

    init() {
        this.pixelRatio = this.setCanvasScalingFactor();
        // this.renderer.setSize(this.width * 4, this.height * 4);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

        let resize = (() => {
            this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        }).bind(this);

        window.addEventListener('resize', resize);

        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowMapType = PCFShadowMap;
        // this.renderer.gammaFactor = 2.2;
        this.renderer.outputEncoding = sRGBEncoding;

        var element = document.body.querySelector('#egg-hunt-game .game-container');
        if (element) {
            element.append(this.renderer.domElement);
        }

        this.camera = new PerspectiveCamera(60, this.renderer.domElement.offsetWidth / this.renderer.domElement.offsetHeight, 1, 2000);
        this.camera.position.set(0, 3.5, 14.5)
        this.camera.zoom = 1;
        this.camera.lookAt(new Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();


        this.postProcessingManager = new PostProcessingManager(this.scene, this.renderer, this.camera, this);
        this.postProcessingManager.init();


        this.eventDispatcher.dispatch(this.events.afterInit);
    }

    updateRenderScale() {
        if (this.renderer.domElement.offsetWidth < 767) {
            this.renderer.setSize(this.renderer.domElement.offsetWidth, this.renderer.domElement.offsetHeight);
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    };

    loadModels() {
        var that = this;
        var gLTFloader = new GLTFLoader();

        gLTFloader.load('../egg-hunt.gltf', function (gltf) {
            that.eventDispatcher.dispatch(that.events.onModelsLoaded, gltf);
        })
    }

    setCanvasScalingFactor() {
        return window.devicePixelRatio || 1;
    }

    getCanvasElement() {
        return this.renderer.domElement;
    }

    getCamera() {
        return this.camera;
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }

    getRoot() {
        return this.root;
    }

    add(item) {
        this.scene.add(item);
    }

    addSky(item) {
        this.skyBox = item;
        this.scene.add(this.skyBox);
    }

    remove(item) {
        this.scene.remove(item);
    }

    rotateTo(degrees) {
        if (this.root) {
            this.root.rotation.y = Math.degToRad(degrees);
        }

        if (this.skyBox) {
            this.skyBox.rotation.y = Math.degToRad(degrees);
        }
    }

    rotateBy(degrees) {
        if (this.root) {
            this.root.rotation.y += Math.degToRad(degrees);
        }

        if (this.skyBox) {
            this.skyBox.rotation.y += Math.degToRad(degrees);
        }
    }

    pan(y) {
        if (this.root) {
            this.root.position.y = y;
        }
    }

    getZoom() {
        return this.camera.zoom;
    }

    zoom(ammount) {
        this.camera.zoom = ammount;
        this.camera.updateProjectionMatrix();
    }

    setRoot(rootNode) {
        this.root = rootNode;
    }

    setFocus(focus) {
        this.bokeh.uniforms["focus"].value = focus;
    }

    setAperture(aperture) {
        this.bokeh.uniforms["aperture"].value = aperture;
    }

    getModelsByName(name, node) {
        var models = [];
        return models = this._findModelsByName(name, node, models);
    }

    _findModelsByName(name, node, models) {

        if (node) {
            let children = node.children;

            if (Array.isArray(children)) {
                children.forEach((child) => {

                    if (child.name.includes(name)) {
                        models.push(child);
                    }

                    models = this._findModelsByName(name, child, models);
                })
            }

        }

        return models;
    }

    setBackground(texture) {
        this.scene.background = texture;
        this.scene.needsUpdate = true;
    }

    getAllModels(node) {
        var models = [];
        return models = this._findAllModels(node, models);
    }

    _findAllModels(node, models) {
        if (node) {
            let children = node.children;

            if (Array.isArray(children)) {
                children.forEach((child) => {
                    models.push(child);
                    models = this._findAllModels(child, models);
                })
            }
        }
        return models;
    }

    updateSceneMaterials(eggs, gltf, lightMapTexture, lightMapFloorTexture, lightMapFoliageTexture) {
        var allModels = this.getAllModels(gltf.scene);

        allModels.forEach((model) => {

            if (model && model.material) {
                if (model.name.includes('reference')) {
                    model.visible = false;
                    return;
                }

                if (model.name.includes('__hidden')) {
                    model.visible = false;
                    return;
                }

                model.material = new MeshBasicMaterial({
                    lightMap: lightMapTexture,
                    lightMapIntensity: 2,
                    side: DoubleSide
                });
                model.material.needsUpdate = true;
            }
        });

        eggs.forEach((egg) => {
            if (egg) {
                egg.model.material.map = egg.texture;
                egg.model.material.needsUpdate = true;
                egg.model.rotation.z = Math.degToRad(Utility.getRandomInt(360));
            }
        })

        var groundModels = this.getModelsByName("__env", gltf.scene);

        groundModels.forEach((model) => {
            if (model && model.material) {
                model.material = new MeshBasicMaterial({
                    lightMap: lightMapFloorTexture,
                    lightMapIntensity: 2,
                    side: DoubleSide
                });
                model.material.needsUpdate = true;
            }
        })

        var foliageModels = this.getModelsByName("__foliage", gltf.scene);

        foliageModels.forEach((model) => {
            if (model && model.material) {
                model.material = new MeshBasicMaterial({
                    lightMap: lightMapFoliageTexture,
                    lightMapIntensity: 2,
                    side: DoubleSide
                });
                model.material.needsUpdate = true;
            }
        })



        setTimeout(() => this.eventDispatcher.dispatch(this.events.onUpdatedSceneMaterials), 2000);
    }

    render() {
        // this.stats.begin();
        // this.renderer.render(this.scene, this.camera);

        if (this.usePostProcessing) {
           this.postProcessingManager.render();
        }
        else {
            this.renderer.render(this.scene, this.camera);
        }

        this.eventDispatcher.dispatch(this.events.onRender);
        // this.stats.end();
    }

    /* Events */
    onAfterInit(handler) {
        this.eventDispatcher.registerHandler(this.events.afterInit, handler);
    }

    onModelsLoaded(handler) {
        this.eventDispatcher.registerHandler(this.events.onModelsLoaded, handler);
    }

    onUpdatedSceneMaterials(handler) {
        this.eventDispatcher.registerHandler(this.events.onUpdatedSceneMaterials, handler);
    }

    onRender(handler) {
        this.eventDispatcher.registerHandler(this.events.onRender, handler);
    }

}

export default SceneManager;