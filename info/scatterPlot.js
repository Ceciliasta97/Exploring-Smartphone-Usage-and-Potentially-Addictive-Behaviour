

(function() {
const container = document.getElementById("chart_scatterplot");
const width =container.clientWidth*0.6;
const height = container.clientHeight;
const margin = { top: 20, right: 40, bottom: 70, left: 80 };

const svg = d3
  .select("#chart_scatterplot")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip_scatterplot");
const genderButton = document.getElementById("genderButton");
const genderMenu = document.getElementById("genderMenu");
const genderSelected = document.getElementById("genderSelected");
const genderOptions = document.querySelectorAll(".select-option");
const ageMinInput = document.getElementById("ageMin");
const ageMaxInput = document.getElementById("ageMax");
const ageMinLabel = document.getElementById("ageMinLabel");
const ageMaxLabel = document.getElementById("ageMaxLabel");
const sliderTrack = document.getElementById("sliderTrack");

/**
 * Converts one value to a common scale between 0 and 1.
 * 
 * This is used so that variables with very different units,
 * can be compared and combined in the same formula.
 * 
 * The function takes the current value and places it
 * between the minimum and maximum values of that variable.
 * 
 * If the minimum and maximum are the same, it returns 0
 * to avoid dividing by zero.
 */

function normalise(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

d3.csv("Data.csv").then(rawData => {
  const data = rawData.map(d => ({
  transaction_id: d.transaction_id,
  user_id: d.user_id,
  age: +d.age,
  gender: d.gender,
  daily_screen_time_hours: +d.daily_screen_time_hours,
  social_media_hours: +d.social_media_hours,
  gaming_hours: +d.gaming_hours,
  work_study_hours: +d.work_study_hours,
  sleep_hours: +d.sleep_hours,
  notifications_per_day: +d.notifications_per_day,
  app_opens_per_day: +d.app_opens_per_day,
  weekend_screen_time: +d.weekend_screen_time,
  stress_level:
    d.stress_level === "Low" ? 1 :
    d.stress_level === "Medium" ? 2 :
    d.stress_level === "High" ? 3 : NaN,
  academic_work_impact:
    d.academic_work_impact === "No" ? 0 :
    d.academic_work_impact === "Yes" ? 1 : NaN,
  addiction_level: d.addiction_level,
  addicted_label: +d.addicted_label
}));

  console.log("Loaded data:", data);

  const cleanData = data.filter(d =>
  !isNaN(d.daily_screen_time_hours) &&
  !isNaN(d.social_media_hours) &&
  !isNaN(d.sleep_hours) &&
  !isNaN(d.notifications_per_day) &&
  !isNaN(d.app_opens_per_day) &&
  !isNaN(d.weekend_screen_time) &&
  !isNaN(d.stress_level) &&
  !isNaN(d.academic_work_impact)
);

console.log("Clean data:", cleanData.length);

cleanData.forEach(d => {
  const level = d.addiction_level ? d.addiction_level.trim().toLowerCase() : "";

  if (level === "mild") {
    d.addiction_stage_num = 1;
    d.addiction_stage_label = "Mild";
  } else if (level === "moderate") {
    d.addiction_stage_num = 2;
    d.addiction_stage_label = "Moderate";
  } else if (level === "severe") {
    d.addiction_stage_num = 3;
    d.addiction_stage_label = "Severe";
  } else if (d.addicted_label === 0) {
    d.addiction_stage_num = 0;
    d.addiction_stage_label = "None";
  } else {
    d.addiction_stage_num = null;
    d.addiction_stage_label = "Unknown";
  }
});

const finalData = cleanData.filter(d => d.addiction_stage_num !== null);
console.log("Final data:", finalData.length);

/**
 * These values store the minimum and maximum of each variable.
 * They are needed for min-max normalisation.
 */

const screenMin = d3.min(finalData, d => d.daily_screen_time_hours);
const screenMax = d3.max(finalData, d => d.daily_screen_time_hours);

const socialMin = d3.min(finalData, d => d.social_media_hours);
const socialMax = d3.max(finalData, d => d.social_media_hours);

const notifMin = d3.min(finalData, d => d.notifications_per_day);
const notifMax = d3.max(finalData, d => d.notifications_per_day);

const opensMin = d3.min(finalData, d => d.app_opens_per_day);
const opensMax = d3.max(finalData, d => d.app_opens_per_day);

const stressMin = d3.min(finalData, d => d.stress_level);
const stressMax = d3.max(finalData, d => d.stress_level);

const impactMin = d3.min(finalData, d => d.academic_work_impact);
const impactMax = d3.max(finalData, d => d.academic_work_impact);

const sleepMin = d3.min(finalData, d => d.sleep_hours);
const sleepMax = d3.max(finalData, d => d.sleep_hours);

/**
 * Calculates the Risk Score Index for each user.
 * 
 * First, each selected variable is normalised to a 0 to 1 scale.
 * Then the values are combined into one composite score.
 * 
 * Higher values of screen time, social media use, notifications,
 * app opens, stress, and academic impact increase the score.
 * Sleep hours are inverted because less sleep is treated as
 * a higher risk behaviour.
 * 
 * The final result is multiplied by 100 so the index can be
 * read on a 0 to 100 scale.
 */

finalData.forEach(d => {
  const S = normalise(d.daily_screen_time_hours, screenMin, screenMax);
  const SM = normalise(d.social_media_hours, socialMin, socialMax);
  const N = normalise(d.notifications_per_day, notifMin, notifMax);
  const O = normalise(d.app_opens_per_day, opensMin, opensMax);
  const T = normalise(d.stress_level, stressMin, stressMax);
  const A = normalise(d.academic_work_impact, impactMin, impactMax);
  const H = normalise(d.sleep_hours, sleepMin, sleepMax);

  d.risk_score_index = 100 * (
    S + SM + N + O + T + A + (1 - H)
  ) / 7;
});

console.log("Sample with risk score:", finalData.slice(0, 10));

const xScale = d3.scalePoint()
  .domain(["None", "Mild", "Moderate", "Severe"])
  .range([0, chartWidth])
  .padding(0.5);

const yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([chartHeight, 0]);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

g.append("g")
  .attr("class", "grid")
  .call(
    d3.axisLeft(yScale)
      .tickSize(-chartWidth)
      .tickFormat("")
  )
  .selectAll("line")
  .attr("stroke", "#e0e0e0");

g.select(".grid path").remove();

g.append("g")
  .attr("transform", `translate(0, ${chartHeight})`)
  .call(xAxis);

g.append("g")
  .call(yAxis);

g.append("text")
  .attr("class", "axis-label")
  .attr("x", chartWidth / 2)
  .attr("y", chartHeight + 50)
  .attr("text-anchor", "middle")
  .text("Addiction Level");

g.append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -chartHeight / 2)
  .attr("y", -55)
  .attr("text-anchor", "middle")
  .text("Risk Score Index (0–100)");

function jitter(amount = 40) {
  return (Math.random() - 0.5) * amount;
}

const colorScale = d3.scaleOrdinal()
  .domain(["None", "Mild", "Moderate", "Severe"])
  .range(["#F9B487", "#F7A5A5", "#427A76", "#174143"]);

/**
 * Draws the scatterplot points for the users that match
 * the current filters.
 * 
 * Each point represents one user.
 * The x-position is based on addiction level,
 * and the y-position is based on the Risk Score Index.
 * 
 * The function removes old points before drawing new ones,
 * so the chart updates correctly when the gender or age
 * filters change.
 */

function drawPoints(filteredData) {
  g.selectAll(".point").remove();

  g.selectAll(".point")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", d => xScale(d.addiction_stage_label) + jitter(40))
    .attr("cy", d => yScale(d.risk_score_index))
    .attr("r", 4)
    .attr("fill", d => colorScale(d.addiction_stage_label))
    .attr("opacity", 0.7)
    .on("mouseover", function(event, d) {
      console.log("point value: ",d);
      const hoverStroke =
        d.addiction_stage_label === "Severe" ? "#FFF2EF" : "#1A2A4F";

      d3.select(this)
        .raise()
        .attr("r", 6)
        .attr("opacity", 1)
        .attr("stroke", hoverStroke)
        .attr("stroke-width", 1.5);

      tooltip
        .style("visibility", "visible")
        .style("left", `${event.clientX + 12}px`)
        .style("top", `${event.clientY - 28}px`)
        .html(`
          <strong>User:</strong> ${d.user_id}<br>
          <strong>Gender:</strong> ${d.gender}<br>
          <strong>Addiction level:</strong> ${d.addiction_stage_label}<br>
          <strong>Risk score:</strong> ${d.risk_score_index.toFixed(1)}<br>
          <strong>Sleep hours:</strong> ${d.sleep_hours}<br>
          <strong>Daily screen time:</strong> ${d.daily_screen_time_hours}<br>
          <strong>Social media hours:</strong> ${d.social_media_hours}<br>
          <strong>Stress level:</strong> ${d.stress_level}<br>
          <strong>Notifications/day:</strong> ${d.notifications_per_day}
        `);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("r", 4)
        .attr("opacity", 0.7)
        .attr("stroke", "none")
        .attr("stroke-width", 0);

      tooltip.style("visibility", "hidden");
    });
}

drawPoints(finalData);
let currentGender = "All";
let currentAgeMin = 18;
let currentAgeMax = 35;

genderButton.addEventListener("click", function(e) {
  e.stopPropagation();
  genderMenu.classList.toggle("open");
});

document.addEventListener("click", function() {
  genderMenu.classList.remove("open");
});

/**
 * Adds interaction to the custom gender filter.
 * 
 * When the user clicks one option, the selected value is saved,
 * the dropdown text is updated, the selected style changes,
 * and the chart is filtered again.
 */

genderOptions.forEach(option => {
  option.addEventListener("click", function() {
    const selectedGender = this.dataset.value;
    currentGender = selectedGender;

    genderSelected.textContent = selectedGender;

    genderOptions.forEach(opt => {
      opt.classList.remove("selected");
    });

    this.classList.add("selected");

    genderMenu.classList.remove("open");

    applyFilters();
  });
});

/**
 * Adds interaction to the age range slider.
 * 
 * These listeners update the minimum and maximum age values,
 * refresh the slider track, and apply the filters again.
 * They also prevent the minimum age from going above the
 * maximum age, and the maximum age from going below
 * the minimum age.
 */

ageMinInput.addEventListener("input", function() {
  let minVal = +this.value;
  let maxVal = +ageMaxInput.value;

  if (minVal > maxVal) {
    minVal = maxVal;
    this.value = minVal;
  }

  currentAgeMin = minVal;
  ageMinLabel.textContent = currentAgeMin;
  updateSliderTrack();
  applyFilters();
});

ageMaxInput.addEventListener("input", function() {
  let maxVal = +this.value;
  let minVal = +ageMinInput.value;

  if (maxVal < minVal) {
    maxVal = minVal;
    this.value = maxVal;
  }

  currentAgeMax = maxVal;
  ageMaxLabel.textContent = currentAgeMax;
  updateSliderTrack();
  applyFilters();
});

/**
 * Updates the visual appearance of the age slider track.
 * 
 * It calculates the current left and right positions
 * of the selected age range and colours that part of the bar.
 * This helps the user see the active interval more clearly.
 */

function updateSliderTrack() {
  const min = +ageMinInput.min;
  const max = +ageMaxInput.max;

  const left = ((currentAgeMin - min) / (max - min)) * 100;
  const right = ((currentAgeMax - min) / (max - min)) * 100;

  sliderTrack.style.background = `
    linear-gradient(
      to right,
      rgba(26, 42, 79, 0.18) 0%,
      rgba(26, 42, 79, 0.18) ${left}%,
      rgba(26, 42, 79, 0.88) ${left}%,
      rgba(26, 42, 79, 0.88) ${right}%,
      rgba(26, 42, 79, 0.18) ${right}%,
      rgba(26, 42, 79, 0.18) 100%
    )
  `;
}

/**
 * Filters the dataset using the selected gender
 * and the selected age range.
 * 
 * After filtering the data, it calls drawPoints()
 * to redraw the chart with only the users that
 * match the current filter conditions.
 */

function applyFilters() {
  const filteredData = finalData.filter(d => {
    const genderMatch = currentGender === "All" || d.gender === currentGender;
    const ageMatch = d.age >= currentAgeMin && d.age <= currentAgeMax;
    return genderMatch && ageMatch;
  });

  drawPoints(filteredData);
}

ageMinLabel.textContent = currentAgeMin;
ageMaxLabel.textContent = currentAgeMax;
updateSliderTrack();
applyFilters();

});

})();