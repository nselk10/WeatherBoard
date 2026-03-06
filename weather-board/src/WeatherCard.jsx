// WeatherCard component: Displays weather information for a single city in a card format
function WeatherCard ({ city, onClick, units }) {
    // Conversion functions for temperature and wind speed units
    const celsiusToFahrenheit = (c) => (c * 9/5) + 32;
    const kmhToMph = (kmh) => kmh * 0.621371;

    // Function to format temperature display based on selected units
    const formatTemperature = (temp, unit) => {
        if (unit === 'imperial') {
            return `${celsiusToFahrenheit(temp).toFixed(1)}°F`;
        }
        return `${temp}°C`;
    };

    // Function to format wind speed display based on selected units
    const formatWind = (wind, unit) => {
        if (unit === 'imperial') {
            return `${kmhToMph(wind).toFixed(1)} mph`;
        }
        return `${wind} km/h`;
    };

    // Render the weather card with clickable area
    return (
        <div onClick={onClick} style = {{ cursor: 'pointer',border: '1px solid #ccc', padding: 16, margin: 8}}>
            {/* City name as header */}
            <h2>{city.name}</h2>
            {/* Display temperature with unit conversion */}
            <p>Temperature: {city.temperature !== null ? formatTemperature(city.temperature, units) : 'N/A'}</p>
            {/* Display wind speed with unit conversion */}
            <p>Wind: {city.windspeed !== null ? formatWind(city.windspeed, units) : 'N/A'}</p>
            {/* Display humidity (no unit conversion needed) */}
            <p>Humidity: {city.relative_humidity !== null ? `${city.relative_humidity}%` : 'N/A'}</p>
        </div>
    );
}

// Export the component for use in other files
export default WeatherCard;