import { Ingredient } from "../model/Ingredient.js";
import { IngredientView } from "../view/IngredientView.js";

export class IngredientController{
    constructor(ingredientStore){
        this.store = ingredientStore;
        this.view = new IngredientView('ingredients-container');
        this.form = document.getElementById('ingredient-form');
        this.deleteIngredientsButton = document.getElementById('clear-ingredients-button');
        this.ingredientsContainer = document.getElementById('ingredients-container');

        this.deleteIngredientsButton.addEventListener('click', this.handleClearIngredientsClick.bind(this));
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));

        this.ingredientsContainer.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.ingredientsContainer.addEventListener('dragend', this.handleDragEnd.bind(this));
    }  

    // Als het slepen begint, activeert deze methode (EventListener dragstart dus)
    handleDragStart(event) {
        // Check of het daadwerkelijk een ingredient is
        if (event.target.classList.contains('ingredient')) {
            // De dragging klasse toevoegen
            event.target.classList.add('dragging');

            // ID en mengsnelheid van de gesleepte ingredient opslaan
            // Zo kun je informatie ophalen in de drop-zone, essentieel om beperkingen/voordelen te kunnen doen
            event.dataTransfer.setData('text/plain', event.target.dataset.ingredientId);
            event.dataTransfer.setData('text/mixspeed', event.target.dataset.mixSpeed); 

            event.dataTransfer.effectAllowed = 'move';
        }
    }

    // Als het slepen van een element is afgelopen (gedropt of afgebroken)
    handleDragEnd(event) {
        // Verwijder de 'dragging' klasse om de visuele feedback te resetten
        if (event.target.classList.contains('dragging')) {
            event.target.classList.remove('dragging');
        }
    }

    handleFormSubmit(event)
    {
        event.preventDefault();

        const formData = new FormData(this.form);

        const isValid = this.formErrorHandling(formData);

        // Als validatie niet succesvol was, stop
        if(!isValid)
        {
            return;
        }

        const ingredient = new Ingredient({
            mixTime: formData.get('mixTime'),
            mixSpeed: formData.get('mixSpeed'),
            color: formData.get('color'),
            texture: formData.get('texture')
        });

        this.store.add(ingredient);
        this.view.renderIngredient(ingredient);
        this.form.reset();
    }

    formErrorHandling(formData)
    {
        // Invoer
        const mixTime = formData.get('mixTime');
        const mixSpeed = formData.get('mixSpeed');
        const color = formData.get('color');
        const texture = formData.get('texture');

        // Foutafhandeling
        if (!mixTime || !mixSpeed || !color || !texture) {
            alert('Fout: Alle velden zijn verplicht om een ingrediënt aan te maken!');
            return false; 
        }

        // Controleer of de numerieke waarden geldig zijn
        const parsedMixTime = parseInt(mixTime);
        const parsedMixSpeed = parseInt(mixSpeed);

        if (isNaN(parsedMixTime) || parsedMixTime <= 0) {
            alert('Fout: Minimale mengtijd moet een positief getal zijn.');
            return false;
        }

        if (isNaN(parsedMixSpeed) || parsedMixSpeed < 1 || parsedMixSpeed > 10) {
            alert('Fout: Mengsnelheid moet een getal tussen 1 en 10 zijn.');
            return false;
        }

        return true;
    }

    handleClearIngredientsClick()
    {
        if(this.store.isEmpty())
        {
            alert('Fout: Er zijn geen ingredienten om te wissen!');
            return;
        }

        this.store.clear();
        this.view.clear();
    }

    removeIngredientFromView(ingredientId) {
        const ingredientElementToRemove = document.querySelector(`.ingredient[data-ingredient-id="${ingredientId}"]`);
        if (ingredientElementToRemove) {
            ingredientElementToRemove.remove();
        }
    }
}