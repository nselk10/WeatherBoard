import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

function HomePage({ cities, onAddCity, units, onUnitsChange, onResetCities }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Function to search for cities using the geocoding API
  const searchCities = async (query) => {
    if (!query.trim()) return;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log('Search response:', data);
      const results = data.results || [];
      console.log('Setting search results:', results);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search cities', err);
    }
  };

  // Function to add a city and clear search
  const handleAddCity = (result) => {
    const newCity = { 
      name: result.name, 
      lat: result.latitude, 
      lon: result.longitude 
    };
    console.log('Adding city:', newCity);
    onAddCity(newCity);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="homepage">
      {/* Header */}
      <div className="header">
        <h1>Weather Board</h1>
        {/* Search and controls */}
        <div className="controls">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a city..."
            className="search-input"
          />
          <button onClick={() => searchCities(searchQuery)} className="btn-primary">
            Search
          </button>
          <button 
            onClick={() => onUnitsChange(units === 'metric' ? 'imperial' : 'metric')} 
            className="btn-secondary"
          >
            Units: {units === 'metric' ? 'Metric (°C, km/h)' : 'Imperial (°F, mph)'}
          </button>
          <button 
            onClick={() => {
              console.log('Reset button clicked');
              onResetCities();
            }} 
            className="btn-danger"
          >
            Reset to Default Cities
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results:</h3>
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

      {/* Cities List */}
      <div className="cities-list">
        <h2>Your Cities</h2>
        {cities.length === 0 ? (
          <p className="no-cities">No cities added yet. Search for a city above!</p>
        ) : (
          <div className="cities-grid">
            {cities.map((city) => (
              <Link 
                key={city.name} 
                to={`/city/${encodeURIComponent(city.name)}`}
                className="city-link-card"
              >
                <h3>{city.name}</h3>
                <p>Click to view details →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
