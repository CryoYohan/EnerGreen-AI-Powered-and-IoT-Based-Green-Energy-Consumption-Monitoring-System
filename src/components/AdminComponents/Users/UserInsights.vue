<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      Advanced Insights
    </h2>
    <div ref="lineChart"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Plotly from "plotly.js-dist-min";

// ✅ Mock data
const insights = {
  growthRate: [10, 12, 14, 15],
  churnRate: [4, 5, 6, 5],
  onlineUsers: [25, 28, 32, 37],
  topHero: "Hero123",
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"]
};

const lineChart = ref(null);

const renderChart = () => {
  const data = [
    {
      x: insights.labels,
      y: insights.growthRate,
      type: "scatter",
      mode: "lines+markers",
      name: "Growth Rate",
      line: { color: "rgb(34,139,34)", width: 3 }, // forest green
      marker: { color: "rgb(34,139,34)", size: 6 }
    },
    {
      x: insights.labels,
      y: insights.churnRate,
      type: "scatter",
      mode: "lines+markers",
      name: "Churn Rate",
      line: { color: "rgb(178,34,34)", width: 3 }, // muted dark red
      marker: { color: "rgb(178,34,34)", size: 6 }
    },
    {
      x: insights.labels,
      y: insights.onlineUsers,
      type: "scatter",
      mode: "lines+markers",
      name: "Online Users",
      line: { color: "rgb(30,64,175)", width: 3 }, // dark blue
      marker: { color: "rgb(30,64,175)", size: 6 }
    }
  ];

  const layout = {
    margin: { t: 40, b: 50, l: 50, r: 20 },
    height: 350,
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    xaxis: { title: "Time", showgrid: false, zeroline: false },
    yaxis: { title: "Values", showgrid: true, zeroline: false },
    legend: {
      orientation: "h",
      y: -0.3,
      x: 0.5,
      xanchor: "center",
      font: { size: 12, color: "#374151" }
    },
    annotations: [
      {
        text: `🏆 Top Hero: <b>${insights.topHero}</b>`,
        xref: "paper",
        yref: "paper",
        x: 1,
        y: 1.15,
        showarrow: false,
        font: { size: 14, color: "rgb(34,139,34)" }
      }
    ]
  };

  Plotly.newPlot(lineChart.value, data, layout, { responsive: true });
};

onMounted(renderChart);
</script>

<style>
#lineChart {
  height: 350px !important;
}
</style>
