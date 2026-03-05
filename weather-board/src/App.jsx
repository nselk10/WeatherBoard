import { useState, useEffect } from 'react';

const CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.01 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

async function fetchWeather(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;
  const res = await fetch(url);
  const data = await res.json();
  const current = data.current_weather || {};
  return {
    ...city,
    temperature: current.temperature,
    windspeed: current.windspeed,
    weathercode: current.weathercode,
  };
}

function App() {
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(CITIES.map(fetchWeather))
      .then(results => {
        setWeather(results);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch weather', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {weather.map(city => (
        <div key={city.name}>
          <h2>{city.name}</h2>
          <p>Temperature: {city.temperature ?? 'N/A'}°C</p>
          <p>Wind: {city.windspeed ?? 'N/A'} km/h</p>
        </div>
      ))}
    </div>
  );
}

export default App;