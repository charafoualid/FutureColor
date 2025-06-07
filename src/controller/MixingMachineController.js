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
        const pot = this.potStore.getPotById(potId); // Assumes PotStore has getPotById

        if (machine && pot) {
            if (pot.isEmpty()) {
                alert("Kan geen lege pot aan machine toevoegen.");
                return;
            }
            // Optional: Check if pot is already in another machine or this one
            machine.addPot(pot);
            this.view.addPotToMachineView(machineId, pot);
            console.log(`Pot ${potId} added to machine ${machineId}`);

            // Visually remove or mark the pot in the PotView
            // This requires communication back to PotController/PotView or a shared state
            const potElement = document.querySelector(`.pot[data-pot-id="${potId}"]`);
            if (potElement) {
                potElement.style.opacity = '0.5'; // Mark as used
                potElement.draggable = false; // Prevent re-dragging
                // Or potElement.remove(); if it should disappear
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

            // Listen for completion (since startMixing is async with setTimeout)
            // A more robust solution would use events or promises from the MixingMachine model
            const checkInterval = setInterval(() => {
                if (machine.status === MIXING_MACHINE_STATUS.COMPLETE) {
                    clearInterval(checkInterval);
                    this.view.updateMachineStatus(machineId, MIXING_MACHINE_STATUS.COMPLETE, machine.getResult());
                    // After mixing, clear the pots from the machine model and view
                    this.view.clearPotsFromMachineView(machineId);
                    // Note: The original pots in PotStore are not cleared here,
                    // they are just no longer in the machine. You might want to clear them
                    // or reset their 'used' state if they are to be reused.
                    machine.clearPots(); // Clear pots from the machine model
                }
            }, 100); // Check every 100ms
        }
    }
}