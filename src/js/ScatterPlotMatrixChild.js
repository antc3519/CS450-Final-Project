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
    window.addEventListener('resize', this.createScatterPlotMatrix);
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
    const padding = 0;
    const margin = { top: 20, right: 0, bottom: 50, left: 20 };
    const width = d3.select("#scatterContainer").node().getBoundingClientRect().width;
    const height = d3.select("#scatterContainer").node().getBoundingClientRect().height;
    var size = width / 5;
    if (height < width) {
      size = height / 5;
      margin.left = (width - height) / 2
    }
      
    const svg = d3.select(this.svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
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
          .attr("fill", colorScale(-correlation))
          .attr("opacity", 0.5)
          .on("click", () => {
            this.setState({ zoomedIn: true, xFeature, yFeature });
          });
  
        if (xFeature !== yFeature) {
          g.append("text")
            .attr("x", size / 2)
            .attr("y", size/2)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text(`${yFeature.substring(0,7)} vs ${xFeature.substring(0,7)}`);
          g.append("text")
            .attr("x", size /2)
            .attr("y", size / 2 + 20)
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .text(correlation.toFixed(2))
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
            size * 4 + 40 + margin.top
          })`
        )
        .style("text-anchor", "middle")
        .text(xFeature);
    });
  
    
    const corrScale = d3.scaleLinear().domain([-200, 200]).range(colorScale.domain());
    const positionScale = d3
      .scaleLinear()
      .domain([0, 200])
      .range([70, height - margin.top - margin.bottom - 70]);
  
    const positionRects = Array.from({ length: 200 }, (_, i) => i);
  
    const legendSvg = svg
      .selectAll(".myclass")
      .data([0])
      .join("g")
      .attr("class", "myclass")
      .attr("transform", `translate(${margin.left + size*4}, ${0})`);
  
    
    legendSvg
      .selectAll("rect")
      .data(positionRects)
      .join("rect")
      .attr("x", 40)
      .attr("y", (d) => positionScale(d))
      .attr("width", 20)
      .attr("height", positionScale(1) - positionScale(0))
      .style("fill", (d) => d3.interpolateRdBu(corrScale(d)));
    
    legendSvg
      .selectAll(".corr_text")
      .data([0])
      .join("text")
      .attr("class", "corr_text")
      .text("Correlation Color Scale")
      .attr("x", -60)
      .attr("y", 300)
      .style("transform", "translate(-220px, 200px) rotate(-90deg)")
      .style("text-anchor", "middle");
  };
  


  
  
  createDetailedScatterPlot = (xFeature, yFeature) => {
    const { data } = this.props;
    if (data.length === 0) return;
    const width = d3.select("#scatterContainer").node().getBoundingClientRect().width;
    const height = d3.select("#scatterContainer").node().getBoundingClientRect().height;
    const padding = 60;

    const svg = d3.select(this.svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
      .style("background", "white")
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
    
    
    svg.append("g")
      .attr("transform", `translate(0,${height - padding})`)
      .call(d3.axisBottom(zoomedXScale).tickFormat(d3.format("~s")));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 25)
      .style("text-anchor", "middle")
      .text(xFeature);

    
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
      <div id="scatterContainer" style={{width:"90%", height:"75%"}}>
        <svg ref={this.svgRef}></svg>
        <div
          id="tooltip"
          style={{
            position: "absolute",
            display: "none",
            background: "white",
            padding: "5px",
            pointerEvents: "none",
          }}
        ></div>
      </div>
    );
  }
}

export default ScatterPlotMatrixChild;