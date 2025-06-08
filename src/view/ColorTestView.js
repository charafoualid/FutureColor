export class ColorTestView {
    constructor(pageId, controlsId, gridContainerId, availableColorsContainerId) {
        this.pageElement = document.getElementById(pageId);
        this.controlsElement = document.getElementById(controlsId);
        this.gridContainerElement = document.getElementById(gridContainerId);
        this.availableColorsContainerElement = document.getElementById(availableColorsContainerId);

        this.rowsInput = document.getElementById('grid-rows');
        this.colsInput = document.getElementById('grid-cols');
        this.generateButton = document.getElementById('generate-grid-button');
        this.clearGridButton = document.getElementById('clear-grid-button');

        this.onGenerateGridCallback = null;
        this.onDropColorOnCellCallback = null;
    }

    setOnGenerateGridCallback(callback) {
        this.onGenerateGridCallback = callback;
    }

    setOnDropColorOnCellCallback(callback) {
        this.onDropColorOnCellCallback = callback;
    }

    initializeEventListeners() {
        this.generateButton.addEventListener('click', () => {
            if (this.onGenerateGridCallback) {
                const rows = parseInt(this.rowsInput.value, 10);
                const cols = parseInt(this.colsInput.value, 10);
                if (rows > 0 && cols > 0) {
                    this.onGenerateGridCallback(rows, cols);
                } else {
                    alert("Voer geldige getallen in voor rijen en kolommen.");
                }
            }
        });

        this.clearGridButton.addEventListener('click', () => {
            this.clearGridHighlightsAndColors();
        });
    }

    renderGrid(rows, cols) {
        this.gridContainerElement.innerHTML = ''; // Clear previous grid
        this.gridContainerElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.gridContainerElement.style.gridTemplateRows = `repeat(${rows}, auto)`;


        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement('div');
            cell.classList.add('color-test-cell');
            cell.setAttribute('data-cell-id', i);

            cell.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                cell.classList.add('drag-over-cell');
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drag-over-cell');
            });

            cell.addEventListener('drop', (event) => {
                event.preventDefault();
                cell.classList.remove('drag-over-cell');
                const color = event.dataTransfer.getData('text/color');
                if (color && this.onDropColorOnCellCallback) {
                    this.onDropColorOnCellCallback(cell, color);
                }
            });
            this.gridContainerElement.appendChild(cell);
        }
    }

    fillCell(cellElement, color) {
        cellElement.style.backgroundColor = color;
        cellElement.textContent = ''; // Clear any placeholder text
    }
    
    clearGridHighlightsAndColors() {
        const cells = this.gridContainerElement.querySelectorAll('.color-test-cell');
        cells.forEach(cell => {
            cell.style.backgroundColor = '#e0e0e0'; // Reset to default background
            cell.classList.remove('drag-over-cell');
        });
    }

    populateAvailableColors(mixedColorElements) {
        this.availableColorsContainerElement.innerHTML = ''; // Clear previous
        mixedColorElements.forEach(originalElement => {
            if (originalElement.dataset.isMixedResult === 'true') {
                const clone = originalElement.cloneNode(true); // Deep clone
                clone.style.cursor = 'grab'; // Ensure grab cursor
                
                // Re-attach dragstart for the cloned element as event listeners are not cloned by default for safety.
                clone.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/color', clone.dataset.color);
                    event.dataTransfer.setData('text/plain', clone.textContent);
                    event.dataTransfer.effectAllowed = 'copy'; // Use copy for test grid
                });
                this.availableColorsContainerElement.appendChild(clone);
            }
        });
    }

    clearAvailableColors() {
        this.availableColorsContainerElement.innerHTML = '';
    }

    show() {
        this.pageElement.style.display = 'flex'; // Or 'block', depending on desired layout
    }

    hide() {
        this.pageElement.style.display = 'none';
    }
}
