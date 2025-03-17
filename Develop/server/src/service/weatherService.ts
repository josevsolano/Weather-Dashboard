import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const GEO_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Interface for Coordinates
interface Coordinates {
  lat: number;
  lon: number;
}

// Interface for Weather Data
interface Weather {
  date: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  weatherIcon: string;
  description: string;
}

// WeatherService Class
class WeatherService {
  private baseURL = WEATHER_API_URL;
  private apiKey = WEATHER_API_KEY;

  // Fetch location data (latitude, longitude) for a city
  private async fetchLocationData(city: string): Promise<Coordinates | null> {
    try {
      const response = await axios.get(GEO_API_URL, {
        params: {
          q: city,
          limit: 1,
          appid: this.apiKey,
        },
      });

      if (!response.data.length) return null;

      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }

  // Fetch weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          units: 'metric',
          appid: this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  // Parse the current weather data
  private parseCurrentWeather(data: any): Weather {
    return {
      date: new Date(data.dt * 1000).toLocaleDateString(),
      temperature: data.main.temp,
      windSpeed: data.wind.speed,
      humidity: data.main.humidity,
      weatherIcon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      description: data.weather[0].description,
    };
  }

  // Parse the 5-day forecast data
  private buildForecastArray(data: any): Weather[] {
    const forecast: Weather[] = [];

    for (let i = 0; i < data.list.length; i += 8) {
      const entry = data.list[i]; // Taking one entry per day
      forecast.push(this.parseCurrentWeather(entry));
    }

    return forecast;
  }

  // Public method to get weather for a city
  async getWeatherForCity(city: string) {
    const coordinates = await this.fetchLocationData(city);
    if (!coordinates) return { error: 'City not found' };

    const weatherData = await this.fetchWeatherData(coordinates);
    if (!weatherData) return { error: 'Weather data not available' };

    return {
      city,
      currentWeather: this.parseCurrentWeather(weatherData.list[0]),
      forecast: this.buildForecastArray(weatherData),
    };
  }
}

export default new WeatherService();
