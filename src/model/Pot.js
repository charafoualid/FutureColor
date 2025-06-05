export class Pot{
    constructor()
    {
        this.id = crypto.randomUUID();
        this.isEmpty = true;
        this.contents = [];
    }
}