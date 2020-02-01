import  EventDispatcher from './event-dispatcher';

class AssetLoader {

    constructor() {
        this.loader = new THREE.TextureLoader();
        this.eventDispatcher = new EventDispatcher();
        this.events = {
            onLoadTextures: 'event-load-textures',
            onModelsLoaded: 'event-on-models-loaded'
        };
    }
    loadTexture(url) {
        return new Promise((resolve, reject) => {
            try {
                var texture = this.loader.load(url);
                texture.wrapS = THREE.RepeatWrapping;//stops unwanted stretching
                texture.wrapT = THREE.RepeatWrapping;//stops unwanted stretching
                texture.repeat.y = - 1; //flip texture vertically;
                texture.needsUpdate = true;
                texture.encoding = THREE.sRGBEncoding;

                resolve(texture);
            }
            catch (error) {
                reject(error);
            }
        });
    }

    loadTextures(urls) {
        var that = this;
        this._loadTextures(urls).then((textures) => {
            that.eventDispatcher.dispatch(this.events.onLoadTextures, textures);
        })
    }

    _loadTextures(urls) {
        var texturePromises = [];
        
        if(Array.isArray(urls)) {

            urls.forEach((url) => {
                texturePromises.push(this.loadTexture(url));
            });

             return Promise.all(texturePromises);
        }

        return [];

    }

    onLoadTextures(handler){
        this.eventDispatcher.registerHandler(this.events.onLoadTextures, handler);
    }
}

export default AssetLoader;