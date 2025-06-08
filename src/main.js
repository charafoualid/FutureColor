// main.js
import { IngredientController } from "./controller/IngredientController.js";
import { PotController } from "./controller/PotController.js";
import { IngredientStore } from "./model/IngredientStore.js"; 
import { MixingMachineController } from "./controller/MixingMachineController.js";
import { ColorTestView } from "./view/ColorTestView.js";
import { ColorTestController } from "./controller/ColorTestController.js";
import { fetchData as fetchWeatherData } from "./services/weatherAPI.js";

window.addEventListener('DOMContentLoaded', () => {
    // --- Main Simulator Setup ---
    const ingredientStore = new IngredientStore();
    const ingredientController = new IngredientController(ingredientStore); 
    const potController = new PotController(ingredientStore); 
    const potStoreInstance = potController.store;
    const mixingMachineController = new MixingMachineController(potStoreInstance);

    // --- Weather Location Form Setup ---
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

    // --- Color Test Page Setup ---
    const colorTestView = new ColorTestView(
        'color-test-view',
        'color-test-controls',
        'color-test-grid-container',
        'available-colors-container'
    );
    const colorTestController = new ColorTestController(colorTestView, 'mix-results-list');
    colorTestController.init();

    // --- View Navigation Setup ---
    const navSimulatorButton = document.getElementById('nav-simulator');
    const navColorTestButton = document.getElementById('nav-color-test');
    const mainSimulatorView = document.getElementById('main-simulator-view');
    // colorTestView.pageElement is already defined in ColorTestView

    navSimulatorButton.addEventListener('click', () => {
        mainSimulatorView.style.display = 'grid'; // or 'flex' or 'block' as per its original display type
        colorTestController.deactivate(); // Deactivate also hides the view
        navSimulatorButton.classList.add('active-nav');
        navColorTestButton.classList.remove('active-nav');
    });

    navColorTestButton.addEventListener('click', () => {
        mainSimulatorView.style.display = 'none';
        colorTestController.activate(); // Activate also shows the view
        navColorTestButton.classList.add('active-nav');
        navSimulatorButton.classList.remove('active-nav');
    });

    // Initialize default view (Simulator)
    mainSimulatorView.style.display = 'grid';
    colorTestView.hide(); // Ensure it's hidden initially
    navSimulatorButton.classList.add('active-nav');

});