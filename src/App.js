import React, { Component } from "react";
import * as d3 from "d3";
import imdbDataset from "./imdb_movie_dataset.csv";
import { sliderBottom } from "d3-simple-slider";
import FileUpload from "./js/FileUpload";
import ScatterPlotMatrixChild from "./js/ScatterPlotMatrixChild";
import WordCloudChild from "./js/WordCloudChild";
import BarChartChild from "./js/BarChartChild";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      yearRange: [2000, 2022],
      filteredData: [],
      allActors: "",
      allDirectors: "",
      allDescriptions: "",
    };
  }

  updateFilteredData = () => {
    const { data, yearRange } = this.state;
    if (data.length > 0) {
      const filteredData = data.filter(
        (d) => d.Year >= yearRange[0] && d.Year <= yearRange[1]
      );
      this.setState({ filteredData });
    }
  };

  concatenateNames = () => {
    const { data } = this.state;

    const allActors = data
      .map((d) => d.Actors)
      .filter((actors) => actors !== undefined && actors !== "")
      .flatMap((actors) => actors.split(",").map((actor) => actor.trim()))
      .join(", ");

    const allDirectors = data
      .map((d) => d.Director)
      .filter((director) => director !== undefined && director !== "")
      .join(", ");

    const allDescriptions = data
      .map((d) => d.Description)
      .filter((desc) => desc !== undefined && desc !== "")
      .join(", ");

    this.setState({ allActors, allDirectors, allDescriptions });
  };

  handleSliderChange = (val) => {
    this.setState({ yearRange: val }, this.updateFilteredData);
  };

  set_data = (uploadedData) => {
    this.setState({ data: uploadedData }, () => {
      this.updateFilteredData();
      this.concatenateNames();
    });
  };

  render() {
    const { filteredData, allActors, allDirectors, allDescriptions, data } = this.state;
    return (
      <div style={{ height: "100vh", width: "100vw", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box"}}>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // Space out child divs evenly
            alignItems: "center", // Center align vertically
            height: "90vh", // Remaining viewport height after FileUpload
            width: "100%", // Full width of the viewport
            overflow: "hidden", // Avoid scrolling
            padding: "0 1vw", // Add a little padding for spacing
            boxSizing: "border-box",
          }}
        > 
          <div
            id="scplotdiv"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexGrow: 1,
              width: "50%",
              height: "100%",
            }}
          >
            <h2 style={{textAlign: "center" }}>Scatter Plot Matrix</h2>
            <div style={{
                marginBottom: "5px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Filter by Year</h3>
              <svg className="slider-range" style={{ width: "90%", maxWidth: "500px", height: "70px" }}></svg>
            </div>
  
            <ScatterPlotMatrixChild data={filteredData} style={{
              width: "100%",
              height: "60%",
            }}/>
          </div>
  
          <div
            style={{
              textAlign: "center",
              width: "50%", // Use 50% of available space
              height: "100%", // Full height
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around", // Space out children evenly
            }}
          >
            <h2>Movie Keyword Wordcloud</h2>
            <WordCloudChild allActors={allActors} allDirectors={allDirectors} allDescriptions={allDescriptions} style={{
              width: "100%",
              height: "45%", // Take up less than half of the parent div
            }}/>
            <h2 style={{ margin: 0 }}>Average Metascore by Genre</h2>
            <BarChartChild data={data} style={{
              width: "100%",
              height: "45%", // Take up less than half of the parent div
            }}/>
          </div>
        </div>
      </div>
    );
  }
  

  componentDidUpdate() {
    const { data, yearRange } = this.state;
    if (data.length === 0) return;

    const sliderRange = sliderBottom()
      .min(d3.min(data, (d) => d.Year))
      .max(d3.max(data, (d) => d.Year))
      .width(300)
      .tickFormat(d3.format("d"))
      .ticks(5)
      .default(yearRange)
      .fill("#85bb65")
      .on("onchange", this.handleSliderChange);

    const gRange = d3
      .select(".slider-range")
      .selectAll(".slider-g")
      .data([null])
      .join("g")
      .attr("class", "slider-g")
      .attr("transform", "translate(20,20)");

    gRange.call(sliderRange);
  }
}

export default App;
