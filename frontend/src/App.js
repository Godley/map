import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactMapboxGl, { Layer, Feature, Popup } from "react-mapbox-gl";
import { CookiesProvider, withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import Dotenv from 'dotenv';

Dotenv.config();

function blendColors(c0, c1, p) {
  var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
  return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return hours+'hours, '+minutes+'minutes, '+seconds+ ' seconds';
}

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor() {
    super();
    this.state = {
      center: [139.767023,35.669256],
      zoom: [5],
      trips: [],
      "selected": null,
    }
    this.onFeatureClick = this.onFeatureClick.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
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
      let result = await fetch("/api/trips/?format=json", options);
      let trips = await result.json();
      for(let i=0; i<trips.length; i++) {
        for(let j=0; j<trips[i].journeys.length; j++) {
          let start_encoded = trips[i].journeys[j].start.replace(" ", "_")
          let end_encoded = trips[i].journeys[j].end.replace(" ", "_")
          let geocode_start = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${trips[i].country} ${start_encoded}.json?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
          let geocode_end = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${trips[i].country} ${end_encoded}.json?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
          geocode_start = await geocode_start.json();
          geocode_end = await geocode_end.json();
          trips[i].journeys[j].start_geocode = geocode_start.features[0].geometry.coordinates
          trips[i].journeys[j].end_geocode = geocode_end.features[0].geometry.coordinates
          trips[i].journeys[j].coords = []
          trips[i].journeys[j].coords.push(trips[i].journeys[j].start_geocode)
          trips[i].journeys[j].coords.push(trips[i].journeys[j].end_geocode)
          trips[i].journeys[j].name = `${trips[i].journeys[j].start} to ${trips[i].journeys[j].end}`
          trips[i].journeys[j].summary = {}
          if(trips[i].journeys[j].method.name !== 'plane' && geocode_start.features.length > 0 && geocode_end.features.length > 0) {
              let start = trips[i].journeys[j].start_geocode.join(",")
              let end = trips[i].journeys[j].end_geocode.join(",")
              let full_coords = `${start};${end}`
              let direction_line = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${full_coords}?approaches=curb;curb&geometries=geojson&steps=true&access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
              direction_line = await direction_line.json();
              if(direction_line.routes.length > 0) {
                trips[i].journeys[j].coords = direction_line.routes[0].geometry.coordinates
                trips[i].journeys[j].time_estimate = String(direction_line.routes[0].duration).toHHMMSS()
                trips[i].journeys[j].distance = direction_line.routes[0].distance / 1000
                trips[i].journeys[j].summary.time_estimate = trips[i].journeys[j].time_estimate
                trips[i].journeys[j].summary.distance = String(trips[i].journeys[j].distance) + " km"
              }
            }
          let route_info = JSON.parse(trips[i].journeys[j].route_info)
          for(let field in route_info) {
            trips[i].journeys[j].summary[field] = route_info[field]
          }
          trips[i].journeys[j].summary.day = trips[i].journeys[j].day
        }
      }
      
      
      this.setState({
        trips: trips
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
    this.setState({"popup": {"coords": args.lngLat,
  "key": args.feature.layer.id},
  "selected": args.feature.layer.id});
  }

  onMouseLeave(args) {
    this.setState({"popup": {},
  "selected": null})
  }

  render() {
    let start_endpoints = [];
    let hotels = [];
    let planes = [];
    let trains = [];
    let activities = [];
    let popup;
    for(let i=0; i<this.state.trips.length; i++) {
      for(let j=0; j<this.state.trips[i].journeys.length; j++) {
        const elem = this.state.trips[i].journeys[j];
        const id = `${i}-journeys-${j}`;
        let color = "#"+elem.method.color;
        let lineWidth = 4;
        let lineOffset = 0;
        if(this.state.selected != "" && this.state.selected != id && this.state.selected != null) {
          lineWidth = 2;
          color = blendColors(color, "#CDCDCD", 0.6);
        }
        if(elem.method.name == "plane") {
          lineOffset = 5
        }
       planes.push(<Layer id={id} type="line" paint={{ "line-color": color, "line-width": lineWidth, "line-offset": lineOffset}}>
                     <Feature coordinates={elem.coords} onMouseLeave={this.onMouseLeave} onClick={this.onFeatureClick} />
                   </Layer>);
        start_endpoints.push(elem.start.name);
        start_endpoints.push(elem.end.name);
      }
      for(let j=0; j<this.state.trips[i].stays.length; j++) {
        const id = `${i}-stays-${j}`;
        hotels.push(<Layer id={id} type="symbol" layout={{ "icon-image": "lodging-15" }}>
        <Feature coordinates={[this.state.trips[i].stays[j].lng,this.state.trips[i].stays[j].lat]} onMouseLeave={this.onMouseLeave} onClick={this.onFeatureClick} />
      </Layer>)
      }
      for(let j=0; j<this.state.trips[i].activities.length; j++) {
        const id = `${i}-activities-${j}`;
        activities.push(<Layer id={id} type="symbol" layout={{ "icon-image": "lodging-15" }}>
        <Feature coordinates={this.state.trips[i].activities[j].coords} onMouseLeave={this.onMouseLeave} onClick={this.onFeatureClick} />
      </Layer>)
      }
    }
    
    if(this.state.selected) {
      let indexor = this.state.popup.key.split("-");
      let data = this.state.trips[indexor[0]][indexor[1]][indexor[2]];
      let rows = [];
      if(data.summary) {
        for(let field in data.summary) {
          rows.push(<tr><td><b>{field}</b></td><td>{data.summary[field]}</td></tr>);
        }
      } else {
        for(let field in data) {
          if(field == "link") {
            rows.push(<tr><td><b>{field}</b></td><td><a href={data[field]}>link</a></td></tr>);
          } else {
            rows.push(<tr><td><b>{field}</b></td><td>{data[field]}</td></tr>);
          }
        }
      }
        
      popup = <Popup
                coordinates={this.state.popup.coords}
                anchor="bottom-right">
                <h2>{data.name}</h2>
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
  {this.state.selected? popup : null}
  {planes}
  {hotels}
</ReactMapboxGl>
    );
  }
}
export default App;
