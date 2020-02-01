import EventDispatcher from './event-dispatcher';

class ApiService {

    constructor() {
        this.eventDispatcher = new EventDispatcher();
        this.events = {
            onNewEggs: 'event-on-new-eggs'
        }
    }

    getAllEggs() {
        return new Promise((resolve, reject) => {

            var requestOptions = {
                method: 'GET',
                redirect: 'follow'
            };

            fetch("https://project-egg.azurewebsites.net/api/eggs", requestOptions)
                .then(response => response.text())
                .then((result) => {
                    var eggs = JSON.parse(result).eggs;
                    this.eventDispatcher.dispatch(this.events.onNewEggs, eggs);
                    resolve(eggs)
                })
                .catch((error) => reject(error));
        });
    }

    onNewEggs(handler) {
        this.eventDispatcher.registerHandler(this.events.onNewEggs, handler);
    }

}

export default ApiService;