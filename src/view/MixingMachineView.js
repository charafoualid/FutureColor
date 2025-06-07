export class MixingMachineView {
    constructor(containerId, resultContainerId) {
        this.container = document.getElementById(containerId);
        this.resultContainer = document.getElementById(resultContainerId); // For displaying mix results
        this.onAddMachineCallback = null;
        this.onStartMixCallback = null;
        this.onSetSpeedCallback = null;
        this.onSetTimeCallback = null;
        this.onAddPotToMachineCallback = null; // Callback for when a pot is conceptually added
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

    // --- UI Rendering ---
    renderInitialView() {
        this.container.innerHTML = `
            <div class="container-header">
                <h2>Mengmachines</h2>
                <button type="button" id="add-mixing-machine-button">Nieuwe Machine</button>
                <button type="button" class="clear" id="clear-machines-button">Wissen</button>
            </div>
            <div id="mixing-machines-list">
                <!-- Mixing machines will be rendered here -->
            </div>
        `;
        this.resultContainer.innerHTML = '<h2>Resultaten</h2><div id="mix-results-list"></div>';

        // Attach event listener for adding a new machine
        document.getElementById('add-mixing-machine-button').addEventListener('click', () => {
            if (this.onAddMachineCallback) {
                this.onAddMachineCallback();
            }
        });

        // Attach event listener for clearing all machines
        document.getElementById('clear-machines-button').addEventListener('click', () => {
            if (typeof this.clearAllMachinesView === 'function') {
                this.clearAllMachinesView();
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
                <p>Sleep potten hierheen</p>
                <div class="machine-pots-list">
                    <!-- Pots added to this machine will appear here -->
                </div>
            </div>
            <button class="start-mix-button" data-machine-id="${machine.id}">Start Mix</button>
            <div class="machine-status">Status: ${machine.status}</div>
            <div class="machine-result"></div>
        `;

        // Event listeners for controls
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

        // Drag and Drop for pots onto the machine
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
            if (status === 'complete' && result) {
                resultDiv.innerHTML = `Resultaat: <div style="width: 30px; height: 30px; background-color: ${result.color}; border: 1px solid #000;"></div> ${result.message}`;
                // Also add to the global results list
                this.renderMixResult(machineId, result);
            } else {
                resultDiv.innerHTML = '';
            }
        }
    }

    renderMixResult(machineId, result) {
        const resultsList = document.getElementById('mix-results-list');
        if (!resultsList) return;

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('mix-result-item');
        resultDiv.innerHTML = `
            <p>Machine ${machineId.substring(0,8)}: <span style="color:${result.color}; font-weight:bold;">${result.color}</span></p>
        `;
        resultsList.appendChild(resultDiv);
    }

    addPotToMachineView(machineId, pot) {
        const machineDiv = this.container.querySelector(`.mixing-machine-instance[data-machine-id="${machineId}"]`);
        if (machineDiv) {
            const potsList = machineDiv.querySelector('.machine-pots-list');
            const potElement = document.createElement('div');
            potElement.classList.add('pot-in-machine');
            potElement.textContent = `Pot ID: ${pot.id.substring(0,4)} (${pot.getContents().length} ingred.)`;
            // You might want to make this draggable out or removable
            potsList.appendChild(potElement);
        }
    }

    clearPotsFromMachineView(machineId) {
        const machineDiv = this.container.querySelector(`.mixing-machine-instance[data-machine-id="${machineId}"]`);
        if (machineDiv) {
            const potsList = machineDiv.querySelector('.machine-pots-list');
            potsList.innerHTML = ''; // Clear previous pots
        }
    }

    // --- Drag and Drop Handlers for Pots on Machine ---
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

    clearAllMachinesView() {
        const machineList = document.getElementById('mixing-machines-list');
        if (machineList) {
            machineList.innerHTML = '';
        }
        const resultsList = document.getElementById('mix-results-list');
        if(resultsList) {
            resultsList.innerHTML = '';
        }
    }
}