
export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastData {
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    pop: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
      deg: number;
    };
  }[];
}

export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface ForecastDataItem {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  speed_deg: number;
  condition: string;
  chanceOfRain?: number;
  icon: string;
  description: string;
  max_temp?: number;
  min_temp?: number;
}

export interface ForecastDailyData extends ForecastDataItem{
    dayOfWeek: string;
    date: string;
}

export interface ForecastHourlyData extends ForecastDataItem{
    time: string;
    date?: string;
}

export interface SelectedCityItem {
    name: string;
    state?: string;
    country?: string;
    lat: number;
    lon: number;
}

export interface CityWeatherWidgetData extends SelectedCityItem {
  current: ForecastDataItem,
  daily: ForecastDailyData[],
}