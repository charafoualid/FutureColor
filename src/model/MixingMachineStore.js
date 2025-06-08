export class MixingMachineStore {
    constructor() {
        this.mixingMachines = [];
    }

    /**
     * Adds a new mixing machine to the store.
     */
    addMachine(machine) {
        this.mixingMachines.push(machine);
    }

    /**
     * Removes a mixing machine from the store by its ID.
     */
    removeMachineById(machineId) {
        this.mixingMachines = this.mixingMachines.filter(machine => machine.id !== machineId);
    }

    /**
     * Retrieves a mixing machine by its ID.
     */
    getMachineById(machineId) {
        return this.mixingMachines.find(machine => machine.id === machineId);
    }

    /**
     * Retrieves all mixing machines.
     */
    getAllMachines() {
        return this.mixingMachines;
    }

    /**
     * Clears all mixing machines from the store.
     */
    clearAllMachines() {
        this.mixingMachines = [];
    }

    isEmpty() {
        return this.mixingMachines.length === 0;
    }
}