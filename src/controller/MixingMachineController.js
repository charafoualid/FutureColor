// controller/MixingMachineController.js
import { MixingMachine } from '../model/MixingMachine.js';
import { MixingMachineStore } from '../model/MixingMachineStore.js'; // Let op: dit is nu de aangepaste store
import { MixingMachineView } from '../view/MixingMachineView.js';
import { MIXING_MACHINE_STATUS } from '../constants.js';
import { fetchData as fetchWeatherData } from '../services/weatherAPI.js';

export class MixingMachineController {
    constructor(potStore) {
        this.mixingMachineStore = new MixingMachineStore(); // Nu beheert deze intern twee MachineStores
        this.view = new MixingMachineView('mixing-machine', 'mix-result');
        this.potStore = potStore;
        this.locationInputElement = document.getElementById('location-input');

        this.view.setOnAddMachineCallback(this.handleAddMachine.bind(this));
        this.view.setOnStartMixCallback(this.handleStartMix.bind(this));
        this.view.setOnSetSpeedCallback(this.handleSetSpeed.bind(this));
        this.view.setOnSetTimeCallback(this.handleSetTime.bind(this));
        this.view.setOnAddPotToMachineCallback(this.handleAddPotToMachine.bind(this));

        // Nieuwe callback voor de "Wissen" knop in de view
        this.view.setOnClearMachinesCallback(this.handleClearMachines.bind(this)); 

        this.view.renderInitialView();
        this.renderActiveHallMachines(); // Initial render for the default active hall
    }

    setActiveHall(hallId) {
        this.mixingMachineStore.setActiveHall(hallId);
        this.renderActiveHallMachines(); // Render machines for the newly active hall
    }

    renderActiveHallMachines() {
        this.view.clearAllMachinesView(); // Clear current view
        const machines = this.mixingMachineStore.getAllMachinesOfActiveHall(); // Get machines for active hall
        machines.forEach(machine => this.view.renderMixingMachine(machine));

        // Re-render results for the active hall (assuming results are also per hall)
        // This requires an adjustment in MixingMachineView.renderMixResult to clear/re-render per hall
        // For now, we'll clear and results will be re-added as machines complete.
        // Or better: ensure renderMixResult checks if the result belongs to the *current* active hall
        // before rendering, or clear only the *current* results. For simplicity, we assume
        // resultContainer always shows results of currently active hall.
        this.view.clearResultsView(); // Clear results for previous hall
        machines.forEach(machine => {
            if (machine.status === MIXING_MACHINE_STATUS.COMPLETE && machine.getResult()) {
                this.view.renderMixResult(machine.id, machine.getResult());
            }
        });
    }

    handleAddMachine() {
        const activeHallMachines = this.mixingMachineStore.getAllMachinesOfActiveHall();
        const newMachine = new MixingMachine(`Machine ${activeHallMachines.length + 1}`);
        this.mixingMachineStore.addMachine(newMachine); // Adds to active hall
        this.view.renderMixingMachine(newMachine);
    }

    handleSetSpeed(machineId, speed) {
        // Zoeken in alle machines, want set speed kan vanuit elke hal op elke machine
        const machine = this.mixingMachineStore.getMachineById(machineId); 
        if (machine) {
            machine.setMixSpeed(speed);
            console.log(`Speed set for ${machineId} to ${speed}`);
        }
    }

    handleSetTime(machineId, time) {
        // Zoeken in alle machines
        const machine = this.mixingMachineStore.getMachineById(machineId);
        if (machine) {
            machine.setMixTime(time);
            console.log(`Time set for ${machineId} to ${time}`);
        }
    }

    handleAddPotToMachine(machineId, potId) {
        // Zoeken in alle machines
        const machine = this.mixingMachineStore.getMachineById(machineId); 
        const newPot = this.potStore.getPotById(potId);

        if (machine && newPot) {
            if (newPot.isEmpty()) {
                alert("Kan geen lege pot aan machine toevoegen.");
                return;
            }

            const oldPot = machine.addPot(newPot);

            if (oldPot) {
                const oldPotElement = document.querySelector(`.pot[data-pot-id="${oldPot.id}"]`);
                if (oldPotElement) {
                    oldPotElement.style.opacity = '1';
                    oldPotElement.draggable = true;
                }
            }
            
            this.view.addPotToMachineView(machineId, newPot);
            console.log(`Pot ${newPot.id} added to machine ${machineId}. Pot ${oldPot ? oldPot.id : 'None'} was replaced.`);

            const newPotElement = document.querySelector(`.pot[data-pot-id="${newPot.id}"]`);
            if (newPotElement) {
                newPotElement.style.opacity = '0.5';
                newPotElement.draggable = false;
            }

        } else {
            console.error("Machine or Pot not found for adding pot to machine.");
        }
    }

    async handleStartMix(machineId) {
        const machine = this.mixingMachineStore.getMachineById(machineId); // Haal de machine op, kan uit elke hal komen

        if (!machine.inputPot) {
            alert("Voeg eerst een pot toe aan de machine voordat je start met mixen.");
            return;
        }

        const currentCity = this.locationInputElement ? this.locationInputElement.value.trim() : null;
        let weatherData = null;
        let weatherAlerts = [];

        if (currentCity) {
            weatherData = await fetchWeatherData(currentCity);
        }

        const originalMixTime = machine.mixTimeSetting;
        let adjustedMixTime = originalMixTime;
        let timeAdjustmentFactor = 1.0;

        if (weatherData && weatherData.current && 
            typeof weatherData.current.temperature_2m !== 'undefined' && 
            typeof weatherData.current.precipitation !== 'undefined') {
            
            const temp = weatherData.current.temperature_2m;
            const precipitationAmount = weatherData.current.precipitation;

            if (precipitationAmount > 0) {
                timeAdjustmentFactor += 0.10;
                weatherAlerts.push(`Neerslag (${precipitationAmount}mm) gedetecteerd: mengtijd +10%.`);
            }

            if (temp < 10) {
                timeAdjustmentFactor += 0.15;
                weatherAlerts.push(`Temperatuur (${temp}°C) is onder 10°C: mengtijd +15%.`);
            }
            
            adjustedMixTime = Math.round(originalMixTime * timeAdjustmentFactor);

            if (temp > 35) {
                // Hier kijken we nu over *alle* machines in *alle* hallen
                const activeMixingMachinesAcrossAllHalls = this.mixingMachineStore.getAllMachinesAcrossAllHalls().filter(
                    m => m.id !== machineId && m.status === MIXING_MACHINE_STATUS.MIXING
                ).length;
                
                if (activeMixingMachinesAcrossAllHalls >= 1) {
                    alert(`Hoge temperatuur (${temp}°C)! Er draait al een andere mengmachine in een van de hallen. Maximaal 1 machine toegestaan boven 35°C. Deze mix wordt niet gestart.`);
                    return;
                }
                weatherAlerts.push(`Temperatuur (${temp}°C) is boven 35°C: maximaal 1 machine mag tegelijk draaien over alle hallen.`);
            }
            
        } else if (currentCity) {
            weatherAlerts.push(`Kon geen volledige weerdata ophalen voor ${currentCity}. Mengtijd wordt niet aangepast.`);
        }

        if (weatherAlerts.length > 0) {
            alert("Weercondities update:\n" + weatherAlerts.join("\n"));
        }
        
        machine.setMixTime(adjustedMixTime);
        if (adjustedMixTime !== originalMixTime) {
            console.log(`Original mix time: ${originalMixTime}ms, Adjusted mix time for machine ${machineId}: ${adjustedMixTime}ms`);
        }

        this.view.updateMachineStatus(machineId, MIXING_MACHINE_STATUS.MIXING);
        machine.startMixing();

        const checkInterval = setInterval(() => {
            if (machine.status === MIXING_MACHINE_STATUS.COMPLETE || machine.status === MIXING_MACHINE_STATUS.IDLE) {
                clearInterval(checkInterval);
                const result = machine.getResult();
                // Alleen updateMachineStatus als het de *actieve* hal betreft.
                // Dit voorkomt dat machines in de achtergrond hallen resultaten tonen in de verkeerde UI.
                if (this.mixingMachineStore.getActiveHallStore().getMachineById(machineId)) {
                    this.view.updateMachineStatus(machineId, machine.status, result);
                } else {
                    // Als de machine niet in de actieve hal is, zorg dan dat de view ook op de hoogte is
                    // (bijv. voor een notificatie als we die zouden hebben)
                    console.log(`Machine ${machineId} in niet-actieve hal ${this.mixingMachineStore.activeHallId} is klaar. Resultaat:`, result);
                }
                
                if (result && result.message && result.message.startsWith("Mixfout: Machinesnelheid")) {
                    // Optioneel: toon alert alleen als machine in actieve hal is
                    if (this.mixingMachineStore.getActiveHallStore().getMachineById(machineId)) {
                        alert(result.message);
                    }
                }

                this.view.clearPotsFromMachineView(machineId);
                machine.removePot(); 
                machine.setMixTime(originalMixTime);
                console.log(`Mix for machine ${machineId} ended. Mix time setting reset to ${originalMixTime}ms.`);
            }
        }, 100);
    }

    handleClearMachines() {
        if (this.mixingMachineStore.getActiveHallStore().isEmpty()) {
            alert('Geen machines om te wissen in deze hal!');
            return;
        }
        this.mixingMachineStore.clearAllMachinesOfActiveHall();
        this.view.clearAllMachinesView(); // Clears all machines from the view
    }
}