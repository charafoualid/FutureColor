// controller/PotController.js
import { Pot } from "../model/Pot.js";
import { PotStore } from "../model/PotStore.js";
import { PotView } from "../view/PotView.js";

export class PotController {
    constructor(ingredientStore){
        this.store = new PotStore(); 
        this.view = new PotView('pots-container');
        this.ingredientStore = ingredientStore; 

        this.addPotButton = document.getElementById('add-pot-button');
        this.deletePotsButton = document.getElementById('clear-pots-button');

        // Stel de callback in voor de PotView om drops af te handelen
        this.view.setOnDropCallback(this.handleIngredientDrop.bind(this));


        this.addPotButton.addEventListener('click', this.handleAddPotClick.bind(this));
        
        this.deletePotsButton.addEventListener('click', this.handleClearPotsClick.bind(this));
        
    }

    handleAddPotClick() {
        const MAX_POTS = 10; 
        if (this.store.pots.length >= MAX_POTS) {
            alert(`Fout: Je kunt niet meer dan ${MAX_POTS} potten aanmaken.`);
            return;
        }

        const newPot = new Pot();
        this.store.add(newPot);
        this.view.renderPot(newPot);
    }

    handleClearPotsClick() {
        if (this.store.isEmpty()) {
            alert('Fout: Er zijn geen potten om te wissen!');
            return;
        }

        this.store.clear();
        this.view.clear();
    }

    handleIngredientDrop(event, targetPot) {
        const ingredientId = event.dataTransfer.getData('text/plain');
        const droppedMixSpeed = parseInt(event.dataTransfer.getData('text/mixspeed'));

        const ingredient = this.ingredientStore.getById(ingredientId);

        if (!ingredient) {
            console.error("Gesleept ingrediënt niet gevonden.");
            return;
        }

        // Kijk eerst of de pot iets heeft, vergelijk daarna als er WEL iets in zit of de mengsnelheden overeenkomen
        if (!targetPot.isEmpty() && droppedMixSpeed !== targetPot.getDominantMixSpeed()) {
            alert(`Fout: Dit ingrediënt heeft een mengsnelheid van ${droppedMixSpeed}x, maar deze pot bevat al ingrediënten met ${targetPot.getDominantMixSpeed()}x. Alleen ingrediënten met dezelfde mengsnelheid kunnen worden gemengd.`);
    
            return;
        }

        // Voeg ingredient aan de pot toe
        targetPot.addIngredient(ingredient);

        // Verwijder de ingredient uit zijn eigen lijst
        const removedFromSource = this.ingredientStore.removeById(ingredientId);

        // Verwijder ingrediënt uit de IngredientView
        if (removedFromSource) {

            const ingredientElementToRemove = document.querySelector(`.ingredient[data-ingredient-id="${ingredientId}"]`);
            if (ingredientElementToRemove) {
                ingredientElementToRemove.remove();
            }
        }

        // Update de pot visueel. Dus met hoeveelheid items en specifieke css klasse
        event.currentTarget.textContent = `Pot ${this.store.pots.indexOf(targetPot) + 1} (${targetPot.getContents().length} items)`;
        if (targetPot.getContents().length === 1) { 
             event.currentTarget.classList.add('pot-filled');
        }
    }
}