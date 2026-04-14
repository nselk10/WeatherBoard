import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  return '—';
}

// ── CityCard — fetches live temperature ─────────────────────────────────────

function CityCard({ city, units }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weathercode`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const current = data.current || {};
        setWeather({ temp: current.temperature_2m, code: current.weathercode });
      })
      .catch(() => {});
  }, [city]);

  const displayTemp = weather
    ? units === 'imperial'
      ? `${((weather.temp * 9 / 5) + 32).toFixed(1)}°F`
      : `${weather.temp}°C`
    : null;

  return (
    <Link to={`/city/${encodeURIComponent(city.name)}`} className="city-link-card">
      <div className="city-card-icon">
        {weather ? getWeatherIcon(weather.code) : '🌡️'}
      </div>
      <h3>{city.name}</h3>
      {displayTemp
        ? <div className="city-card-temp">{displayTemp}</div>
        : <div className="city-card-temp city-card-loading">Loading…</div>
      }
      <p>{weather ? getWeatherDesc(weather.code) : 'Fetching weather'}</p>
    </Link>
  );
}

// ── HomePage ─────────────────────────────────────────────────────────────────

function HomePage({ cities, onAddCity, units, onUnitsChange, onResetCities }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchCities = async (query) => {
    if (!query.trim()) return;
    setSearching(true);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchCities(searchQuery);
  };

  const handleAddCity = (result) => {
    onAddCity({ name: result.name, lat: result.latitude, lon: result.longitude });
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="homepage">
      {/* ── Header ── */}
      <div className="header">
        <h1>Weather<span>Board</span></h1>

        <div className="controls">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city…"
            className="search-input"
          />
          <button onClick={() => searchCities(searchQuery)} className="btn-primary" disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </button>
          <button
            onClick={() => onUnitsChange(units === 'metric' ? 'imperial' : 'metric')}
            className="btn-secondary"
          >
            {units === 'metric' ? '°C / km·h' : '°F / mph'}
          </button>
          <button onClick={onResetCities} className="btn-danger">
            Reset
          </button>
        </div>

        {/* ── Search Results ── */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Results</h3>
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.name}-${result.latitude}-${result.longitude}-${index}`}
                  onClick={() => handleAddCity(result)}
                  className="result-item"
                >
                  <strong>{result.name}</strong>
                  {result.admin1 && <span>{result.admin1}</span>}
                  {result.country && <span>{result.country}</span>}
                  <span className="add-badge">+ Add</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Cities Grid ── */}
      <div className="cities-list">
        <h2>Your Cities</h2>
        {cities.length === 0 ? (
          <p className="no-cities">No cities added yet. Search for a city above!</p>
        ) : (
          <div className="cities-grid">
            {cities.map(city => (
              <CityCard key={city.name} city={city} units={units} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
