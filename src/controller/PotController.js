import { Pot } from "../model/Pot.js";
import { PotStore } from "../model/PotStore.js";
import { PotView } from "../view/PotView.js";

export class PotController {
    constructor(){
        this.store = new PotStore();
        this.view = new PotView('pots-container');
        this.addPotButton = document.getElementById('add-pot-button');

        this.addPotButton.addEventListener('click', this.handleAddPotClick.bind(this));
    }

    handleAddPotClick()
    {
        const newPot = new Pot();
        this.store.add(newPot);
        this.view.renderPot(newPot);
    }
}