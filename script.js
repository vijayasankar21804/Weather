const apiKey = 'd68039a4ab0ed77d58c4e700ecbcdac8'; // Replace with your OpenWeather API key
let unit = 'metric'; // Default is Celsius
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// DOM Elements
const cityInput = document.getElementById('city');
const searchButton = document.getElementById('search');
const unitToggleButton = document.getElementById('unit-toggle');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const description = document.getElementById('description');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const reportTime = document.getElementById('report-time');
const weatherIcon = document.getElementById('weather-icon');
const forecastList = document.getElementById('forecast-list');
const historyList = document.getElementById('history-list');

// Event Listeners
searchButton.addEventListener('click', fetchWeather);
unitToggleButton.addEventListener('click', toggleUnit);

// Fetch weather for a specific city
async function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  setLoading(true);
  errorMessage.textContent = '';

  try {
    const response = await fetchWeatherData(city);
    const data = await response.json();

    if (data.cod === 404) {
      throw new Error('City not found');
    } else if (data.cod !== 200) {
      throw new Error('Failed to fetch weather data');
    }

    displayWeather(data);
    fetchForecast(city);
    updateSearchHistory(city);

  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    setLoading(false);
  }
}

// Fetch weather data from OpenWeather API
async function fetchWeatherData(city) {
  return await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`);
}

// Display current weather
function displayWeather(data) {
  cityName.textContent = `Weather in ${data.name}`;
  description.textContent = data.weather[0].description;
  temperature.textContent = `Temperature: ${data.main.temp}°${unit === 'metric' ? 'C' : 'F'}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  reportTime.textContent = `Time of report: ${new Date().toLocaleString()}`;
  weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  weatherInfo.style.display = 'block';
}

// Fetch 3-day forecast
async function fetchForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`
    );
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
  }
}

// Display 3-day weather forecast


// Update search history in local storage
function updateSearchHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city);
    if (searchHistory.length > 5) searchHistory.pop(); // Keep only the last 5 searches
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
  }
}

// Display search history in the UI
function displaySearchHistory() {
  historyList.innerHTML = '';
  searchHistory.forEach(city => {
    const historyItem = document.createElement('li');
    historyItem.textContent = city;
    historyItem.addEventListener('click', () => {
      cityInput.value = city;
      fetchWeather();
    });
    historyList.appendChild(historyItem);
  });
}

// Toggle unit between Celsius and Fahrenheit
function toggleUnit() {
  unit = unit === 'metric' ? 'imperial' : 'metric';
  unitToggleButton.textContent = unit === 'metric' ? 'Switch to Fahrenheit' : 'Switch to Celsius';
  if (cityInput.value) {
    fetchWeather();
  }
}

// Show loading state
function setLoading(isLoading) {
  weatherInfo.style.display = isLoading ? 'none' : 'block';
  forecastList.innerHTML = isLoading ? '' : forecastList.innerHTML;
}

window.onload = displaySearchHistory;
