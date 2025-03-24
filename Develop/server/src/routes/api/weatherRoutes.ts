import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // TODO: GET weather data from city name


  const cityName = req.body.cityName;

  const weatherData = await WeatherService.getWeatherForCity(cityName)

  // TODO: save city to search history
  await HistoryService.addCity(cityName)


  res.json(weatherData)

});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {

  const searchHistory = await HistoryService.getCities()


  res.json(searchHistory)
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const targetId = req.params.id;


  await HistoryService.removeCity(targetId);

  res.json({ message: 'City removed from history' });

});

export default router;
