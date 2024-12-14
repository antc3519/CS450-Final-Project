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

    this.setState({ allActors, allDirectors, allDescriptions});
  };

  handleSliderChange = (val) => {
    this.setState({ yearRange: val }, this.updateFilteredData);
  };

  set_data = (uploadedData) => {
    this.setState({data: uploadedData}, () => {
      this.updateFilteredData();
      this.concatenateNames();
    })
  }

  render() {
    const { filteredData, allActors, allDirectors, allDescriptions, data } = this.state;
    return (
      <div>
      <FileUpload set_data={this.set_data}></FileUpload>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            height: "90vh",
            overflow: "hidden",
            alignItems: "flex-start",
          }}
        >
          <div style={{height: "90vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
            <h3 style={{transform: "rotate(-90deg) translate(50%, 0)", textAlign: "center"}}>Scatter Plot Matrix</h3>
          </div>
          <div id = "scplotdiv"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexGrow: 1,
              overflow: "auto",
              width: "55%",
              height: "100%",
            }}
          >
            
            <ScatterPlotMatrixChild data={filteredData} />
            <div style={{ marginTop: "5px", flexShrink: 0 }}>
              <h3 style = {{textAlign: "center", margin:0}}>Filter by Year</h3>
              <svg className="slider-range" width="500" height="100" transform="translate(80,0)"></svg>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              width: "50%",
              height: "100%"
            }}
          >
            <h2>Movie Keyword Wordcloud</h2>
            <WordCloudChild allActors={allActors} allDirectors={allDirectors} allDescriptions={allDescriptions}/>
            <h2 style={{margin: 0}}>Average Metascore by Genre</h2>
            <BarChartChild data={data}/>
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
