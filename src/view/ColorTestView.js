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
        this.onCellClickCallback = null; // New callback for cell clicks
    }

    setOnGenerateGridCallback(callback) {
        this.onGenerateGridCallback = callback;
    }

    setOnDropColorOnCellCallback(callback) {
        this.onDropColorOnCellCallback = callback;
    }

    setOnCellClickCallback(callback) { // Setter for the new callback
        this.onCellClickCallback = callback;
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

            cell.addEventListener('click', (event) => { // Add click listener
                const color = event.target.getAttribute('data-color');
                if (color && this.onCellClickCallback) {
                    this.onCellClickCallback(color);
                }
            });

            this.gridContainerElement.appendChild(cell);
        }
    }

    fillCell(cellElement, color) {
        cellElement.style.backgroundColor = color;
        cellElement.setAttribute('data-color', color); // Store color in data attribute
        cellElement.textContent = ''; // Clear any placeholder text
    }
    
    clearGridHighlightsAndColors() {
        const cells = this.gridContainerElement.querySelectorAll('.color-test-cell');
        cells.forEach(cell => {
            cell.style.backgroundColor = '#e0e0e0'; // Reset to default background
            cell.removeAttribute('data-color'); // Remove stored color
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

    displayTriadicPopup(originalColorHex, triadicColorsData) {
        // Remove existing popup if any
        const existingPopup = document.getElementById('triadic-popup-dynamic-testview');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'triadic-popup-dynamic-testview'; // Unique ID for this popup
        popupOverlay.classList.add('triadic-popup-overlay'); // Reuse existing styles if suitable

        const popupContent = document.createElement('div');
        popupContent.classList.add('triadic-popup-content'); // Reuse existing styles if suitable

        popupContent.innerHTML = `
            <h3>
                Triadische kleuren voor ${originalColorHex}
                <span class="original-color-chip" style="background-color: ${originalColorHex};"></span>
            </h3>
            <div class="triadic-colors-display">
                ${triadicColorsData.map(colorData => `
                    <div class="triadic-color-swatch-container">
                        <div class="triadic-popup-swatch" style="background-color: ${colorData.hex};"></div>
                        <div class="triadic-color-info">
                            <p><strong>HEX:</strong> ${colorData.hex}</p>
                            <p><strong>HSL:</strong> ${colorData.hsl.h}°, ${colorData.hsl.s}%, ${colorData.hsl.l}%</p>
                            <p><strong>RGB:</strong> ${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button id="close-triadic-popup-testview">Sluiten</button>
        `;

        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);

        const closeButton = popupContent.querySelector('#close-triadic-popup-testview');
        closeButton.addEventListener('click', () => {
            popupOverlay.remove();
        });

        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) { // Clicked on overlay, not content
                popupOverlay.remove();
            }
        });
    }

    show() {
        this.pageElement.style.display = 'flex'; // Or 'block', depending on desired layout
    }

    hide() {
        this.pageElement.style.display = 'none';
    }
}
