import React, {useRef} from 'react';
import {useDrag, useDrop} from 'react-dnd';
import type {DropTargetMonitor} from 'react-dnd';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import type {CityWeatherWidgetData} from '@/types/weather';
import {CloudRain, Wind, X} from 'lucide-react';
import { getWeatherIconUrl } from '@/services/weatherService';

interface WeatherWidgetProps {
  id: string;
  index: number;
  cityData: CityWeatherWidgetData | null;
  onRemove: (city: CityWeatherWidgetData) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const CityWeatherWidget: React.FC<WeatherWidgetProps> = ({
  id,
  index,
  cityData,
  onRemove,
  onMove
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: 'weather-widget',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor<DragItem, void>) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'weather-widget',
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  if (!cityData) {
    return (
      <Card className="bg-white/20 backdrop-blur-md border-0 text-white">
        <CardContent className="p-4 text-center">
          <div>Loading weather...</div>
        </CardContent>
      </Card>
    );
  }

  const { current, daily } = cityData;

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      <Card className="bg-white/20 backdrop-blur-md border-0 text-white cursor-move hover:bg-white/30 transition-all duration-200 transform hover:scale-105">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <img 
                src={getWeatherIconUrl(current.icon)} 
                alt={current.description} 
                className="w-8 h-8 inline-block"
              />
              {cityData.name}, {cityData.country} 
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(cityData)}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Weather */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{Math.floor(current.temp)}°C</div>
            <div className="text-sm opacity-80 mb-2">{current.condition}</div>
            <div className="text-xs opacity-70">Feels like {Math.floor(current.feels_like)}°C</div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CloudRain className="w-3 h-3" />
              <span>{current.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              <span>{current.wind_speed} km/h</span>
            </div>
          </div>

          {/* Tomorrow's Forecast */}
          <div className="border-t border-white/20 pt-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              {daily.map(day => (
                <React.Fragment key={day.date}>
                  <div className="text-left">
                    <span className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })} ({
                        new Date(day.date).getDate()
                    }/{
                        new Date(day.date).getMonth() + 1
                    })</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <img 
                      src={getWeatherIconUrl(day.icon)} 
                      alt={day.description} 
                      className="w-6 h-6"
                    />
                    <span>{day.condition}</span>
                  </div>
                  <div className="text-right font-semibold">
                    {Math.floor(day?.max_temp ?? 0)}°C / {Math.floor(day?.min_temp ?? 0)}°C
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CityWeatherWidget;