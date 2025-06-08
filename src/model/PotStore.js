export class PotStore {
    constructor() {
        this.pots = [];
    }

    add(pot) {
        this.pots.push(pot);
    }

    clear(){
        this.pots = [];
    }

    isEmpty()
    {
        return this.pots.length === 0;    
    }

    getPotById(potId) {
        return this.pots.find(pot => pot.id === potId);
    }
}