import { Pot } from './Pot.js';
import { MIXING_MACHINE_STATUS } from '../constants.js';

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
        let mixedColor;

        if (ingredients.length === 1) {
            // If only one ingredient, the result is that ingredient's color.
            mixedColor = ingredients[0].color;
        } else if (ingredients.length >= 2) {
            // If two or more, mix the colors of the first two ingredients.
            let color1 = ingredients[0].color;
            let color2 = ingredients[1].color;
            mixedColor = this.#mixColors(color1, color2);
        } else {
            this.status = MIXING_MACHINE_STATUS.IDLE;
            alert("Kan het mengen niet starten: Pot is leeg na controle.");
            return;
        }

        // Simulate mixing time
        setTimeout(() => {
            this.status = MIXING_MACHINE_STATUS.COMPLETE;
            this.mixResult = { color: mixedColor, message: 'Mixen voltooid!' };
            console.log(`Mixing machine ${this.name} finished. Result:`, this.mixResult);
        }, this.mixTimeSetting);
    }

    #hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return { r, g, b };
    }

    #rgbToHex(r, g, b) {
        return `#` + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    #mixColors(color1, color2) {
        const rgb1 = this.#hexToRgb(color1);
        const rgb2 = this.#hexToRgb(color2);

        const mixedRgb = {
            r: Math.min(255, Math.floor((rgb1.r + rgb2.r) / 2)),
            g: Math.min(255, Math.floor((rgb1.g + rgb2.g) / 2)),
            b: Math.min(255, Math.floor((rgb1.b + rgb2.b) / 2))
        };

        return this.#rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b);
    }

    getContents() {
        return this.inputPot;
    }

    getResult() {
        return this.mixResult;
    }
}