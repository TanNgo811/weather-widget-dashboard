import type {ForecastDailyData, ForecastHourlyData, WeatherData} from "@/types/weather.ts";
import React, {useEffect, useState, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Calendar, CloudRain, Wind} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {convertFromDegToNavigation, processDailyForecast, processHourlyForecast} from "@/utils/helpers.ts";
import {getCityList, getForecastData, getWeatherData, getWeatherIconUrl} from "@/services/weatherService.ts";
import {toast} from "sonner";
import {useAppStore} from "@/app/app.state.ts";
import {useAutoRefresh} from "@/hooks/useAutoRefresh.ts";

const SingaporeWeatherDashboard: React.FC = () => {
  const [forecastDailyData, setForecastDailyData] = useState<ForecastDailyData[]>([]);
  const [forecastHourlyData, setForecastHourlyData] = useState<ForecastHourlyData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const appState = useAppStore();
  
  const fetchSingaporeWeather = useCallback(async () => {
    try {
      const data = await getCityList('Singapore');
      if (data.length === 0) {
        throw new Error("Could not find location 'Singapore'");
      }
      const { lat, lon } = data[0];
      const weatherData = await getWeatherData(lat, lon);
      setWeatherData(weatherData);

      const forecastData = await getForecastData(lat, lon);
      // Process daily forecast data
      const dailyForecastData = processDailyForecast(forecastData)
      setForecastDailyData(dailyForecastData)
      // Process hourly forecast data
      const hourlyForecast: ForecastHourlyData[] = processHourlyForecast(forecastData)
      setForecastHourlyData(hourlyForecast);
    } catch (error) {
      console.error('Error fetching Singapore weather:', error);
      toast.error('Failed to fetch Singapore weather data');
    } finally {
      appState.setMainWeatherLoading(false);
    }
  }, [appState]);
  
  useEffect(() => {
    fetchSingaporeWeather();
  }, []);
  
  useAutoRefresh(fetchSingaporeWeather, true);

  if (!weatherData) {
    return (
      <Card className="bg-white/20 backdrop-blur-md border-0 text-white">
        <CardContent className="p-8 text-center">
          <div className="text-lg">Loading Singapore weather...</div>
        </CardContent>
      </Card>
    );
  }

  const { weather, main, name, wind } = weatherData;

  return (
    <div className="space-y-6">
      <Card className="bg-white/20 backdrop-blur-md border-0 text-white overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <img 
              src={getWeatherIconUrl(weather[0].icon)} 
              alt={weather[0].description} 
              className="text-3xl"
            />
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Main Temperature */}
            <div className="lg:col-span-2">
              <div className="text-6xl md:text-7xl font-bold mb-2">
                {Math.floor(main.temp)}°C
              </div>
              <div className="text-xl opacity-80 mb-4">{weather[0].main}</div>
              <div className="text-lg opacity-70">
                Feels like {Math.floor(main.feels_like)}°C
              </div>
            </div>

            {/* Weather Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CloudRain className="w-5 h-5" />
                <span>Humidity: {main.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5" />
                <span>Wind: {wind.speed} km/h {convertFromDegToNavigation(wind.deg)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>Pressure: {main.pressure} hPa</div>
              <div className="text-sm opacity-70">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="hourly" className="space-y-4">
        <TabsList className="bg-white/20 backdrop-blur-md border-0">
          <TabsTrigger value="hourly" className="data-[state=active]:bg-white/30">
            Hourly Forecast
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-white/30">
            Daily Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <Card className="bg-white/20 backdrop-blur-md border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Hourly Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {forecastHourlyData.slice(0, 12).map((hour, index) => (
                  <div key={index} className="text-center p-3 rounded-lg bg-white/10">
                    <div className="text-sm opacity-80 mb-1">{hour.time}</div>
                    {(hour.date && hour.date !== new Date().toLocaleDateString()) ? (
                        <div className="text-xs opacity-80 mb-1">{new Date(hour.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                    ) : (
                        <div className="h-[20px]">{}</div>
                    )}
                    
                    <img 
                      src={getWeatherIconUrl(hour.icon)} 
                      alt={hour.description} 
                      className="text-2xl mb-1"
                    />
                    <div className="font-semibold text-lg">{Math.floor(hour.temp)}°</div>
                    <div className="text-xs opacity-70">{hour.chanceOfRain}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card className="bg-white/20 backdrop-blur-md border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {forecastDailyData.length}-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecastDailyData.map((day, index) => (
                  <div key={index} className="grid grid-cols-3 items-center gap-4 p-4 rounded-lg bg-white/10">
                    <div className="flex items-center gap-4">
                      <img 
                        src={getWeatherIconUrl(day.icon)} 
                        alt={day.description} 
                        className="text-2xl"
                      />
                      <div>
                        <div className="font-semibold">{day.dayOfWeek}</div>
                        <div className="text-sm opacity-80">{new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-80">{day.condition}</div>
                      <div className="text-xs opacity-70">{day.chanceOfRain}% rain</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {Math.floor(day.max_temp ?? 0)}°C / {Math.floor(day.min_temp ?? 0)}°C
                      </div>
                      <div className="text-xs opacity-70">{day.humidity}% humidity</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SingaporeWeatherDashboard;