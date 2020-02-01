import EventDispatcher from '../event-dispatcher';

class GameCounter {
    constructor(element) {
        this.eventDispatcher = new EventDispatcher();
        this.element = element;
        this.model = {}

        this.template = doT.template(`
            <div class="c-game-counter">
                <div class="c-game-counter__inner">
                    {{?this.model.length }}
                        {{~this.model :value:index}}

                            <img class="c-game-counter__image {{?value.hasBeenFound}}found{{?}}" src="{{=value.previewImageUrl}}" />

                        {{~}}
                    {{?}}
                </div>
            </div>
        `);

        this.element.innerHTML = this.template();
    }

    update(model) {
        this.model = model;
        this.element.innerHTML = this.template(model);
    }
}

export default GameCounter;