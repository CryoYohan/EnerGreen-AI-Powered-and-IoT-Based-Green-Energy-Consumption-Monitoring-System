// src/services/carbonService.js
import * as carbonRepo from '@/data/carbonRepository.js';

/**
 * Processes raw daily summaries and calculates CO2 emissions for various timeframes.
 * @param {Array<Object>} summaries An array of daily summary documents from Firestore.
 * @param {number} carbonRateKg The carbon emission factor (kg CO2 per kWh).
 * @returns {Object} An object containing data for weekly, monthly, and yearly charts.
 */
export function processCo2SummariesForCharts(summaries, carbonRateKg) {
    if (!summaries || summaries.length === 0) {
        return { weeklyChartData: [], monthlyChartData: [], yearlyChartData: [] };
    }

    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // --- Weekly (Last 7 Days) ---
    const lastSevenDays = summaries
        .slice(0, 7)
        .map(s => {
            const totalKwh = (s.gridKwhTotal || 0) + (s.solarKwhTotal || 0);
            return {
                label: weekday[new Date(s.date).getUTCDay()],
                value: parseFloat((totalKwh * carbonRateKg).toFixed(2))
            };
        })
        .reverse(); // Sort from past to present

    // --- Monthly (Last 12 Months) ---
    const monthlyTotals = {};
    summaries.forEach(s => {
        const date = new Date(s.date);
        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = { value: 0, sortTime: date.getTime() };
        }
        const totalKwh = (s.gridKwhTotal || 0) + (s.solarKwhTotal || 0);
        monthlyTotals[monthKey].value += totalKwh * carbonRateKg;
    });

    const monthlyChartData = Object.keys(monthlyTotals)
        .map(key => ({ ...monthlyTotals[key], key }))
        .sort((a, b) => a.sortTime - b.sortTime)
        .slice(-12)
        .map(item => ({
            label: monthNames[parseInt(item.key.split('-')[1]) - 1],
            value: parseFloat(item.value.toFixed(2))
        }));

    // --- Yearly ---
    const yearlyTotals = {};
    summaries.forEach(s => {
        const yearKey = new Date(s.date).getUTCFullYear().toString();
        if (!yearlyTotals[yearKey]) {
            yearlyTotals[yearKey] = 0;
        }
        const totalKwh = (s.gridKwhTotal || 0) + (s.solarKwhTotal || 0);
        yearlyTotals[yearKey] += totalKwh * carbonRateKg;
    });

    const yearlyChartData = Object.keys(yearlyTotals)
        .sort()
        .map(year => ({
            label: year,
            value: parseFloat(yearlyTotals[year].toFixed(2))
        }));

    return { weeklyChartData: lastSevenDays, monthlyChartData, yearlyChartData };
}

/**
 * Processes realtime readings to calculate hourly CO2 emissions for today.
 * @param {Array<Object>} readings Raw realtime reading documents.
 * @param {number} carbonRateKg The carbon emission factor.
 * @returns {Array<Object>}
 */
export function processReadingsForHourlyChart(readings, carbonRateKg) {
    const hourlyKwh = {}; 

    for (let i = 1; i < readings.length; i++) {
        const prev = readings[i - 1];
        const curr = readings[i];
        const delta = curr.kwhConsumed - prev.kwhConsumed;
        
        if (delta > 0 && delta < 1) { // Basic outlier detection
            const hour = curr.timestamp.toDate().getHours();
            hourlyKwh[hour] = (hourlyKwh[hour] || 0) + delta;
        }
    }
    
    return Array.from({ length: 24 }, (_, i) => {
        const kwh = hourlyKwh[i] || 0;
        return {
            label: `${i}:00`,
            value: parseFloat((kwh * carbonRateKg).toFixed(3))
        };
    });
}

/**
 * Calculates the key metrics for the Carbon Emission page.
 * @param {Array<Object>} summaries Raw daily summary documents.
 * @param {number} carbonRateKg The carbon emission factor.
 * @returns {Array<Object>}
 */
export function calculateDynamicMetrics(summaries, carbonRateKg) {
    if (!summaries || summaries.length === 0) {
        return [
            { title: 'Current CO₂ Emissions (Today)', cost: '0.00 kg CO₂' },
            { title: 'Trees Equivalent (Monthly)', cost: '0 trees' },
            { title: 'Monthly Total', cost: '0.00 kg CO₂' },
        ];
    }
    
    const latestSummary = summaries[0];
    const latestKwh = (latestSummary.gridKwhTotal || 0) + (latestSummary.solarKwhTotal || 0);
    const latestCo2 = latestKwh * carbonRateKg;

    const last30Days = summaries.slice(0, 30);
    const last30DaysKwh = last30Days.reduce((acc, s) => acc + (s.gridKwhTotal || 0) + (s.solarKwhTotal || 0), 0);
    const last30DaysCo2 = last30DaysKwh * carbonRateKg;
    
    // An average mature tree absorbs about 20.4 kg of CO2 per year, or ~1.7 kg per month.
    const treesEquivalent = (last30DaysCo2 / 1.7).toFixed(0); 

    return [
        {
            title: 'Current CO₂ Emissions (Today)',
            cost: `${latestCo2.toFixed(2)} kg CO₂`,
            definition: 'Based on the last daily summary'
        },
        {
            title: 'Trees Equivalent (Monthly)',
            cost: `${treesEquivalent} trees`,
            definition: 'Needed to offset last 30 days'
        },
        {
            title: 'Monthly Total',
            cost: `${last30DaysCo2.toFixed(2)} kg CO₂`,
            definition: 'Total for the last 30 days'
        },
    ];
}

// Re-export repository functions for convenience
export const { getCarbonRate, getDailySummaries, listenToHourlyReadings } = carbonRepo;
