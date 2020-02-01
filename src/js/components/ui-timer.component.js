import EventDispatcher from '../event-dispatcher';

class UITimer {
    constructor(element) {
        this.eventDispatcher = new EventDispatcher();
        this.element = element;
        this.model = {
            time: '3:00'
        };

        this.template = doT.template(`
            <div class="c-ui-timer">
                Time: {{=this.model.time}}
            </div>
        `);

        this.element.innerHTML = this.template();
    }

    update(model) {

        if(model.time){
            model.time = this.millisToMinutesAndSeconds(model.time);
        }

        this.model = model;
        this.element.innerHTML = this.template(model);
    }
    millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + (seconds === '60' ? '00' : seconds);
    }
}

export default UITimer;