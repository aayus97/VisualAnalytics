// Parse query parameters
const queryParams = new URLSearchParams(window.location.search);

// Get parameters from the query string
const age = queryParams.get("age");
const sex = queryParams.get("sex");
const timeSpent = queryParams.get("timeSpent");
const comments = queryParams.get("comments");
const depression = queryParams.get("depression");
const anxiety = queryParams.get("anxiety");

// Depression and Anxiety Icons
const depressionIcons = {
  Severe: "images/severe.png",
  Moderate: "images/moderate.png",
  Mild: "images/mild.png",
  Minimal: "images/minimal.png",
  "Moderately Severe": "images/moderately_severe.png",
};

const anxietyIcons = depressionIcons; // Assume same icons for simplicity

// Update Basic Info
document.getElementById("age").textContent = age;
document.getElementById("sex").textContent = sex;
document.getElementById("time-spent").textContent = `${timeSpent} hours`;

// Set Sex Icon
document.getElementById("sex-icon").src = sex === "male" ? "images/boy.png" : "images/girl.png";

// Update Comments
document.getElementById("comment-text").textContent = comments;

// Update Mental Health Levels
document.getElementById("depression").textContent = depression;
document.getElementById("anxiety").textContent = anxiety;
document.getElementById("depression-icon").src = depressionIcons[depression] || "images/default.png";
document.getElementById("anxiety-icon").src = anxietyIcons[anxiety] || "images/default.png";

// Time Visualization
const timeSvg = d3.select("#time-visual")
  .append("svg");

const totalHours = 24; // Represent a day
const barWidth = 400; // Width of the time bar
const barHeight = 20; // Height of the time bar

timeSvg
  .attr("width", barWidth + 40)
  .attr("height", barHeight + 40);

timeSvg.append("rect")
  .attr("x", 20)
  .attr("y", 10)
  .attr("width", barWidth)
  .attr("height", barHeight)
  .attr("fill", "#e0e0e0");

timeSvg.append("rect")
  .attr("x", 20)
  .attr("y", 10)
  .attr("width", (timeSpent / totalHours) * barWidth)
  .attr("height", barHeight)
  .attr("fill", "#007bff");

timeSvg.append("text")
  .attr("x", 20 + (timeSpent / totalHours) * barWidth + 5)
  .attr("y", 25)
  .attr("font-size", "12px")
  .attr("fill", "#333")
  .text(`${timeSpent} hrs`);

// Back to Main Visuals
document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "index1.html";
});
