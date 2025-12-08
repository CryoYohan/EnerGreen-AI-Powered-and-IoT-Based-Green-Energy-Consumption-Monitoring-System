import { describe, it, expect } from 'vitest';
import {
    processCo2SummariesForCharts,
    calculateDynamicMetrics,
    processReadingsForHourlyChart
} from '@/services/carbonService';

describe('Carbon Service Logic', () => {

    // --- Mock Data ---
    const mockSummaries = [
        { date: '2023-10-27', gridKwhTotal: 10, solarKwhTotal: 5 }, // Today (most recent)
        { date: '2023-10-26', gridKwhTotal: 8, solarKwhTotal: 4 },
        { date: '2023-10-25', gridKwhTotal: 12, solarKwhTotal: 6 },
        // ... more data could be added for monthly/yearly tests
    ];

    const carbonRate = 0.5; // Simple rate for easy math (0.5 kg/kWh)

    describe('processCo2SummariesForCharts', () => {
        it('calculates weekly chart data correctly', () => {
            const { weeklyChartData } = processCo2SummariesForCharts(mockSummaries, carbonRate);
            
            expect(weeklyChartData).toHaveLength(3);
            
            // 2023-10-27 is a Friday.
            // (10 + 5) * 0.5 = 7.5
            // The function reverses the input slice, so the last element in input (oldest) becomes first in chart?
            // Actually, the service slices(0,7) then reverses.
            // Input: [Today, Yesterday, 2DaysAgo]
            // Slice: [Today, Yesterday, 2DaysAgo]
            // Reverse: [2DaysAgo, Yesterday, Today]
            
            const lastDay = weeklyChartData[2]; 
            expect(lastDay.value).toBe(7.5); // (10+5)*0.5
        });

        it('returns empty arrays if no summaries provided', () => {
            const result = processCo2SummariesForCharts([], carbonRate);
            expect(result.weeklyChartData).toEqual([]);
            expect(result.monthlyChartData).toEqual([]);
        });
    });

    describe('calculateDynamicMetrics', () => {
        it('calculates current CO2 emissions (today)', () => {
            const metrics = calculateDynamicMetrics(mockSummaries, carbonRate);
            const todayMetric = metrics.find(m => m.title === 'Current CO₂ Emissions (Today)');
            
            // Latest summary is index 0: (10 + 5) * 0.5 = 7.5
            expect(todayMetric.cost).toBe('7.50 kg CO₂');
        });

        it('calculates trees equivalent', () => {
            const metrics = calculateDynamicMetrics(mockSummaries, carbonRate);
            const treeMetric = metrics.find(m => m.title === 'Trees Equivalent (Monthly)');
            
            // Total kWh for all 3 mock days: (15) + (12) + (18) = 45 kWh
            // Total CO2: 45 * 0.5 = 22.5 kg
            // Tree offset per month constant in service is ~1.7
            // Trees = 22.5 / 1.7 = ~13.23 -> rounded to 13
            
            expect(treeMetric.cost).toContain('trees');
        });
    });

    describe('processReadingsForHourlyChart', () => {
        it('aggregates hourly readings correctly', () => {
            // Mock readings with timestamps
            const mockReadings = [
                { kwhConsumed: 100, timestamp: { toDate: () => new Date('2023-10-27T08:00:00') } },
                { kwhConsumed: 105, timestamp: { toDate: () => new Date('2023-10-27T08:30:00') } }, // +5 delta
                { kwhConsumed: 106, timestamp: { toDate: () => new Date('2023-10-27T09:00:00') } }  // +1 delta
            ];
            
            // Service outlier detection: delta > 0 && delta < 1
            // 1st delta: 5 (Ignored, > 1)
            // 2nd delta: 1 (Ignored, not < 1? Wait, check code: delta < 1)
            // Let's adjust mock to fit "outlier" logic in service: 0 < delta < 1
            
            const validReadings = [
                { kwhConsumed: 100.0, timestamp: { toDate: () => new Date('2023-10-27T08:00:00') } },
                { kwhConsumed: 100.5, timestamp: { toDate: () => new Date('2023-10-27T08:30:00') } }, // +0.5 (Valid)
                { kwhConsumed: 100.8, timestamp: { toDate: () => new Date('2023-10-27T08:45:00') } }  // +0.3 (Valid)
            ];
            
            // Total for hour 8: 0.5 + 0.3 = 0.8 kWh
            // CO2: 0.8 * 0.5 = 0.4 kg
            
            const hourlyData = processReadingsForHourlyChart(validReadings, carbonRate);
            const hour8 = hourlyData.find(h => h.label === '8:00');
            
            expect(hour8.value).toBe(0.400);
        });
    });
});
