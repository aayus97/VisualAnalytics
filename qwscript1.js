// Tooltip setup
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("opacity", 0)
  .style("background-color", "rgba(0, 0, 0, 0.8)")
  .style("color", "white")
  .style("padding", "5px 10px")
  .style("border-radius", "5px");

// Set up SVG
const svg = d3.select("#visualization")
  .attr("width", 900)
  .attr("height", 900);

const width = +svg.attr("width");
const height = +svg.attr("height");
const innerRadius = 180;
const outerRadius = 320;

// Paths to male and female PNG icons
const maleIconPath = "images/boy.png";
const femaleIconPath = "images/girl.png";

// Color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Dataset URL
const datasetUrl = "dataset.csv";

// State tracking
let currentView = "grid"; // Tracks the active chart view

// Load and process dataset
d3.csv(datasetUrl).then(data => {
  // Preprocess data
  data.forEach(d => {
    d.age = +d.age;
    d.Sex = d.Sex.trim().toLowerCase();
    d.num_hours_used = +d.num_hours_used || "Unknown";
    d.comments = Array.from({ length: 10 }, (_, i) => d[`Word_${i + 1}`]).filter(Boolean).join(", ");
    d.anxiety = d["GAD7 Category"] || "N/A";
    d.depression = d["PHQ9 Category"] || "N/A";
    d.words = Array.from({ length: 10 }, (_, i) => d[`Word_${i + 1}`]).filter(Boolean);
    d.Year = +d.Year || null;
    d.MaleCount = +d.MaleCount || 0;
    d.FemaleCount = +d.FemaleCount || 0;
  });

  data = data.filter(d => !isNaN(d.age) && d.Sex);

  // Update stats in the scorecard
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

  // Hide stats
  function hideStats() {
    document.getElementById("scorecard").style.display = "none";
  }

  // Grid View
  function renderGridView(data) {
    svg.selectAll("*").remove(); // Clear SVG
    updateStats(data); // Update stats

    const totalIcons = data.length;
    const numCols = Math.ceil(Math.sqrt(totalIcons));
    const iconSize = Math.min(width / numCols, height / numCols) * 0.9;

    svg.selectAll("image")
      .data(data)
      .join("image")
      .attr("xlink:href", d => (d.Sex === "male" ? maleIconPath : femaleIconPath))
      .attr("x", (d, i) => (i % numCols) * iconSize)
      .attr("y", (d, i) => Math.floor(i / numCols) * iconSize)
      .attr("width", iconSize * 0.8)
      .attr("height", iconSize * 0.8)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
          .html(`Age: ${d.age}<br>Sex: ${d.Sex}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      })
      .on("click", d => redirectToDetailsPage(d));
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

      text.transition() // Add transition for the text
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
      { range: "26-30", min: 26, max: 30 },
    ];

    const groupedData = ageRanges.map(range => {
      const males = data.filter(d => d.age >= range.min && d.age <= range.max && d.Sex === "male").length;
      const females = data.filter(d => d.age >= range.min && d.age <= range.max && d.Sex === "female").length;

      return { Range: range.range, Males: males, Females: females };
    });

    const barWidth = width / ageRanges.length;
    const maxRows = Math.ceil(Math.max(...groupedData.map(d => d.Males + d.Females)) / 5);
    const iconSize = Math.min(barWidth / 5, height / (maxRows * 1.5));

    groupedData.forEach((d, index) => {
      const xOffset = index * barWidth + barWidth / 2 - (5 * iconSize) / 2;

      // Append male icons
      svg.selectAll(`image.male-age-${index}`)
        .data(d3.range(d.Males))
        .join("image")
        .attr("xlink:href", maleIconPath)
        .attr("x", (i) => xOffset + (i % 5) * iconSize)
        .attr("y", height)
        .transition()
        .duration(1000)
        .attr("y", (i) => height - Math.floor(i / 5) * iconSize - iconSize - 20)
        .attr("width", iconSize * 0.8)
        .attr("height", iconSize * 0.8);

      // Append female icons
      svg.selectAll(`image.female-age-${index}`)
        .data(d3.range(d.Females))
        .join("image")
        .attr("xlink:href", femaleIconPath)
        .attr("x", (i) => xOffset + (i % 5) * iconSize)
        .attr("y", height)
        .transition()
        .duration(1000)
        .attr("y", (i) => height - Math.floor((i + d.Males) / 5) * iconSize - iconSize - 20)
        .attr("width", iconSize * 0.8)
        .attr("height", iconSize * 0.8);

      // Append the total count text
      svg.append("text")
        .attr("x", index * barWidth + barWidth / 2)
        .attr("y", height)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(d.Males + d.Females)
        .transition()
        .duration(1000)
        .attr("y", height - Math.ceil((d.Males + d.Females) / 5) * iconSize - iconSize - 25);

      // Append the age range text
      svg.append("text")
        .attr("x", index * barWidth + barWidth / 2)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text(d.Range);
    });
  }

  // Radial Chart
  function renderRadialChart(data, selectedCategory = "GAD7 Category") {
    svg.selectAll("*").remove();
    hideStats();

    const groupedData = d3.rollup(
      data.filter(d => d[selectedCategory]),
      v => d3.sum(v, d => d.MaleCount + d.FemaleCount),
      d => d[selectedCategory]
    );

    const radialData = Array.from(groupedData, ([key, value]) => ({ category: key, count: value }));
    const angleScale = d3.scaleBand().domain(radialData.map(d => d.category)).range([0, 2 * Math.PI]);
    const radiusScale = d3.scaleLinear().domain([0, d3.max(radialData, d => d.count)]).range([innerRadius, outerRadius]);

    const radialGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    radialGroup.selectAll(".arc")
      .data(radialData)
      .join("path")
      .attr("d", d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(d => radiusScale(d.count))
        .startAngle(d => angleScale(d.category))
        .endAngle(d => angleScale(d.category) + angleScale.bandwidth())
      )
      .attr("fill", (d, i) => colorScale(i))
      .attr("stroke", "#fff")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
          .html(`Category: ${d.category}<br>Count: ${d.count}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }

  // Stacked Bar Chart
  function renderStackedBarChart(data, selectedCategory = "GAD7 Category") {
    svg.selectAll("*").remove();
    hideStats();

    const groupedData = d3.rollup(
      data.filter(d => d[selectedCategory]),
      v => ({
        Male: d3.sum(v, d => d.MaleCount),
        Female: d3.sum(v, d => d.FemaleCount)
      }),
      d => d[selectedCategory]
    );

    const stackedData = Array.from(groupedData, ([key, value]) => ({ category: key, ...value }));
    const stackKeys = ["Male", "Female"];

    const xScale = d3.scaleBand().domain(stackedData.map(d => d.category)).range([0, width]).padding(0.3);
    const yScale = d3.scaleLinear().domain([0, d3.max(stackedData, d => d.Male + d.Female)]).nice().range([height - 50, 50]);

    const stack = d3.stack().keys(stackKeys);
    const layers = stack(stackedData);

    svg.append("g").attr("transform", "translate(50, 0)").call(d3.axisLeft(yScale));
    svg.append("g").attr("transform", `translate(0, ${height - 50})`).call(d3.axisBottom(xScale));

    svg.selectAll(".layer")
      .data(layers)
      .join("g")
      .attr("fill", d => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => xScale(d.data.category))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on("mouseover", (event, d) => {
        const gender = d.data.Male === d[1] - d[0] ? "Male" : "Female";
        tooltip.style("opacity", 1)
          .html(`Category: ${d.data.category}<br>${gender} Count: ${d[1] - d[0]}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }

  // Line Chart
  function renderLineChart(data) {
    svg.selectAll("*").remove();
    hideStats();

    const groupedData = d3.rollups(
      data,
      v => ({
        depression: d3.sum(v, d => d.depression === "Moderate" ? 1 : 0),
        anxiety: d3.sum(v, d => d.anxiety === "Moderate" ? 1 : 0)
      }),
      d => d.Year
    );

    const lineData = Array.from(groupedData, ([year, counts]) => ({ year: +year, ...counts }));

    const xScale = d3.scaleLinear().domain(d3.extent(lineData, d => d.year)).range([50, width - 50]);
    const yScale = d3.scaleLinear().domain([0, d3.max(lineData, d => Math.max(d.depression, d.anxiety))]).nice().range([height - 50, 50]);

    svg.append("g").attr("transform", "translate(50, 0)").call(d3.axisLeft(yScale));
    svg.append("g").attr("transform", `translate(0, ${height - 50})`).call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    ["depression", "anxiety"].forEach((key, i) => {
      const line = d3.line().x(d => xScale(d.year)).y(d => yScale(d[key])).curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", i === 0 ? "#e63946" : "#457b9d")
        .attr("stroke-width", 3)
        .attr("d", line);
    });
  }

  // Button Event Listeners
  document.getElementById("grid-view").addEventListener("click", () => {
    currentView = "grid";
    renderGridView(data);
  });

  document.getElementById("gender-bar-chart").addEventListener("click", () => {
    currentView = "bar";
    renderGenderBarChart(data);
  });

  document.getElementById("age-bar-chart").addEventListener("click", () => {
    currentView = "age";
    renderAgeDistribution(data);
  });

  document.getElementById("radial-chart").addEventListener("click", () => {
    currentView = "radial";
    renderRadialChart(data);
  });

  document.getElementById("stacked-bar-chart").addEventListener("click", () => {
    currentView = "stacked";
    renderStackedBarChart(data);
  });

  document.getElementById("line-chart").addEventListener("click", () => {
    currentView = "line";
    renderLineChart(data);
  });

  // Default View
  renderGridView(data);
});
