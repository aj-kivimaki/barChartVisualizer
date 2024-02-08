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
  .attr("id", "x-axis")
  .attr("transform", `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append("g").attr("id", "y-axis");

// create the chart
getData().then((data) => {
  const max = d3.max(data, (d) => d[1]);

  const y = d3.scaleLinear().domain([0, max]).range([graphHeight, 0]); // height of the svg

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d[0]))
    .range([0, width]) // width of the svg
    .paddingInner(0.15);

  // create the tip
  const tip = d3
    .tip()
    .attr("id", "tooltip")
    .html((d) => {
      return `<i>${new Date(d[0]).getFullYear()} Q${Math.ceil(
        (new Date(d[0]).getMonth() + 1) / 3
      )} <br> 
      ${d[1].toLocaleString("en-US")} Billion</i>`;
    });

  graph.call(tip);

  graph
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("width", x.bandwidth)
    .attr("height", (d) => graphHeight - y(d[1]))
    .attr("fill", "#EC9706")
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("class", "bar")
    .attr("data-gdp", (d) => d[1])
    .attr("data-date", (d) => {
      return formatDate(new Date(d[0]), "YYYY-MM-DD");
    })
    .on("mouseover", (d, i, n) => {
      tip.show(d, n[i]);
      tip.attr("data-date", formatDate(new Date(d[0]), "YYYY-MM-DD"));
    })
    .on("mouseout", (d, i, n) => tip.hide());

  // create and call the axes
  const xAxis = d3
    .axisBottom(x)
    .tickValues(x.domain().filter((d, i) => i % 20 === 0)) // Display every 5 years
    .tickFormat((d) => new Date(d).getFullYear());

  const yAxis = d3
    .axisLeft(y)
    .ticks(8)
    .tickFormat((d) => `${d.toLocaleString("en-US")}`);

  xAxisGroup
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "end");

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
});

function formatDate(date) {
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const quarterStartMonth = (quarter - 1) * 3;
  const formattedDate = `${year}-${String(quarterStartMonth + 1).padStart(
    2,
    "0"
  )}-01`;
  return formattedDate;
}
