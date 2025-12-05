// src/services/solarService.js
import * as solarRepo from '@/data/solarRepository.js';

/**
 * Processes realtime readings to calculate hourly grid vs. solar consumption.
 * @param {Array<Object>} readings Raw realtime reading documents.
 * @returns {Array<Object>}
 */
function processHourlyDeltas(readings) {
    const solarReadings = readings.filter(r => r.energySource === 'Solar');
    const gridReadings = readings.filter(r => r.energySource === 'Grid');

    const calculateKwhByHour = (list) => {
        const hours = {};
        for (let i = 1; i < list.length; i++) {
            const delta = list[i].kwhConsumed - list[i-1].kwhConsumed;
            if (delta > 0 && delta < 5) { // Basic outlier filtering
                const h = list[i].timestamp.toDate().getHours();
                hours[h] = (hours[h] || 0) + delta;
            }
        }
        return hours;
    };

    const solarHourly = calculateKwhByHour(solarReadings);
    const gridHourly = calculateKwhByHour(gridReadings);
    
    return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        solar: solarHourly[i] || 0,
        grid: gridHourly[i] || 0
    }));
}

/**
 * Calculates the key metrics based on the current view's data.
 * @param {Array<Object>} data The processed data for the current view.
 * @param {boolean} isDaily Indicates if the data is hourly for the daily view.
 * @returns {Array<Object>}
 */
export function calculateMetrics(data, isDaily) {
    let totalSolar = 0;
    let totalGrid = 0;

    if (isDaily) {
        totalSolar = data.reduce((acc, c) => acc + c.solar, 0);
        totalGrid = data.reduce((acc, c) => acc + c.grid, 0);
    } else {
        totalSolar = data.reduce((acc, curr) => acc + (curr.solarKwhTotal || 0), 0);
        totalGrid = data.reduce((acc, curr) => acc + (curr.gridKwhTotal || 0), 0);
    }

    const totalEnergy = totalSolar + totalGrid;
    const independence = totalEnergy > 0 ? (totalSolar / totalEnergy) * 100 : 0;

    return [
        { title: 'Solar Generation', value: `${totalSolar.toFixed(1)} kWh`, subtitle: 'Produced this period' },
        { title: 'Grid Usage', value: `${totalGrid.toFixed(1)} kWh`, subtitle: 'Imported from utility' },
        { title: 'Energy Independence', value: `${independence.toFixed(1)}%`, subtitle: '% of power from Solar' },
        { title: 'Peak Power', value: `4.2 kW`, subtitle: 'System Capacity' }
    ];
}

/**
 * Calculates savings and environmental impact.
 * @param {Array<Object>} data The processed data for the current view.
 * @param {boolean} isDaily Flag for daily view.
 * @param {number} currentRate Rate per kWh.
 * @param {number} carbonRate Rate of CO2 per kWh.
 * @returns {Object}
 */
export function calculateImpact(data, isDaily, currentRate, carbonRate) {
    let totalSolar = 0;
    if (isDaily) {
        totalSolar = data.reduce((acc, c) => acc + c.solar, 0);
    } else {
        totalSolar = data.reduce((acc, c) => acc + (c.solarKwhTotal || 0), 0);
    }

    const savings = totalSolar * currentRate;
    const co2Avoided = totalSolar * carbonRate;
    const treesPlanted = co2Avoided / 1.6; // Assuming 1.6 kg CO2 offset per tree per month

    return {
        savingsValue: savings.toFixed(2),
        co2Avoided: co2Avoided.toFixed(1),
        treesPlanted: treesPlanted.toFixed(1)
    };
}

/**
 * Prepares the data for the Plotly chart based on the active filter.
 * @param {Array<Object>} historicalData Raw daily summaries.
 * @param {Array<Object>} hourlyData Processed hourly data.
 * @param {string} activeFilter The current time filter ('Daily', 'Weekly', etc.).
 * @returns {Object}
 */
export function processDataForChart(historicalData, hourlyData, activeFilter) {
    let xValues = [];
    let ySolar = [];
    let yGrid = [];

    if (activeFilter === 'Daily') {
        xValues = hourlyData.map(d => d.hour);
        ySolar = hourlyData.map(d => d.solar);
        yGrid = hourlyData.map(d => d.grid);
    } else if (activeFilter === 'Yearly') {
        const monthlyData = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        historicalData.forEach(d => {
            const [year, month] = d.date.split('-');
            const key = `${year}-${month}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { label: monthNames[parseInt(month) - 1], solar: 0, grid: 0, sort: new Date(d.date).getTime() };
            }
            monthlyData[key].solar += d.solarKwhTotal || 0;
            monthlyData[key].grid += d.gridKwhTotal || 0;
        });

        const sorted = Object.values(monthlyData).sort((a, b) => a.sort - b.sort).slice(-12);
        xValues = sorted.map(m => m.label);
        ySolar = sorted.map(m => m.solar);
        yGrid = sorted.map(m => m.grid);
    } else {
        const days = activeFilter === 'Weekly' ? 7 : 30;
        const slicedData = historicalData.slice(0, days).reverse();
        
        xValues = slicedData.map(d => {
            const date = new Date(d.date);
            return activeFilter === 'Weekly' ? date.toLocaleDateString('en-US', { weekday: 'short' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        ySolar = slicedData.map(d => d.solarKwhTotal || 0);
        yGrid = slicedData.map(d => d.gridKwhTotal || 0);
    }
    
    return { xValues, ySolar, yGrid };
}

// Re-export repository functions
export const { getUtilityRate, getCarbonRate, getDailySummaries, listenToHourlyReadings } = solarRepo;
export { processHourlyDeltas };
