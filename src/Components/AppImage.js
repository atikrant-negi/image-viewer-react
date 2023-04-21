import { Component} from 'react';
import '../styles/App.css';

export default class AppImage extends Component {
    constructor(props) {
        super(props);
        this.state = { height: 0, width: 0};
    }

    componentDidMount() {
        this.updateSizing();
    }

    render() {
        return (
            <img className = "image" src = { this.props.src } alt = { this.props.src }
            style = {{ width: this.state.width, height: this.state.height, animation: "anim 0.3s ease-in" }}
            />
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateSizing();
    }

    shouldComponentUpdate(nextProps, nextState, snapshot) {
        // don't update if the src and dimensions stay the same
        if (this.props.src === nextProps.src)
            return !(
                this.state.width === nextState.width && 
                this.state.height === nextState.height
            );

        return true;
    }

    // helper methods

    updateSizing() {
        let nState = {...this.state};
        let aspect = this.props.width / this.props.height;

        if (aspect <= 1.0) {
            nState.height = "100%";
            nState.width = "auto";
        }
        else {
            nState.width = "100%";
            nState.height = "auto";
        }
        
        this.setState(nState);
    }
}