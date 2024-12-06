import React, { Component } from "react";
import * as d3 from "d3";

class WordCloudChild extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wordFrequency: [],
      selectedCategory: "Actors",
    };
  }

  componentDidMount() {
    this.updateWordFrequency();
    this.renderWordCloud();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.allActors !== this.props.allActors ||
      prevProps.allDirectors !== this.props.allDirectors ||
      prevState.selectedCategory !== this.state.selectedCategory
    ) {
      this.updateWordFrequency();
      this.renderWordCloud();
    }
  }

  updateWordFrequency = () => {
    const { allActors, allDirectors } = this.props;
    const { selectedCategory } = this.state;

    let words = [];

    if (selectedCategory === "Actors") {
      words = allActors.split(",").map((actor) => actor.trim());
    } else if (selectedCategory === "Directors") {
      words = allDirectors.split(",").map((director) => director.trim());
    }

    const wordFrequency = Object.entries(
      words.reduce((freq, word) => {
        if (word) {
          freq[word] = (freq[word] || 0) + 1;
        }
        return freq;
      }, {})
    );

    this.setState({ wordFrequency });
  };

  renderWordCloud() {
    const data = this.state.wordFrequency.sort((a, b) => b[1] - a[1]).slice(0, 10);
    const svg = d3.select(".wordcloud-svg");
    const containerWidth = 600;
    const containerHeight = 130;

    svg.selectAll("*").remove();
    svg.attr("width", containerWidth).attr("height", containerHeight);

    if (data.length === 0) {
      return;
    }

    const fontSizeScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d[1]), d3.max(data, (d) => d[1])])
      .range([10, 40]);

    let currentXPosition = 20;
    let currentYPosition = containerHeight / 2;
    const textElements = [];

    data.forEach((d) => {
      const textWidth = fontSizeScale(d[1]) * d[0].length * 0.6;

      if (currentXPosition + textWidth > containerWidth - 20) {
        currentXPosition = 20;
        currentYPosition += fontSizeScale(d[1]) + 10;
      }

      textElements.push({
        word: d[0],
        frequency: d[1],
        fontSize: fontSizeScale(d[1]),
        xPosition: currentXPosition,
        yPosition: currentYPosition,
      });
      currentXPosition += textWidth + 20;
    });

    const words = svg.selectAll("text").data(textElements, (d) => d.word);

    words
      .transition()
      .duration(1500)
      .attr("x", (d) => d.xPosition)
      .attr("y", (d) => d.yPosition)
      .style("font-size", (d) => `${d.fontSize}px`);

    words
      .enter()
      .append("text")
      .attr("x", (d) => d.xPosition)
      .attr("y", (d) => d.yPosition)
      .attr("fill", "black")
      .style("font-size", "1px")
      .text((d) => d.word)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .style("font-size", (d) => `${d.fontSize}px`);

    words.exit().remove();
  }

  handleCategoryChange = (event) => {
    this.setState({ selectedCategory: event.target.value });
  };

  render() {
    return (
      <div
        className="wordcloud-container"
        style={{
          marginTop: "-30px",
          padding: "5px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f9f9f9",
          textAlign: "center",
          maxWidth: "850px",
        }}
      >
        <h2>Word Cloud</h2>
        <div className="controls">
          <label>
            <input
              type="radio"
              value="Directors"
              checked={this.state.selectedCategory === "Directors"}
              onChange={this.handleCategoryChange}
            />
            Actors
          </label>
          <label style={{ marginLeft: "20px" }}>
            <input
              type="radio"
              value="Actors"
              checked={this.state.selectedCategory === "Actors"}
              onChange={this.handleCategoryChange}
            />
            Directors
          </label>
        </div>
        <div>
          <svg className="wordcloud-svg"></svg>
        </div>
      </div>
    );
  }
}

export default WordCloudChild;
