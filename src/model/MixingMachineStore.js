// model/MixingMachineStore.js
import { MachineStore } from './MachineStore.js'; // Import the new MachineStore

export class MixingMachineStore {
    constructor() {
        this.hallStores = {
            'hall-a': new MachineStore('hall-a'),
            'hall-b': new MachineStore('hall-b')
        };
        this.activeHallId = 'hall-a'; // Default active hall
    }

    setActiveHall(hallId) {
        if (this.hallStores[hallId]) {
            this.activeHallId = hallId;
        } else {
            console.warn(`Hal met ID ${hallId} bestaat niet.`);
        }
    }

    getActiveHallStore() {
        return this.hallStores[this.activeHallId];
    }

    // Proxy methods to the active hall's store
    addMachine(machine) {
        this.getActiveHallStore().addMachine(machine);
    }

    removeMachineById(machineId) {
        this.getActiveHallStore().removeMachineById(machineId);
    }

    getMachineById(machineId) {
        // We moeten machines kunnen vinden in *alle* hallen voor bepaalde operaties
        // (bijv. de 35 graden regel), dus we zoeken door alle stores.
        for (const hallId in this.hallStores) {
            const machine = this.hallStores[hallId].getMachineById(machineId);
            if (machine) return machine;
        }
        return null;
    }

    getAllMachinesOfActiveHall() { // Nieuwe methode
        return this.getActiveHallStore().getAllMachines();
    }

    getAllMachinesAcrossAllHalls() { // Voor globale checks zoals temperatuurregel
        return Object.values(this.hallStores).flatMap(store => store.getAllMachines());
    }

    clearAllMachinesOfActiveHall() { // Nieuwe methode
        this.getActiveHallStore().clearAllMachines();
    }

    isEmpty() { // Checkt of de actieve hal leeg is
        return this.getActiveHallStore().isEmpty();
    }
}