export class IngredientStore {
    constructor()
    {
        this.ingredients = [];
    }

    add(ingredient)
    {
        this.ingredients.push(ingredient);
    }

    clear()
    {
        this.ingredients = [];
    }

    getAll()
    {
        return this.ingredients;
    }
}