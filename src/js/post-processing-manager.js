import { Clock, GammaCorrectionShader } from "three";
import {BloomEffect, EffectComposer, EffectPass, RenderPass, BokehEffect, VignetteEffect, ShaderPass } from "postprocessing";

class PostProcessingManager {
    constructor(sceneManager) {
        this.composer = new EffectComposer(sceneManager.getRenderer());
        this.sceneManager = sceneManager;
        this.scene = this.sceneManager.getScene();
        this.camera = this.sceneManager.getCamera();
        this.postprocessing = { enabled: true };
    }

    init(){
        const bokehEffect = new BokehEffect({
			focus: 0.1,
			dof: 0.02,
			aperture: 0.0265,
			maxBlur: 0.00125
        });
        
        var gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
        let renderPass = new RenderPass(this.scene, this.camera);
        let bokehPass = new EffectPass(this.camera, bokehEffect, new VignetteEffect());
        let bloomPass = new EffectPass(this.camera, new BloomEffect());
          

        renderPass.renderToScreen = true;

        this.composer.addPass(renderPass);
       // this.composer.addPass(gammaCorrectionShader);
      //  this.composer.addPass(bloomPass);
        this.clock = new Clock();
    }

    render() {
        this.composer.render(this.clock.getDelta());
    }
    
}

export default PostProcessingManager;