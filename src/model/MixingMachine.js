import { Pot } from './Pot.js';
import { MIXING_MACHINE_STATUS } from '../constants.js';
import { hexToRgb, rgbToHex } from '../utils/colorUtils.js';

export class MixingMachine {
    constructor(name = 'New Machine') {
        this.id = crypto.randomUUID();
        this.name = name;
        this.mixSpeedSetting = 1;
        this.mixTimeSetting = 1000; // Default mix time in milliseconds
        this.inputPot = null;
        this.status = MIXING_MACHINE_STATUS.IDLE;
        this.mixResult = null;
    }

    /**
     * Sets the mixing speed for this machine.
     */
    setMixSpeed(speed) {
        if (typeof speed === 'number' && speed > 0) {
            this.mixSpeedSetting = speed;
        } else {
            console.error("Invalid mix speed provided.");
        }
    }

    /**
     * Sets the mixing time for this machine.
     */
    setMixTime(time) {
        if (typeof time === 'number' && time > 0) {
            this.mixTimeSetting = time;
        } else {
            console.error("Invalid mix time provided.");
        }
    }

    /**
     * Adds a pot to the mixing machine.
     * @param {Pot} pot The pot to add.
     * @returns {Pot|null} The pot that was previously in the machine, or null if there wasn't one.
     */
    addPot(pot) {
        let oldPot = null;
        if (pot instanceof Pot) {
            oldPot = this.inputPot;
            this.inputPot = pot;    
            return oldPot;
        } else {
            console.error("Invalid pot object provided to MixingMachine.");
            return null;
        }
    }

    /**
     * Clears all pots from the mixing machine.
     */
    removePot() {
        this.inputPot = null;
        this.mixResult = null;
        this.status = MIXING_MACHINE_STATUS.IDLE;
    }

    /**
     * Initiates the mixing process.
     */
    startMixing() {
        if (!this.inputPot) {
            alert("Kan het mengen niet starten: Geen pot in de machine.");
            return;
        }

        this.status = MIXING_MACHINE_STATUS.MIXING;

        console.log(`Mixing machine ${this.name} (ID: ${this.id}) started mixing with speed ${this.mixSpeedSetting}x for ${this.mixTimeSetting}ms.`);

        const ingredients = this.inputPot.getContents();
        const requiredSpeed = this.inputPot.getDominantMixSpeed();
        let requiredMixTime = null;
        
        if (ingredients.length > 0) {
            requiredMixTime = ingredients[0].mixTime;
            for (let i = 1; i < ingredients.length; i++) {
                if (ingredients[i].mixTime !== requiredMixTime) {
                    alert("Fout: Niet alle ingrediënten in de pot hebben dezelfde mengtijd.");
                    this.status = MIXING_MACHINE_STATUS.IDLE;
                    return;
                }
            }
        }

        if (requiredMixTime !== null && this.mixTimeSetting !== requiredMixTime) {
            alert(`Fout: De mengtijd van de machine (${this.mixTimeSetting} ms) komt niet overeen met de mengtijd van de ingrediënten (${requiredMixTime} ms).`);
            this.status = MIXING_MACHINE_STATUS.IDLE;
            return;
        }

        let mixedColor;
        let message = 'Mixen voltooid!'; // Default success message

        // Check for speed mismatch
        if (requiredSpeed !== null && this.mixSpeedSetting !== requiredSpeed) {
            mixedColor = this.#generateRandomHexColor();
            message = `Mixfout: Machinesnelheid (${this.mixSpeedSetting}) komt niet overeen met de vereiste snelheid (${requiredSpeed}). Willekeurige kleur geproduceerd.`;
        } else {
            // Original mixing logic if speeds match or no specific speed is required (though current pot logic implies a speed if ingredients exist)
            if (ingredients.length === 1) {
                mixedColor = ingredients[0].color;
            } else if (ingredients.length >= 2) {
                let color1 = ingredients[0].color;
                let color2 = ingredients[1].color;
                mixedColor = this.#mixColors(color1, color2);
            } else {
                this.status = MIXING_MACHINE_STATUS.IDLE;
                alert("Kan het mengen niet starten: Pot is leeg na controle.");
                return;
            }
        }

        // Simulate mixing time
        setTimeout(() => {
            this.status = MIXING_MACHINE_STATUS.COMPLETE;
            this.mixResult = { color: mixedColor, message: message };
            console.log(`Mixing machine ${this.name} finished. Result:`, this.mixResult);
        }, this.mixTimeSetting);
    }

    #mixColors(color1, color2) {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);

        const mixedRgb = {
            r: Math.min(255, Math.floor((rgb1.r + rgb2.r) / 2)),
            g: Math.min(255, Math.floor((rgb1.g + rgb2.g) / 2)),
            b: Math.min(255, Math.floor((rgb1.b + rgb2.b) / 2))
        };

        return rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b);
    }

    #generateRandomHexColor() {
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += Math.floor(Math.random() * 16).toString(16);
        }
        return color.toUpperCase();
    }

    getContents() {
        return this.inputPot;
    }

    getResult() {
        return this.mixResult;
    }
}