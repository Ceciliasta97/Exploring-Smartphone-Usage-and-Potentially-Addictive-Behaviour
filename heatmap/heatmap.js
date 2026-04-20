// Heatmap structure based on:
// https://d3-graph-gallery.com/graph/heatmap_style.html
// Adapted for this dataset.

// Set up chart size
const margin = { top: 120, right: 40, bottom: 80, left: 100 };
const width = 720 - margin.left - margin.right;
const height = 520 - margin.top - margin.bottom;

// Create the SVG and move the chart area inside the margins
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Select the tooltip div from the HTML
const tooltip = d3.select("#tooltip");

// Define bins for screen time
const screenBins = [
  { label: "3–5", min: 3, max: 5 },
  { label: "5–7", min: 5, max: 7 },
  { label: "7–9", min: 7, max: 9 },
  { label: "9–11", min: 9, max: 11 },
  { label: "11–12", min: 11, max: 13 }
];

// Define bins for sleep
const sleepBins = [
  { label: "4.5–5.5", min: 4.5, max: 5.5 },
  { label: "5.5–6.5", min: 5.5, max: 6.5 },
  { label: "6.5–7.5", min: 6.5, max: 7.5 },
  { label: "7.5–8.5", min: 7.5, max: 8.5 },
  { label: "8.5–9.5", min: 8.5, max: 9.5 }
];

// Define bins for stress
const stressBins = [
  { label: "Low", min: 1, max: 1.5 },
  { label: "Medium", min: 1.5, max: 2.5 },
  { label: "High", min: 2.5, max: 3.5 }
];

// Define bins for work/study hours
const workStudyBins = [
  { label: "0.5–1.5", min: 0.5, max: 1.5 },
  { label: "1.5–2.5", min: 1.5, max: 2.5 },
  { label: "2.5–3.5", min: 2.5, max: 3.5 },
  { label: "3.5–4.5", min: 3.5, max: 4.5 },
  { label: "4.5–6", min: 4.5, max: 6.5 }
];

// Define bins for notifications per day
const notificationBins = [
  { label: "20–60", min: 20, max: 60 },
  { label: "60–100", min: 60, max: 100 },
  { label: "100–140", min: 100, max: 140 },
  { label: "140–180", min: 140, max: 180 },
  { label: "180+", min: 180, max: Infinity }
];

// Define bins for app opens per day
const appBins = [
  { label: "15–45", min: 15, max: 45 },
  { label: "45–75", min: 45, max: 75 },
  { label: "75–105", min: 75, max: 105 },
  { label: "105–135", min: 105, max: 135 },
  { label: "135+", min: 135, max: Infinity }
];

// Find which bin a numeric value belongs to
function getBinLabel(value, bins) {
  const match = bins.find(bin => value >= bin.min && value < bin.max);
  return match ? match.label : null;
}

// Convert addiction categories into numbers so they can be averaged
function parseAddictionLevel(value) {
  if (value === "Mild") return 1;
  if (value === "Moderate") return 2;
  if (value === "Severe") return 3;
  return NaN;
}

// Convert stress categories into numbers so they can be binned
function parseStressLevel(value) {
  if (value === "Low") return 1;
  if (value === "Medium") return 2;
  if (value === "High") return 3;
  return NaN;
}

// Convert the average addiction score back into a category for the tooltip
function getAddictionLabel(avg) {
  if (avg === null) return "No data";
  if (avg < 1.5) return "Mild";
  if (avg < 2.5) return "Moderate";
  return "Severe";
}

// Variable settings for the dropdown
const variableSettings = {
  sleep: {
    key: "sleep",
    label: "Sleep Hours",
    bins: sleepBins
  },
  stress: {
    key: "stress",
    label: "Stress Level",
    bins: stressBins
  },
  workStudy: {
    key: "workStudy",
    label: "Work/Study Hours",
    bins: workStudyBins
  },
  notifications: {
    key: "notifications",
    label: "Notifications per Day",
    bins: notificationBins
  },
  apps: {
    key: "apps",
    label: "App Opens per Day",
    bins: appBins
  }
};

// Load the CSV file once
d3.csv("Smartphone_Usage_And_Addiction_Analysis_7500_Rows.csv", d => ({
  screen: +d["daily_screen_time_hours"],
  sleep: +d["sleep_hours"],
  stress: parseStressLevel(d["stress_level"]),
  addiction: parseAddictionLevel(d["addiction_level"]),
  workStudy: +d["work_study_hours"],
  notifications: +d["notifications_per_day"],
  apps: +d["app_opens_per_day"],
})).then(data => {

  // Remove rows with missing or invalid values
  const filtered = data.filter(d =>
    !Number.isNaN(d.screen) &&
    !Number.isNaN(d.addiction)
  );

  // Draw default heatmap
  drawHeatmap(filtered, "sleep");

  // Update heatmap when dropdown changes
  d3.select("#yVariableSelect").on("change", function() {
    const selectedVariable = this.value;
    drawHeatmap(filtered, selectedVariable);
  });
}).catch(error => {
  console.error("Error loading or processing CSV:", error);
});

// Function to draw or redraw the heatmap
function drawHeatmap(data, selectedVariable) {
  const settings = variableSettings[selectedVariable];
  const yBins = settings.bins;
  const yKey = settings.key;
  const yLabel = settings.label;

  // Only keep rows that have a value for the selected Y variable
  const usableData = data.filter(d =>
    !Number.isNaN(d[yKey])
  );

  // Clear old chart elements before redrawing
  svg.selectAll("*").remove();

  // Build the heatmap cells
  const cells = [];

  for (const sBin of screenBins) {
    for (const yBin of yBins) {
      const matches = usableData.filter(d =>
        d.screen >= sBin.min && d.screen < sBin.max &&
        d[yKey] >= yBin.min && d[yKey] < yBin.max
      );

      cells.push({
        screen: sBin.label,
        yValue: yBin.label,
        avgAddiction: matches.length ? d3.mean(matches, d => d.addiction) : null,
        count: matches.length
      });
    }
  }

  // Create scales
  const x = d3.scaleBand()
    .domain(screenBins.map(d => d.label))
    .range([0, width])
    .padding(0.05);

  const y = d3.scaleBand()
    .domain(yBins.map(d => d.label))
    .range([height, 0])
    .padding(0.05);

  const color = d3.scaleSequential()
    .domain([1, 3])
    .interpolator(d3.interpolateOrRd);

  // Draw axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Add chart title
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text(`Average Addiction Level by Screen Time and ${yLabel}`);

  // Add axis labels
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 55)
    .attr("text-anchor", "middle")
    .text("Daily Screen Time (hours)");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -65)
    .attr("text-anchor", "middle")
    .text(yLabel);

  // Draw heatmap cells
  svg.selectAll("rect.heat-cell")
    .data(cells)
    .join("rect")
    .attr("class", "heat-cell")
    .attr("x", d => x(d.screen))
    .attr("y", d => y(d.yValue))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => d.avgAddiction === null ? "#e5e5e5" : color(d.avgAddiction))
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1)
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("stroke", "#222")
        .attr("stroke-width", 2);

      tooltip
        .style("opacity", 1)
        .html(`
          <strong>Daily screen time:</strong> ${d.screen} hours<br>
          <strong>${yLabel}:</strong> ${d.yValue}<br>
          <strong>Users in bin:</strong> ${d.count}<br>
          <strong>Average addiction score:</strong> ${d.avgAddiction === null ? "No data" : d.avgAddiction.toFixed(2)}<br>
          <strong>Approx. addiction band:</strong> ${getAddictionLabel(d.avgAddiction)}
        `);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY + 12}px`);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);

      tooltip.style("opacity", 0);
    });

  // Draw legend
  const legendWidth = 240;
  const legendHeight = 12;
  const legendX = width - legendWidth;
  const legendY = -90;

  const defs = svg.append("defs");

  const gradient = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateOrRd(0));

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateOrRd(1));

  svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendX)
    .attr("y", legendY - 8)
    .text("Average addiction level");

  svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "url(#legend-gradient)")
    .attr("stroke", "#ccc");

  svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendX)
    .attr("y", legendY + legendHeight + 15)
    .text("Mild");

  svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", legendY + legendHeight + 15)
    .attr("text-anchor", "middle")
    .text("Moderate");

  svg.append("text")
    .attr("class", "legend-label")
    .attr("x", legendX + legendWidth)
    .attr("y", legendY + legendHeight + 15)
    .attr("text-anchor", "end")
    .text("Severe");
}