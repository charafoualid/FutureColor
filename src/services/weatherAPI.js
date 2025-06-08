export async function fetchData(cityName) {
    if (!cityName) {
        console.error("City name is required.");
        alert("Voer een stadsnaam in.");
        return null;
    }

    try {
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&format=json&language=nl`;
        const geoResponse = await fetch(geocodingUrl);

        if (!geoResponse.ok) {
            throw new Error(`Geocoding HTTP error! status: ${geoResponse.status}`);
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert(`Kon de locatie niet vinden voor: ${cityName}`);
            console.error("No results found for city:", cityName);
            return null;
        }

        const {latitude, longitude, name: foundCityName} = geoData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error(`Weather API HTTP error! status: ${weatherResponse.status}`);
        }

        const weatherData = await weatherResponse.json();

        console.log("Weather data for", foundCityName, ":", weatherData);

        if (weatherData.current) {

            const temperature = weatherData.current.temperature_2m;
            const precipitation = weatherData.current.precipitation !== 0 ? "ja" : "nee";

            alert(`Huidige temperatuur in ${foundCityName}: ${temperature}°C. Neerslag: ${precipitation}`);

        } else {
            alert(`Geen temperatuurgegevens beschikbaar voor ${foundCityName}.`);
        }

        return weatherData;

    } catch (error) {

        console.error("Could not fetch weather data:", error);
        alert(`Fout bij het ophalen van weergegevens voor ${cityName}. Probeer het later opnieuw.`);
        return null;

    }
}