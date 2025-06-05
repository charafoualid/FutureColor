export class PotView {
    constructor(containerId)
    {
        this.container = document.getElementById(containerId);
        this.onDropCallBack = null;
    }

    setOnDropCallback(callback) {
        this.onDropCallback = callback;
    }

    renderPot(pot){
        const div = document.createElement('div');
        div.classList.add('pot');
        div.setAttribute('data-pot-id', pot.id);
        div.textContent = `Pot ${this.container.children.length + 1}`;

        div.addEventListener('dragover', (event) => this.handleDragOver(event, pot));
        div.addEventListener('dragleave', (event) => this.handleDragLeave(event, pot));
        div.addEventListener('drop', (event) => this.handleDrop(event, pot));

        this.container.appendChild(div);
    }

    handleDragOver(event, pot) {
        event.preventDefault(); // CRUCIAAL: Laat drop toe
        event.currentTarget.classList.add('drag-over'); // Visuele feedback
    }

    handleDragLeave(event, pot) {
        event.currentTarget.classList.remove('drag-over'); // Verwijder feedback
        event.currentTarget.classList.remove('invalid-drop'); // Zorg dat deze ook weg is
    }

    handleDrop(event, pot) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over'); // Verwijder feedback

        // Roep de callback naar de controller aan
        if (this.onDropCallback) {
            this.onDropCallback(event, pot); // Geef event en pot-data door
        }
    }

    clear()
    {
        this.container.innerHTML = ' ';
    }

    renderAllPots(pots){
        this.clear();
        pots.forEach(pot => this.renderPot(pot));
    }
}