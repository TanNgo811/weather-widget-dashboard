import React, {useCallback, useState, useMemo} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {Plus, Search} from 'lucide-react';
import {getCityList} from "@/services/weatherService.ts";
import type {GeoLocation, SelectedCityItem} from "@/types/weather.ts";
import {toast} from "sonner";
import Loading from "@/components/Loading.tsx";

interface AddCityFormProps {
  onAddCity: (city: SelectedCityItem) => void;
}

const AddCityForm: React.FC<AddCityFormProps> = ({ onAddCity }) => {
  const [selectedCity, setSelectedCity] = useState<SelectedCityItem | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [cityList, setCityList] = useState<GeoLocation[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) {
      return;
    }

    setIsSubmitting(true);
    setInputValue('');
    try {
      await onAddCity(selectedCity);
      setSelectedCity(null);
    } catch (error) {
      console.error('Error adding city:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGetCityList = useCallback(async (name: string) => {
    if (!name.trim()) {
      setCityList([]);
      return;
    }
    
    setListLoading(true);
    try {
      const response = await getCityList(name, 10);
      setCityList(response);
    } catch (error) {
      console.error('Error fetching city list:', error);
      toast.error('Failed to fetch city list');
    } finally {
      setListLoading(false);
    }
  }, [])
  
  // Create a debounced version of the handleGetCityList function using useMemo
  const debouncedGetCityList = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (name: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleGetCityList(name);
      }, 500);
    };
  }, [handleGetCityList]);
  
  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedCity(null)
    debouncedGetCityList(value);
  }, [debouncedGetCityList])
  
  return (
    <Card className="bg-white/20 backdrop-blur-md border-0 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Add Singapore's City Weather Widget (Jurong, Tampines, Woodlands, Clementi,...)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter Singapore city name..."
            value={inputValue}
            onChange={handleCityChange}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={!selectedCity || isSubmitting || listLoading}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            {listLoading ? (
              <Loading />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            
          </Button>
        </form>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {cityList.map((city) => (
              <Button
                key={`${city.lat}-${city.lon}`}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCity(city)}
                className={`bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs ${
                  (selectedCity?.lat === city.lat && selectedCity?.lon === city.lon) ? 'bg-white/50 text-black' : ''
                }`}
                disabled={isSubmitting}
              >
                {[city.name, city.state, city.country].filter(Boolean).join(' - ')}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddCityForm;