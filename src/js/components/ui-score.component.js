import EventDispatcher from '../event-dispatcher';

class UIScore {
    constructor(element) {
        this.eventDispatcher = new EventDispatcher();
        this.element = element;
        this.model = {
            score: 0
        };

        this.template = doT.template(`
            <div class="c-ui-score">
                <p>Score: {{=this.model.score}}</p>
            </div>
        `);

        this.element.innerHTML = this.template();
    }

    update(model) {
        this.model = model;
        this.element.innerHTML = this.template(model);
    }
 
}

export default UIScore;