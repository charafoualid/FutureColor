import { MixingMachine } from '../model/MixingMachine.js';
import { MixingMachineStore } from '../model/MixingMachineStore.js';
import { MixingMachineView } from '../view/MixingMachineView.js';
import { MIXING_MACHINE_STATUS } from '../constants.js';

export class MixingMachineController {
    constructor(potStore) {
        this.mixingMachineStore = new MixingMachineStore();
        this.view = new MixingMachineView('mixing-machine', 'mix-result');
        this.potStore = potStore;

        this.view.setOnAddMachineCallback(this.handleAddMachine.bind(this));
        this.view.setOnStartMixCallback(this.handleStartMix.bind(this));
        this.view.setOnSetSpeedCallback(this.handleSetSpeed.bind(this));
        this.view.setOnSetTimeCallback(this.handleSetTime.bind(this));
        this.view.setOnAddPotToMachineCallback(this.handleAddPotToMachine.bind(this));

        this.view.renderInitialView();
    }

    handleAddMachine() {
        const newMachine = new MixingMachine(`Machine ${this.mixingMachineStore.getAllMachines().length + 1}`);
        this.mixingMachineStore.addMachine(newMachine);
        this.view.renderMixingMachine(newMachine);
    }

    handleSetSpeed(machineId, speed) {
        const machine = this.mixingMachineStore.getMachineById(machineId);
        if (machine) {
            machine.setMixSpeed(speed);
            console.log(`Speed set for ${machineId} to ${speed}`);
        }
    }

    handleSetTime(machineId, time) {
        const machine = this.mixingMachineStore.getMachineById(machineId);
        if (machine) {
            machine.setMixTime(time);
            console.log(`Time set for ${machineId} to ${time}`);
        }
    }

    handleAddPotToMachine(machineId, potId) {
        const machine = this.mixingMachineStore.getMachineById(machineId);
        const newPot = this.potStore.getPotById(potId);

        if (machine && newPot) {
            if (newPot.isEmpty()) {
                alert("Kan geen lege pot aan machine toevoegen.");
                return;
            }

            // Add the new pot to the machine; this returns the old pot if one existed
            const oldPot = machine.addPot(newPot);

            // If a pot was replaced, make the old pot available again in the PotView.
            if (oldPot) {
                const oldPotElement = document.querySelector(`.pot[data-pot-id="${oldPot.id}"]`);
                if (oldPotElement) {
                    oldPotElement.style.opacity = '1'; // Make it fully visible
                    oldPotElement.draggable = true;    // Make it draggable again
                }
            }
            
            // Update the machine's UI to display the new pot.
            this.view.addPotToMachineView(machineId, newPot);
            console.log(`Pot ${newPot.id} added to machine ${machineId}. Pot ${oldPot ? oldPot.id : 'None'} was replaced.`);

            // Mark the new pot as 'in use' in the PotView.
            const newPotElement = document.querySelector(`.pot[data-pot-id="${newPot.id}"]`);
            if (newPotElement) {
                newPotElement.style.opacity = '0.5'; // Mark as used
                newPotElement.draggable = false; // Prevent re-dragging while in machine
            }

        } else {
            console.error("Machine or Pot not found for adding pot to machine.");
        }
    }

    handleStartMix(machineId) {
        const machine = this.mixingMachineStore.getMachineById(machineId);
        if (machine) {
            if (!machine.inputPot) {
                alert("Voeg eerst een pot toe aan de machine voordat je start met mixen.");
                return;
            }
            this.view.updateMachineStatus(machineId, 'mixing');
            machine.startMixing();

            // Poll for mixing completion as startMixing uses setTimeout.
            // TODO: Refactor to use events or promises for completion notification instead of polling.
            const checkInterval = setInterval(() => {
                if (machine.status === MIXING_MACHINE_STATUS.COMPLETE) {
                    clearInterval(checkInterval);
                    const result = machine.getResult();
                    this.view.updateMachineStatus(machineId, MIXING_MACHINE_STATUS.COMPLETE, result);
                    
                    // Check for specific error message from mixing process
                    if (result && result.message && result.message.startsWith("Mixfout: Machinesnelheid")) {
                        alert(result.message);
                    }

                    // Clear the pot from the machine model and UI after mixing is complete.
                    this.view.clearPotsFromMachineView(machineId);
                    machine.removePot();
                }
            }, 100); // Poll interval for checking mixing status.
        }
    }
}