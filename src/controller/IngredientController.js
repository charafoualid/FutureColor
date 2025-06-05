import { Ingredient } from "../model/Ingredient.js";
import { IngredientStore } from "../model/IngredientStore.js";
import { IngredientView } from "../view/IngredientView.js";

export class IngredientController{
    constructor(){
        this.store = new IngredientStore();
        this.view = new IngredientView('ingredients-container');
        this.form = document.getElementById('ingredient-form');
        this.deleteIngredientsButton = document.getElementById('clear-ingredients-button');

        this.deleteIngredientsButton.addEventListener('click', this.handleClearIngredientsClick.bind(this));
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
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
        this.store.clear();
        this.view.clear();
    }
}