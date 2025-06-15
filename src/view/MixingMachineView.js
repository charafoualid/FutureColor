// view/MixingMachineView.js
import { MIXING_MACHINE_STATUS } from '../constants.js';
import { getTriadicColors } from '../utils/colorUtils.js';

export class MixingMachineView {
    constructor(containerId, resultContainerId) {
        this.container = document.getElementById(containerId);
        this.resultContainer = document.getElementById(resultContainerId);
        this.onAddMachineCallback = null;
        this.onStartMixCallback = null;
        this.onSetSpeedCallback = null;
        this.onSetTimeCallback = null;
        this.onAddPotToMachineCallback = null;
        this.onClearMachinesCallback = null; // NIEUW: Callback voor wissen
    }

    // --- Set Callbacks to Controller ---
    setOnAddMachineCallback(callback) {
        this.onAddMachineCallback = callback;
    }

    setOnStartMixCallback(callback) {
        this.onStartMixCallback = callback;
    }

    setOnSetSpeedCallback(callback) {
        this.onSetSpeedCallback = callback;
    }

    setOnSetTimeCallback(callback) {
        this.onSetTimeCallback = callback;
    }

    setOnAddPotToMachineCallback(callback) {
        this.onAddPotToMachineCallback = callback;
    }

    setOnClearMachinesCallback(callback) { // NIEUW: Setter voor de wissen callback
        this.onClearMachinesCallback = callback;
    }

    // --- UI Rendering ---
    renderInitialView() {
        this.container.innerHTML = `
            <div class="container-header">
                <h2>Mengmachines</h2>
                <button type="button" id="add-mixing-machine-button">Nieuwe Machine</button>
                <button type="button" class="clear" id="clear-machines-button">Wissen</button>
            </div>
            <div id="mixing-machines-list">
                </div>
        `;
        this.resultContainer.innerHTML = '<h2>Resultaten</h2><div id="mix-results-list"></div>';

        // Event listener for the "Nieuwe Machine" button.
        document.getElementById('add-mixing-machine-button').addEventListener('click', () => {
            if (this.onAddMachineCallback) {
                this.onAddMachineCallback();
            }
        });

        // Event listener for the "Wissen" (clear) button.
        document.getElementById('clear-machines-button').addEventListener('click', () => {
            if (this.onClearMachinesCallback) { // Gebruik de nieuwe callback
                this.onClearMachinesCallback();
            }
        });
    }

    renderMixingMachine(machine) {
        const machineList = document.getElementById('mixing-machines-list');
        if (!machineList) return;

        const machineDiv = document.createElement('div');
        machineDiv.classList.add('mixing-machine-instance');
        machineDiv.setAttribute('data-machine-id', machine.id);
        machineDiv.innerHTML = `
            <h3>${machine.name} (ID: ${machine.id.substring(0, 8)})</h3>
            <label>Snelheid: 
                <input type="number" class="mix-speed-input" value="${machine.mixSpeedSetting}" min="1" max="10" data-machine-id="${machine.id}">
            </label>
            <label>Tijd (ms): 
                <input type="number" class="mix-time-input" value="${machine.mixTimeSetting}" min="100" step="100" data-machine-id="${machine.id}">
            </label>
            <div class="machine-pots-dropzone" data-machine-id="${machine.id}">
                <p class="dropzone-placeholder">Sleep potten hierheen</p>
            </div>
            <button class="start-mix-button" data-machine-id="${machine.id}">Start Mix</button>
            <div class="machine-status">Status: ${machine.status}</div>
            <div class="machine-result"></div>
        `;

        machineDiv.querySelector('.start-mix-button').addEventListener('click', () => {
            if (this.onStartMixCallback) {
                this.onStartMixCallback(machine.id);
            }
        });

        machineDiv.querySelector('.mix-speed-input').addEventListener('change', (e) => {
            if (this.onSetSpeedCallback) {
                this.onSetSpeedCallback(machine.id, parseInt(e.target.value));
            }
        });

        machineDiv.querySelector('.mix-time-input').addEventListener('change', (e) => {
            if (this.onSetTimeCallback) {
                this.onSetTimeCallback(machine.id, parseInt(e.target.value));
            }
        });

        const dropzone = machineDiv.querySelector('.machine-pots-dropzone');
        dropzone.addEventListener('dragover', (event) => this.handleDragOver(event));
        dropzone.addEventListener('dragleave', (event) => this.handleDragLeave(event));
        dropzone.addEventListener('drop', (event) => this.handleDropPotOnMachine(event, machine.id));

        machineList.appendChild(machineDiv);
    }

    updateMachineStatus(machineId, status, result = null) {
        const machineDiv = this.container.querySelector(`.mixing-machine-instance[data-machine-id="${machineId}"]`);
        if (machineDiv) {
            machineDiv.querySelector('.machine-status').textContent = `Status: ${status}`;
            const resultDiv = machineDiv.querySelector('.machine-result');
            resultDiv.innerHTML = '';

            if (status === MIXING_MACHINE_STATUS.MIXING) {
                machineDiv.classList.add('mixing');
                resultDiv.innerHTML = `<div class="mixing-spinner" title="Bezig met mengen..."></div>
                    <div style="margin-top:8px;font-size:0.95em;color:#007bff;">Mengen...</div>`;
            } else {
                machineDiv.classList.remove('mixing');
            }

            if (status === MIXING_MACHINE_STATUS.COMPLETE && result) {
                this.renderMixResult(machineId, result);
            }
        }
    }

    renderMixResult(machineId, result) {
        const resultsList = document.getElementById('mix-results-list');
        if (!resultsList) return;

        // Controleer of er al een resultaat voor deze machine bestaat en verwijder het
        const existingResult = resultsList.querySelector(`.mixed-result[data-machine-id="${machineId}"]`);
        if (existingResult) {
            existingResult.remove();
        }

        const colorSwatch = document.createElement('div');
        colorSwatch.classList.add('ingredient', 'mixed-result'); // Voeg 'mixed-result' toe voor identificatie
        colorSwatch.setAttribute('data-machine-id', machineId); // Koppel resultaat aan machine ID
        colorSwatch.style.backgroundColor = result.color;
        colorSwatch.textContent = result.color; 
        colorSwatch.title = `Gemengd door machine ${machineId.substring(0,8)}. Bericht: ${result.message}`; 

        colorSwatch.draggable = true;
        const uniquePotId = `mixed-${machineId}-${Date.now()}`;
        colorSwatch.setAttribute('data-pot-id', uniquePotId); 
        colorSwatch.setAttribute('data-color', result.color);
        colorSwatch.setAttribute('data-is-mixed-result', 'true');
        
        colorSwatch.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', colorSwatch.textContent); 
            event.dataTransfer.setData('text/color', result.color);
            event.dataTransfer.effectAllowed = 'move';
            event.target.classList.add('dragging-pot');
        });
        colorSwatch.addEventListener('dragend', (event) => {
            event.target.classList.remove('dragging-pot');
        });

        colorSwatch.addEventListener('click', () => {
            const baseColorHex = result.color;
            const triadicColorsData = getTriadicColors(baseColorHex);
            this.displayTriadicPopup(baseColorHex, triadicColorsData);
        });

        resultsList.appendChild(colorSwatch);
    }

    displayTriadicPopup(originalColorHex, triadicColorsData) {
        const existingPopup = document.getElementById('triadic-popup-dynamic');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'triadic-popup-dynamic';
        popupOverlay.classList.add('triadic-popup-overlay');

        const popupContent = document.createElement('div');
        popupContent.classList.add('triadic-popup-content');

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
            <button id="close-triadic-popup">Sluiten</button>
        `;

        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);

        const closeButton = popupContent.querySelector('#close-triadic-popup');
        closeButton.addEventListener('click', () => {
            popupOverlay.remove();
        });

        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.remove();
            }
        });
    }

    addPotToMachineView(machineId, pot) {
        const machineDiv = this.container.querySelector(`.mixing-machine-instance[data-machine-id="${machineId}"]`);
        if (machineDiv) {
            const dropzone = machineDiv.querySelector('.machine-pots-dropzone');
            dropzone.innerHTML = '';

            const potElement = document.createElement('div');
            potElement.classList.add('pot'); 

            let potText = `Pot (${pot.id.substring(0, 4)})`;
            if (!pot.isEmpty()) {
                potElement.classList.add('pot-filled'); 
                potText += ` (${pot.getContents().length} items)`;
            } else {
                potText += " (Leeg)";
            }
            potElement.textContent = potText;

            dropzone.appendChild(potElement);
        }
    }

    clearPotsFromMachineView(machineId) {
        const machineDiv = this.container.querySelector(`.mixing-machine-instance[data-machine-id="${machineId}"]`);
        if (machineDiv) {
            const dropzone = machineDiv.querySelector('.machine-pots-dropzone');
            dropzone.innerHTML = '<p class="dropzone-placeholder">Sleep potten hierheen</p>';
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over-machine');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over-machine');
    }

    handleDropPotOnMachine(event, machineId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over-machine');
        const potId = event.dataTransfer.getData('text/pot-id');

        if (potId && this.onAddPotToMachineCallback) {
            this.onAddPotToMachineCallback(machineId, potId);
        }
    }

    // Aangepaste clearAllMachinesView om de machines zelf te wissen
    clearAllMachinesView() {
        const machineList = document.getElementById('mixing-machines-list');
        if (machineList) {
            machineList.innerHTML = '';
        }
        // Let op: we roepen clearResultsView apart aan in de controller bij halwisseling
        // of als alle machines van een hal gewist worden.
    }

    // Nieuwe methode om alleen de resultaten te wissen
    clearResultsView() {
        const resultsList = document.getElementById('mix-results-list');
        if (resultsList) {
            resultsList.innerHTML = '';
        }
    }
}