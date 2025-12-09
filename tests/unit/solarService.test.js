import { describe, it, expect } from 'vitest';
import {
    calculateMetrics,
    calculateImpact,
    processDataForChart
} from '@/services/solarService';

describe('Solar Service Logic', () => {

    // --- Mock Data ---
    // Hourly data structure
    const mockHourlyData = [
        { hour: '10:00', solar: 2.5, grid: 0.5 },
        { hour: '11:00', solar: 3.0, grid: 0 },
    ];
    
    // Daily summary structure
    const mockDailySummaries = [
        { date: '2023-10-27', solarKwhTotal: 10, gridKwhTotal: 5 },
        { date: '2023-10-26', solarKwhTotal: 8, gridKwhTotal: 8 },
    ];

    describe('calculateMetrics', () => {
        it('calculates daily view metrics correctly', () => {
            // isDaily = true, uses hourly data array
            const metrics = calculateMetrics(mockHourlyData, true);
            
            // Total Solar: 2.5 + 3.0 = 5.5
            // Total Grid: 0.5 + 0 = 0.5
            // Total: 6.0
            // Independence: (5.5 / 6.0) * 100 = 91.666... -> 91.7%
            
            const solarMetric = metrics.find(m => m.title === 'Solar Generation');
            const gridMetric = metrics.find(m => m.title === 'Grid Usage');
            const indepMetric = metrics.find(m => m.title === 'Energy Independence');

            expect(solarMetric.value).toBe('5.5 kWh');
            expect(gridMetric.value).toBe('0.5 kWh');
            expect(indepMetric.value).toBe('91.7%');
        });

        it('calculates historical view metrics correctly', () => {
            // isDaily = false, uses summaries array
            const metrics = calculateMetrics(mockDailySummaries, false);
            
            // Total Solar: 10 + 8 = 18
            // Total Grid: 5 + 8 = 13
            // Total: 31
            // Independence: (18 / 31) * 100 = 58.06 -> 58.1%
            
            expect(metrics[0].value).toBe('18.0 kWh');
            expect(metrics[2].value).toBe('58.1%');
        });
    });

    describe('calculateImpact', () => {
        const rate = 10; // 10 currency units per kWh
        const carbonRate = 0.5; // 0.5 kg CO2 per kWh

        it('calculates savings and environmental impact', () => {
            const impact = calculateImpact(mockHourlyData, true, rate, carbonRate);
            
            // Solar total: 5.5
            // Savings: 5.5 * 10 = 55.00
            // CO2 Avoided: 5.5 * 0.5 = 2.7500
            
            expect(impact.savingsValue).toBe('55.00');
            expect(impact.co2Avoided).toBe('2.7500');
        });
    });

    describe('processDataForChart', () => {
        it('processes daily (hourly) data correctly', () => {
            const chartData = processDataForChart([], mockHourlyData, 'Daily');
            
            expect(chartData.xValues).toEqual(['10:00', '11:00']);
            expect(chartData.ySolar).toEqual([2.5, 3.0]);
            expect(chartData.yGrid).toEqual([0.5, 0]);
        });

        it('processes weekly data correctly', () => {
            const chartData = processDataForChart(mockDailySummaries, [], 'Weekly');
            
            // Should slice(0,7) and reverse.
            // Input: [Oct 27, Oct 26]
            // Output: [Oct 26, Oct 27]
            
            expect(chartData.ySolar).toEqual([8, 10]);
            expect(chartData.yGrid).toEqual([8, 5]);
        });
    });
});
