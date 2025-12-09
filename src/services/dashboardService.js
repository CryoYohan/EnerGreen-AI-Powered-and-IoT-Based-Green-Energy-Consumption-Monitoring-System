// src/services/dashboardService.js
import * as deviceRepo from '@/data/deviceRepository.js';

/**
 * Processes raw daily summaries into structured data for charts.
 * This contains the business logic for aggregation.
 * @param {Array<Object>} summaries An array of daily summary documents.
 */
function processDailySummariesForCharts(summaries) {
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const weeklyTotals = {};
  const monthlyTotals = {};
  const yearlyTotals = {};
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  cutoffDate.setHours(0, 0, 0, 0);

  summaries.forEach(summary => {
    const date = new Date(summary.date);
    const gridKwh = summary.gridKwhTotal || 0;
    const solarKwh = summary.solarKwhTotal || 0;
    
    if (date > cutoffDate) {
      const dateKey = date.toISOString().slice(0, 10);
      if (!weeklyTotals[dateKey]) {
        weeklyTotals[dateKey] = { grid: 0, solar: 0, label: weekday[date.getDay()] };
      }
      weeklyTotals[dateKey].grid += gridKwh;
      weeklyTotals[dateKey].solar += solarKwh;
    }

    const month = date.getMonth();
    const year = date.getFullYear();
    const monthlyKey = `${monthNames[month]}-${year}`;
    if (!monthlyTotals[monthlyKey]) {
      monthlyTotals[monthlyKey] = { grid: 0, solar: 0 };
    }
    monthlyTotals[monthlyKey].grid += gridKwh;
    monthlyTotals[monthlyKey].solar += solarKwh;

    const yearlyKey = year.toString();
    if (!yearlyTotals[yearlyKey]) {
      yearlyTotals[yearlyKey] = { grid: 0, solar: 0 };
    }
    yearlyTotals[yearlyKey].grid += gridKwh;
    yearlyTotals[yearlyKey].solar += solarKwh;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastSevenDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const dayData = weeklyTotals[dateKey] || { grid: 0, solar: 0 };
    lastSevenDays.push({
      label: weekday[d.getDay()], // Force correct label from loop date
      grid: dayData.grid,
      solar: dayData.solar,
      value: dayData.grid + dayData.solar
    });
  }

  const weeklyData = lastSevenDays;
  const monthlyData = Object.keys(monthlyTotals).map(key => ({
    label: key.split('-')[0],
    grid: monthlyTotals[key].grid,
    solar: monthlyTotals[key].solar,
    value: monthlyTotals[key].grid + monthlyTotals[key].solar
  }));
  const yearlyData = Object.keys(yearlyTotals).map(year => ({
    label: year,
    grid: yearlyTotals[year].grid,
    solar: yearlyTotals[year].solar,
    value: yearlyTotals[year].grid + yearlyTotals[year].solar
  }));
  
  return { weeklyData, monthlyData, yearlyData };
}

/**
 * Calculates hourly consumption deltas from raw readings.
 * @param {Array<Object>} readings An array of realtime reading documents.
 */
function processReadingsForHourlyChart(readings) {
    const gridReadings = readings.filter(r => r.energySource === 'Grid');
    const solarReadings = readings.filter(r => r.energySource === 'Solar');

    const calculateKwhDeltaForHourly = (readings) => {
        if (!readings || readings.length < 2) return { total: 0, hourly: {} };
        let totalDelta = 0;
        const hourly = {};
        for (let i = 1; i < readings.length; i++) {
            const delta = readings[i].kwhConsumed - readings[i - 1].kwhConsumed;
            if (delta > 0) {
                totalDelta += delta;
                const hour = readings[i].timestamp.getHours();
                hourly[hour] = (hourly[hour] || 0) + delta;
            }
        }
        return { total: totalDelta, hourly };
    };

    const gridResults = calculateKwhDeltaForHourly(gridReadings);
    const solarResults = calculateKwhDeltaForHourly(solarReadings);

    return Array.from({ length: 24 }, (_, i) => ({
      label: `${i}:00`,
      grid: gridResults.hourly[i] || 0,
      solar: solarResults.hourly[i] || 0,
      value: (gridResults.hourly[i] || 0) + (solarResults.hourly[i] || 0)
    }));
}

/**
 * Fetches and processes all data needed for the historical charts (W, M, Y).
 * @param {string} deviceId 
 * @returns {Promise<Object>}
 */
export async function getHistoricalChartData(deviceId) {
    if (!deviceId) return { weeklyData: [], monthlyData: [], yearlyData: [] };
    const summaries = await deviceRepo.getDailySummaries(deviceId);
    if (!summaries || summaries.length === 0) {
        return { weeklyData: [], monthlyData: [], yearlyData: [] };
    }
    return processDailySummariesForCharts(JSON.parse(JSON.stringify(summaries)));
}

/**
 * Fetches and processes all data for the daily (hourly) chart.
 * @param {string} deviceId 
 * @returns {Promise<Array<Object>>}
 */
export async function getHourlyChartData(deviceId) {
    if (!deviceId) return [];
    const readings = await deviceRepo.getTodaysReadings(deviceId);
    return processReadingsForHourlyChart(readings);
}
