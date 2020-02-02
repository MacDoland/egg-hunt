
import { AudioListener, Math, RepeatWrapping, sRGBEncoding, BackSide, MeshBasicMaterial, MeshFaceMaterial, CubeGeometry, Mesh  } from "three";

import ApiService from './api-service';
import AssetLoader from './asset-loader';
import AudioService from './audio-service';
import GameCounter from './components/game-counter.component';
import SceneManager from './scene-manager';
import EggService from './egg-service';
import PostProcessingManager from './post-processing-manager';
import PickHelper from './pick-helper';
import UI from './ui-manager';
import Utility from './utility';

import GameManager from './game-manager';
import UITimer from './components/ui-timer.component';
import UIScore from './components/ui-score.component';

document.addEventListener("DOMContentLoaded", function () {
    const element = document.body.querySelector('#egg-hunt-game')
        , apiService = new ApiService()
        , gameManager = new GameManager(element)
        , sceneManager = new SceneManager()
        // , gameCounterElement = document.body.querySelector('#game-counter')
        // , gameCounter = new GameCounter(gameCounterElement)
        , uIScore = new UIScore(document.body.querySelector('#game-score'))
        // , uITimer = new UITimer(document.body.querySelector('#game-timer'))
        , assetLoader = new AssetLoader()
        , eggService = new EggService(20)
        , pickHelper = new PickHelper()
        , ui = new UI();



    let eggsData
        , eggModels
        , loadedEggs
        , pickedEggs
        , root
        , model
        , audioService
        , sfxService;


    let music = [
        { key: 'playful-solutions', path: 'audio/playful-solutions.mp3' },
        { key: 'familly-game', path: 'audio/familly-game.mp3' },
        { key: 'fun-on-the-farm', path: 'audio/fun-on-the-farm.mp3' },
        { key: 'fun-time', path: 'audio/fun-time.mp3' },
        { key: 'happy-walker', path: 'audio/happy-walker.mp3' },
        { key: 'sneaky-steps', path: 'audio/sneaky-steps.mp3' }
    ]

    var selectedMusic = music[Utility.getRandomInt(music.length)];


    gameManager.onBegin(function () {
        sceneManager.init();
    });


    sceneManager.onAfterInit(() => {
        let postProcessingManager = new PostProcessingManager(sceneManager);
        postProcessingManager.init();
        sceneManager.onRender(postProcessingManager.render.bind(postProcessingManager));


        apiService.getAllEggs();

        var listener = new AudioListener();
        var sfxListener = new AudioListener();
        sceneManager.getCamera().add(listener);
        sceneManager.getCamera().add(sfxListener);
        audioService = new AudioService(listener);
        audioService.load(selectedMusic.key, selectedMusic.path);
        audioService.setVolume(0.25);

        let volumeControl = document.body.querySelector('#volume-toggle');

        if (volumeControl) {
            var volume = 0.25;

            document.body.querySelector('#volume-toggle').addEventListener('click', () => {
                volume = volume != 0.25 ? 0.25 : 0;
                audioService.setVolume(volume);
            });
        }

        sfxService = new AudioService(sfxListener);
        sfxService.load('success', 'audio/success-chime.wav');
        sfxService.setVolume(0.25);

        ui.init(sceneManager);
    });

    apiService.onNewEggs((newEggs) => {
        eggsData = newEggs;
        sceneManager.loadModels();
    });

    sceneManager.onModelsLoaded((loadedModel) => {
        model = loadedModel;
        root = loadedModel.scene;
        root.rotation.y = Math.degToRad(180);
        sceneManager.setRoot(root);
        sceneManager.add(loadedModel.scene);
        var models = sceneManager.getModelsByName("Egg", loadedModel.scene);
        eggService.buildEggs(eggsData, models);
    });

    sceneManager.onModelsLoaded(() => {
        // audioService.disable.bind(audioService)();
    
        let textureUrls = [
            './media/sky/01A_Day_Sunless_Left.png',
            './media/sky/01A_Day_Sunless_Right.png',
            './media/sky/01A_Day_Sunless_Up.png',
            './media/sky/01A_Day_Sunless_Down.png',
            './media/sky/01A_Day_Sunless_Front.png',
            './media/sky/01A_Day_Sunless_Back.png'
        ];

        let skyboxLoader = new AssetLoader();

        skyboxLoader.onLoadTextures((textures) => {
            var materials = textures.map((texture) =>{

                texture.wrapS = RepeatWrapping;//stops unwanted stretching
                texture.wrapT = RepeatWrapping;//stops unwanted stretching
                texture.repeat.y = -1; //flip texture vertically;
                texture.encoding = sRGBEncoding;
                texture.flipY = true;
                texture.needsUpdate = true;

                return new MeshBasicMaterial({
                    map: texture,
                    side: BackSide
                })
            });

            var skyBoxGeometry = new CubeGeometry(5000, 5000, 5000);
            var skyBoxMaterial = new MeshFaceMaterial(materials);
            var mesh = new Mesh(skyBoxGeometry, skyBoxMaterial);
            mesh.scale.y = -1;
            sceneManager.addSky(mesh)
        });

        skyboxLoader.loadTextures(textureUrls);

        // let texture = loader.load(textureUrls,
        //      ((cubeTexture) => {
        //         var skyBoxGeometry = new THREE.CubeGeometry(5000, 5000, 5000);
        //         var skyBoxMaterial = new THREE.MeshBasicMaterial({
        //             envMap: cubeTexture,
        //             side: THREE.BackSide
        //         })
        //         var mesh = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        //         sceneManager.addSky(mesh)
        //       // sceneManager.add(mesh);

        //     }).bind(this));

    });


    eggService.onHatchedEggs((eggs) => {
        loadedEggs = eggs;
        eggModels = eggs.map((egg) => egg.model);
        pickedEggs = eggService.pickEggs(eggs, 4);
        gameManager.setPickedEggs(pickedEggs);
        // gameCounter.update(pickedEggs);

        var loop = () => {
            pickHelper.pick(ui.getPickPosition(), eggModels, sceneManager.getCamera());

            if (pickHelper.pickedObject) {
                window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
            }

            requestAnimationFrame(loop);
        };

        ui.getGameContainer().addEventListener('click', (event) => {

            if (pickHelper.pickedObject) {
                pickedEggs.forEach((pickedEgg) => {
                    if (pickedEgg.model.uuid === pickHelper.pickedObject.uuid) {
                        if (pickedEgg.isHiddenEgg && !pickedEgg.hasBeenFound) {
                            pickedEgg.hasBeenFound = true;
                            sfxService.play('success', false);
                            gameManager.checkGameProgress();
                        }
                    }
                });

                // gameCounter.update(pickedEggs);
            }
        });

        loop();

        assetLoader.loadTextures([
            "lightmap.png",
            "lightmap-floor.png",
            "lightmap__foliage.png"
        ]);
    })

    assetLoader.onLoadTextures(([lightMapTexture, lightMapFloorTexture, lightMapFoliageTexture]) => {
        sceneManager.updateSceneMaterials(loadedEggs, model, lightMapTexture, lightMapFloorTexture, lightMapFoliageTexture);
    });

    sceneManager.onUpdatedSceneMaterials(() => {
        audioService.play(selectedMusic.key, true);
        gameManager.startGame();

        if (window.outerWidth < 768) {
            sceneManager.updateRenderScale();
        }
        window.requestAnimationFrame(sceneManager.render.bind(sceneManager));
    });

    gameManager.onGameEnd((score) => {
        audioService.stop();

        uIScore.update({
            score: score
        });
    });

    gameManager.onGameTimeStart((timerState) => {
        // uITimer.update({
        //     time: timerState.duration - timerState.elapsedTime
        // });
    })

    gameManager.onGameTimeProgress((timerState) => {
        // uITimer.update({
        //     time: timerState.duration - timerState.elapsedTime
        // });
    })

    gameManager.onGameTimeEnd((timerState) => {
        // uITimer.update({
        //     time: timerState.duration - timerState.elapsedTime
        // });
    })
});
