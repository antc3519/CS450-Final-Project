import React, { Component } from 'react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,
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
        console.log('text', json)
        const headers = this.getHeaders(text); // Extract headers from the CSV
        this.props.onFileUpload(json, headers); // Pass JSON data and headers to parent
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = currentLine[index]?.trim();
      });
      if (Object.keys(obj).length && lines[i].trim()) {
        result.push(obj);
      }
    }
    return result;
  };

  getHeaders = (csv) => {
    const lines = csv.split("\n");
    return lines[0].split(",").map((header) => header.trim());
  };

  render() {
    return (
      <div style={{marginBottom: 100, backgroundColor: "#f0f0f0", paddingBottom: 50, paddingRight:120, paddingLeft:120 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit} style = {{display: 'flex'}}>
          <input type="file" accept=".csv" onChange={(event) => this.setState({ file: event.target.files[0] })} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
