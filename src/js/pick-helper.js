import EventDispatcher from './event-dispatcher';

class PickHelper {
    constructor() {
        this.eventDispatcher = new EventDispatcher();
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
        this.offset = new THREE.Vector2(0, 0);
        this.zero = new THREE.Vector2(0, 0);
        this.events = {
            onPick: "events-on-pick"
        };
    }
    pick(normalizedPosition, eggs, camera) {
        // restore the color if there is a picked object
        if (this.pickedObject) {
            // this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            // this.pickedObject = undefined;
            this.pickedObject.rotation.z += 0.1;
        }

        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(eggs);
        if (intersectedObjects.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObjects[0].object;
            if (this.pickedObject.name.includes('Egg')) {

                this.offset.x += 0.005;

                if (this.offset.x >= 100) {
                    this.offset.x = 0;
                }

                this.pickedObject.material.map.offset = this.offset;
                this.pickedObject.material.lightMap.offset = this.zero;
                this.pickedObject.material.needsUpdate = true;
            }
        }
        else {
            if (this.pickedObject) {
                this.pickedObject.material.map.offset = new THREE.Vector2();
                this.pickedObject.material.needsUpdate = true;
                this.pickedObject = undefined;
            }

            this.offset.x = 0;
        }
    }

    onPick(handler) {
        this.eventDispatcher.registerHandler(this.events.onPick, handler);
    }
}

export default PickHelper;