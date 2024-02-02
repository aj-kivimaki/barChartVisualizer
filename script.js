// get the data from the API
async function getData() {
  const res = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );
  const json = await res.json();
  return json.data;
}

const width = 800;
const height = 400;

// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = width - margin.left - margin.right;
const graphHeight = height - margin.top - margin.bottom;

// create the svg element
const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", 1000)
  .attr("height", 500);

// create graph
const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// create the axis
const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`);
const yAxisGroup = graph.append("g");

// create the chart
getData().then((data) => {
  const max = d3.max(data, (d) => d[1]);

  const y = d3.scaleLinear().domain([0, max]).range([graphHeight, 0]); // height of the svg

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d[0]))
    .range([0, width]) // width of the svg
    .paddingInner(0.05)
    .paddingOuter(0.05);

  graph
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("width", x.bandwidth)
    .attr("height", (d) => graphHeight - y(d[1]))
    .attr("fill", "orange")
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("class", "bar")
    .append("title")
    .text(
      (d) =>
        `${new Date(d[0]).getFullYear()} Q${Math.ceil(
          (new Date(d[0]).getMonth() + 1) / 3
        )}\n${d[1].toLocaleString("en-US")} billion`
    );

  // create and call the axes
  const xAxis = d3
    .axisBottom(x)
    .tickValues(x.domain().filter((d, i) => i % 15 === 0)) // Display every 5 years
    .tickFormat((d) => new Date(d[0]).getFullYear());

  const yAxis = d3
    .axisLeft(y)
    .ticks(6)
    .tickFormat((d) => `${d.toLocaleString("en-US")}`);

  xAxisGroup
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "end");

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
});
