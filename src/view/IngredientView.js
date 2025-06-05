export class IngredientView{
    constructor(containerId)
    {
        this.container = document.getElementById(containerId);
    }

    renderIngredient(ingredient)
    {
        const div = document.createElement('div');
        div.classList.add('ingredient', ingredient.texture);
        div.style.background = ingredient.color;
        div.textContent = `${ingredient.texture}\n${ingredient.mixSpeed}x`;

        div.draggable = true; 
        div.dataset.ingredientId = ingredient.id;
        div.dataset.mixSpeed = ingredient.id;

        this.container.appendChild(div);
    }

    clear()
    {
        this.container.innerHTML = '';
    }
}