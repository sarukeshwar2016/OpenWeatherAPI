import React, { useState } from 'react';
import axios from 'axios';

const apiKey = 'db089c38f7285399d2a5b864a283ea01'; // Replace this with your OpenWeather API key

const WeatherPage = () => {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [airQuality, setAirQuality] = useState(null);
  const [error, setError] = useState('');

  const fetchWeatherData = async () => {
    try {
      setError('');
      // 1. Get Coordinates
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );
      if (geoRes.data.length === 0) {
        setError('City not found');
        return;
      }
      const { lat, lon } = geoRes.data[0];

      // 2. Get Current Weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );

      // 3. Get Forecast
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );

      // 4. Get Air Pollution
      const airRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );

      setCurrentWeather(weatherRes.data);
      setForecast(forecastRes.data.list.slice(0, 5)); // First 5 forecasts (3-hr intervals)
      setAirQuality(airRes.data.list[0]);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>🌤️ Weather Dashboard</h2>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: '8px', width: '250px', marginRight: '10px' }}
      />
      <button onClick={fetchWeatherData} style={{ padding: '8px' }}>
        Get Weather
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {currentWeather && (
        <div style={{ marginTop: '20px' }}>
          <h3>🌡️ Current Weather in {currentWeather.name}</h3>
          <p>Temperature: {currentWeather.main.temp}°C</p>
          <p>Humidity: {currentWeather.main.humidity}%</p>
          <p>Wind: {currentWeather.wind.speed} m/s</p>
          <p>Condition: {currentWeather.weather[0].description}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📅 3-Hour Forecast (Next 15 hrs)</h3>
          {forecast.map((item, index) => (
            <div key={index}>
              <p>
                {item.dt_txt} - {item.main.temp}°C, {item.weather[0].description}
              </p>
            </div>
          ))}
        </div>
      )}

      {airQuality && (
        <div style={{ marginTop: '20px' }}>
          <h3>🏭 Air Pollution Index (AQI)</h3>
          <p>AQI Level: {airQuality.main.aqi}</p>
          <p>CO: {airQuality.components.co} µg/m³</p>
          <p>NO₂: {airQuality.components.no2} µg/m³</p>
          <p>PM2.5: {airQuality.components.pm2_5} µg/m³</p>
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
