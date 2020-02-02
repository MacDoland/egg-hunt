import { Clock, Vector3, Raycaster } from "three";
import { BloomEffect, DepthEffect, EffectComposer, EffectPass, RenderPass, RealisticBokehEffect, BokehEffect, VignetteEffect, SMAAEffect, GammaCorrectionEffect } from "postprocessing";

class PostProcessingManager {
    constructor(scene, renderer, camera, sceneManager) {
        this.composer = new EffectComposer(renderer);
        this.scene = scene;
        this.camera = camera;
        this.sceneManager = sceneManager;
        this.raycaster = new Raycaster();
        this.postprocessing = { enabled: true };
        this.container = document.body.querySelector('#egg-hunt-game .game-container')

        let pixelRatio = window.devicePixelRatio || 1;
        this.composer.setSize(this.container.offsetWidth * pixelRatio, this.container.offsetHeight * pixelRatio);
    }

    

    init() {
        let focus = 1.88;/*this.camera.position.distanceTo(new Vector3(0,0,5));*/
        const bokehEffect = new BokehEffect({
            focus: focus,
			dof: -9,
			aperture: 0.04,
			maxBlur: 0.5
        });

        let that = this;

        this.uniforms = bokehEffect.uniforms;

        // window.addEventListener('keyup', (e) => {
        //     if(e.which == 189){
        //         this.uniforms.get("focus").value -= 0.01;
        //         console.log("focus", this.uniforms.get("focus").value);
        //         window.requestAnimationFrame(that.render.bind(that));
        //     }

        //     if(e.which == 187){
        //         this.uniforms.get("focus").value += 0.01;
        //         console.log("focus", this.uniforms.get("focus").value);
        //         window.requestAnimationFrame(that.render.bind(that));

        //     }

        //     if(e.which == 188){
        //         this.uniforms.get("dof").value -= 0.01;
        //         console.log("dof", this.uniforms.get("dof").value);
        //         window.requestAnimationFrame(that.render.bind(that));

        //     }

        //     if(e.which == 190){
        //         this.uniforms.get("dof").value += 0.01;
        //         console.log("dof", this.uniforms.get("dof").value);
        //         window.requestAnimationFrame(that.render.bind(that));
        //     }


            
        //     if(e.which == 37){
        //         this.uniforms.get("aperture").value -= 0.01;
        //         console.log("aperture", this.uniforms.get("aperture").value);
        //         window.requestAnimationFrame(that.render.bind(that));

        //     }

        //     if(e.which == 39){
        //         this.uniforms.get("aperture").value += 0.01;
        //         console.log("aperture", this.uniforms.get("aperture").value);
        //         window.requestAnimationFrame(that.render.bind(that));
        //     }

            
        // });
        

        let gammaCorrectionEffect = new GammaCorrectionEffect({ gamma: 2.2 });
        let renderPass = new RenderPass(this.scene, this.camera);
        let bokehPass = new EffectPass(this.camera, bokehEffect, new VignetteEffect());
        let bloomPass = new EffectPass(this.camera, new BloomEffect());
        let depthPass = new EffectPass(this.camera, new DepthEffect());

        let pass = new EffectPass(this.camera,
            gammaCorrectionEffect
        );

        depthPass.enabled = false;
        pass.renderToScreen = true;

        this.composer.addPass(renderPass);
        this.composer.addPass(bokehPass);
        this.composer.addPass(depthPass);
        this.composer.addPass(pass);
        this.clock = new Clock();
    }

    render() {

        if(this.sceneManager.getRoot()){
            this.raycaster.set(this.camera.position, new Vector3().subVectors( new Vector3(), this.camera.position ).normalize());
            var hits = this.raycaster.intersectObjects(this.sceneManager.getRoot().children, true);

            if(hits.length > 0){
                console.log("distance", hits[0].distance);
                this.uniforms.get('focus').value = hits[0].distance;
            }
        }

        this.composer.render(this.clock.getDelta());
        console.log("pp-render");
    }

}

export default PostProcessingManager;