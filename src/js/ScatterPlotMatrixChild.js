import React, { Component } from "react";
import * as d3 from "d3";

class ScatterPlotMatrixChild extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.state = {
      zoomedIn: false,
      xFeature: null,
      yFeature: null,
    };
  }

  componentDidMount() {
    this.createScatterPlotMatrix();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data !== this.props.data) {
      this.createScatterPlotMatrix();
    } else if (
      prevState.zoomedIn !== this.state.zoomedIn ||
      prevState.xFeature !== this.state.xFeature ||
      prevState.yFeature !== this.state.yFeature
    ) {
      this.state.zoomedIn
        ? this.createDetailedScatterPlot(this.state.xFeature, this.state.yFeature)
        : this.createScatterPlotMatrix();
    }
  }

  createScatterPlotMatrix = () => {
    const { data } = this.props;
    if (data.length === 0) return;

    const features = ["Rank", "Votes", "Rating", "Revenue (Millions)"];
    const size = 150;
    const padding = 20;
    const margin = { top: 20, right: 20, bottom: 50, left: 0 };
    const width = features.length * size + margin.left + margin.right;
    const height = features.length * size + margin.top + margin.bottom;
    
    const svg = d3.select(this.svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
      .style("padding", "0 100px 0 50px")
      .style("display", "block")
      .style("overflow", "visible");

    const scales = {};
    features.forEach((feature) => {
      scales[feature] = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d[feature]))
        .range([size - padding, padding]);
    });

    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

    features.forEach((yFeature, rowIndex) => {
      features.forEach((xFeature, colIndex) => {
        const g = svg
          .append("g")
          .attr(
            "transform",
            `translate(${colIndex * size + margin.left}, ${
              rowIndex * size + margin.top
            })`
          );

        let sumX = 0,
          sumY = 0,
          sumXY = 0,
          sumX2 = 0,
          sumY2 = 0,
          n = 0;

        data.forEach((d) => {
          const x = d[xFeature];
          const y = d[yFeature];
          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumX2 += x * x;
          sumY2 += y * y;
          n += 1;
        });

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt(
          (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
        );

        const correlation = denominator === 0 ? 0 : numerator / denominator;

        g.append("rect")
          .attr("width", size)
          .attr("height", size)
          .attr("fill", colorScale(correlation))
          .attr("opacity", 0.5)
          .on("click", () => {
            this.setState({ zoomedIn: true, xFeature, yFeature });
          });

        if (xFeature !== yFeature) {
          g.append("text")
            .attr("x", size / 2)
            .attr("y", 145)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text(`${yFeature} vs ${xFeature}`);
        }
      });

      svg
        .append("text")
        .attr(
          "transform",
          `translate(${margin.left - 30}, ${
            rowIndex * size + margin.top + size / 2
          }) rotate(-90)`
        )
        .style("text-anchor", "middle")
        .text(yFeature);
    });

    features.forEach((xFeature, colIndex) => {
      svg
        .append("text")
        .attr(
          "transform",
          `translate(${colIndex * size + margin.left + size / 2}, ${
            height - 15
          })`
        )
        .style("text-anchor", "middle")
        .text(xFeature);

    });
    this.createCorrelationLegend(svg, width, height, margin);

  };

  createCorrelationLegend = (svg, width, height, margin) => {
    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);
  
    // Position the legend next to the scatter plot matrix
    const legendHeight = height - margin.top - margin.bottom;
    const legendWidth = 20;
    const legendMargin = 10;
  
    const legend = svg.append("g")
      .attr("transform", `translate(${width + legendMargin}, ${margin.top})`);
  
    // Create a gradient for the legend
    const legendScale = d3.scaleLinear().domain([-1, 1]).range([legendHeight, 0]);
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "correlation-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "100%")
      .attr("y2", "0%");
  
    gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateRdBu(1));
    gradient.append("stop").attr("offset", "50%").attr("stop-color", d3.interpolateRdBu(0));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateRdBu(-1));
  
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#correlation-gradient)");
  
    // Add axis for the legend
    const legendAxis = d3.axisRight(legendScale).ticks(5);
    legend.append("g").attr("transform", `translate(${legendWidth}, 0)`).call(legendAxis);
  
    // Add label
    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .text("Correlation");
  };
  


  createDetailedScatterPlot = (xFeature, yFeature) => {
    const { data } = this.props;
    if (data.length === 0) return;

    const width = 600;
    const height = 600;
    const padding = 80;

    const svg = d3.select(this.svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
      .style("background", "white")
      .style("border", "1px solid gray")
      .style("position", "relative");

    const zoomedXScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d[xFeature]))
      .nice()
      .range([padding, width - padding]);

    const zoomedYScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d[yFeature]))
      .nice()
      .range([height - padding, padding]);

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => zoomedXScale(d[xFeature]))
      .attr("cy", (d) => zoomedYScale(d[yFeature]))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .style("display", "inline-block")
          .html(`${xFeature}: ${d[xFeature]}<br/>${yFeature}: ${d[yFeature]}<br/>Title: ${d.Title}`);
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("display", "none");
      });
    
    //x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - padding})`)
      .call(d3.axisBottom(zoomedXScale).tickFormat(d3.format("~s")));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 25)
      .style("text-anchor", "middle")
      .text(xFeature);

    //y-axis
    svg.append("g")
      .attr("transform", `translate(${padding},0)`)
      .call(d3.axisLeft(zoomedYScale).tickFormat(d3.format("~s")));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", padding / 3)
      .style("text-anchor", "middle")
      .text(yFeature);

    svg.append("text")
      .text("Close")
      .attr("x", width - 70)
      .attr("y", 50)
      .style("cursor", "pointer")
      .style("font-size", "20px")
      .style("fill", "red")
      .on("click", () => {
        this.setState({ zoomedIn: false, xFeature: null, yFeature: null });
      });
  };

  render() {
    return (
      <div>
        <svg ref={this.svgRef}></svg>
        <div
          id="tooltip"
          style={{
            position: "absolute",
            display: "none",
            background: "white",
            border: "1px solid gray",
            padding: "5px",
            pointerEvents: "none",
          }}
        ></div>
      </div>
    );
  }
}

export default ScatterPlotMatrixChild;
