// src/data/kobeTours.js

export const tourSteps = {
  // --- HOME DASHBOARD ---
  "Home": [
    {
      targetId: 'overview-header',
      title: 'Welcome to EnerGreen!',
      message: 'I am Kobe, your personal guide. This is your main dashboard where you can see a high-level overview of your energy stats.',
      voiceText: 'Welcome to Ener Green! I am Kobe, your personal guide. This is your main dashboard.'
    },
    {
      targetId: 'overview-metrics',
      title: 'Key Metrics',
      message: 'Here you can see a snapshot of your daily performance, including current costs, grid vs. solar usage, and your carbon savings.',
      voiceText: 'Here you can see a snapshot of your daily performance.'
    },
    {
      targetId: 'energy-card',
      title: 'Real-Time Monitoring',
      message: 'This section shows your current power usage in real-time. Watch it change as you turn appliances on and off!',
      voiceText: 'This section shows your current power usage in real time.'
    },
    {
      targetId: 'charts-section',
      title: 'Detailed Analytics',
      message: 'Use these charts to analyze your consumption over time (daily, weekly, monthly). You can spot trends and identify where to save.',
      voiceText: 'Use these charts to analyze your consumption over time.'
    }
  ],

  // --- FORECAST PAGE ---
  "Forecast": [
    {
      targetId: 'forecast-header',
      title: 'Future Insights',
      message: 'Welcome to the Forecast page! Here, we use AI to predict your future energy generation and consumption.',
      voiceText: 'Welcome to the Forecast page! Here, we use AI to predict your future energy generation and consumption.'
    },
    {
      targetId: 'generation-forecast',
      title: 'Solar Generation Forecast',
      message: 'This chart predicts how much energy your solar panels will produce in the coming days based on weather data.',
      voiceText: 'This chart predicts how much energy your solar panels will produce in the coming days.'
    },
    {
      targetId: 'consumption-forecast',
      title: 'Consumption Prediction',
      message: 'We also estimate your future usage. Use this to plan high-energy tasks on sunny days to save money!',
      voiceText: 'We also estimate your future usage. Use this to plan high-energy tasks on sunny days.'
    }
  ],

  // --- APPLIANCES PAGE ---
  "Appliances": [
    {
      targetId: 'appliances-header',
      title: 'Smart Appliance Control',
      message: 'Manage all your connected smart plugs and devices from this single hub.',
      voiceText: 'Manage all your connected smart plugs and devices from this single hub.'
    },
    {
      targetId: 'add-device-btn',
      title: 'Add New Devices',
      message: 'Got a new smart plug? Click here to pair it with your EnerGreen system.',
      voiceText: 'Got a new smart plug? Click here to pair it with your EnerGreen system.'
    },
    {
      targetId: 'device-list',
      title: 'Device List',
      message: 'Here are your active devices. You can toggle them on/off remotely or view their individual consumption.',
      voiceText: 'Here are your active devices. You can toggle them on or off remotely.'
    }
  ],

  // --- COST PAGE ---
  "Cost": [
    {
      targetId: 'cost-header',
      title: 'Cost Analysis',
      message: 'Track your electricity expenses and bill projections here.',
      voiceText: 'Track your electricity expenses and bill projections here.'
    },
    {
      targetId: 'projected-bill',
      title: 'Projected Bill',
      message: 'This is an estimate of your next monthly bill based on your current usage patterns.',
      voiceText: 'This is an estimate of your next monthly bill.'
    },
    {
      targetId: 'savings-card',
      title: 'Total Savings',
      message: 'See how much money you have saved by using solar energy instead of the grid.',
      voiceText: 'See how much money you have saved by using solar energy.'
    }
  ],

  // --- SOLAR PANEL PAGE ---
  "SolarPanel": [
    {
      targetId: 'solar-header',
      title: 'Solar System Health',
      message: 'Monitor the performance and status of your solar panel setup.',
      voiceText: 'Monitor the performance and status of your solar panel setup.'
    },
    {
      targetId: 'realtime-solar',
      title: 'Real-Time Generation',
      message: 'See exactly how much power your panels are producing right now.',
      voiceText: 'See exactly how much power your panels are producing right now.'
    },
    {
      targetId: 'roi-calculator',
      title: 'ROI Calculator',
      message: 'Check your Return on Investment to see when your system will pay for itself.',
      voiceText: 'Check your Return on Investment to see when your system will pay for itself.'
    }
  ],
  
    // --- CARBON EMISSION PAGE ---
  "CarbonEmission": [
    {
      targetId: 'carbon-header',
      title: 'Environmental Impact',
      message: 'Track your carbon footprint and contribution to a greener planet.',
      voiceText: 'Track your carbon footprint and contribution to a greener planet.'
    },
    {
      targetId: 'emission-stats',
      title: 'Emission Stats',
      message: 'View your total CO2 emissions compared to the average household.',
      voiceText: 'View your total CO2 emissions compared to the average household.'
    },
    {
      targetId: 'trees-planted',
      title: 'Trees Equivalent',
      message: 'We convert your savings into "Trees Planted" to help you visualize your positive impact!',
      voiceText: 'We convert your savings into Trees Planted to help you visualize your positive impact!'
    }
  ],

  // --- SIMULATION PAGE ---
  "Simulation": [
    {
      targetId: 'simulation-header',
      title: 'Solar Simulator',
      message: 'Curious about going solar? Use this tool to estimate your potential savings and system cost.',
      voiceText: 'Curious about going solar? Use this tool to estimate your potential savings and system cost.'
    },
    {
      targetId: 'simulation-inputs',
      title: 'Customize Your Setup',
      message: 'Enter your average monthly bill and adjust the slider to change the size of the solar system you want to simulate.',
      voiceText: 'Enter your average monthly bill and adjust the slider to change the size of the solar system.'
    },
    {
      targetId: 'simulation-results',
      title: 'Estimated Results',
      message: 'See how much you could save monthly, your new estimated bill, and how long it would take for the system to pay for itself.',
      voiceText: 'See how much you could save monthly, your new estimated bill, and your payback period.'
    }
  ]
};
