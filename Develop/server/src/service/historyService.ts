import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const HISTORY_FILE = path.join(__dirname, '../../data/searchHistory.json');

// Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = uuidv4(); // Generate a unique ID for each city
    this.name = name;
  }
}

// Define the HistoryService class
class HistoryService {
  // Reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No existing search history, creating new file.');
      return [];
    }
  }

  // Writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(HISTORY_FILE, JSON.stringify(cities, null, 2));
  }

  // Gets all cities from the searchHistory.json file
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Adds a city to the search history
  async addCity(cityName: string): Promise<City[]> {
    const cities = await this.read();
    
    // Check if the city already exists
    if (cities.some((city) => city.name.toLowerCase() === cityName.toLowerCase())) {
      return cities;
    }

    const newCity = new City(cityName);
    cities.push(newCity);
    
    await this.write(cities);
    return cities;
  }

  // Removes a city from the search history
  async removeCity(id: string): Promise<City[]> {
    let cities = await this.read();
    cities = cities.filter((city) => city.id !== id);
    
    await this.write(cities);
    return cities;
  }
}

export default new HistoryService();
