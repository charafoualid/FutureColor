import { getTriadicColors } from '../utils/colorUtils.js'; // Import color utility

export class ColorTestController {
    constructor(view, mixedResultsListId) {
        this.view = view;
        this.mixedResultsListId = mixedResultsListId; // ID of the <ul> or <div> in main view

        this.view.setOnGenerateGridCallback(this.handleGenerateGrid.bind(this));
        this.view.setOnDropColorOnCellCallback(this.handleDropColorOnCell.bind(this));
        this.view.setOnCellClickCallback(this.handleCellClick.bind(this)); // Set the new callback
    }

    init() {
        this.view.initializeEventListeners();
        // Optionally generate a default grid
        // this.handleGenerateGrid(this.view.rowsInput.value, this.view.colsInput.value);
    }

    activate() {
        this.view.show();
        this.refreshAvailableColors();
        // Generate a default grid if none exists or based on current input values
        if (!this.view.gridContainerElement.hasChildNodes()) {
             this.handleGenerateGrid(parseInt(this.view.rowsInput.value,10), parseInt(this.view.colsInput.value,10));
        }
    }

    deactivate() {
        this.view.hide();
        // No need to clear grid or available colors here, they persist until user clears or regenerates
    }

    handleGenerateGrid(rows, cols) {
        this.view.renderGrid(rows, cols);
    }

    handleDropColorOnCell(cellElement, color) {
        this.view.fillCell(cellElement, color);
    }

    handleCellClick(colorHex) { // Handler for cell clicks
        if (!colorHex) return; // Do nothing if no color

        try {
            const triadicColorsData = getTriadicColors(colorHex);
            this.view.displayTriadicPopup(colorHex, triadicColorsData);
        } catch (error) {
            console.error("Error generating or displaying triadic colors:", error);
            // Optionally, inform the user if the color is invalid for triadic calculation
        }
    }

    refreshAvailableColors() {
        const mixedResultsList = document.getElementById(this.mixedResultsListId);
        if (mixedResultsList) {
            const colorElements = Array.from(mixedResultsList.children);
            this.view.populateAvailableColors(colorElements);
        }
    }
}
