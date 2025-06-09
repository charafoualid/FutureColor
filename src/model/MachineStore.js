// model/MachineStore.js
export class MachineStore {
    constructor(hallId) {
        this.hallId = hallId;
        this.machines = [];
    }

    addMachine(machine) {
        this.machines.push(machine);
    }

    removeMachineById(machineId) {
        this.machines = this.machines.filter(machine => machine.id !== machineId);
    }

    getMachineById(machineId) {
        return this.machines.find(machine => machine.id === machineId);
    }

    getAllMachines() {
        return this.machines;
    }

    clearAllMachines() {
        this.machines = [];
    }

    isEmpty() {
        return this.machines.length === 0;
    }
}