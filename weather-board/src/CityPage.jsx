import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Pages.css';

// ── Weather helpers ──────────────────────────────────────────────────────────

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

function getWeatherDesc(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 65) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

// ── API ──────────────────────────────────────────────────────────────────────

async function fetchWeather(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,windspeed_10m,relative_humidity_2m,weathercode`;
  const res = await fetch(url);
  const data = await res.json();
  const current = data.current || {};
  return {
    ...city,
    temperature: current.temperature_2m,
    windspeed: current.windspeed_10m,
    relative_humidity: current.relative_humidity_2m,
    weathercode: current.weathercode,
  };
}

// ── Unit helpers ─────────────────────────────────────────────────────────────

const toF = (c) => (c * 9 / 5) + 32;
const toMph = (kmh) => kmh * 0.621371;

function formatTemp(temp, units) {
  if (units === 'imperial') return `${toF(temp).toFixed(1)}°F`;
  return `${temp}°C`;
}

function formatWind(wind, units) {
  if (units === 'imperial') return `${toMph(wind).toFixed(1)} mph`;
  return `${wind} km/h`;
}

// ── Component ────────────────────────────────────────────────────────────────

function CityPage({ cities, units, onRemoveCity }) {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const city = cities.find(c => c.name === decodeURIComponent(cityName));

  useEffect(() => {
    if (!city) {
      setError('City not found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchWeather(city)
      .then(data => { setWeather(data); setLoading(false); })
      .catch(() => { setError('Failed to load weather data'); setLoading(false); });
  }, [city, cityName]);

  const handleRemove = () => {
    onRemoveCity(city.name);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="city-page">
        <div className="loading-container">
          <div className="spinner" />
          Fetching weather…
        </div>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="city-page">
        <p className="error-message">{error || 'City not found'}</p>
        <button onClick={() => navigate('/')} className="btn-primary">← Back to Home</button>
      </div>
    );
  }

  const icon = getWeatherIcon(weather.weathercode);
  const desc = getWeatherDesc(weather.weathercode);
  const humidity = weather.relative_humidity ?? 0;

  return (
    <div className="city-page">
      <div className="page-header">
        <button onClick={() => navigate('/')} className="btn-home">← Home</button>
      </div>

      <div className="city-detail-card">
        {/* ── Header ── */}
        <div className="city-detail-header">
          <div className="city-weather-icon">{icon}</div>
          <div>
            <h1>{weather.name}</h1>
            <div className="city-weather-desc">{desc}</div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="weather-info">
          <div className="weather-item">
            <span className="label">Temperature</span>
            <span className="value">
              {weather.temperature !== null ? formatTemp(weather.temperature, units) : 'N/A'}
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
            <span className="value">{humidity}%</span>
            <div className="humidity-bar-track">
              <div className="humidity-bar-fill" style={{ width: `${humidity}%` }} />
            </div>
          </div>

          <div className="weather-item">
            <span className="label">Coordinates</span>
            <span className="value" style={{ fontSize: '1rem' }}>
              {weather.lat.toFixed(3)}°, {weather.lon.toFixed(3)}°
            </span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="city-actions">
          <button onClick={handleRemove} className="btn-danger">Remove City</button>
        </div>
      </div>
    </div>
  );
}

export default CityPage;
