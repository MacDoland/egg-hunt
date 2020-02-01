import AssetLoader from './asset-loader';

class Egg {
    constructor(data, model) {
        this.id = data.id;
        this.model = model;
        this.loader = new AssetLoader();
        this.isHiddenEgg = false;
        this.hasBeenFound = false;
        this.previewImageUrl = data.previewImageUrl;
    }

    load(textureUrl) {
        return new Promise((resolve, reject) => {
            try {
                this.loader.loadTexture(textureUrl).then((texture) => {
                    this.textureUrl = textureUrl;
                    this.texture = texture;
                    resolve(this);
                });
            }
            catch (error) {
                reject(error);
            }
        });
        
    }

    pick() {
        this.isHiddenEgg = true;
        this.hasBeenFound = false;
    }

    unpick() {
        this.isHiddenEgg = false;
        this.hasBeenFound = false;
    }

}

export default Egg;