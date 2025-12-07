import api from '@/services/api';

/**
 * Service to fetch weather data via the Backend Proxy. 
 * Falls back to mock data if request fails.
 */
export const weatherService = {
  async getCurrentWeather(lat = 10.3157, lon = 123.8854) { // Default: Cebu City
    try {
        // Call our secure backend proxy
        // The backend reads the API Key from process.env.OPENWEATHER_API_KEY
        const res = await api.get('/api/public/weather', {
            params: {
                lat,
                lon
            }
        });

        // Calculate isDaytime based on API response sunrise/sunset or local time fallback
        const now = Math.floor(Date.now() / 1000);
        const sys = res.data.sys;
        let isDaytime = true;
        
        if (sys && sys.sunrise && sys.sunset) {
            isDaytime = now >= sys.sunrise && now < sys.sunset;
        } else {
            // Fallback to simplified hours if API data is weird
            const hours = new Date().getHours();
            isDaytime = hours >= 6 && hours < 18;
        }

        return {
            temp: Math.round(res.data.main.temp),
            condition: res.data.weather[0].main,
            description: res.data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${res.data.weather[0].icon}@2x.png`,
            clouds: res.data.clouds.all,
            humidity: res.data.main.humidity,
            windSpeed: res.data.wind.speed,
            isDaytime, // Store this for efficiency calc
            timestamp: new Date()
        };
    } catch (error) {
        console.warn("Weather Proxy unavailable (using mock data):", error.message);
       
        // Mock data
        const hours = new Date().getHours();
        const isMockDaytime = hours >= 6 && hours < 18;

        return {
            temp: 27,
            condition: 'Clouds',
            description: 'partly cloudy',
            icon: 'https://openweathermap.org/img/wn/02d@2x.png',
            clouds: 40,
            humidity: 80,
            windSpeed: 2.5,
            isDaytime: isMockDaytime,
            timestamp: new Date(),
            isMock: true
        };
    }
  },

  /**
   * Estimates solar efficiency based on weather conditions and time of day.
   * @param {Object} weather Current weather object
   * @returns {number} Efficiency percentage (0-100)
   */
  calculateSolarEfficiency(weather) {
      if (!weather) return 0;
      
      // 1. Night Time Check: If it's night, solar generation is effectively 0
      if (weather.isDaytime === false) {
          return 0;
      }

      // 2. Base Efficiency Calculation
      // Simple algorithm: 
      // Base 100%
      // -1% for every 2% cloud cover
      // -0.5% for every degree above 25C (heat degradation)
      
      let efficiency = 100;
      
      // Cloud impact
      if (weather.clouds) {
          efficiency -= (weather.clouds / 2);
      }
      
      // Heat impact (standard panels lose efficiency in high heat)
      if (weather.temp > 25) {
          efficiency -= (weather.temp - 25) * 0.5;
      }

      return Math.max(0, Math.min(100, Math.round(efficiency)));
  }
};
