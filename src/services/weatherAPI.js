export async function fetchData(cityName) {
    // Check if city name is provided
    if (!cityName) {
        console.error("City name is required.");
        alert("Voer een stadsnaam in.");
        return null;
    }

    try {
        // Build geocoding API URL to get latitude and longitude for the city
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&format=json&language=nl`;
        const geoResponse = await fetch(geocodingUrl);

        // Check if geocoding API call was successful
        if (!geoResponse.ok) {
            throw new Error(`Geocoding HTTP error! status: ${geoResponse.status}`);
        }

        const geoData = await geoResponse.json();

        // Check if any results were found for the city
        if (!geoData.results || geoData.results.length === 0) {
            alert(`Kon de locatie niet vinden voor: ${cityName}`);
            console.error("No results found for city:", cityName);
            return null;
        }

        // Extract latitude, longitude, and city name from the first result
        const {latitude, longitude, name: foundCityName} = geoData.results[0];

        // Build weather API URL using the obtained coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error(`Weather API HTTP error! status: ${weatherResponse.status}`);
        }

        const weatherData = await weatherResponse.json();

        console.log("Weather data for", foundCityName, ":", weatherData);

        if (!weatherData.current) {
            
            // Show alert if no temperature data is available
            alert(`Geen temperatuurgegevens beschikbaar voor ${foundCityName}.`);
        }

        return weatherData;

    } catch (error) {

        console.error("Could not fetch weather data:", error);
        alert(`Fout bij het ophalen van weergegevens voor ${cityName}. Probeer het later opnieuw.`);
        return null;

    }
}