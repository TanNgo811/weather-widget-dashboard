import type {WeatherData, ForecastData, GeoLocation} from '@/types/weather';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_BASE_URL = 'https://api.openweathermap.org/geo/1.0';

export const getCityList = async (city: string, limit?: number): Promise<GeoLocation[]> => {
  try {
    const { data } = await axios.get(`${GEO_API_BASE_URL}/direct`, {
      params: {
        q: `${city},SG`,
        limit: limit ?? 1,
        appid: API_KEY,
      },
    });
    return data;
  
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
};

export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const { data } = await axios.get(`${API_BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
  });
  return data;
};

export const getForecastData = async (lat: number, lon: number): Promise<ForecastData> => {
    const { data } = await axios.get(`${API_BASE_URL}/forecast`, {
        params: {
            lat,
            lon,
            appid: API_KEY,
            units: 'metric',
        },
    });
    return data;
};

export const getWeatherIconUrl = (iconCode: string) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;