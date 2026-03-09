import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Pages.css';

// Function to fetch weather data for a given city from the Open-Meteo API
async function fetchWeather(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,windspeed_10m,relative_humidity_2m`;
  const res = await fetch(url);
  const data = await res.json();
  const current = data.current || {};
  return {
    ...city,
    temperature: current.temperature_2m,
    windspeed: current.windspeed_10m,
    relative_humidity: current.relative_humidity_2m,
  };
}

function CityPage({ cities, units, onRemoveCity }) {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Find city by name
  const city = cities.find(c => c.name === decodeURIComponent(cityName));

  // Fetch weather data for this city
  useEffect(() => {
    if (!city) {
      setError('City not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchWeather(city)
      .then(weatherData => {
        setWeather(weatherData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch weather', err);
        setError('Failed to load weather data');
        setLoading(false);
      });
  }, [city, cityName]);

  // Handle city removal
  const handleRemoveCity = () => {
    onRemoveCity(city.name);
    navigate('/');
  };

  if (loading) {
    return <div className="city-page"><p>Loading weather data...</p></div>;
  }

  if (error || !city) {
    return (
      <div className="city-page">
        <h1 className="error">{error || 'City not found'}</h1>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="city-page">
      <div className="page-header">
        <button onClick={() => navigate('/')} className="btn-home">
          ← Home
        </button>
      </div>
      
      <div className="city-detail-card">
        <h1>{weather.name}</h1>
        
        <div className="weather-info">
          <div className="weather-item">
            <span className="label">Temperature</span>
            <span className="value">
              {weather.temperature !== null ? formatTemperature(weather.temperature, units) : 'N/A'}
            </span>
          </div>
          
          <div className="weather-item">
            <span className="label">Wind Speed</span>
            <span className="value">
              {weather.windspeed !== null ? formatWind(weather.windspeed, units) : 'N/A'}
            </span>
          </div>
          
          <div className="weather-item">
            <span className="label">Humidity</span>
            <span className="value">
              {weather.relative_humidity !== null ? `${weather.relative_humidity}%` : 'N/A'}
            </span>
          </div>

          <div className="weather-item">
            <span className="label">Coordinates</span>
            <span className="value">
              {weather.lat.toFixed(4)}°, {weather.lon.toFixed(4)}°
            </span>
          </div>
        </div>

        <div className="city-actions">
          <button onClick={handleRemoveCity} className="btn-danger">
            Remove City
          </button>
        </div>
      </div>
    </div>
  );
}

export default CityPage;
