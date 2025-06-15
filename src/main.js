// main.js
import { IngredientController } from "./controller/IngredientController.js";
import { PotController } from "./controller/PotController.js";
import { IngredientStore } from "./model/IngredientStore.js"; 
import { MixingMachineController } from "./controller/MixingMachineController.js";
import { ColorTestView } from "./view/ColorTestView.js";
import { ColorTestController } from "./controller/ColorTestController.js";
import { WeatherController } from "./controller/WeatherController.js";

window.addEventListener('DOMContentLoaded', () => {
    // --- Main Simulator Setup ---
    const ingredientStore = new IngredientStore();
    const ingredientController = new IngredientController(ingredientStore); 
    const potController = new PotController(ingredientStore); 
    const potStoreInstance = potController.store;
    const mixingMachineController = new MixingMachineController(potStoreInstance);
    const weatherController = new WeatherController(); // Instantiated with parentheses

    // --- Hall Selector Setup ---
    // Haal de knoppen direct op, want ze zijn nu altijd in de HTML
    const hallAButton = document.getElementById('hall-a-button');
    const hallBButton = document.getElementById('hall-b-button');

    // Zorg ervoor dat de event listeners alleen worden toegevoegd als de knoppen bestaan
    if (hallAButton && hallBButton) {
        hallAButton.addEventListener('click', () => {
            mixingMachineController.setActiveHall('hall-a');
            hallAButton.classList.add('active-hall');
            hallBButton.classList.remove('active-hall');
        });

        hallBButton.addEventListener('click', () => {
            mixingMachineController.setActiveHall('hall-b');
            hallBButton.classList.add('active-hall');
            hallAButton.classList.remove('active-hall');
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

    navSimulatorButton.addEventListener('click', () => {
        mainSimulatorView.style.display = 'grid';
        colorTestController.deactivate();
        navSimulatorButton.classList.add('active-nav');
        navColorTestButton.classList.remove('active-nav');
    });

    navColorTestButton.addEventListener('click', () => {
        mainSimulatorView.style.display = 'none';
        colorTestController.activate();
        navColorTestButton.classList.add('active-nav');
        navSimulatorButton.classList.remove('active-nav');
    });

    // Initialize default view (Simulator)
    mainSimulatorView.style.display = 'grid';
    colorTestView.hide();
    navSimulatorButton.classList.add('active-nav');
    // Zorg ervoor dat Hal A standaard actief is bij laden
    if (hallAButton) { // Deze check is nu redundant als je zeker weet dat de knoppen bestaan
        hallAButton.classList.add('active-hall');
    }
});