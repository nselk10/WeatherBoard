import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import CityPage from './CityPage';
import './App.css';

const DEFAULT_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.01 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

function App() {
  const [cities, setCities] = useState(() => {
    const saved = localStorage.getItem('weatherCities');
    return saved ? JSON.parse(saved) : DEFAULT_CITIES;
  });

  const [units, setUnits] = useState(() => {
    return localStorage.getItem('weatherUnits') || 'metric';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('weatherTheme') || 'light';
  });

  useEffect(() => { localStorage.setItem('weatherCities', JSON.stringify(cities)); }, [cities]);
  useEffect(() => { localStorage.setItem('weatherUnits', units); }, [units]);
  useEffect(() => { localStorage.setItem('weatherTheme', theme); }, [theme]);

  const handleAddCity = (newCity) => {
    if (!cities.some(city => city.name === newCity.name)) {
      setCities(prev => [...prev, newCity]);
    }
  };

  const handleRemoveCity = (cityName) => {
    setCities(prev => prev.filter(city => city.name !== cityName));
  };

  const handleUnitsChange = (newUnits) => setUnits(newUnits);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleClearData = () => {
    localStorage.removeItem('weatherCities');
    localStorage.removeItem('weatherUnits');
    localStorage.removeItem('weatherTheme');
    setCities(DEFAULT_CITIES);
    setUnits('metric');
    setTheme('light');
  };

  return (
    <div className={`App app-${theme}`}>
      <div className="theme-switcher">
        <button onClick={toggleTheme} className="theme-btn">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                cities={cities}
                onAddCity={handleAddCity}
                units={units}
                onUnitsChange={handleUnitsChange}
                onResetCities={handleClearData}
              />
            }
          />
          <Route
            path="/city/:cityName"
            element={
              <CityPage
                cities={cities}
                units={units}
                onRemoveCity={handleRemoveCity}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
