// src/services/costService.js
import * as costRepo from '@/data/costRepository.js';
// 1. IMPORT THE ICONS HERE so we can pass them as objects
import {
    CurrencyDollarIcon,
    BoltIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline';

/**
 * Calculates the key performance metrics for the cost page.
 * @param {Array<Object>} rawData The array of daily summaries.
 * @param {number} currentRate The user's current electricity rate.
 * @param {number} userBudget The user's monthly budget.
 * @returns {Array<Object>}
 */
export function calculateKpiMetrics(rawData, currentRate, userBudget) {
    if (!rawData.length) return [];

    const now = new Date();
    const currentMonthData = rawData.filter(d => new Date(d.date).getMonth() === now.getMonth());

    const monthKwh = currentMonthData.reduce((acc, c) => acc + (c.gridKwhTotal || 0), 0);
    const monthCost = monthKwh * currentRate;
    const dayAvg = now.getDate() > 0 ? monthCost / now.getDate() : 0;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projected = dayAvg * daysInMonth;
    const isOverBudget = projected > userBudget;

    // 2. RETURN OBJECTS MATCHING CostMetricsCard PROPS
    // Note: I changed key 'value' to 'cost' because your child component uses {{ metric.cost }}
    return [
        {
            title: 'Current Bill',
            cost: `₱${monthCost.toFixed(2)}`,
            icon: CurrencyDollarIcon,
            definition: 'This month so far',
            bgClass: 'bg-blue-100 dark:bg-blue-900/30',
            textClass: 'text-blue-600 dark:text-blue-400',
            trendClass: 'text-gray-500'
        },
        {
            title: 'Projected Bill',
            cost: `₱${projected.toFixed(2)}`,
            icon: ChartBarIcon,
            definition: isOverBudget ? 'Over Budget' : 'On Track',
            bgClass: isOverBudget ? 'bg-red-100 dark:bg-red-900/30' : 'bg-purple-100 dark:bg-purple-900/30',
            textClass: isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400',
            trendIcon: isOverBudget ? '⚠️' : '✅',
            trendClass: isOverBudget ? 'text-red-600' : 'text-green-600'
        },
        {
            title: 'Consumption',
            cost: `${monthKwh.toFixed(1)} kWh`,
            icon: BoltIcon,
            definition: 'This Month',
            bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
            textClass: 'text-yellow-600 dark:text-yellow-400',
            trendClass: 'text-gray-500'
        },
        {
            title: 'Avg. Daily Cost',
            cost: `₱${dayAvg.toFixed(2)}`,
            icon: ArrowTrendingUpIcon,
            definition: 'Based on this month',
            bgClass: 'bg-green-100 dark:bg-green-900/30',
            textClass: 'text-green-600 dark:text-green-400',
            trendClass: 'text-gray-500'
        }
    ];
}

/**
 * Calculates the breakdown between grid cost and solar savings.
 * @param {Array<Object>} rawData The array of daily summaries.
 * @param {number} currentRate The user's current electricity rate.
 * @returns {Object}
 */
export function calculateBreakdownStats(rawData, currentRate) {
    if (!rawData.length) return { gridCost: 0, solarSavings: 0 };

    const now = new Date();
    const monthData = rawData.filter(d => new Date(d.date).getMonth() === now.getMonth());

    const gridKwh = monthData.reduce((acc, c) => acc + (c.gridKwhTotal || 0), 0);
    const solarKwh = monthData.reduce((acc, c) => acc + (c.solarKwhTotal || 0), 0);

    return {
        gridCost: gridKwh * currentRate,
        solarSavings: solarKwh * currentRate
    };
}

/**
 * Processes raw summaries into a monthly billing history.
 * @param {Array<Object>} rawData The array of daily summaries.
 * @param {number} currentRate The user's current electricity rate.
 * @returns {Array<Object>}
 */
export function calculateBillingHistory(rawData, currentRate) {
    if (!rawData.length) return [];

    const grouped = {};
    rawData.forEach(d => {
        const date = new Date(d.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!grouped[key]) {
            grouped[key] = {
                month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                kwh: 0,
                cost: 0,
                sort: date.getTime(),
                provider: d.electricityProvider || 'veco'
            };
        }
        const gridKwh = d.gridKwhTotal || 0;
        grouped[key].kwh += gridKwh;
        // Calculate cost using the provided rate
        grouped[key].cost += gridKwh * currentRate;
    });

    return Object.values(grouped)
        .sort((a, b) => b.sort - a.sort)
        .map(i => ({
            ...i,
            kwh: i.kwh.toFixed(2),
            cost: i.cost.toFixed(2),
        }))
        .slice(0, 12);
}

/**
 * Prepares data for the Plotly charts.
 * @param {Array<Object>} rawData The array of daily summaries.
 * @param {string} activeFilter The selected time period ('Daily', 'Weekly', etc.).
 * @param {number} currentRate The user's current electricity rate.
 * @returns {Object}
 */
export function processDataForCharts(rawData, activeFilter, currentRate) {
    let days = 7;
    if (activeFilter === 'Monthly') days = 30;
    if (activeFilter === 'Yearly') days = 365;

    const filtered = rawData.slice(0, days).reverse();

    const xValues = filtered.map(d => {
        const [y, m, day] = d.date.split('-');
        const date = new Date(y, m - 1, day);
        return activeFilter === 'Yearly'
            ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const yCost = filtered.map(d => (d.gridKwhTotal || 0) * currentRate);
    const yUsage = filtered.map(d => (d.gridKwhTotal || 0));

    return { xValues, yCost, yUsage };
}

// Re-export repository functions
export const { getUtilityRate, getDailySummaries } = costRepo;