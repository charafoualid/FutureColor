// main.js
import { IngredientController } from "./controller/IngredientController.js";
import { PotController } from "./controller/PotController.js";
import { IngredientStore } from "./model/IngredientStore.js"; 
import { MixingMachineController } from "./controller/MixingMachineController.js";

window.addEventListener('DOMContentLoaded', () => {

    const ingredientStore = new IngredientStore();

    const ingredientController = new IngredientController(ingredientStore); 
    const potController = new PotController(ingredientStore); 
    
    const potStoreInstance = potController.store;
    const mixingMachineController = new MixingMachineController(potStoreInstance);
    
});