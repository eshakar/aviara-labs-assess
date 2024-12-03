"use client";
// components/Navbar.tsx
import { FC, useState } from 'react';
import { FiSun, FiTarget, FiMapPin} from 'react-icons/fi';
import SearchBox from '@/components/SearchBox';
import axios from "axios";
import { loadingCityAtom, placeAtom } from "@/app/atom";
import { useAtom } from "jotai";

type Props = { location?: string };

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY;

export default function Navbar({ location }: Props) {

  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  //
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  async function handleInputChang(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}`
        );

        const suggestions = response.data.list.map((item: any) => item.name);
        setSuggestions(suggestions);
        setError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
  }

  function handleSubmiSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true);
    e.preventDefault();
    if (suggestions.length == 0) {
      setError("Location not found");
      setLoadingCity(false);
    } else {
      setError("");
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (postiion) => {
        const { latitude, longitude } = postiion.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }

  return (
    <>
    <nav className="bg-gray-50 p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-2">
            <FiSun className="text-yellow-500 text-2xl" />
            <span className="text-gray-800 text-2xl font-bold">Weather</span>
          </div>

          {/* Right side - Icons and Search */}
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-600 hover:text-gray-800 transition-colors"
              type="button"
            >
              <FiTarget 
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-2xl  text-gray-400 hover:opacity-80 cursor-pointer" />
            </button>

            <div className="flex items-center space-x-2">
              <FiMapPin className="text-gray-600 text-xl" />
              <p className="text-slate-900/80 text-sm"> {location} </p>
            </div>

            {/* Search Input */}
            <div className="relative hidden md:flex">
            <SearchBox
                value={city}
                onSubmit={(e) => handleSubmiSearch}
                onChange={(e) => handleInputChang(e.target.value)}
              />
              <SuggetionBox
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
    <section className="flex   max-w-7xl px-3 md:hidden ">
    <div className="relative ">
      {/* SearchBox */}

      <SearchBox
        value={city}
        onSubmit={(e) => handleSubmiSearch}
        onChange={(e) => handleInputChang(e.target.value)}
      />
      <SuggetionBox
        {...{
          showSuggestions,
          suggestions,
          handleSuggestionClick,
          error
        }}
      />
    </div>
  </section>
  </>
  );
};

function SuggetionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px]  flex flex-col gap-1 py-2 px-2">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1 "> {error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(item)}
              className="cursor-pointer p-1 rounded   hover:bg-gray-200"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}