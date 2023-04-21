import { Component, Fragment } from 'react';
import AppImage from './Components/AppImage';
import './styles/App.css';

import images from "./data/JSON/images.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { imagePool: [], windowSize: 10, start: 0, index: 0, intervalID: null, playDir: 0};
  }

  // load images in the specified window for faster response on subsequent navigation
  componentDidMount() {
    let loads = [], pool = [];

    for (let i = 0; i < this.state.windowSize; i++) {
      loads.push(new Promise((resolve, reject) => {
        let image = new Image();
        image.src = images[i];
        image.onload = (e) => {
          resolve({src: e.target.src, height: e.target.height, width: e.target.width});
        };
        image.onerror = reject;
      }));

      pool.push({src: "", height: 0, width: 0});
    }

    // trigger a re-render once all the images have been loaded successfully
    Promise.all(loads).then(res => {
      let newState = {...this.state, imagePool: pool};
      newState.imagePool = newState.imagePool.map((x, index) => ({...res[index]}));
      
      this.setState(newState);
    });
  }

  render() {
    return (
      <Fragment>
        <div id = "header"> Image Viewer </div>
        <div id = "container-app">
          <div id = "container-image">
          {
            (this.state.imagePool[this.state.index - this.state.start]?.src || "") === "" ? (
              <div className = "image status">Loading</div>
            ) : (
              <AppImage {...this.state.imagePool[this.state.index - this.state.start]} key = {this.state.imagePool[this.state.index - this.state.start].src} />
            )
          }
          </div>
          <div id = "container-control">
            <div className = "control-left">
              <button 
                onClick = { () => { this.incrementIndex(-1); } } 
                className = "btn-control"
              >
                <FontAwesomeIcon icon = { icon({name: "angle-left", style: "solid"}) }/>
              </button>
            </div>
            <div className = "control-middle">
              <div>
                {
                  this.state.playDir === 1 ? (
                  <button 
                    onClick = { () => this.handlePlay(false, 0) } 
                    className = "btn-control"
                  >
                    <FontAwesomeIcon icon = { icon({name: "pause", style: "solid"}) }/>
                  </button>
                  ) : (
                  <button 
                    onClick = { () => this.handlePlay(true, 1) } 
                    className = "btn-control"
                  >
                    <FontAwesomeIcon icon = { icon({name: "play", style: "solid"}) }/>
                  </button>
                  )
                }
                {
                    this.state.playDir === -1 ? (
                    <button 
                      onClick = { () => this.handlePlay(false, 0) } 
                      className = "btn-control flip-X"
                    >
                      <FontAwesomeIcon icon = { icon({name: "pause", style: "solid"}) }/>
                    </button>
                    ) : (
                    <button 
                      onClick = { () => this.handlePlay(true, -1) } 
                      className = "btn-control flip-X"
                    >
                      <FontAwesomeIcon icon = { icon({name: "play", style: "solid"}) }/>
                    </button>
                  )
                }
              </div>
            </div>
            <div className = "control-right">
            <button 
                onClick = { () => { this.incrementIndex(1); } } 
                className = "btn-control"
              >
                <FontAwesomeIcon icon = { icon({name: "angle-right", style: "solid"}) }/>
              </button>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    let forward = Boolean(this.state.index > prevState.index);
    let nState = {...this.state};
    nState.imagePool = nState.imagePool.map(x => ({...x}));

    // if indices are not equal, update the imagePool
    // this assumes absolute increment is never more than 1
    if (prevState.index !== this.state.index) {
      // if window can't be shifted, index can still change as long as it doesn't go out of bounds
      if (forward && (this.state.start + this.state.windowSize >= images.length)) return;
      if (!forward && (this.state.start - 1 < 0)) return;

      // slide the window
      if (this.state.index > prevState.index) {
        nState.imagePool.shift();
        nState.imagePool.push({src: "", height: 0, width: 0});
        nState.start += 1;

        let image = new Image();
        image.src = images[nState.start + nState.windowSize - 1];
        image.onload = (e) => {
          nState.imagePool[nState.imagePool.length - 1] = {src: e.target.src, width: e.target.width, height: e.target.height};
          this.setState(nState);
        };
      }
      else {
        nState.imagePool.pop();
        nState.imagePool.unshift({src: "", height: 0, width: 0});
        nState.start -= 1;

        let image = new Image();
        image.src = images[nState.start];
        image.onload = (e) => {
          nState.imagePool[0] = {src: e.target.src, width: e.target.width, height: e.target.height};
          this.setState(nState);
        };
      }
    }
  }

  componentWillUnmount() { }

  // ---------- helper methods

  incrementIndex(count) {
    if (this.state.index + count >= images.length || this.state.index + count < 0) return;
    else this.setState({...this.state, index: this.state.index + count});
  }

  /**
   * @param { Boolean } play play (true) / pause (false)
   * @param { Number } direction -1 for backwards, 1 for forward
   */
  handlePlay(play, direction) {
    if (play) {
      if (this.state.playDir === direction || Math.abs(direction) !== 1) return;

      if (this.state.intervalID !== null) clearInterval(this.state.intervalID);
      let id = setInterval(() => this.incrementIndex(direction), 700);
      this.setState({...this.state, intervalID: id, playDir: direction});
    }
    else {
      if (this.state.intervalID !== null) {
        clearInterval(this.state.intervalID);
        this.setState({ ...this.state, intervalID: null, playDir: 0 });
      }
    }
  }
};