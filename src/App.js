import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactMapboxGl, { Layer, Feature, Popup } from "react-mapbox-gl";

class App extends Component {
  constructor() {
    super();
    this.state = {
      center: [139.767023,35.669256],
      zoom: [5],
      "hotels": [],
      "journeys": [],
      "activities": []
    }
    this.onFeatureClick = this.onFeatureClick.bind(this);
  }
  componentDidMount() {
    var options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
        }
    };
    fetch("http://localhost:8000/api/v1/hotel/?format=json", options)
    .then((value) => {
      value.json().then((result) => {
        this.setState({"hotels": result.objects})
      })});
    fetch("http://localhost:8000/api/v1/journey/?format=json", options)
    .then((value) => {
      value.json().then((result) => {
        this.setState({"journeys": result.objects});
      })});
      fetch("http://localhost:8000/api/v1/activity/?format=json", options)
    .then((value) => {
      value.json().then((result) => {
        this.setState({"activities": result.objects});
      })});
  }

  onFeatureClick(args) {
    console.log(args.feature.layer.id);
    this.setState({"popup": {"coords": args.lngLat,
  "key": args.feature.layer.id}});
  }
  render() {
    let start_endpoints = [];
    let hotels = [];
    let planes = [];
    let trains = [];
    let activities = [];
    const colours = {"train": "#4790E5", "plane": "#46e559", "bus": "#e56846"}
    let popup;
    for(let i=0; i<this.state.hotels.length; i++) {
      const coords = this.state.hotels[i].position.split(",").map(Number).reverse();
      const id = "hotels-"+i;
      hotels.push(<Layer id={id} type="symbol"
      layout={{ "icon-image": "lodging-15" }}><Feature key={i} coordinates={coords} onClick={this.onFeatureClick} /></Layer>);
    }
    for(let i=0; i<this.state.activities.length; i++) {
      const coords = this.state.activities[i].position.split(",").map(Number).reverse();
      const id = "activities-"+i;
      activities.push(<Layer id={id} type="symbol"
      layout={{ "icon-image": "marker-15" }}><Feature key={i} coordinates={coords}  onClick={this.onFeatureClick} /></Layer>);
    }
    for(let i=0; i<this.state.journeys.length; i++) {
      const elem = this.state.journeys[i];
      const startpoint = elem.start.position.split(",").map(Number).reverse();
      const endpoint = elem.end.position.split(",").map(Number).reverse();
      const coords = [startpoint, endpoint];
      let lineoffset = 0;
      if(start_endpoints.indexOf(elem.start.name) > -1 && start_endpoints.indexOf(elem.end.name) > -1
      && elem.method == "plane")
      {
        lineoffset = 6;
      }
      const id = "journeys-"+i;
      planes.push(<Layer id={id} type="line" paint={{ "line-color": colours[elem.method], "line-width": 4,
      "line-offset": lineoffset }}>
                    <Feature coordinates={coords} onClick={this.onFeatureClick} />
                  </Layer>);
      start_endpoints.push(elem.start.name);
      start_endpoints.push(elem.end.name);
    }
    if(this.state.popup) {
      let indexor = this.state.popup.key.split("-");
      let data = this.state[indexor[0]][Number(indexor[1])];
      console.log(data);
      let name = data.name;
      if(!name) {
        name = data.start.name + " to " + data.end.name;
      }
      let rows = [];
      const excluded = ["start", "end", "resource_uri", "id"];
      for(const field in data) {
        console.log(data);
        if(excluded.indexOf(field) == -1) {
        rows.push(<tr><td>{field}</td><td>{data[field]}</td></tr>);
        }
      }
      popup = <Popup
  coordinates={this.state.popup.coords}
  offset={{
    'bottom-left': [12, -38],  'bottom': [0, -38], 'bottom-right': [-12, -38]
  }}
  anchor="bottom-right">
  <h2>{name}</h2>
  <table>
    <tbody>
      {rows}
    </tbody>
  </table>
</Popup>;
    }
    return (
      <ReactMapboxGl
  style="mapbox://styles/mapbox/streets-v8"
  accessToken="pk.eyJ1IjoiY2hhcndhcnoiLCJhIjoiY2ltNnU1c3g3MDAwNHdhbTlyN3J0a3gzayJ9.CdOg19NClAJoDH-jzpw57A"
  containerStyle={{
    height: "100vh",
    width: "100vw"
  }}
  center={this.state.center}
  zoom={this.state.zoom}>
  {popup}
    {hotels}
      {activities}
    {planes}
    {trains}
</ReactMapboxGl>
    );
  }
}
export default App;
