// Import necessary React hooks and components
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import CityPage from './CityPage';
import './App.css';

// Default list of cities to display initially
const DEFAULT_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.01 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

// Main App component
function App() {
  // State for the list of cities, initialized from localStorage or default cities
  const [cities, setCities] = useState(() => {
    const savedCities = localStorage.getItem('weatherCities');
    return savedCities ? JSON.parse(savedCities) : DEFAULT_CITIES;
  });

  // State for the units system (metric or imperial), initialized from localStorage
  const [units, setUnits] = useState(() => {
    const savedUnits = localStorage.getItem('weatherUnits');
    return savedUnits || 'metric';
  });

  // Effect to save cities to localStorage whenever cities change
  useEffect(() => {
    localStorage.setItem('weatherCities', JSON.stringify(cities));
  }, [cities]);

  // Effect to save units to localStorage whenever units change
  useEffect(() => {
    localStorage.setItem('weatherUnits', units);
  }, [units]);

  // Function to add a new city
  const handleAddCity = (newCity) => {
    if (!cities.some(city => city.name === newCity.name)) {
      setCities([...cities, newCity]);
    }
  };

  // Function to remove a city
  const handleRemoveCity = (cityName) => {
    setCities(cities.filter(city => city.name !== cityName));
  };

  // Function to change units
  const handleUnitsChange = (newUnits) => {
    setUnits(newUnits);
  };

  // State for the color theme (light or dark), persisted in localStorage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('weatherTheme');
    return savedTheme || 'light';
  });

  // Effect to save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('weatherTheme', theme);
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Function to clear all stored data and reset to defaults
  const handleClearData = () => {
    console.log('handleClearData called');
    localStorage.removeItem('weatherCities');
    localStorage.removeItem('weatherUnits');
    localStorage.removeItem('weatherTheme');
    console.log('Local storage cleared, setting cities to:', DEFAULT_CITIES);
    setCities(DEFAULT_CITIES);
    setUnits('metric');
    setTheme('light');
    console.log('Reset complete');
  };

  // Return the app with routing
  return (
    <div className={`App app-${theme}`}>
      <div className="theme-switcher">
        <button onClick={toggleTheme} className="btn-secondary">
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
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
        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;