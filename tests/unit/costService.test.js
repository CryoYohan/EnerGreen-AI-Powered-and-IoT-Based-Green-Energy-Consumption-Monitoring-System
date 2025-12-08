import { describe, it, expect, vi } from 'vitest';
import {
    calculateKpiMetrics,
    calculateBreakdownStats,
    calculateBillingHistory,
    processDataForCharts
} from '@/services/costService';

// Mock the HeroIcons to avoid import issues in pure JS environment if necessary,
// though jsdom usually handles them fine as objects.
// We just verify they are passed through.

describe('Cost Service Logic', () => {

    const currentRate = 12; // 12 Pesos/kWh
    const userBudget = 1000;
    
    // Create dates relative to "now" to ensure tests pass in any month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const mockData = [
        { 
            date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`, 
            gridKwhTotal: 10, 
            solarKwhTotal: 5,
            electricityProvider: 'veco'
        },
        { 
            date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-02`, 
            gridKwhTotal: 20, 
            solarKwhTotal: 10,
            electricityProvider: 'veco'
        }
    ];

    describe('calculateKpiMetrics', () => {
        it('calculates current bill and projection', () => {
            // Mock Date to ensure consistent "now" during test? 
            // The service uses `new Date()`. For robust tests, we'd mock system time.
            // For this simple example, we assume the test runs in the same month as mockData.
            
            const metrics = calculateKpiMetrics(mockData, currentRate, userBudget);
            
            // Total Grid kWh: 10 + 20 = 30
            // Current Cost: 30 * 12 = 360
            
            const billMetric = metrics.find(m => m.title === 'Current Bill');
            expect(billMetric.cost).toBe('₱360.00');
            
            // Check if icons are present (just check it's defined)
            expect(billMetric.icon).toBeDefined();
        });

        it('identifies over-budget scenarios', () => {
            // Small budget to force over-budget
            const smallBudget = 10; 
            const metrics = calculateKpiMetrics(mockData, currentRate, smallBudget);
            
            const projectedMetric = metrics.find(m => m.title === 'Projected Bill');
            expect(projectedMetric.definition).toBe('Over Budget');
            expect(projectedMetric.trendIcon).toBe('⚠️');
        });
    });

    describe('calculateBreakdownStats', () => {
        it('calculates grid cost vs solar savings', () => {
            const stats = calculateBreakdownStats(mockData, currentRate);
            
            // Grid: 30 kWh * 12 = 360
            // Solar: 15 kWh * 12 = 180
            
            expect(stats.gridCost).toBe(360);
            expect(stats.solarSavings).toBe(180);
        });
    });

    describe('calculateBillingHistory', () => {
        it('aggregates data by month', () => {
            const history = calculateBillingHistory(mockData, currentRate);
            
            expect(history).toHaveLength(1); // All data is same month
            
            const monthData = history[0];
            expect(monthData.kwh).toBe('30.00');
            expect(monthData.cost).toBe('360.00');
            expect(monthData.provider).toBe('veco');
        });
    });

    describe('processDataForCharts', () => {
        it('formats data for plotting', () => {
            const chartData = processDataForCharts(mockData, 'Daily', currentRate);
            
            // Expect reversed order (latest first? logic says rawData.slice.reverse)
            // Service: rawData.slice(0, 7).reverse()
            // mockData is [Day1, Day2] (oldest to newest usually? wait, service logic depends on input order)
            // Usually Firestore returns ordered?
            // If input is [Day1, Day2], slice is [Day1, Day2], reverse is [Day2, Day1]
            
            expect(chartData.yUsage).toHaveLength(2);
            expect(chartData.yUsage[0]).toBe(20); // Day 2 (latest)
            expect(chartData.yUsage[1]).toBe(10); // Day 1
            
            expect(chartData.yCost[0]).toBe(20 * 12);
        });
    });
});
