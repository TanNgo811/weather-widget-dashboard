import type {ForecastDailyData, ForecastData, ForecastHourlyData} from "@/types/weather.ts";

export const processDailyForecast = (forecast: ForecastData): ForecastDailyData[] => {
    return forecast.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const existingDay = acc.find(d => d.dayOfWeek === day);
        if (existingDay) {
            existingDay.max_temp = Math.max(existingDay.max_temp || item.main.temp, item.main.temp);
            existingDay.min_temp = Math.min(existingDay.min_temp || item.main.temp, item.main.temp);
            existingDay.humidity = Math.max(existingDay.humidity, item.main.humidity);
            existingDay.condition = item.weather[0].main;
            existingDay.icon = item.weather[0].icon;
        } else {
            // Create new day entry
            acc.push({
              dayOfWeek: day,
              date: date.toLocaleDateString(),
              max_temp: item.main.temp,
              min_temp: item.main.temp,
              humidity: item.main.humidity,
              pressure: item.main.pressure,
              wind_speed: item.wind.speed,
              speed_deg: item.wind.deg,
              condition: item.weather[0].main,
              chanceOfRain: item.pop * 100,
              icon: item.weather[0].icon,
              description: item.weather[0].description, 
              temp: item.main.temp,
              feels_like: item.main.feels_like
            });
        }
      return acc;
    }, [] as ForecastDailyData[]);
}

export const processHourlyForecast = (forecast: ForecastData): ForecastHourlyData[] => {
    return forecast.list.slice(0, 12).map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      wind_speed: item.wind.speed,
      speed_deg: item.wind.deg,
      condition: item.weather[0].main,
      chanceOfRain: item.pop * 100,
      icon: item.weather[0].icon,
      description: item.weather[0].description
    }));
}

export const convertFromDegToNavigation = (deg: number): string => {
    // Convert degrees to a compass direction
    if (deg >= 0 && deg < 22.5) return 'N';
    if (deg >= 22.5 && deg < 67.5) return 'NE';
    if (deg >= 67.5 && deg < 112.5) return 'E';
    if (deg >= 112.5 && deg < 157.5) return 'SE';
    if (deg >= 157.5 && deg < 202.5) return 'S';
    if (deg >= 202.5 && deg < 247.5) return 'SW';
    if (deg >= 247.5 && deg < 292.5) return 'W';
    if (deg >= 292.5 && deg < 337.5) return 'NW';
    if (deg >= 337.5 && deg < 360) return 'N';
    
    return '';
}