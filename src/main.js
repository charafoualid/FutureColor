// main.js
import { IngredientController } from "./controller/IngredientController.js";
import { PotController } from "./controller/PotController.js";
import { IngredientStore } from "./model/IngredientStore.js"; 
import { MixingMachineController } from "./controller/MixingMachineController.js";
import { fetchData as fetchWeatherData } from "./services/weatherAPI.js";

window.addEventListener('DOMContentLoaded', () => {

    const ingredientStore = new IngredientStore();

    const ingredientController = new IngredientController(ingredientStore); 
    const potController = new PotController(ingredientStore); 
    
    const potStoreInstance = potController.store;
    const mixingMachineController = new MixingMachineController(potStoreInstance);

    const locationForm = document.getElementById('locator-form');
    const locationInput = document.getElementById('location-input');

    if (locationForm && locationInput) {
        locationForm.addEventListener('submit', async (event) => {

            event.preventDefault();

            const cityName = locationInput.value.toLowerCase().trim();
            if (cityName) {
                await fetchWeatherData(cityName);
            } else {
                alert("Voer een stadsnaam in om te zoeken.");
            }

        });
    }
});