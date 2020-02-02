import {Audio, AudioLoader } from "three";

class AudioService {
    constructor(listener) {

        this.storageKey = 'egg-hunt-audio-disabled';
        this.listener = listener;
        this.speaker = new Audio(listener);
        this.loader = new AudioLoader();
        this.audio = [];
        let that = this;



    }


    setVolume(volume) {
        this.speaker.setVolume(volume);
    }

    load(key, path, ) {
        var audioLoader = new AudioLoader();
        var that = this;

        audioLoader.load(path, function (buffer) {
            that.audio[key] = buffer;
        });
    }

    play(key, isLoop) {

        if (!localStorage.getItem(this.storageKey) && Array.isArray(this.audio) && this.audio[key] && !this.speaker.isPlaying) {
            this.currentKey = key;
            this.isLoop = isLoop;
            this.speaker.setBuffer(this.audio[key]);
            this.speaker.setLoop(isLoop);
            this.speaker.play();
        }
    }

    stop() {
        if (this.speaker && this.speaker.isPlaying) {
            this.speaker.stop();
        }
    }

    enable() {
        if (this.key) {
            this.play(this.key, this.isLoop);
        }

        localStorage.removeItem(this.storageKey);
    }

    disable() {
        this.stop();
        localStorage.setItem(this.storageKey, true);
    }
}

export default AudioService;
