import React from "react";

class OSC extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      address: '',
      args: [
        {type: ''},
        {value: ''}
      ]
    };

    this.port = 8080;

    this.ws = new WebSocket(`ws://0.0.0.0:${this.port}`);
    
    this.ws.onopen = () => {
      console.log("osc.js: opened");
    };

    this.ws.onmessage = event => {
      if ('data' in event) {
        onMessage(JSON.parse(event.data));
      }
    };

    const onMessage = data => {
      console.log(data.args[2].value);
      // this.setState({address: data.address, args: data.args})
    };

    const send = msg => {
      this.ws.send(JSON.stringify(msg));
    };

  }
  render(){
    return (
      <div className="container">
        <div className="Message">
          <p>Address: {this.state.address}</p>
          {this.state.args.map((arg, index) => {
            if (arg.type === 'string'){
              return (<p key={index}>{arg.type} {JSON.parse(arg.value.toString())}</p>)
            } else {
              return (<p key={index}>{arg.type} {arg.value}</p>)
            }
          })}
        </div>
      </div>
    );
  }
}

export default OSC;