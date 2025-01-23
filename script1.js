function updatePageBackgroundWordCloud(data) {
  const wordCloudSvg = d3.select("#background-word-cloud");
  wordCloudSvg.selectAll("*").remove(); // Clear previous word cloud

  const width = window.innerWidth * 3; // Use innerWidth for better compatibility
  const height = window.innerHeight * 3;

  const wordCounts = data.reduce((acc, d) => {
    d.words.forEach(word => {
      acc[word] = (acc[word] || 0) + 1;
    });
    return acc;
  }, {});

  const wordCloudData = Object.keys(wordCounts).map(word => ({
    text: word,
    size: wordCounts[word] * 10, // Scale size based on frequency
  }));

  const layout = d3.layout.cloud()
    .size([width, height])
    .words(wordCloudData)
    .rotate(() => (Math.random() > 0.5 ? 0 : 90)) // Random rotation
    .fontSize(d => d.size)
    .on("end", draw);

  layout.start();

  function draw(words) {
    console.log("Word cloud rendering words:", words);
    wordCloudSvg.attr("width", width).attr("height", height);

    wordCloudSvg.selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", d => `${d.size}px`)
      .style("fill", (_, i) => d3.schemeCategory10[i % 10])
      .attr("text-anchor", "middle")
      .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .text(d => d.text);
  }
}

// Load dataset and call the word cloud function
d3.csv("dataset.csv").then(data => {
  const transformedData = data.map(d => ({
    words: [d.Word_1, d.Word_2, d.Word_3, d.Word_4, d.Word_5, d.Word_6, d.Word_7, d.Word_8, d.Word_9, d.Word_10]
  }));
  updatePageBackgroundWordCloud(transformedData);
});








// Tooltip setup
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");



// Set up SVG
const svg = d3.select("#visualization")
  .attr("width", 800)
  .attr("height", 800);

const width = +svg.attr("width");
const height = +svg.attr("height");

// Paths to male and female PNG icons
const maleIconPath = "images/boy.png";
const femaleIconPath = "images/girl.png";

// Load the dataset
const datasetUrl = "dataset.csv";

d3.csv(datasetUrl).then(data => {
  // Preprocess data
  data.forEach(d => {
    d.age = +d.age;
    d.Sex = d.Sex.trim().toLowerCase();
    d.num_hours_used = +d.num_hours_used || "Unknown";
    d.comments = Array.from({ length: 10 }, (_, i) => d[`Word_${i + 1}`]).filter(Boolean).join(", ");
    d.anxiety = d["GAD7 Category"] || "N/A";
    d.depression = d["PHQ9 Category"] || "N/A";
  });

  

  data = data.filter(d => !isNaN(d.age) && d.Sex);

  // Update Stats
  function updateStats(data) {
    const total = data.length;
    const males = data.filter(d => d.Sex === "male").length;
    const females = data.filter(d => d.Sex === "female").length;

    const malePercentage = ((males / total) * 100).toFixed(2);
    const femalePercentage = ((females / total) * 100).toFixed(2);

    document.getElementById("total-count").textContent = `Total: ${total}`;
    document.getElementById("male-count").textContent = `Males: ${males} (${malePercentage}%)`;
    document.getElementById("female-count").textContent = `Females: ${females} (${femalePercentage}%)`;

    document.getElementById("scorecard").style.display = "block";
  }

  // Hide Stats
  function hideStats() {
    document.getElementById("scorecard").style.display = "none";
  }

// Grid View
function renderGridView(data) {
  svg.selectAll("*").remove(); // Clear the SVG
  updateStats(data); // Update the stats dynamically

  const totalIcons = data.length;
  const numCols = Math.ceil(Math.sqrt(totalIcons));
  const iconSize = Math.min(width / numCols, height / numCols) * 1.1;

  svg.selectAll("image")
    .data(data)
    .join("image")
    .attr("xlink:href", d => (d.Sex === "male" ? maleIconPath : femaleIconPath))
    .attr("x", (d, i) => (i % numCols) * iconSize + iconSize / 2 - iconSize * 0.3) // Initial X position
    .attr("y", height) // Start from the bottom of the SVG (animation starts here)
    .attr("width", 0) // Start with zero width (for animation effect)
    .attr("height", 0) // Start with zero height (for animation effect)
    .transition() // Apply transition
    .duration(1000) // Animation duration in milliseconds
    .attr("x", (d, i) => (i % numCols) * iconSize + iconSize / 2 - iconSize * 0.3) // Final X position
    .attr("y", (d, i) => Math.floor(i / numCols) * iconSize + iconSize / 2 - iconSize * 0.3) // Final Y position
    .attr("width", iconSize * 0.6) // Final width
    .attr("height", iconSize * 0.6) // Final height;

  svg.selectAll("image") // Add interactivity after the animation
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`Age: ${d.age}<br>Sex: ${d.Sex}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .on("click", (event, d) => {
      redirectToDetailsPage(d); // Redirect to the details page on click
    });
}

// Redirect to details page
function redirectToDetailsPage(person) {
  const queryParams = new URLSearchParams({
    age: person.age,
    sex: person.Sex,
    timeSpent: person.num_hours_used,
    comments: person.comments,
    depression: person.depression,
    anxiety: person.anxiety,
  }).toString();

  // Redirect to details.html with query string
  window.location.href = `details.html?${queryParams}`;
}



// Gender Bar Chart
function renderGenderBarChart(data) {
  svg.selectAll("*").remove();
  hideStats();

  const groupedData = d3.rollup(data, v => v.length, d => d.Sex);
  const genderData = Array.from(groupedData, ([key, value]) => ({ Sex: key, Count: value }));

  const barWidth = width / genderData.length;
  const maxRows = 5;
  const iconSize = Math.min(barWidth / maxRows, height / 20);

  genderData.forEach((d, index) => {
    const xOffset = index * barWidth + barWidth / 2 - (maxRows * iconSize) / 2;

    // Append the icons with transitions
    svg.selectAll(`image.${d.Sex}`)
      .data(d3.range(d.Count))
      .join("image")
      .attr("xlink:href", d.Sex === "male" ? maleIconPath : femaleIconPath)
      .attr("x", (i) => xOffset + (i % maxRows) * iconSize)
      .attr("y", height) // Start from the bottom
      .transition() // Add transition
      .duration(1000) // Duration of the transition
      .attr("y", (i) => height - Math.floor(i / maxRows) * iconSize - iconSize - 10) // Final y position
      .attr("width", iconSize * 0.8)
      .attr("height", iconSize * 0.8)
      .attr("class", d.Sex);

    // Append the count text at the top and transition it
    const text = svg
      .append("text")
      .attr("x", index * barWidth + barWidth / 2)
      .attr("y", height) // Start at the bottom
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(d.Count);

    text
      .transition() // Add transition for the text
      .duration(1000) // Duration matches the icons
      .attr("y", height - Math.ceil(d.Count / maxRows) * iconSize - iconSize - 10); // Final y position

    // Add the gender text below the column
    svg.append("text")
      .attr("x", index * barWidth + barWidth / 2)
      .attr("y", height - 1)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text(d.Sex.charAt(0).toUpperCase() + d.Sex.slice(1));
  });
}


// Age Distribution
function renderAgeDistribution(data) {
  svg.selectAll("*").remove();
  hideStats();

  const ageRanges = [
    { range: "15-20", min: 15, max: 20 },
    { range: "21-25", min: 21, max: 25 },
    { range: "26-30", min: 25, max: 30 },
  ];

  const groupedData = ageRanges.map(range => {
    const males = data.filter(d => d.age >= range.min && d.age <= range.max && d.Sex === "male").length;
    const females = data.filter(d => d.age >= range.min && d.age <= range.max && d.Sex === "female").length;

    return {
      Range: range.range,
      Males: males,
      Females: females,
    };
  });

  const barWidth = width / ageRanges.length;
  const maxRows = Math.ceil(Math.max(...groupedData.map(d => d.Males + d.Females)) / 5);
  const iconSize = Math.min(barWidth / 5, height / (maxRows * 1.5));

  groupedData.forEach((d, index) => {
    const xOffset = index * barWidth + barWidth / 2 - (5 * iconSize) / 2;

    // Append male icons with transitions
    svg.selectAll(`image.male-age-${index}`)
      .data(d3.range(d.Males))
      .join("image")
      .attr("xlink:href", maleIconPath)
      .attr("x", (i) => xOffset + (i % 5) * iconSize)
      .attr("y", height) // Start from the bottom
      .transition() // Add transition
      .duration(1000) // Transition duration
      .attr("y", (i) => height - Math.floor(i / 5) * iconSize - iconSize - 20) // Final y position
      .attr("width", iconSize * 0.8)
      .attr("height", iconSize * 0.8);

    // Append female icons with transitions
    svg.selectAll(`image.female-age-${index}`)
      .data(d3.range(d.Females))
      .join("image")
      .attr("xlink:href", femaleIconPath)
      .attr("x", (i) => xOffset + (i % 5) * iconSize)
      .attr("y", height) // Start from the bottom
      .transition() // Add transition
      .duration(1000) // Transition duration
      .attr("y", (i) => height - Math.floor((i + d.Males) / 5) * iconSize - iconSize - 20) // Final y position
      .attr("width", iconSize * 0.8)
      .attr("height", iconSize * 0.8);

    // Append the total count text and transition it
    const text = svg
      .append("text")
      .attr("x", index * barWidth + barWidth / 2)
      .attr("y", height) // Start at the bottom
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(d.Males + d.Females);

    text
      .transition() // Add transition for the text
      .duration(1000) // Duration matches the icons
      .attr("y", height - Math.ceil((d.Males + d.Females) / 5) * iconSize - iconSize - 25); // Final y position

    // Append the age range text below the bar
    svg.append("text")
      .attr("x", index * barWidth + barWidth / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text(d.Range);
  });
}


  // Button Event Listeners
  document.getElementById("grid-view").addEventListener("click", () => renderGridView(data));
  document.getElementById("gender-bar-chart").addEventListener("click", () => renderGenderBarChart(data));
  document.getElementById("age-bar-chart").addEventListener("click", () => renderAgeDistribution(data));

  // Default View
  renderGridView(data);
});





