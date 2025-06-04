export class IngredientStore {
    constructor()
    {
        this.ingredients = [];
    }

    add(ingredient)
    {
        this.ingredients.push(ingredient);
    }

    getAll()
    {
        return this.ingredients;
    }
}