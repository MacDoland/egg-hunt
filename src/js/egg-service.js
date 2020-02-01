import AssetLoader from './asset-loader';
import Egg from './egg';
import EventDispatcher from './event-dispatcher';
import Utility from './utility';

class EggService {

    constructor(maxEggs) {
        this.eventDispatcher = new EventDispatcher();
        this.events = {
            onHatchedEggs: 'event-on-eggs-hatch',
        };
        this.maxEggs = maxEggs || 20;
        this.assetLoader = new AssetLoader();
        this.eggs = [];
        this.hiddenEggs = [];
        this.eggsLoading = [];
    }

    buildEggs(eggsData, eggModel) {
        this.hatchEggs(eggsData, eggModel)
        .then((eggs) => this.eventDispatcher.dispatch(this.events.onHatchedEggs, eggs));
    }

    hatchEggs(eggsData, eggModels) {
        if (Array.isArray(eggsData)) {
            var eggCount = eggsData.length >= this.maxEggs ? this.maxEggs : eggsData.length;
            eggCount = eggModels.length >= eggCount ? eggCount : eggModels.length;

            var index = 0, id = 0, eggData, eggModel, egg;

            for (var i = 0; i < eggCount; i++) {
                index = Utility.getRandomInt(eggsData.length);
                eggData = eggsData[index];
                eggsData = eggsData.filter(item => item.id !== eggData.id);

                index = Utility.getRandomInt(eggModels.length);
                eggModel = eggModels[index];
                eggModels = eggModels.filter(item => item.id !== eggModel.id);


                egg = new Egg(eggData,  eggModel);
                this.eggs.push(egg);
                this.eggsLoading.push(egg.load(eggData.textureImageUrl));
            }

            return Promise.all(this.eggsLoading);
        }
    }

    pickEggs(eggs, maxCount){
        var index
        , pickedEgg;

        if(eggs.length < maxCount){
            maxCount = eggs.length;
        }

        this.hiddenEggs = [];

        for(var i = 0; i < maxCount; i++){

            index = Utility.getRandomInt(eggs.length);
            pickedEgg = eggs[index];
            eggs = eggs.filter((egg) => egg.id !== pickedEgg.id);
            pickedEgg.pick();
            this.hiddenEggs.push(pickedEgg);

        }

        return this.hiddenEggs;

        console.log("hidden eggs", this.hiddenEggs);
    }

    onHatchedEggs(handler) {
        this.eventDispatcher.registerHandler(this.events.onHatchedEggs, handler);
    }
}

export default EggService;