const OSCWebSocketServer = require('./OSCWebSocketServer');

const defaultArgs = {
  localAddress:  '0.0.0.0',
  localPort:     57121,
  remoteAddress: '0.0.0.0',
  remotePort:    57122,
  webSocketPort: 8080,
};

class Tidal extends OSCWebSocketServer {
  constructor(args = defaultArgs) {
    super(args);
  }

  handleOscFromUdp(oscMessageOrBundle) {
    if (oscMessageOrBundle.oscType === 'message' &&
        oscMessageOrBundle.address === '/osc-setup') {
      this.sendOscToServer({ address: '/osc-setup-reply' });
    } else {
      this.sendOscToWebSocket(oscMessageOrBundle);
    }
  }

  start({ localAddress, localPort, remoteAddress, remotePort, webSocketPort } = defaultArgs) {
    super.start({ localAddress, localPort, remoteAddress, remotePort, webSocketPort });
  }
}

module.exports = { Tidal, defaultArgs };
