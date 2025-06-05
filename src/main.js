import { IngredientController } from "./controller/IngredientController.js";
import { PotController } from "./controller/PotController.js";

window.addEventListener('DOMContentLoaded', () => {
    new IngredientController();
    new PotController();
});