import React, { Component } from "react";
import * as d3 from "d3";
import cloud from 'd3-cloud';

class WordCloudChild extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: "Actors",
    };
  }

  componentDidMount() {
    this.updateWordFrequencies();
  }

  componentDidUpdate() {
    this.updateWordFrequencies();
  }

  updateWordFrequencies = () => {
    const filterWords = ["a", "of", "to", "the", "on", "is", "and", "in", "his","her","who","that","A","with","their","for","he","she","an","from","by","The","as"]
    const { allActors, allDirectors, allDescriptions } = this.props;
    const { selectedCategory } = this.state;

    let words;
    let wordFrequencies;
    let combinedWords;
    if (selectedCategory === 'Actors') {
      words = allActors.split(',');
      combinedWords = words.map(word => word.trim()).filter(word => word);
      wordFrequencies = Array.from(
        combinedWords.reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map()),
        ([text, size]) => ({ text, size: size * 8 - 70 }) // Scale frequency to font size
      );
    } else if (selectedCategory === 'Directors') {
      words = allDirectors.split(',');
      combinedWords = words.map(word => word.trim()).filter(word => word);
      wordFrequencies = Array.from(
        combinedWords.reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map()),
        ([text, size]) => ({ text, size: size * 10 - 30 }) // Scale frequency to font size
      );
    } else {
      words = allDescriptions.trim(',').split(' ');
      combinedWords = words.map(word => word.trim()).filter(word => word).filter(word => !filterWords.includes(word));
      wordFrequencies = Array.from(
        combinedWords.reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map()),
        ([text, size]) => ({ text, size: size / 2 }) // Scale frequency to font size
      );
    }

    wordFrequencies.sort((a, b) => b.size - a.size)
    wordFrequencies = wordFrequencies.slice(0,30)
    console.log(wordFrequencies)
    this.generateWordCloud(wordFrequencies);
  };

  handleCategoryChange = (event) => {
    this.setState({ selectedCategory: event.target.value }, this.updateWordFrequencies);
  };

  generateWordCloud = (frequencies) => {
    d3.select(this.refs.wordCloud).selectAll('*').remove(); // Clear previous SVG
    var width = d3.select("#cloudContainer").node().getBoundingClientRect().width - 50
    var height = d3.select("#cloudContainer").node().getBoundingClientRect().height - 100

    const layout = cloud()
      .size([width, height]) // Width and height of the word cloud
      .words(frequencies)
      .padding(5) // Space between words
      .rotate(() => 0) // No rotation for this example
      .fontSize(d => d.size) // Font size is based on the size attribute
      .spiral('archimedean') // Use archimedean spiral
      .on('end', this.draw);

    layout.start();
  };

  draw = (words) => {
    var width = d3.select("#cloudContainer").node().getBoundingClientRect().width - 40
    var height = d3.select("#cloudContainer").node().getBoundingClientRect().height - 100
    const svg = d3.select(this.refs.wordCloud)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate('+width/2+20+','+height/2+20+')');

    svg.selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', d => `${d.size}px`)
      .style('fill', () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
      .text(d => d.text);

    this.applyOvalMask(svg);
  };

  applyOvalMask = (svg) => {
    const defs = svg.append('defs');
    var width = d3.select("#cloudContainer").node().getBoundingClientRect().width - 40
    var height = d3.select("#cloudContainer").node().getBoundingClientRect().height - 100

    defs.append('clipPath')
      .attr('id', 'oval-mask')
      .append('ellipse')
      .attr('cx', width/2) // Center X
      .attr('cy', height/2) // Center Y
      .attr('rx', 350) // Horizontal radius
      .attr('ry', 150); // Vertical radius

    svg.select('g')
      .attr('clip-path', 'url(#oval-mask)');
  };

  render() {
    return (
      <div style={{ width: "100%", height:"30%"}} id="cloudContainer">
        
        <div style={{display:"flex",justifyContent:"center"}}>
          <label>
            <input
              type="radio"
              value="Actors"
              checked={this.state.selectedCategory === 'Actors'}
              onChange={this.handleCategoryChange}
            />
            Actors
          </label>
          <label>
            <input
              type="radio"
              value="Directors"
              checked={this.state.selectedCategory === 'Directors'}
              onChange={this.handleCategoryChange}
            />
            Directors
          </label>
          <label>
            <input
              type="radio"
              value="Descriptions"
              checked={this.state.selectedCategory === 'Descriptions'}
              onChange={this.handleCategoryChange}
            />
            Descriptions
          </label>
        </div>
        <div ref="wordCloud" style={{padding:20}} />
      </div>
    );
  }
}

export default WordCloudChild;
