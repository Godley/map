import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactMapboxGl, { Layer, Feature, Popup } from "react-mapbox-gl";
import { CookiesProvider, withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import Dotenv from 'dotenv';

Dotenv.config();

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
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
  async componentDidMount() {
    const { cookies } = this.props;
    var options = {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
      }
    };
    try {
      let result = await fetch("/api/journeys/?format=json", options);
      let journeys = await result.json();
      for(let i=0; i<journeys.length; i++) {
        let start_encoded = journeys[i].start.replace(" ", "_")
        let end_encoded = journeys[i].end.replace(" ", "_")
        let geocode_start = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${start_encoded}.json?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
        let geocode_end = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${end_encoded}.json?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
        geocode_start = await geocode_start.json();
        geocode_end = await geocode_end.json();
        console.log(geocode_start)
        console.log(geocode_end)
        journeys[i].start_geocode = geocode_start.features[0].geometry.coordinates
        journeys[i].end_geocode = geocode_end.features[0].geometry.coordinates
        journeys[i].coords = journeys[i].start_geocode.reverse() + journeys[i].end_geocode.reverse()
        console.log(journeys[i].start_geocode)
        console.log(journeys[i].end_geocode)
        if(journeys[i].method.name !== 'plane' && geocode_start.features.length > 0 && geocode_end.features.length > 0) {
            let start = journeys[i].start_geocode.join(",")
            let end = journeys[i].end_geocode.join(",")
            let full_coords = `${start};${end}`
            let direction_line = await fetch(`https://api.mapbox.com/matching/v5/mapbox/driving/${full_coords}?approaches=curb&geometries=geojson&profile=mapbox/driving&access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
            if(direction_line.matchings.length > 0) {
              journeys[i].coords = direction_line.matchings[0].geometry.coordinates
            }
          } 
        
      }
      this.setState({
        "journeys": journeys,
        // "hotels": hotels.objects,
        // "activities": activities.objects
      });
    }
    catch (exception) {
      console.log(exception)
      // let result = await fetch("/api/guestjourney/?format=json", options);
      // let journeys = await result.json();
      // this.setState({
      //   "journeys": journeys.objects
      // });
    }
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
    let popup;

    if (!this.state.journeys) {
        return null
    }
    for(let i=0; i<this.state.journeys.length; i++) {
      const elem = this.state.journeys[i];
      let lineoffset = 0;
      console.log(elem)
      const id = "journeys-"+i;
     planes.push(<Layer id={id} type="line" paint={{ "line-color": "#"+elem.method.color, "line-width": 4,
     "line-offset": lineoffset }}>
                   <Feature coordinates={elem.coords} onClick={this.onFeatureClick} />
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
  accessToken={process.env.REACT_APP_MAPBOX_API_KEY}
  containerStyle={{
    height: "100vh",
    width: "100vw"
  }}
  center={this.state.center}
  zoom={this.state.zoom}>
  {popup}
    {planes}
    {trains}
</ReactMapboxGl>
    );
  }
}
export default App;
