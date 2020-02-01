'use strict';

class EventDispatcher {
    constructor(){
        this._events = [];
    }

    addEvent(eventName) {
        if (typeof (this._events[eventName]) === 'undefined') {
            this._events[eventName] = [];
        }
    }

    clearEvent(eventName) {
        this._events[eventName] = [];
    }

    registerHandler(eventName, handler) {
        this.addEvent(eventName);
        this._events[eventName].push(handler);
    }

    deregisterHandler(eventName, handler) {
        var index = this._events[eventName].indexOf(handler);

        if (index !== -1)
        this._events[eventName].splice(index, 1);
    }

    dispatch(eventName, arg) {
        if (typeof (this._events[eventName]) !== "undefined") {

            for (var i = 0; i < this._events[eventName].length; i++) {
                this._events[eventName][i](arg);
            }
        }
    }
}

export default EventDispatcher;
