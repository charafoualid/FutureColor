export class Pot{
    constructor()
    {
        this.id = crypto.randomUUID();
        this.contents = [];
        this.dominantMixSpeed = null;
    }

    addIngredient(ingredient) {
        if (this.contents.length === 0) {
            this.dominantMixSpeed = ingredient.mixSpeed; // Stel de mengsnelheid in bij het eerste ingrediënt
        }
        this.contents.push(ingredient);
    }

    getDominantMixSpeed() {
        return this.dominantMixSpeed;
    }

    isEmpty() {
        return this.contents.length === 0;
    }

    getContents() {
        return this.contents;
    }
}