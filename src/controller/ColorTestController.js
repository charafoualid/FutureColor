export class ColorTestController {
    constructor(view, mixedResultsListId) {
        this.view = view;
        this.mixedResultsListId = mixedResultsListId; // ID of the <ul> or <div> in main view

        this.view.setOnGenerateGridCallback(this.handleGenerateGrid.bind(this));
        this.view.setOnDropColorOnCellCallback(this.handleDropColorOnCell.bind(this));
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

    refreshAvailableColors() {
        const mixedResultsList = document.getElementById(this.mixedResultsListId);
        if (mixedResultsList) {
            const colorElements = Array.from(mixedResultsList.children);
            this.view.populateAvailableColors(colorElements);
        }
    }
}
