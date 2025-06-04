export class Ingredient {
    constructor({mixTime, mixSpeed, color, texture})
    {
        this.id = crypto.randomUUID();
        this.mixTime = parseInt(mixTime);
        this.mixSpeed = parseInt(mixSpeed);
        this.color = color;
        this.texture = texture;
    }
}