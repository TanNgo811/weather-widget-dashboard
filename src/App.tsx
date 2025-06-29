import {useState} from 'react'
import './App.css'
import type {CityWeatherWidgetData, SelectedCityItem} from "@/types/weather.ts";
import {getForecastData, getWeatherData} from "@/services/weatherService.ts";
import {toast, Toaster} from 'sonner';
import {DndProvider} from "react-dnd";
import {HTML5Backend} from 'react-dnd-html5-backend';
import SingaporeWeatherDashboard from "@/components/SingaporeWeatherDashboard.tsx";
import AddCityForm from "@/components/AddCityForm.tsx";
import CityWeatherWidget from "@/components/CityWeatherWidget.tsx";
import {useAppStore} from "@/app/app.state.ts";
import Loading from "@/components/Loading.tsx";
import {processDailyForecast} from "@/utils/helpers.ts";

function App() {
  const [widgets, setWidgets] = useState<CityWeatherWidgetData[]>([]);
  const appState = useAppStore();

  const handleAddWidget = async (city: SelectedCityItem) => {
    try {
      const currentWeather = await getWeatherData(city.lat, city.lon);
      const forecastData = await getForecastData(city.lat, city.lon);
      const dailyForecast = processDailyForecast(forecastData)
      
      const newWidget: CityWeatherWidgetData = {
        ...city,
        current: {
            temp: currentWeather.main.temp,
            feels_like: currentWeather.main.feels_like,
            humidity: currentWeather.main.humidity,
            pressure: currentWeather.main.pressure,
            wind_speed: currentWeather.wind.speed,
            speed_deg: currentWeather.wind.deg,
            condition: currentWeather.weather[0].main,
            icon: currentWeather.weather[0].icon,
            description: currentWeather.weather[0].description,
            max_temp: currentWeather.main.temp_max,
            min_temp: currentWeather.main.temp_min,
        },
        daily: dailyForecast,
      };
      setWidgets(prev => [...prev, newWidget]);
      toast.success(`Added ${city.name} weather widget`);
    } catch (error) {
      console.error('Error adding widget:', error);
      toast.error(`Failed to add weather widget for ${city}`);
    }
  };

  const handleRemoveWidget = (city: CityWeatherWidgetData) => {
    setWidgets(prev => prev.filter(widget => widget.lat !== city.lat && widget.lon !== city.lon));
    toast.success('Widget removed');
  };

  const handleMoveWidget = (dragIndex: number, hoverIndex: number) => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const draggedWidget = newWidgets[dragIndex];
      newWidgets.splice(dragIndex, 1);
      newWidgets.splice(hoverIndex, 0, draggedWidget);
      return newWidgets;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {appState.mainWeatherLoading && (
        <div className="absolute w-full h-full z-20 flex items-center justify-center background-animation">
          <Loading />
          <div className="text-white text-xl">Loading Singapore weather...</div>
        </div>
      )}
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br p-4 background-animation">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Main Singapore Weather Dashboard */}
          <SingaporeWeatherDashboard />

          {/* Add City Form */}
          <AddCityForm onAddCity={handleAddWidget} />

          {/* Weather Widgets Grid */}
          {widgets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">City Weather Widgets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgets.map((widget, index) => (
                  <CityWeatherWidget
                    key={`${widget.lat}-${widget.lon}`}
                    id={`${widget.lat}-${widget.lon}`}
                    index={index}
                    cityData={widget}
                    onRemove={handleRemoveWidget}
                    onMove={handleMoveWidget}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default App
