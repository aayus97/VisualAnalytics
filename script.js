function updatePageBackgroundWordCloud(data) {
  const wordCloudSvg = d3.select("#background-word-cloud");
  wordCloudSvg.selectAll("*").remove(); // Clear previous word cloud

  // Set larger dimensions for the background word cloud
  const width = window.outerWidth * 4; // Increase width (150% of the viewport width)
  const height = window.outerHeight * 4; // Increase height (150% of the viewport height)


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

// Call the function initially with the full dataset
d3.csv("dataset.csv").then(data => {
  const transformedData = data.map(d => ({
    words: [d.Word_1, d.Word_2, d.Word_3, d.Word_4, d.Word_5, d.Word_6, d.Word_7, d.Word_8, d.Word_9, d.Word_10]
  }));
  updatePageBackgroundWordCloud(transformedData);
});

// Update the background when filters are applied
function updateFilteredBackgroundWordCloud(filteredData) {
  const transformedData = filteredData.map(d => ({
    words: [d.Word_1, d.Word_2, d.Word_3, d.Word_4, d.Word_5, d.Word_6, d.Word_7, d.Word_8, d.Word_9, d.Word_10]
  }));
  updatePageBackgroundWordCloud(transformedData);
}





const width = 900;
const height = 900;
const innerRadius = 180;
const outerRadius = 320;



// Color scales
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Tooltip for hover interactivity
const tooltip = d3.select("#tooltip");

let currentView = "stacked"; // Tracks the current active chart: "radial" or "stacked"

// Load data
d3.csv("dataset.csv", d => ({
  Year: d.Year,
  "Full Time Student": d["Full Time Student"],
  "GAD7 Category": d["GAD7 Category"] ? d["GAD7 Category"].trim() : null,
  "PHQ9 Category": d["PHQ9 Category"] ? d["PHQ9 Category"].trim() : null,
  num_hours_used: +d.num_hours_used,
  MaleCount: +d.MaleCount,
  FemaleCount: +d.FemaleCount,
  sentiment: +d.sentiment,
  age:+d.age,
  words: [d.Word_1, d.Word_2, d.Word_3, d.Word_4, d.Word_5, d.Word_6, d.Word_7, d.Word_8, d.Word_9, d.Word_10]
})).then(data => {
  const years = [...new Set(data.map(d => d.Year))].sort();
//   const yearSelector = d3.select("#year-selector");
  const studentSelector = d3.select("#student-filter");
  const categorySelector = d3.select("#category-selector");

  const yearExtent = d3.extent(data, d => +d.Year); // Get min and max years

  

  
d3.select("#time-slider")
  .attr("min", yearExtent[0])
  .attr("max", yearExtent[1])
  .attr("value", yearExtent[0]); // Default to the earliest year

d3.select("#time-slider-value").text(yearExtent[0]); // Initialize display

updateStackedBarChart(data, "GAD7 Category", "All", "All");


// Initial rendering of the line chart (if active)
if (currentView === "line") {
  const selectedCategory = d3.select("#line-category-selector").node().value;
  updateLineChart(data, "All", selectedCategory);
}

// Button visibility
d3.select("#flatten-button").style("display", "inline"); // Stacked is active
d3.select("#radial-button").style("display", "none"); // Show radial button



d3.select("#student-filter").on("change", function () {
    const selectedYear = timeSlider.node().value; // Get the current year from the slider
    updateChart(selectedYear); // Call updateChart with the current year
  });
  


  d3.select("#category-selector").on("change", function () {
    const selectedYear = timeSlider.node().value; // Get the current year from the slider
  
    if (currentView === "line") {
      updateLineChart(data, selectedYear); // If line chart is active, re-render it dynamically
    } else {
      updateChart(selectedYear); // Otherwise, update the radial or stacked chart
    }
  });
  


  function toggleFilters(show) {
    d3.select("#filters-container").style("display", show ? "flex" : "none");
  }

// Toggle buttons for switching between charts


const lineChartControls = d3.select("#line-chart-controls"); // Reference line chart controls
const chartSwitcher = d3.select("#chart-switcher"); // Reference chart switcher

d3.select("#line-button").on("click", () => {
  currentView = "line"; // Update the current view to 'line'
  toggleSuggestionsContainer(false); 

  // Show only the other chart buttons
  d3.select("#flatten-button").style("display", "inline");
  d3.select("#radial-button").style("display", "inline");
  d3.select("#line-button").style("display", "none");

  // Show line chart controls
  lineChartControls.style("display", "block");

  // Hide other controls
  d3.select("#time-slider-container").style("display", "none"); // Hide year slider
  d3.select("#dropdown-container").style("display", "none"); // Hide dropdown filters
  d3.select("#filters-container").style("display", "none"); // Hide stacked bar chart filters
  d3.select("#word-cloud").style("display", "none"); // Hide word cloud

  // Render the initial line chart
  const selectedCategory = d3.select("#line-category-selector").node().value;
  updateLineChart(data, "All", selectedCategory); // Call updateLineChart for initial render

  // Ensure the category selector updates the line chart dynamically
  d3.select("#line-category-selector").on("change", function () {
    const newCategory = d3.select(this).node().value;
    updateLineChart(data, "All", newCategory); // Re-render with the selected category
  });
});


d3.select("#flatten-button").on("click", () => {
  currentView = "stacked"; // Update the current view to 'stacked'
  toggleSuggestionsContainer(true);

  // Show only the other chart buttons
  d3.select("#line-button").style("display", "inline");
  d3.select("#radial-button").style("display", "inline");
  d3.select("#flatten-button").style("display", "none");

  // Show relevant controls
  chartSwitcher.style("display", "flex");
  d3.select("#time-slider-container").style("display", "flex");
  d3.select("#dropdown-container").style("display", "flex");
  d3.select("#filters-container").style("display", "block");

  // Hide line chart controls
  lineChartControls.style("display", "none");
  d3.select("#word-cloud").style("display", "none"); // Hide word cloud

  // Render the stacked bar chart
  updateStackedBarChart(data, "GAD7 Category", "All", "All");
});

d3.select("#radial-button").on("click", () => {
  currentView = "radial"; // Update the current view to 'radial'

  toggleSuggestionsContainer(false);

  // Show only the other chart buttons
  d3.select("#line-button").style("display", "inline");
  d3.select("#flatten-button").style("display", "inline");
  d3.select("#radial-button").style("display", "none");

  // Show relevant controls
  chartSwitcher.style("display", "flex");
  d3.select("#time-slider-container").style("display", "flex");
  d3.select("#dropdown-container").style("display", "flex");
  d3.select("#word-cloud").style("display", "flex"); // Show word cloud

  // Hide line chart controls
  lineChartControls.style("display", "none");
  d3.select("#filters-container").style("display", "none"); // Hide filters

  // Render the radial chart
  updateRadialChart(data, "All", "All");
});


  
  const timeSlider = d3.select("#time-slider");
  const timeSliderValue = d3.select("#time-slider-value");
  


  timeSlider.on("input", function () {
    const selectedYear = this.value;
    timeSliderValue.text(selectedYear); // Update the displayed year value

    if (currentView === "radar") {
      // Recompute radar chart data based on the selected year
      const radarData = prepareRadarData(data, selectedYear);
      updateRadarChart(radarData); // Re-render the radar chart
    } else {
      updateChart(selectedYear); // Update radial or stacked chart
    }
});

  

  // Initial rendering
  updateRadialChart(data, "All", "All");
//////////////////////////////////////////////////////////////////////////
function updateSuggestions(filteredData) {
  // Calculate counts for anxiety and depression categories
  const anxietyCounts = d3.rollup(
    filteredData,
    v => d3.sum(v, d => d["GAD7 Category"] ? 1 : 0),
    d => d["GAD7 Category"]
  );

  const depressionCounts = d3.rollup(
    filteredData,
    v => d3.sum(v, d => d["PHQ9 Category"] ? 1 : 0),
    d => d["PHQ9 Category"]
  );

  // Find the highest category
  const maxAnxietyCategory = Array.from(anxietyCounts).reduce((max, entry) =>
    entry[1] > max[1] ? entry : max, ["None", 0]
  );

  const maxDepressionCategory = Array.from(depressionCounts).reduce((max, entry) =>
    entry[1] > max[1] ? entry : max, ["None", 0]
  );

  // Calculate percentages for context
  const totalAnxiety = Array.from(anxietyCounts.values()).reduce((sum, count) => sum + count, 0);
  const totalDepression = Array.from(depressionCounts.values()).reduce((sum, count) => sum + count, 0);
  const anxietyPercentage = ((maxAnxietyCategory[1] / totalAnxiety) * 100).toFixed(1);
  const depressionPercentage = ((maxDepressionCategory[1] / totalDepression) * 100).toFixed(1);

  // Dynamic suggestions with a more tailored tone
  const suggestions = {
    anxiety: {
      "Minimal": "🌱 You're doing great! Consider light activities like yoga or stretching to keep up your well-being.",
      "Mild": "🌼 Try mindfulness exercises or take a short walk to relax. A little break can make a big difference.",
      "Moderate": "💡 It might be helpful to talk to someone you trust or try guided meditations. Your mental health matters.",
      "Severe": "🚨 We strongly recommend reaching out to a mental health professional. You're not alone—help is available."
    },
    depression: {
      "Minimal": "🌟 Keep nurturing positive habits like maintaining a regular sleep schedule and a balanced diet.",
      "Mild": "🌈 Connect with friends or engage in hobbies you love. Staying active can uplift your mood.",
      "Moderate": "📋 Structured activities and talking to a therapist can provide the support you need. You deserve care.",
      "Severe": "🆘 Please reach out to a mental health professional as soon as possible. Your well-being is our priority."
    }
  };

  // Retrieve tailored suggestions
  const anxietySuggestion = suggestions.anxiety[maxAnxietyCategory[0]] || "No specific suggestions available.";
  const depressionSuggestion = suggestions.depression[maxDepressionCategory[0]] || "No specific suggestions available.";

  // Update the suggestions container with dynamic text
  d3.select("#suggestions-container").html(`
    <h3>Here are Some Suggestions:</h3>
    <p><strong>Anxiety (${maxAnxietyCategory[0]} - ${anxietyPercentage}% of total):</strong> ${anxietySuggestion}</p>
    <p><strong>Depression (${maxDepressionCategory[0]} - ${depressionPercentage}% of total):</strong> ${depressionSuggestion}</p>
    <p>✨ Remember, taking small steps can lead to big improvements. You're not alone on this journey.</p>
  `);
}

function toggleSuggestionsContainer(isVisible) {
  const suggestionsContainer = document.getElementById("suggestions-container");
  suggestionsContainer.style.display = isVisible ? "block" : "none";
}


//////////////////////////////////////////////////////////////////////////

// function updateChart(selectedYear = "All") {
//     const studentFilter = d3.select("#student-filter").node().value;
//     const categoryFilter = d3.select("#category-selector").node().value;
   
  
//     if (currentView === "radial") {
//       updateRadialChart(data, selectedYear, studentFilter);
//     } else if (currentView === "stacked") {
//       updateStackedBarChart(data, categoryFilter, selectedYear, studentFilter);
//     }
//     else if (currentView === "line") {
//       updateLineChart(data, selectedYear); // Call the new line chart function
//     }
//   }

function updateChart(selectedYear = "All") {
  const studentFilter = d3.select("#student-filter").node().value;
  const categoryFilter = d3.select("#category-selector").node().value;

  if (currentView === "radial") {
    d3.select("#suggestions-container").style("display", "none"); // Hide suggestions for non-stacked charts
    updateRadialChart(data, selectedYear, studentFilter);
  } else if (currentView === "stacked") {
    d3.select("#suggestions-container").style("display", "block"); // Show suggestions only for stacked bar chart
    updateStackedBarChart(data, categoryFilter, selectedYear, studentFilter);
  } else if (currentView === "line") {
    d3.select("#suggestions-container").style("display", "none"); // Hide suggestions for non-stacked charts
    updateLineChart(data, selectedYear); // Call the new line chart function
  }
}



  function filterData(data, gender, ageRange, minHours, maxHours) {
    return data.filter(d => {
      const genderMatch = 
        gender === "All" || (gender === "Male" && d.MaleCount > 0) || (gender === "Female" && d.FemaleCount > 0);
      const ageMatch =
        ageRange === "All" || (d.age >= ageRange[0] && d.age <= ageRange[1]);
      const hoursMatch =
        d.num_hours_used >= minHours && d.num_hours_used <= maxHours;
  
      return genderMatch && ageMatch && hoursMatch;
    });
  }
  
  

  function updateFilteredStackedChart() {
    const selectedGender = d3.select("#gender-selector").node().value;
    const selectedAgeRange = d3.select("#age-group-selector").node().value === "All" 
      ? "All" 
      : d3.select("#age-group-selector").node().value.split("-").map(Number);
    const minHours = +d3.select("#time-slider-min").node().value;
    const maxHours = +d3.select("#time-slider-max").node().value;
  
    const filteredData = filterData(data, selectedGender, selectedAgeRange, minHours, maxHours);

    console.log({ selectedGender, selectedAgeRange, minHours, maxHours });
    

    updateStackedBarChart(filteredData); // Pass filtered data to the chart function
  }
  
// Event listeners for filters
d3.select("#gender-selector").on("change", updateFilteredStackedChart);
d3.select("#age-group-selector").on("change", updateFilteredStackedChart);
d3.select("#time-slider-min").on("input", function () {
  d3.select("#min-hours").text(this.value);
  updateFilteredStackedChart();
});
d3.select("#time-slider-max").on("input", function () {
  d3.select("#max-hours").text(this.value);
  updateFilteredStackedChart();
});


  // Utility Functions
  

  function prepareRadarData(data, selectedYear) {
    // Filter data for the selected year
    const filteredData = data.filter(d => selectedYear === "All" || d.Year === selectedYear);
  
    // Compute averages for GAD7 and PHQ9 Categories
    const gad7Data = d3.rollup(
      filteredData.filter(d => d["GAD7 Category"] && d.num_hours_used),
      v => d3.mean(v, d => d.num_hours_used),
      d => d["GAD7 Category"]
    );
  
    const phq9Data = d3.rollup(
      filteredData.filter(d => d["PHQ9 Category"] && d.num_hours_used),
      v => d3.mean(v, d => d.num_hours_used),
      d => d["PHQ9 Category"]
    );
  
    // Combine categories (GAD7 and PHQ9) into a single set
    const categories = Array.from(new Set([...gad7Data.keys(), ...phq9Data.keys()])).sort();
  
    // Normalize data for better visualization (scale to a range of 0-1)
    const maxVal = Math.max(
      d3.max([...gad7Data.values()]),
      d3.max([...phq9Data.values()])
    );
  
    // Create radar chart data
    const radarData = categories.map(category => ({
      axis: category,
      GAD7: (gad7Data.get(category) || 0) / maxVal,
      PHQ9: (phq9Data.get(category) || 0) / maxVal
    }));
  
    return radarData;
  }
  


  // Radial Chart

function updateRadialChart(data, selectedYear, studentFilter) {
  const categoryKey = d3.select("#category-selector").node().value; // Get the selected category (PHQ9 or GAD7)

  // Filter and preprocess the data
  const filteredData = data.filter(d => {
    const matchesYear = selectedYear === "All" || d.Year === selectedYear;
    const matchesStudent = studentFilter === "All" || d["Full Time Student"] === studentFilter;
    return matchesYear && matchesStudent && d[categoryKey];
  });

  // Summarize data by the selected category
  const summarizedData = d3.rollup(
    filteredData,
    v => d3.sum(v, d => d.MaleCount + d.FemaleCount), // Sum male and female counts
    d => d[categoryKey] // Group by the selected category (PHQ9 or GAD7)
  );

  // Get unique categories dynamically based on the data
  const categories = Array.from(summarizedData.keys());

  // Convert summarized data to hierarchical format
  const hierarchicalData = categories.map(category => ({
    category,
    count: summarizedData.get(category) || 0
  }));

  // Define scales
  const angleScale = d3.scaleBand()
    .domain(categories)
    .range([0, 2 * Math.PI]); // Spread categories around the circle

  const radiusScale = d3.scaleLinear()
    .domain([0, d3.max(hierarchicalData, d => d.count)]) // Scale radius based on counts
    .range([innerRadius, outerRadius]);

  // Clear previous chart
  d3.select("#chart").selectAll("*").remove();

  // Create SVG container
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Draw radial arcs
  svg.selectAll(".category")
    .data(hierarchicalData)
    .enter()
    .append("path")
    .attr("d", d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(d => radiusScale(d.count))
      .startAngle(d => angleScale(d.category))
      .endAngle(d => angleScale(d.category) + angleScale.bandwidth())
    )
    .attr("fill", d => colorScale(d.category))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`
          <strong>${categoryKey === "PHQ9 Category" ? "Depression" : "Anxiety"}:</strong> ${d.category}<br>
          <strong>Count:</strong> ${d.count}
        `)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY}px`);
    })
    .on("mouseout", () => tooltip.style("opacity", 0));


  // Add title to the Radial Chart
svg.append("text")
.attr("class", "chart-title")
.attr("x", 0) // Center horizontally
.attr("y", -outerRadius - 30) // Position above the radial chart
.attr("text-anchor", "middle") // Center the text
.style("font-size", "18px") // Font size for the title
.style("font-weight", "bold") // Bold text for emphasis
.style("fill", "#333") // Dark text color
.text("Words Speak Louder: Mental Health Reflections by Year");

  // Add a legend for depression or anxiety levels
  const legend = svg.append("g")
  .attr("transform", `translate(${outerRadius + 10}, -${outerRadius / 2 - 10})`);

  // Add **title for the legend**
  legend.append("text")
  .attr("x", 0)
  .attr("y", -20) // Position above the legend items
  .text(categoryKey === "PHQ9 Category" ? "Depression Levels" : "Anxiety Levels")
  .style("font-size", "13px")
  .style("font-weight", "bold")
  .style("fill", "#333")
  .attr("text-anchor", "start"); // Align text with the legend items



  legend.selectAll("legend-item")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", (_, i) => `translate(0, ${i * 20})`)
    .each(function (d) {
      d3.select(this)
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(d));

      d3.select(this)
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(d)
        .style("font-size", "12px")
        .style("alignment-baseline", "middle");
    });


  // Update word cloud
  const yearData = filteredData.filter(d => d.Year === selectedYear || selectedYear === "All");
  const wordCounts = yearData.reduce((acc, d) => {
    d.words.forEach(word => {
      acc[word] = (acc[word] || 0) + 1;
    });
    return acc;
  }, {});

  const wordCloudData = Object.keys(wordCounts).map(word => ({
    text: word,
    size: wordCounts[word] * 10
  }));

  updateWordCloud(wordCloudData);

}




function updateStackedBarChart(data, categoryKey = "GAD7 Category", selectedYear = "All", studentFilter = "All") {
    const filteredData = data.filter(d => {
        const matchesYear = selectedYear === "All" || d.Year === selectedYear;
        const matchesStudent = studentFilter === "All" || d["Full Time Student"] === studentFilter;
        return matchesYear && matchesStudent && d[categoryKey];
    });

    updateSuggestions(filteredData);



 
    const summarizedData = d3.rollup(
      filteredData,
      v => ({
          Male: d3.sum(v, d => d.MaleCount || 0), // Default to 0 if MaleCount is missing
          Female: d3.sum(v, d => d.FemaleCount || 0) // Default to 0 if FemaleCount is missing
      }),
      d => d[categoryKey]
  );
  

    const stackedData = Array.from(summarizedData, ([category, counts]) => ({
      category,
      Male: counts.Male || 0, // Default to 0 if Male is missing
      Female: counts.Female || 0 // Default to 0 if Female is missing
  })).sort((a, b) => a.category.localeCompare(b.category));

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////

  // Filter based on the selected gender
const selectedGender = d3.select("#gender-selector").node().value;

const filteredStackedData = stackedData.filter(d => {
    if (selectedGender === "All") return true; // Show all data if no gender filter is applied
    if (selectedGender === "Male") return d.Male > 0; // Only show categories with non-zero Male count
    if (selectedGender === "Female") return d.Female > 0; // Only show categories with non-zero Female count
    return false; // Default case (should not occur)
});

  

    // Chart dimensions and margins
    const margin = { top: 50, right: 150, bottom: 100, left: 70 };
    const chartWidth = 900 - margin.left - margin.right;
    const chartHeight = 600 - margin.top - margin.bottom;

    const chartWidthwc = 3000;
    const chartHeightwc = 1500;

    // Remove previous chart
    d3.select("#chart").selectAll("*").remove();

    // Create SVG
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
        .domain(filteredStackedData.map(d => d.category))
        .range([0, chartWidth])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredStackedData, d => d.Male + d.Female)])
        .nice()
        .range([chartHeight, 0]);

    // Add axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // Define stack generator
    let stackKeys;
    if (selectedGender === "All") {
        stackKeys = ["Male", "Female"];
    } else {
        stackKeys = [selectedGender]; // Only use the selected gender as the key
    }

    // Define stack generator with dynamic keys
    const stack = d3.stack().keys(stackKeys);

    

    // Generate stack layers using the filtered data
    const layers = stack(filteredStackedData);



    // Draw the stacked bars
    svg.selectAll(".layer")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "layer")
        .attr("fill", (d, i) => colorScale(d.key)) // Assign colors for Male and Female
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.category))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .on("mouseover", (event, d) => {
            const gender = d.data.Male === (d[1] - d[0]) ? "Male" : "Female";
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>Category:</strong> ${d.data.category}<br>
                    <strong>${gender} Count:</strong> ${d[1] - d[0]}
                `)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY}px`);
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    // Add labels to the stacked bars
    svg.selectAll(".layer")
        .data(layers)
        .selectAll("text")
        .data(d => d)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.data.category) + xScale.bandwidth() / 2)
        .attr("y", d => yScale((d[0] + d[1]) / 2)) // Position in the middle of each segment
        .attr("dy", "0.35em") // Center vertically
        .text(d => d[1] - d[0]) // Display the value
        .attr("fill", "white") // Make the label visible on darker bars
        .attr("font-size", "12px")
        .attr("text-anchor", "middle");



    // Add word cloud as a transparent background
    const wordCloudData = createWordCloudData(filteredData); // Get word cloud data from the filtered dataset
    updateWordCloudStacked(wordCloudData, svg, chartWidthwc, chartHeightwc); // Update word cloud


    // Add a legend
    const legend = svg.append("g")
    .attr("transform", `translate(${chartWidth + 20}, 0)`); // Position the legend to the right of the chart
  
  const legendData = ["Male", "Female"];
  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 25)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d, i) => colorScale(d))
    .style("cursor", "pointer")
    .on("click", (event, category) => {
      // Toggle visibility of bars by category
      const isVisible = d3.selectAll(`.bar-${category}`).style("opacity") === "1";
      d3.selectAll(`.bar-${category}`).transition().style("opacity", isVisible ? 0 : 1);
    });
  
  legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 30)
    .attr("y", (d, i) => i * 25 + 15)
    .text(d => d)
    .style("font-size", "14px")
    .style("cursor", "pointer")
    .on("click", (event, category) => {
      const isVisible = d3.selectAll(`.bar-${category}`).style("opacity") === "1";
      d3.selectAll(`.bar-${category}`).transition().style("opacity", isVisible ? 0 : 1);
    });

    svg.selectAll("rect")
    .on("mouseover", (event, d) => {
      const gender = d.key; // 'Male' or 'Female' directly from stack key
      tooltip
          .style("opacity", 1)
          .html(`
              <strong>Category:</strong> ${d.data.category}<br>
              <strong>Count:</strong> ${d[1] - d[0]}
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY}px`);
  });

  // Add title to the Stacked Bar Chart
svg.append("text")
.attr("class", "chart-title")
.attr("x", chartWidth / 2) // Center horizontally
.attr("y", -20) // Position above the chart
.attr("text-anchor", "middle") // Center the text
.style("font-size", "18px") // Font size for the title
.style("font-weight", "bold") // Bold text for emphasis
.style("fill", "#333") // Dark text color
.text("Time in Focus: Discover How Usage Hours Shape Mental Health");

  


}


//Word Cloud Function

function updateWordCloud(data) {
    const wordCloud = d3.select("#word-cloud");
    wordCloud.selectAll("*").remove();

    const layout = d3.layout.cloud()
        .size([320, 320]) // Set word cloud size
        .words(data)
        .rotate(() => Math.random() * 90) // Optional: random rotation of words
        .fontSize(d => d.size) // Font size based on word frequency
        .on("end", drawWordCloud);

    layout.start();

    function drawWordCloud(words) {
        const svg = wordCloud.append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", `translate(${layout.size()[0] / 2}, ${layout.size()[1] / 2})`); // Center the group initially

        svg.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("fill", (d, i) => colorScale(i)) // Apply colors
            .attr("text-anchor", "middle") // Center the text
            .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .text(d => d.text);

        // Adjust the entire group to align vertically within the container
        const svgHeight = svg.node().getBoundingClientRect().height; // Get the height of the group
        const containerHeight = wordCloud.node().getBoundingClientRect().height;
        const translateY = (containerHeight - svgHeight) / 2; // Center vertically
        svg.attr("transform", `translate(${layout.size()[0] / 2}, ${layout.size()[1] / 2 + translateY})`); // Adjust vertical position
    }
}

function createWordCloudData(filteredData) {
  const wordCounts = filteredData.reduce((acc, d) => {
      d.words.forEach(word => {
          acc[word] = (acc[word] || 0) + 1;
      });
      return acc;
  }, {});

  return Object.keys(wordCounts).map(word => ({
      text: word,
      size: wordCounts[word] * 10, // Scale size based on frequency
  }));
}



function updateWordCloudStacked(data, parentSvg, chartWidth, chartHeight) {
  // Remove any existing word cloud background
  parentSvg.selectAll(".word-cloud-backgrounds").remove();

  // Add a new word cloud background group
  const wordCloudGroup = parentSvg
      .append("g")
      .attr("class", "word-cloud-backgrounds")
      .attr("transform", `translate(0, 0)`); // Position at the top-left corner

  const layout = d3.layout.cloud()
      .size([chartWidth, chartHeight]) // Full chart container size
      .words(data)
      .rotate(() => Math.random() * 90 - 45) // Randomize rotation between -45° and 45°
      .fontSize(d => d.size) // Size based on word frequency
      .on("end", draw);

  layout.start();

  function draw(words) {
      wordCloudGroup
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", d => `${d.size}px`)
          .style("fill", d => colorScale(d.text))
          .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
          .attr("text-anchor", "middle")
          .text(d => d.text);
  }
}



// line chart

function updateLineChart(data, selectedYear = "All", category = "All") {
  // Filter data based on the selected year and category
  const filteredData = data.filter(d => {
    const matchesYear = selectedYear === "All" || d.Year === selectedYear;
    const matchesCategory =
      category === "All" || d["GAD7 Category"] === category || d["PHQ9 Category"] === category;
    return matchesYear && matchesCategory;
  });

  // Summarize counts for depression and anxiety by year
  const summary = d3.rollups(
    filteredData,
    v => ({
      depression: d3.sum(v, d => d["PHQ9 Category"] === category ? 1 : 0),
      anxiety: d3.sum(v, d => d["GAD7 Category"] === category ? 1 : 0)
    }),
    d => d.Year
  );

  const formattedData = Array.from(summary, ([year, counts]) => ({
    year: +year,
    depression: counts.depression,
    anxiety: counts.anxiety
  })).sort((a, b) => a.year - b.year);

  // Chart dimensions and margins
  const margin = { top: 50, right: 150, bottom: 50, left: 70 };
  const chartWidth = 900 - margin.left - margin.right;
  const chartHeight = 600 - margin.top - margin.bottom;

  // Remove previous chart
  d3.select("#chart").selectAll("*").remove();

  // Create SVG
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(formattedData, d => d.year))
    .range([0, chartWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(formattedData, d => Math.max(d.depression, d.anxiety))])
    .nice()
    .range([chartHeight, 0]);

  // Add axes
  svg.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(5)); // Optimize tick display

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add line generator
  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX); // Smooth lines for better aesthetics

  // Add lines
  ["depression", "anxiety"].forEach((key, i) => {
    svg.append("path")
      .datum(formattedData.map(d => ({ year: d.year, value: d[key] })))
      .attr("fill", "none")
      // .attr("stroke", i === 0 ? "#e63946" : "#457b9d") // Red for depression, blue for anxiety
      .attr("style", "stroke: black; stroke-width: 1;")
      // .attr("stroke-width", 5) // Increase stroke width
      .attr("d", line);
  });

  // Add points
  svg.selectAll(".dot")
    .data(formattedData.flatMap(d => [
      { year: d.year, value: d.depression, type: "Depression" },
      { year: d.year, value: d.anxiety, type: "Anxiety" }
    ]))
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.value))
    .attr("r", 6) // Increase point size
    .attr("fill", d => (d.type === "Depression" ? "#e63946" : "#457b9d"))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`
          <strong>${d.type}:</strong> ${d.value}<br>
          <strong>Year:</strong> ${d.year}
        `)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`);
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Add chart title
  svg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Follow the Flow: See How Categories Change by Year");

  // Add axis labels
  svg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Year");

  svg.append("text")
    .attr("x", -chartHeight / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px")
    .text("Count");

  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${chartWidth + 20}, 20)`);

  ["Depression", "Anxiety"].forEach((key, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", i === 0 ? "#e63946" : "#457b9d");

    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 25 + 12)
      .text(key)
      .style("font-size", "12px")
      .style("alignment-baseline", "middle");
  }) ;
}



});



