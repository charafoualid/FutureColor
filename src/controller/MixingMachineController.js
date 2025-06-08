import { MixingMachine } from '../model/MixingMachine.js';
import { MixingMachineStore } from '../model/MixingMachineStore.js';
import { MixingMachineView } from '../view/MixingMachineView.js';
import { MIXING_MACHINE_STATUS } from '../constants.js';
import { fetchData as fetchWeatherData } from '../services/weatherAPI.js'; // Import weather API

export class MixingMachineController {
    constructor(potStore) {
        this.mixingMachineStore = new MixingMachineStore();
        this.view = new MixingMachineView('mixing-machine', 'mix-result');
        this.potStore = potStore;
        this.locationInputElement = document.getElementById('location-input'); // Get location input element

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

    async handleStartMix(machineId) { // Made async to await weather data
        const machine = this.mixingMachineStore.getMachineById(machineId);

        if (!machine.inputPot) {
            alert("Voeg eerst een pot toe aan de machine voordat je start met mixen.");
            return;
        }

        const currentCity = this.locationInputElement ? this.locationInputElement.value.trim() : null;
        let weatherData = null;
        let weatherAlerts = [];

        if (currentCity) {
            weatherData = await fetchWeatherData(currentCity); // Await the weather data
        }

        const originalMixTime = machine.mixTimeSetting; // Store original time
        let adjustedMixTime = originalMixTime;
        let timeAdjustmentFactor = 1.0;

        if (weatherData && weatherData.current && 
            typeof weatherData.current.temperature_2m !== 'undefined' && 
            typeof weatherData.current.precipitation !== 'undefined') {
            
            const temp = weatherData.current.temperature_2m;
            const precipitationAmount = weatherData.current.precipitation;

            // Rule: Als het neerslag is (precipitation > 0) 10% meer mengtijd.
            if (precipitationAmount > 0) {
                timeAdjustmentFactor += 0.10;
                weatherAlerts.push(`Neerslag (${precipitationAmount}mm) gedetecteerd: mengtijd +10%.`);
                console.log(`Weather: Precipitation detected (${precipitationAmount}mm), increasing mix time by 10%.`);
            }

            // Rule: Onder de 10 graden 15% langer mengen.
            if (temp < 10) {
                timeAdjustmentFactor += 0.15; // Additive with precipitation rule
                weatherAlerts.push(`Temperatuur (${temp}°C) is onder 10°C: mengtijd +15%.`);
                console.log(`Weather: Temperature ${temp}°C (<10°C), increasing mix time by 15%.`);
            }
            
            adjustedMixTime = Math.round(originalMixTime * timeAdjustmentFactor);

            // Rule: Als het boven de 35 graden mag er maximaal 1 mengmachine draaien.
            if (temp > 35) {
                console.log(`Weather: Temperature ${temp}°C (>35°C), checking active machines.`);
                const activeMixingMachines = this.mixingMachineStore.getAllMachines().filter(
                    m => m.id !== machineId && m.status === MIXING_MACHINE_STATUS.MIXING
                ).length;
                
                if (activeMixingMachines >= 1) {
                    alert(`Hoge temperatuur (${temp}°C)! Er draait al een andere mengmachine. Maximaal 1 machine toegestaan boven 35°C. Deze mix wordt niet gestart.`);
                    return; // Prevent starting this mix
                }
                weatherAlerts.push(`Temperatuur (${temp}°C) is boven 35°C: maximaal 1 machine mag tegelijk draaien.`);
            }
            
        } else if (currentCity) {
            // Weather data fetch was attempted but failed or data was incomplete
            weatherAlerts.push(`Kon geen volledige weerdata ophalen voor ${currentCity}. Mengtijd wordt niet aangepast.`);
        }

        if (weatherAlerts.length > 0) {
            alert("Weercondities update:\n" + weatherAlerts.join("\n"));
        }
        
        machine.setMixTime(adjustedMixTime); // Apply adjusted time
        if (adjustedMixTime !== originalMixTime) {
            console.log(`Original mix time: ${originalMixTime}ms, Adjusted mix time for machine ${machineId}: ${adjustedMixTime}ms`);
        }

        this.view.updateMachineStatus(machineId, MIXING_MACHINE_STATUS.MIXING); // Use constant
        machine.startMixing();

        const checkInterval = setInterval(() => {
            if (machine.status === MIXING_MACHINE_STATUS.COMPLETE || machine.status === MIXING_MACHINE_STATUS.IDLE) { // Check IDLE in case mix fails early
                clearInterval(checkInterval);
                const result = machine.getResult();
                this.view.updateMachineStatus(machineId, machine.status, result); // Use constant
                
                if (result && result.message && result.message.startsWith("Mixfout: Machinesnelheid")) {
                    alert(result.message);
                }

                this.view.clearPotsFromMachineView(machineId);
                machine.removePot(); 
                machine.setMixTime(originalMixTime); // IMPORTANT: Reset machine's mix time to its original setting
                console.log(`Mix for machine ${machineId} ended. Mix time setting reset to ${originalMixTime}ms.`);
            }
        }, 100);
    }
}