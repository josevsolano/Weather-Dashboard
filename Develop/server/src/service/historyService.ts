import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Define a City class with name and id properties
class City {
  constructor(public name: string, public id: string = uuidv4()) {}
}

class HistoryService {
  private filePath = './db/db.json';

  // Read from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // Write the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
  }

  // Get cities from the searchHistory.json file and return as an array of City objects
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Add a city to the searchHistory.json file
  async addCity(cityName: string): Promise<City> {
    const cities = await this.read();
    const city = new City(cityName);
    cities.push(city);
    await this.write(cities);
    return city;
  }

  // Remove a city by id from the searchHistory.json file
  async removeCity(id: string): Promise<boolean> {
    let cities = await this.read();
    const initialLength = cities.length;
    cities = cities.filter(city => city.id !== id);

    if (cities.length === initialLength) {
      return false;
    }

    await this.write(cities);
    return true;
  }
}

export default new HistoryService();