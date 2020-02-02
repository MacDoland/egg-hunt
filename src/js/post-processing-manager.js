import { Clock } from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass, RealisticBokehEffect, BokehEffect, VignetteEffect, ShaderPass, GammaCorrectionEffect } from "postprocessing";

class PostProcessingManager {
    constructor(scene, renderer, camera) {
        this.composer = new EffectComposer(renderer);
        this.scene = scene;
        this.camera = camera;
        this.postprocessing = { enabled: true };
    }

    init() {
        const bokehEffect = new RealisticBokehEffect({
            focus: 0.065,
			focalLength: this.camera.getFocalLength(),
			fStop: 1.6,
			luminanceThreshold: 0.325,
			luminanceGain: 2.0,
			bias: -0.35,
			fringe: 0.7,
			maxBlur: 2.5,
			rings: 5,
			samples: 5,
			showFocus: false,
			manualDoF: false,
			pentagon: true
        });

        let gammaCorrectionEffect = new GammaCorrectionEffect({ gamma: 2.2 });
        let renderPass = new RenderPass(this.scene, this.camera);
        let bokehPass = new EffectPass(this.camera, bokehEffect, new VignetteEffect());
        let bloomPass = new EffectPass(this.camera, new BloomEffect());

        let pass = new EffectPass(this.camera,
            gammaCorrectionEffect
        );

        pass.renderToScreen = true;

        this.composer.addPass(renderPass);
        // this.composer.addPass(bokehPass);
        this.composer.addPass(pass);
        // this.composer.addPass(gammaCorrectionShader);
        //  this.composer.addPass(bloomPass);
        this.clock = new Clock();
    }

    render() {
        this.composer.render(this.clock.getDelta());
    }

}

export default PostProcessingManager;