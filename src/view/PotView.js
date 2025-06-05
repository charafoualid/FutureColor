export class PotView {
    constructor(containerId)
    {
        this.container = document.getElementById(containerId);
    }

    renderPot(pot){
        const div = document.createElement('div');
        div.classList.add('pot');
        div.setAttribute('data-pot-id', pot.id);
        div.textContent = `Pot ${this.container.children.length + 1}`;
        this.container.appendChild(div);
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