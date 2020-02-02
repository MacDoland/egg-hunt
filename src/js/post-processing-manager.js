import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

class PostProcessingManager {
    constructor(sceneManager) {
        this.composer = new EffectComposer(sceneManager.getRenderer());
        this.sceneManager = sceneManager;
        this.scene = this.sceneManager.getScene();
        this.camera = this.sceneManager.getCamera();
        this.postprocessing = { enabled: true };
    }

    init(){
       
        // var depthShader = THREE.BokehDepthShader;

        // this.materialDepth = new THREE.ShaderMaterial( {
        //     uniforms: depthShader.uniforms,
        //     vertexShader: depthShader.vertexShader,
        //     fragmentShader: depthShader.fragmentShader
        // } );

        // this.materialDepth.uniforms[ 'mNear' ].value = this.camera.near;
        // this.materialDepth.uniforms[ 'mFar' ].value = this.camera.far;

        var bokehSettings = {
            focus : 0.001, aperture : 0.000025,  maxblur : 1.0,
            width: window.innerWidth, height : window.innerHeight
        }


        this.composer.addPass(new RenderPass(this.scene, this.camera));
        // this.composer.addPass(new THREE.BokehPass(this.scene, this.camera, bokehSettings));

    }

    // initPostprocessing() {

    //     postprocessing.scene = this.sceneManager.getScene();
    //     postprocessing.camera = this.sceneManager.getCamera();
    
    //     var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    //     postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
    //     postprocessing.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
    
    //     var bokeh_shader = THREE.BokehShader;
    //     postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );
    
    //     postprocessing.bokeh_uniforms[ 'tColor' ].value = postprocessing.rtTextureColor.texture;
    //     postprocessing.bokeh_uniforms[ 'tDepth' ].value = postprocessing.rtTextureDepth.texture;
    //     postprocessing.bokeh_uniforms[ 'textureWidth' ].value = window.innerWidth;
    //     postprocessing.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight;
    
    //     postprocessing.materialBokeh = new THREE.ShaderMaterial( {
    
    //         uniforms: postprocessing.bokeh_uniforms,
    //         vertexShader: bokeh_shader.vertexShader,
    //         fragmentShader: bokeh_shader.fragmentShader,
    //         defines: {
    //             RINGS: shaderSettings.rings,
    //             SAMPLES: shaderSettings.samples
    //         }
    
    //     } );
    
    // }

    render() {
        this.composer.render(1);
    }
    
}

export default PostProcessingManager;