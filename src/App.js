import React, { Component } from "react";
import * as d3 from "d3";
import imdbDataset from "./imdb_movie_dataset.csv";
import { sliderBottom } from "d3-simple-slider";
import FileUpload from "./js/FileUpload";
import ScatterPlotMatrixChild from "./js/ScatterPlotMatrixChild";
import WordCloudChild from "./js/WordCloudChild";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      yearRange: [2000, 2022],
      filteredData: [],
      allActors: "",
      allDirectors: "",
    };
  }

  componentDidMount() {
    // Load data
    d3.csv(imdbDataset).then((data) => {
      const parsedData = data.map((d) => ({
        Rank: +d.Rank,
        Votes: +d.Votes,
        Rating: +d.Rating,
        "Revenue (Millions)": +d["Revenue (Millions)"],
        Year: +d.Year,
        Title: d.Title,
        Director: d.Director,
        Actors: d.Actors,
      }));
      this.setState({ data: parsedData }, () => {
        this.updateFilteredData();
        this.concatenateNames();
      });
    });
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

    this.setState({ allActors, allDirectors });
  };

  handleSliderChange = (val) => {
    this.setState({ yearRange: val }, this.updateFilteredData);
  };

  handleFileUpload = (uploadedData, headers) => {
    this.setState({data: uploadedData}, () => {this.updateFilteredData();
      this.concatenateNames();
    })
  }

  render() {
    const { filteredData, allActors, allDirectors } = this.state;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          height: "100vh",
          overflow: "hidden",
          alignItems: "flex-start",
        }}
      >
        <div id = "scplotdiv"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexGrow: 1,
            overflow: "auto",
            width: "60%",
            height: "100%",
          }}
        >
          <h1 style={{ textAlign: "center" }}>Scatter Plot Matrix</h1>
          <ScatterPlotMatrixChild data={filteredData} />
          <div style={{ marginTop: "20px", flexShrink: 0 }}>
            <h3 style = {{textAlign: "center"}}>Filter by Year</h3>
            <svg className="slider-range" width="500" height="100" transform="translate(80,0)"></svg>
          </div>
        </div>

        {}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "40%",
            height: "100%"
          }}
        >
          <FileUpload onFileUpload = {this.handleFileUpload}></FileUpload>
          <WordCloudChild allActors={allActors} allDirectors={allDirectors} />
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
