import { Router, type Request, type Response } from 'express';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const router = Router();
const HISTORY_FILE = path.join(__dirname, '../../../db/db.json');
const WEATHER_API_KEY = '843fa40ad68a96668befb0da86d9b44b'; // Replace with your OpenWeatherMap API key

type cityData = {
  city: string,
  id: string
}

// POST Request to retrieve weather data and save to history
router.post('/', async (req: Request, res: Response) => {
  const { city } = req.body;
  if (!city) return res.status(400).json({ error: 'City name is required' });

  try {
    // Fetch weather data from OpenWeather API
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );

    const weatherData = weatherResponse.data;

    // Read existing search history
    let history = []
      const fileData = await fs.readFile(HISTORY_FILE, 'utf-8');
      history = JSON.parse(fileData);
    
    // Create new entry
    const newEntry = {
      id: uuidv4(),
      city,
    };

    // Avoid duplicate entries
    if (!history.some((entry:cityData) => entry.city.toLowerCase() === city.toLowerCase())) {
      history.push(newEntry);
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    }

   return res.json({ weather: weatherData, history });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET Search History
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const fileData = await fs.readFile(HISTORY_FILE, 'utf-8');
    const history = JSON.parse(fileData);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load search history' });
  }
});

// DELETE a city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const fileData = await fs.readFile(HISTORY_FILE, 'utf-8');
    let history = JSON.parse(fileData);

    // Filter out the city with matching ID
    history = history.filter((entry:cityData) => entry.id !== id);

    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));

    res.json({ message: 'City removed from history', history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

export default router;
