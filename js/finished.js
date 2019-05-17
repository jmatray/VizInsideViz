'use strict';
/*
1. make a filterByYear function

*/

(function () {

  let data = "no data";
  let dataByYear = "";
  let allYearsData = "no data";
  let svgLinePlot = ""; // keep SVG reference in global scope
  let svgScatterPlot = "";
  let select = "";
  var line = "";
  let div = "";



  // load data and make scatter plot after window loads
  window.onload = function () {
    // Define the line


    svgLinePlot = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);




    // Append dropdown to body, and add function to remake scatterplot
    // with filtered year
    select = d3.select("body")
      .append("div")
      .attr('id', 'selectHolder')
      .append("text")
      .text("Year ")
      .attr('id', 'year')
      .append("select")
      .attr('id', 'dropdown')
      .on("change", function (d) {
        let value = d3.select(this).property("value");
        makeLinePlot(value);
        //makeScatterPlot(value);
      });

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/dataEveryYear.csv")
      .then((csvData) => {
        data = csvData

        allYearsData = csvData;

        // Add countries to dropdown
        let countries = allYearsData.map((row) => row['location']);
        let distinctCountries = [...new Set(countries)];
        select.selectAll("option")
          .data(distinctCountries)
          .enter()
          .append("option")
          .attr("value", function (d) { return d; })
          .property("selected", function (d) { return d === 'USA' })
          .text(function (d) { return d; });
        makeLinePlot("USA");
      });
  }


  // make title and axes labels
  function makeLabels() {
    svgLinePlot.append('text')
      .attr('x', 50)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text("Countries by Life Expectancy and Fertility Rate (" + data[0]["time"] + ")");

    svgLinePlot.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Fertility Rates (Avg Children per Woman)');

    svgLinePlot.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Life Expectancy (years)');
  }

  function filterByCountry(country) {
    data = allYearsData.filter((row) => row['location'] == country);
  }

  function filterByYear(year) {
    dataByYear = allYearsData.filter((row) => row['time'] == year);
  }

  // make title and axes labels
  function makeLabels() {

    svgLinePlot.append('text')
      .attr('x', 50)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text("Countries by Time and Population Size (" + data[0]["location"] + ")");

    svgLinePlot.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '14pt')
      .text('Population Size (millions)');

    svgLinePlot.append('text')
      .attr('transform', 'translate(20, 300)rotate(-90)')
      .style('font-size', '14pt')
      .text('Year');
  }

    // make title and axes labels
    function makeScatterLabels() {

      svgScatterPlot.append('text')
        .attr('x', 15)
        .attr('y', 20)
        .style('font-size', '10pt')
        .text("Countries by Life Expectancy and Fertility Rate");
  
      svgScatterPlot.append('text')
        .attr('x', 25)
        .attr('y', 285)
        .style('font-size', '10pt')
        .text('Fertility Rates (Avg Children per Woman)');
  
      svgScatterPlot.append('text')
        .attr('transform', 'translate(20, 200)rotate(-90)')
        .style('font-size', '10pt')
        .text('Life Expectancy (years)');
    }

    // make scatter plot with trend line
    function makeLinePlot(country) {
      svgLinePlot.html("");
      filterByCountry(country);
  
      // get arrays of fertility rate data and life Expectancy data
      let pop_size_data = data.map((row) => parseFloat(row["pop_mlns"]));
      let year_data = data.map((row) => row["time"]);
  
      // find data limits
      let axesLimits = findMinMax(year_data, pop_size_data);
  
      // draw axes and return scaling + mapping functions
      let mapFunctions = drawAxes(axesLimits, "time", "pop_mlns", svgLinePlot, { min: 50, max: 450 }, { min: 50, max: 450 });
  
      // plot data as points and add tooltip functionality
      plotLine(mapFunctions);
  
      // draw title and axes labels
      makeLabels();
    }
  


  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotLine(map) {
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;


    // line = d3.line()
    //   .x(function (d, i) {return xMap(d.time); }) // set the x values for the line generator
    //   .y(function (d) {console.log(d); return yMap(d['pop_mlns']); }) // set the y values for the line generator 
    //   .curve(d3.curveMonotoneX) // apply smoothing to the line

    // make tooltip
    d3.select(".tooltip").remove();
    div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let line = d3.line()
      .x((d) => map.x(d))
      .y((d) => map.y(d));
    svgLinePlot.append('path')
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // append data to SVG and plot as points
    svgLinePlot.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', '4px')
      .attr('fill', "#4286f4")
      // add tooltip functionality to points
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html("")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          div.html("");
          svgScatterPlot = d3.select(".tooltip")
          .append('svg')
          .attr('width', 400)
          .attr('height', 400);
        makeScatterPlot(d["time"], svgScatterPlot);
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  // make scatter plot with trend line
  function makeScatterPlot(year) {
    svgScatterPlot.html("");

    filterByYear(year)

    // get arrays of fertility rate data and life Expectancy data
    let fertility_rate_data = dataByYear.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = dataByYear.map((row) => parseFloat(row["life_expectancy"]));

    // find data limits
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy", svgScatterPlot, { min: 50, max: 250 }, { min: 30, max: 250 });

    // plot data as points and add tooltip functionality
    plotDots(mapFunctions, fertility_rate_data, life_expectancy_data);

    // draw title and axes labels
    makeScatterLabels();
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotDots(map, fertility, life_expectancy) {

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;


    // append data to SVG and plot as points
    svgScatterPlot.selectAll('.dot')
      .data(dataByYear)
      .enter()
      .append('circle')
      .attr('cx',xMap)
      .attr('cy', yMap)
      .attr('r', '4px')
      .attr('fill', "#4286f4")
  }


  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function (d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svg.append("g")
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) { return +d[y] }

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
