// controller/PotController.js
import { Pot } from "../model/Pot.js";
import { PotStore } from "../model/PotStore.js";
import { PotView } from "../view/PotView.js";
import { IngredientStore } from "../model/IngredientStore.js"; // Importeer IngredientStore voor toegang

export class PotController {
    // Constructor krijgt nu de shared ingredientStore door
    constructor(ingredientStore){
        this.store = new PotStore(); // PotStore blijft uniek voor PotController
        this.view = new PotView('pots-container');
        this.ingredientStore = ingredientStore; // Gebruik de doorgegeven IngredientStore
        // Optioneel: Referentie naar IngredientController als je die nodig hebt voor view updates
        // Echter, IngredientController.removeIngredientFromView is voldoende als publieke methode.
        // this.ingredientController = ingredientController; // Dit is gecompliceerd, beter via main.js of publieke methode

        this.addPotButton = document.getElementById('add-pot-button');
        this.deletePotsButton = document.getElementById('clear-pots-button');

        // Stel de callback in voor de PotView om drops af te handelen
        this.view.setOnDropCallback(this.handleIngredientDrop.bind(this));


        this.addPotButton.addEventListener('click', this.handleAddPotClick.bind(this));
        
        this.deletePotsButton.addEventListener('click', this.handleClearPotsClick.bind(this));
        
    }

    handleAddPotClick() {
        const MAX_POTS = 10; // Voorbeeldlimiet
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

    // NIEUW: Handler voor de drop van een ingrediënt op een pot
    handleIngredientDrop(event, targetPot) {
        const ingredientId = event.dataTransfer.getData('text/plain');
        const droppedMixSpeed = parseInt(event.dataTransfer.getData('text/mixspeed'));

        const ingredient = this.ingredientStore.getById(ingredientId);

        if (!ingredient) {
            console.error("Gesleept ingrediënt niet gevonden in IngredientStore. Dit zou niet moeten gebeuren.");
            return;
        }

        // 1. Validatie: Mengsnelheid
        if (!targetPot.isEmpty() && droppedMixSpeed !== targetPot.getDominantMixSpeed()) {
            alert(`Fout: Dit ingrediënt heeft een mengsnelheid van ${droppedMixSpeed}x, maar deze pot bevat al ingrediënten met ${targetPot.getDominantMixSpeed()}x. Alleen ingrediënten met dezelfde mengsnelheid kunnen worden gemengd.`);
            // Voeg tijdelijke visuele feedback toe voor ongeldige drop
            event.currentTarget.classList.add('invalid-drop');
            setTimeout(() => {
                event.currentTarget.classList.remove('invalid-drop');
            }, 1000); // Verwijder klasse na 1 seconde
            return;
        }

        // 2. Data Update: Voeg ingrediënt toe aan de pot in het model
        targetPot.addIngredient(ingredient);

        // 3. Data Update: Verwijder ingrediënt uit de IngredientStore
        const removedFromSource = this.ingredientStore.removeById(ingredientId);

        // 4. View Update: Verwijder ingrediënt uit de IngredientView
        if (removedFromSource) {
            // We hebben een manier nodig om de IngredientView te vertellen dat een ingrediënt moet verdwijnen.
            // Dit kan via een methode in IngredientController.
            // Omdat IngredientController een singleton is in main.js, kunnen we deze direct aanroepen.
            // Hier moet je *vooraf* in main.js de IngredientController instantie beschikbaar maken.
            // Dit is een van de weinige plaatsen waar controllers indirect met elkaar 'praten'.
            // Voor nu: directe DOM manipulatie, is minder MVC, maar werkt snel.
            // Beter is om dit door de IngredientController te laten doen via een publieke methode.
            const ingredientElementToRemove = document.querySelector(`.ingredient[data-ingredient-id="${ingredientId}"]`);
            if (ingredientElementToRemove) {
                ingredientElementToRemove.remove();
            }
        }

        // 5. View Update: Update de visuele representatie van de pot
        // Bijvoorbeeld: aantal items tonen, of kleur aanpassen op basis van inhoud
        // De PotView moet dit kunnen updaten. Hier doen we een simpele update van de tekst en kleur.
        event.currentTarget.textContent = `Pot ${this.store.pots.indexOf(targetPot) + 1} (${targetPot.getContents().length} items)`;
        if (targetPot.getContents().length === 1) { // Pas kleur aan bij het eerste ingrediënt
             //event.currentTarget.style.backgroundColor = ingredient.color;
             event.currentTarget.classList.add('pot-filled');
        }
        // Je kunt hier ook een kleine 'ingrediënt' representatie toevoegen aan de pot.
        // Dat is complexer en gaan we nu niet doen, want 'simpel' houden.
    }
}