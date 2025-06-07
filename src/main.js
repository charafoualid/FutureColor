// main.js
import { IngredientController } from "./controller/IngredientController.js";
import { PotController } from "./controller/PotController.js";
import { IngredientStore } from "./model/IngredientStore.js"; 
import { MixingMachineController } from "./controller/MixingMachineController.js";

window.addEventListener('DOMContentLoaded', () => {
    // Instantieer de IngredientStore EEN KEER
    const ingredientStore = new IngredientStore(); // Correct met const

    // Instantieer BEIDE controllers, geef de ingredientStore door
    // Gebruik 'const' om de variabelen correct te declareren binnen deze scope
    const ingredientController = new IngredientController(ingredientStore); // Correct met const
    const potController = new PotController(ingredientStore); // Correct met const

    // Get the PotStore instance from the PotController
    // This assumes PotController creates and holds the single PotStore instance.
    // If PotStore were managed globally like IngredientStore, you'd instantiate it here.
    const potStoreInstance = potController.store;

    // Instantieer de MixingMachineController en geef de potStore door
    const mixingMachineController = new MixingMachineController(potStoreInstance);
});