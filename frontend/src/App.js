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

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor() {
    super();
    this.state = {
      center: [139.767023,35.669256],
      zoom: [5],
      data: {
        "stays": [],
      "journeys": [],
      "activities": [],
      },
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
      let result = await fetch("/api/journeys/?format=json", options);
      let journeys = await result.json();
      for(let i=0; i<journeys.length; i++) {
        let start_encoded = journeys[i].start.replace(" ", "_")
        let end_encoded = journeys[i].end.replace(" ", "_")
        let geocode_start = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${start_encoded}.json?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
        let geocode_end = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${end_encoded}.json?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
        geocode_start = await geocode_start.json();
        geocode_end = await geocode_end.json();
        journeys[i].start_geocode = geocode_start.features[0].geometry.coordinates
        journeys[i].end_geocode = geocode_end.features[0].geometry.coordinates
        journeys[i].coords = []
        journeys[i].coords.push(journeys[i].start_geocode)
        journeys[i].coords.push(journeys[i].end_geocode)
        if(journeys[i].method.name !== 'plane' && geocode_start.features.length > 0 && geocode_end.features.length > 0) {
            let start = journeys[i].start_geocode.join(",")
            let end = journeys[i].end_geocode.join(",")
            let full_coords = `${start};${end}`
            let direction_line = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${full_coords}?approaches=curb;curb&geometries=geojson&steps=true&access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`)
            direction_line = await direction_line.json();
            if(direction_line.routes.length > 0) {
              journeys[i].coords = direction_line.routes[0].geometry.coordinates
            }
          } 
        
      }
      let stays = await fetch("/api/stays/?format=json", options);
      stays = await stays.json();
      
      this.setState({
        data: {
          journeys: journeys,
          stays: stays,
        }
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

    for(let i=0; i<this.state.data["journeys"].length; i++) {
      const elem = this.state.data["journeys"][i];
      const id = "journeys-"+i;
      let color = "#"+elem.method.color;
      let lineWidth = 4;
      if(this.state.selected != "" && this.state.selected != id) {
        lineWidth = 2;
        color = blendColors(color, "#505050", 0.2);
      }
     planes.push(<Layer id={id} type="line" paint={{ "line-color": color, "line-width": lineWidth}}>
                   <Feature coordinates={elem.coords} onClick={this.onFeatureClick} />
                 </Layer>);
      start_endpoints.push(elem.start.name);
      start_endpoints.push(elem.end.name);
    }
    for(let i=0; i<this.state.data["stays"].length; i++) {
      const id = "stays-"+i;
      console.log(this.state.data["stays"][i].lng,this.state.data["stays"][i].lat)
      hotels.push(<Layer id={id} type="marker" layout={{ "icon-image": "lodging-15" }}>
      <Feature coordinates={[this.state.data["stays"][i].lng,this.state.data["stays"][i].lat]} onMouseLeave={this.onMouseLeave} onClick={this.onFeatureClick} />
    </Layer>)
    }
    if(this.state.selected) {
      let indexor = this.state.popup.key.split("-");
      let data = this.state.data[indexor[0]][indexor[1]];
      let name = data.name;
      if(!name) {
        name = data.start + " to " + data.end;
      }
      let rows = [];
      let route_info = JSON.parse(data.route_info)
      rows.push(<tr><td>Date</td><td>{data.datetime}</td></tr>)
      for(let field in route_info) {
        rows.push(<tr><td><b>{field}</b></td><td>{route_info[field]}</td></tr>)
      }
        
      popup = <Popup
                coordinates={this.state.popup.coords}
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
  {this.state.selected? popup : null}
  {planes}
</ReactMapboxGl>
    );
  }
}
export default App;
