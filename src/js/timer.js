import EventDispatcher from './event-dispatcher';

class Timer {
    constructor() {
        this.eventDispatcher = new EventDispatcher();
        this.events = {
            onTimerStart: 'event-on-timer-start',
            onTimerProgress: 'event-on-timer-progress',
            onTimerEnd: 'event-on-time-end'
        };

        this.state = {
            active: false
        }

        this.startTime = 0;
    }

    countdown(duration) {
        this.state.active = true;
        this.state.startTime = new Date();
        this.state.duration = duration;
        this.state.elapsedTime = 0;

        this.eventDispatcher.dispatch(this.events.onTimerStart, this.state);
        this._countdown.bind(this)();
    }

    _countdown() {
        if (this.state.active) {
            this.state.currentTime = new Date();
            this.state.elapsedTime = this.state.currentTime - this.state.startTime;

            this.eventDispatcher.dispatch(this.events.onTimerProgress, this.state);

            if (this.state.elapsedTime < this.state.duration) {
                requestAnimationFrame(this._countdown.bind(this));
            }
            else {
                this.eventDispatcher.dispatch(this.events.onTimerEnd, this.state);
            }
        }
    }

    stop() {
        this.state.active = false;
    }

    getState(){
        return this.state;
    }

    onTimerStart(handler) {
        this.eventDispatcher.registerHandler(this.events.onTimerStart, handler);
    }

    onTimerProgress(handler) {
        this.eventDispatcher.registerHandler(this.events.onTimerProgress, handler);
    }

    onTimerEnd(handler) {
        this.eventDispatcher.registerHandler(this.events.onTimerEnd, handler);
    }
}

export default Timer;