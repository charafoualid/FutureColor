import { Ingredient } from "../model/Ingredient.js";
import { IngredientStore } from "../model/IngredientStore.js";
import { IngredientView } from "../view/IngredientView.js";

export class IngredientController{
    constructor(){
        this.store = new IngredientStore();
        this.view = new IngredientView('ingredients-container');
        this.form = document.getElementById('ingredient-form');

        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    handleFormSubmit(event)
    {
        event.preventDefault();

        const formData = new FormData(this.form);

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
}