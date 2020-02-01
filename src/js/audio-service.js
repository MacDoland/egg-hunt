class AudioService {
    constructor(listener) {
        this.listener = listener;
        this.speaker = new THREE.Audio(listener);
        this.loader = new THREE.AudioLoader();
        this.audio = [];
        let that = this;
    }

    setVolume(volume){
        this.speaker.setVolume( volume );
    }

    load(key, path, ) {
        var audioLoader = new THREE.AudioLoader();
        var that = this;

        audioLoader.load(path, function (buffer) {
            that.audio[key] = buffer;
        });
    }

    play(key, isLoop) {
        if (Array.isArray(this.audio) && this.audio[key] && !this.speaker.isPlaying) {
            this.speaker.setBuffer( this.audio[key] );
            this.speaker.setLoop( isLoop );
            this.speaker.play();
        }
    }

    stop() {
        this.speaker.stop();
    }
}

export default AudioService;
