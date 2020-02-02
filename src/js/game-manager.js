import ApiService from './api-service';
import AssetLoader from './asset-loader';
import AudioService from './audio-service';
import EventDispatcher from './event-dispatcher';
import GameCounter from './components/game-counter.component';
import SceneManager from './scene-manager';
import EggService from './egg-service';
import PickHelper from './pick-helper';
import Timer from './timer';
import UI from './ui-manager';
import Utility from './utility';

import {Math} from "three";



class GameManager {

    constructor(element) {
        var that = this;
        this.element = element;
        this.state = {
            step: 0,
            pickedEggs: []
        };
        this.events = {
            onBegin: 'events-on-begin',
            onGameEnd: 'events-on-game-end',
            onGameTimeStart: 'events-on-game-time-start',
            onGameTimeProgress: 'events-on-game-time-progress',
            onGameTimeEnd: 'events-on-game-time-end'
        }

        this.apiService = new ApiService();
        this.eventDispatcher = new EventDispatcher();
        this.timer = new Timer();
        this.timer.onTimerStart((state) => {
            that.eventDispatcher.dispatch(that.events.onGameTimeStart, state);
        })
        this.timer.onTimerProgress((state) => {
            that.eventDispatcher.dispatch(that.events.onGameTimeProgress, state);
        })
        this.timer.onTimerEnd((state) => {
            that.eventDispatcher.dispatch(that.events.onGameTimeEnd, state);
            that.endGame();
        })

        this.sceneManager = new SceneManager();

        this.updateStep(0);

        document.body.querySelector('#intro-screen button').addEventListener('click', (event) => {
            that.begin();
        });

    }

    begin() {
        if (this.state.step === 0 || this.state.step === 3) {
            this.updateStep(1);
            this.eventDispatcher.dispatch(this.events.onBegin);
        }
    }

    startGame() {
        this.updateStep(2);
        this.timer.countdown(180000);
    }

    endGame() {
        this.updateStep(3);
        this.timer.stop();
        this.state.score = this.calculateScore();
        this.eventDispatcher.dispatch(this.events.onGameEnd, this.state.score);
    }

    resetState() {
        this.state = {
            step: 0,
            pickedEggs: []
        };
    }

    updateStep(step) {
        this.state.step = step;
        this.element.setAttribute('data-step', step);
    }

    calculateScore(){
        var score = 0;
        var eggsFound = this.getPickedEggCount();
        var timerState = this.timer.getState();
        var timeLeft = Math.clamp(timerState.duration - timerState.elapsedTime, 0, timerState.duration);

        if(timeLeft > 0) {
            timeLeft = Math.floor(timeLeft / 60);
        }

        score += eggsFound * 20;
        score += timeLeft;

        return score;

    }

    getPickedEggCount(){
        var eggsFound = 0;

        this.state.pickedEggs.forEach((egg) => {
            if(egg.hasBeenFound) {
                eggsFound++;
            }
        });

        return eggsFound;

    }

    setPickedEggs(eggs) {
        this.state.pickedEggs = eggs;
    }

    checkGameProgress(){
        if(Array.isArray(this.state.pickedEggs) && this.state.pickedEggs.length > 0) {
            var eggsCount = this.state.pickedEggs.length;
            var eggsFound = this.getPickedEggCount();

            if(eggsFound === eggsCount){
                //game won
                this.endGame();
            }

        }
    }

    /* events */

    onBegin(handler) {
        this.eventDispatcher.registerHandler(this.events.onBegin, handler);
    }

    onGameEnd(handler) {
        this.eventDispatcher.registerHandler(this.events.onGameEnd, handler);
    }

    onGameTimeStart(handler) {
        this.eventDispatcher.registerHandler(this.events.onGameTimeStart, handler);
    }

    onGameTimeProgress(handler) {
        this.eventDispatcher.registerHandler(this.events.onGameTimeProgress, handler);
    }

    onGameTimeEnd(handler) {
        this.eventDispatcher.registerHandler(this.events.onGameTimeEnd, handler);
    }


}

export default GameManager;