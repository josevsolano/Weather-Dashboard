import dotenv from 'dotenv';
import dayjs from 'dayjs';
dotenv.config();

const API_KEY = process.env.API_KEY;

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
interface Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

class WeatherService {
  private baseURL: string = 'https://api.openweathermap.org/data/2.5';

  // Fetch location data from the API
  private async fetchLocationData(city: string): Promise<Coordinates> {
    const geoLocationResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
    const geoLocationData = await geoLocationResponse.json();

    if (!geoLocationData || geoLocationData.length === 0) {
      throw new Error('Location not found');
    }

    return {
      lat: geoLocationData[0].lat,
      lon: geoLocationData[0].lon,
    };
  }

  // Fetch weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const { lat, lon } = coordinates;
    const weatherResponse = await fetch(`${this.baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`);
    if (!weatherResponse.ok) {
      throw new Error('Error fetching weather data');
    }
    return weatherResponse.json();
  }

  // Parse and return current weather data
  private parseCurrentWeather(data: any): Weather {
    return {
      city: data.city.name,
      // date: data.list[0].dt,
      date: dayjs(data.list[0].dt*1000).format('MM/DD/YYYY'),
      icon: data.list[0].weather[0].icon,
      iconDescription: data.list[0].weather[0].description,
      tempF: data.list[0].main.temp,
      windSpeed: data.list[0].wind.speed,
      humidity: data.list[0].main.humidity,
    };
  }

  // Build the 5-day forecast array
  private buildForecastArray(data: any): Weather[] {
    return data.list.filter((_: any, index: number) => index % 8 === 0).map((item: any) => ({
      city: data.city.name,
      // date: item.dt,
      date: dayjs(item.dt*1000).format('MM/DD/YYYY'),
      icon: item.weather[0].icon,
      iconDescription: item.weather[0].description,
      tempF: item.main.temp,
      windSpeed: item.wind.speed,
      humidity: item.main.humidity,
    }));
  }

  // Get weather for a specific city
  async getWeatherForCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);

    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(weatherData);

    return [currentWeather, ...forecast];
  }
}

export default new WeatherService();
