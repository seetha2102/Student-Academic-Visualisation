const width = 1800;
const height = 715;

const data = [
    { name: ["Academic Engagement &", "Personal Commitment"], value: 20, detail: "factor_1.html" },
    { name: ["Health &", "Well-being"], value: 20, detail: "factor_2.html" },
    { name: ["Family Background &", "Support System"], value: 20, detail: "factor_3.html" },
    { name: ["Educational Environment &", "Social Influence"], value: 20, detail: "factor_4.html" },
    { name: ["Resource", "Accessibility"], value: 20, detail: "factor_5.html" }
];

const colorInterpolators = [
  d3.interpolateViridis,
  d3.interpolatePlasma,
  d3.interpolateCool
];

// Generate a color array similar to schemeCategory10:
const colors = Array.from({ length: 10 }, (_, i) => {
  const interpolator = colorInterpolators[i % colorInterpolators.length];
  return interpolator(i / 9); // Use `i / (n-1)` for evenly spaced colors
});

// Define color scale
const color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(colors);

// Create pie layout and arc generator
const pie = d3.pie()
    .sort(null)
    .value(d => d.value);

const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2);

const labelArc = d3.arc()
    .innerRadius(Math.min(width, height) / 2 * 0.6)
    .outerRadius(Math.min(width, height) / 2 * 0.6);

// Generate arcs
const arcs = pie(data);

// Initialize SVG
const svg = d3.select("#chartContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 1.5, -height / 2  , width, height])
    .attr("style", "max-width: 100%; max-height: 100%; font: 10px sans-serif;");

// Access the details container
const detailsContainer = d3.select("#details");
const graphContainer = d3.select("#detailedGraph");

// Create the tooltip
const tooltip = d3.select("#tooltip");

// Show tooltip when page loads
tooltip.style("display", "block")
    .style("top", "20px") // Position it near the top of the page
    .style("left", "50%") // Center it horizontally
    .style("transform", "translateX(-50%)"); // Adjust to center it perfectly


svg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("fill", d => color(d.data.name))
    .attr("d", arc)
    .attr("cursor", "pointer")
    .on("mouseover", function(d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke", "black")  // Add a black stroke
            .attr("stroke-width", 2) // Make the stroke visible
            .attr("transform", "scale(1.02)"); // Slightly scale up
    })
    .on("mouseleave", function(d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke", "none")  // Remove the stroke
            .attr("transform", "scale(1)"); // Reset scaling
    })
    .on("click", function(d) {
        tooltip.style("display", "none");
        if (d.data && d.data.detail) {
            // Show the details container
            detailsContainer.style("display", "block");
            var timestamp = new Date().getTime();
            // Load the detailed HTML into the graphContainer
            detailsContainer.select("h2").text(d.data.name.join(' '));
            graphContainer.html(""); // Clear previous content
            graphContainer.append("iframe")
                .attr("src", d.data.detail + "?t=" + timestamp)
                .attr("title", d.data.name)
                .attr("width", "1580px")  // Set the width of the iframe
                .attr("height", "900px") // Set the height of the iframe
                .style("border", "none");
        } else {
            detailsContainer.style("display", "block");
            graphContainer.html("<p>No detailed information available for this slice.</p>");
        }
    })
    .append("title")
    .text(d => `${d.data.name}: ${d.data.value}`);


svg.selectAll("text")
    .data(arcs)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .selectAll("tspan")
    .data(d => d.data.name)
    .enter()
    .append("tspan")
    .attr("x", 0)
    .attr("dy", (d, i) => i > 0 ? "1.2em" : 0)  // Move subsequent lines down
    .text(d => d)
    .style("fill", "#fff")
    .style("font-size", "18px");


// Define gradients
const defs = svg.append("defs");

const gradients = ["Student", "Performance", "Factors"].map((word, i) => {
  const gradientId = `gradient-${i}`;
  const gradient = defs.append("linearGradient")
    .attr("id", gradientId)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%"); // Horizontal gradient

  // Add color stops to the gradient using the interpolator
  for (let j = 0; j <= 1; j += 0.25) {
    gradient.append("stop")
      .attr("offset", `${j * 100}%`)
      .attr("stop-color", colorInterpolators[i % colorInterpolators.length](j));
  }

  return gradientId;
});



// Add text beside the pie chart
svg.append("text")
    .attr("x", -1150) // Adjust x position as needed
    .attr("y", -195) // Adjust y position as needed
    .attr("text-anchor", "start") // Align text to the start
    .style("font-size", "115px") // Font size
    .style("font-weight", "bold") // Text color
    .selectAll("tspan")
    .data(["Student", "Performance", "Factors"]) // Bind data for each line
    .enter()
    .append("tspan")
    .attr("x", -1150) // Reset x position for each line
    .attr("dy", (d, i) => i === 0 ? 0 : "1.5em") // Move subsequent lines down
    .style("fill", (d, i) => `url(#gradient-${i})`)
    .text(d => d); // Set the text for each tspan

