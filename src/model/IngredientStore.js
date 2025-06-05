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

    isEmpty()
    {
        return this.ingredients.length === 0;    
    }

    getById(id) {
        return this.ingredients.find(ingredient => ingredient.id === id);
    }

    removeById(id) {
        const initialLength = this.ingredients.length;
        this.ingredients = this.ingredients.filter(ingredient => ingredient.id !== id);
        return this.ingredients.length < initialLength; // True als element verwijderd is
    }

}