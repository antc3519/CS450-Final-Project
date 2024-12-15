import React, { Component } from "react";
import * as d3 from "d3";

class BarChartChild extends Component {

  componentDidUpdate() {
    const data = this.props.data;
    const genreData = {}

    data.forEach(movie => {
        const genrelist = movie.Genre.split(",").map(genre => genre.trim());
        genrelist.forEach(genre => {
            if (!genreData[genre]) {
                genreData[genre] = { sum: 0, count: 0 };
            }
            genreData[genre].sum += movie.Metascore;
            genreData[genre].count += 1;
        });
    });
  
    const genreAverages = {};
    Object.keys(genreData).forEach(genre => {
        genreAverages[genre] = (genreData[genre].sum / genreData[genre].count).toFixed(0);
    });

    const maxAverage = d3.max(Object.values(genreAverages));

    const margin = { top: 20, right: 30, bottom: 50, left: 40 },
    width = d3.select(".barchart").node().getBoundingClientRect().width,
    height = d3.select(".barchart").node().getBoundingClientRect().height,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select('#mysvg').attr('width', width).attr('height', height)
    svg.select('g').remove()
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    var xScale = d3.scaleBand().domain(Object.keys(genreData)).range([0, innerWidth]).padding(0.1);
    var yScale = d3.scaleLinear().domain([0, maxAverage]).range([innerHeight, 0]);

    g.selectAll(".x_axis_g2").data([0]).join('g').attr("class", 'x_axis_g2')
      .attr("transform", `translate(0, ${innerHeight})`).call(d3.axisBottom(xScale)).selectAll('text').style('text-anchor', 'end').attr('transform', 'rotate(-45)');
    
    g.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom - 5)
        .text("Genres");

    g.selectAll(".y_axis_g2").data([0]).join('g').attr("class", 'y_axis_g2').call(d3.axisLeft(yScale));

    g.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -innerHeight / 2)
        .attr("y", -margin.left + 15)
        .text("Average Metascore");

    const genreDataArray = Object.entries(genreAverages)

    g.selectAll("rect")
        .data(genreDataArray)
        .join("rect")
        .attr("x", function (d) {
            return xScale(d[0]);
        })
        .attr("y", function (d) {
            return yScale(d[1]);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return innerHeight - yScale(d[1]);
        })
        .style("fill", "#69b3a2");
  }

  render() {
    return (
        <div className='barchart' style={{width:"100%", height:"40%"}}>
            <svg id="mysvg">
                <g className="container"></g>
            </svg>
        </div>
    );
  }
}

export default BarChartChild;