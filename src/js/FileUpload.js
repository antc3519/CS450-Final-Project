import React, { Component } from 'react';
import * as d3 from "d3";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,  // New state to store the parsed JSON data
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.setState({ jsonData: json });  // Set JSON to state
        this.props.set_data(json)
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const data = d3.csvParse(csv)
    const parsedData = data.map((d) => ({
      Rank: +d.Rank,
      Votes: +d.Votes,
      Rating: +d.Rating,
      "Revenue (Millions)": +d["Revenue (Millions)"],
      Year: +d.Year,
      Metascore: +d.Metascore,
      Genre: d.Genre,
      Description: d.Description,
      Title: d.Title,
      Director: d.Director,
      Actors: d.Actors,
    }));
    console.log(parsedData)
    return parsedData;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: "0px 20px", height: "10vh"}}>
        <h2 style={{margin:0}}>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input type="file" accept=".csv" onChange={(event) => this.setState({ file: event.target.files[0] })} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;