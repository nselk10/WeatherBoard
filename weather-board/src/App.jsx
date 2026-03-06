// Import necessary React hooks and the WeatherCard component
import { useState, useEffect } from 'react';
import WeatherCard from './WeatherCard';
import './App.css';

// Default list of cities to display initially
const CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.01 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

// Function to fetch weather data for a given city from the Open-Meteo API
async function fetchWeather(city) {
  // Construct the API URL with the city's coordinates and requested weather variables
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,windspeed_10m,relative_humidity_2m`;
  // Fetch the data from the API
  const res = await fetch(url);
  const data = await res.json();
  // Extract the current weather data
  const current = data.current || {};
  // Return the city data merged with the fetched weather information
  return {
    ...city,
    temperature: current.temperature_2m,
    windspeed: current.windspeed_10m,
    relative_humidity: current.relative_humidity_2m,
  };
}

// Main App component
function App() {
  // State for the list of cities, initialized from localStorage or default cities
  const [cities, setCities] = useState(() => {
    const savedCities = localStorage.getItem('weatherCities');
    return savedCities ? JSON.parse(savedCities) : CITIES;
  });
  // State for the weather data of all cities
  const [weather, setWeather] = useState([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for the currently selected city, initialized from localStorage
  const [selected, setSelected] = useState(() => {
    const savedSelected = localStorage.getItem('weatherSelected');
    return savedSelected ? JSON.parse(savedSelected) : null;
  });
  // State for the search query input
  const [searchQuery, setSearchQuery] = useState('');
  // State for the search results from the geocoding API
  const [searchResults, setSearchResults] = useState([]);
  // State for the units system (metric or imperial), initialized from localStorage
  const [units, setUnits] = useState(() => {
    const savedUnits = localStorage.getItem('weatherUnits');
    return savedUnits || 'metric';
  });

  // Conversion functions for temperature and wind speed
  const celsiusToFahrenheit = (c) => (c * 9/5) + 32;
  const kmhToMph = (kmh) => kmh * 0.621371;

  // Function to format temperature based on units
  const formatTemperature = (temp, unit) => {
    if (unit === 'imperial') {
      return `${celsiusToFahrenheit(temp).toFixed(1)}°F`;
    }
    return `${temp}°C`;
  };

  // Function to format wind speed based on units
  const formatWind = (wind, unit) => {
    if (unit === 'imperial') {
      return `${kmhToMph(wind).toFixed(1)} mph`;
    }
    return `${wind} km/h`;
  };

  // Function to search for cities using the geocoding API
  const searchCities = async (query) => {
    // Don't search if query is empty
    if (!query.trim()) return;
    // Construct the geocoding API URL
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
    try {
      // Fetch search results
      const res = await fetch(url);
      const data = await res.json();
      // Update search results state
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Failed to search cities', err);
    }
  };

  // Function to add a city from search results to the cities list
  const addCity = (result) => {
    // Create a new city object from the search result
    const newCity = { name: result.name, lat: result.latitude, lon: result.longitude };
    // Check if the city is not already in the list
    if (!cities.some(city => city.name === newCity.name)) {
      // Add the new city to the list
      setCities([...cities, newCity]);
    }
    // Clear search results and query
    setSearchResults([]);
    setSearchQuery('');
  };

  // Function to clear all stored data and reset to defaults
  const clearStoredData = () => {
    // Remove all weather-related data from localStorage
    localStorage.removeItem('weatherCities');
    localStorage.removeItem('weatherSelected');
    localStorage.removeItem('weatherUnits');
    // Reset states to defaults
    setCities(CITIES);
    setSelected(null);
    setUnits('metric');
  };

  // Effect to save cities to localStorage whenever cities change
  useEffect(() => {
    localStorage.setItem('weatherCities', JSON.stringify(cities));
  }, [cities]);

  // Effect to save selected city to localStorage whenever selected changes
  useEffect(() => {
    if (selected) {
      localStorage.setItem('weatherSelected', JSON.stringify(selected));
    } else {
      localStorage.removeItem('weatherSelected');
    }
  }, [selected]);

  // Effect to save units to localStorage whenever units change
  useEffect(() => {
    localStorage.setItem('weatherUnits', units);
  }, [units]);

  // Effect to fetch weather data whenever cities change
  useEffect(() => {
    setLoading(true);
    // Fetch weather for all cities, handling failures individually
    Promise.allSettled(cities.map(fetchWeather))
      .then(results => {
        const weatherData = results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.error('Failed to fetch weather for', cities[index].name, result.reason);
            // Return city with null weather data if fetch failed
            return {
              ...cities[index],
              temperature: null,
              windspeed: null,
              relative_humidity: null,
            };
          }
        });
        setWeather(weatherData);
        setLoading(false);
        // Update selected city with latest weather data if it exists in current cities
        if (selected) {
          const updatedSelected = weatherData.find(city => city.name === selected.name);
          if (updatedSelected) {
            setSelected(updatedSelected);
          } else {
            setSelected(null);
          }
        }
      });
  }, [cities]);

  // Show loading message while fetching data
  if (loading) return <p>Loading...</p>;

  // Render the main UI
  return (
    <div className="App">
      {/* Search and units controls */}
      <div style={{ marginBottom: '20px' }}>
        {/* Search input and button */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a city..."
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button onClick={() => searchCities(searchQuery)}>Search</button>
        {/* Units toggle button */}
        <button onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')} style={{ marginLeft: '10px' }}>
          Units: {units === 'metric' ? 'Metric (°C, km/h)' : 'Imperial (°F, mph)'}
        </button>
        {/* Clear stored data button */}
        <button onClick={clearStoredData} style={{ marginLeft: '10px', backgroundColor: '#fc7d7d' }}>
          Clear Stored Data
        </button>
        {/* Display search results if any */}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => addCity(result)}
                style={{ cursor: 'pointer', padding: '5px', border: '1px solid #ddd', margin: '2px' }}
              >
                {result.name}, {result.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weather cards for each city */}
      {weather.map(city => (
        <WeatherCard key={city.name} city={city} onClick={() => setSelected(city)} units={units} />
      ))}

      {/* Detailed view for selected city */}
      {selected && (
        <div>
          <h2>Details: {selected.name}</h2>
          <p>Temperature: {selected.temperature !== null ? formatTemperature(selected.temperature, units) : 'N/A'}</p>
          <p>Wind: {selected.windspeed !== null ? formatWind(selected.windspeed, units) : 'N/A'}</p>
          <p>Humidity: {selected.relative_humidity !== null ? `${selected.relative_humidity}%` : 'N/A'}</p>
          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;