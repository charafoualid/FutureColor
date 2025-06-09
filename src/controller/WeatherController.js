import { fetchData as fetchWeatherData } from "../services/weatherAPI.js";

export class WeatherController {
    constructor() {
        this.locationForm = document.getElementById('locator-form');
        this.locationInput = document.getElementById('location-input');

        if (this.locationForm && this.locationInput) {
            this.locationForm.addEventListener('submit', this.handleLocationSubmit.bind(this));
        }
    }

    async handleLocationSubmit(event) {
        event.preventDefault();
        const cityName = this.locationInput.value.toLowerCase().trim();
        if (cityName) {
            await fetchWeatherData(cityName);
        } else {
            alert("Voer een stadsnaam in om te zoeken.");
        }
    }
}
