// Forwards OSC messages between a UDP OSC Server and a WebSocket

const dgram = require('dgram');
const osc = require('osc-min');
const WebSocket = require('ws');

class OSCWebSocketServer {
  constructor() {
    this.localAddress = undefined;
    this.localPort = undefined;
    this.remoteAddress = undefined;
    this.remotePort = undefined;
    this.webSocketPort = undefined;

    this.udpConnected = false;
    this.udpServer = dgram.createSocket('udp4');

    this.webSocketConnected = false;
    this.webSocket = undefined;
  }

  start({ localAddress, localPort, remoteAddress, remotePort, webSocketPort }) {
    this.localAddress = localAddress;
    this.localPort = localPort;
    this.remoteAddress = remoteAddress;
    this.remotePort = remotePort;
    this.webSocketPort = webSocketPort;

    this.createUdpServer();
    this.createWebSocketServer();
  }

  createUdpServer() {
    this.udpServer.on('error', error => {
      console.error(`${this.constructor.name} UDP server failed to connect to ${this.localAddress}:${this.localPort}`); // eslint-disable-line no-console
      console.error(error); // eslint-disable-line no-console
      this.udpServer.close(() => (this.udpConnected = false));
    });
    this.udpServer.on('message', udpMessage => this.handleOscFromUdp(osc.fromBuffer(udpMessage)));
    this.udpServer.bind(this.localPort, this.localAddress, () => (this.udpConnected = true));
  }

  createWebSocketServer() {
    this.webSocketServer = new WebSocket.Server({ port: this.webSocketPort });
    this.webSocketServer.on('connection', socket => {
      this.webSocketConnected = true;
      this.webSocket = socket;
      this.webSocket.on('message', oscJSON => {
        this.handleOscFromWebsocket(JSON.parse(oscJSON));
      });
    });
    this.webSocketServer.on('error', error => {
      console.error(`${this.constructor.name} WebSocketServer had an error:`); // eslint-disable-line no-console
      console.error(error); // eslint-disable-line no-console
      if (this.webSocketServer !== undefined) {
        this.webSocketServer.close(() => (this.webSocketConnected = false));
      }
    });
  }

  sendOscToWebSocket(oscMessageOrBundle) {
    if (!this.webSocketConnected) {
      // console.error(`${this.constructor.name} WebSocket is not connected`); // eslint-disable-line no-console
      return;
    }
    // TODO check if the websocket exists and is open!!!
    if (this.webSocket !== undefined) {
      this.webSocket.send(JSON.stringify(oscMessageOrBundle), error => {
        console.error('OSCWebSocketServer.sendOscToWebSocket:', error); // eslint-disable-line no-console
      });
    }
  }

  sendOscToServer(oscMessageOrBundle) {
    if (!this.udpConnected) {
      console.error(`${this.constructor.name} UDP server is not connected`); // eslint-disable-line no-console
      return;
    }

    const buffer = osc.toBuffer(oscMessageOrBundle);
    this.udpServer.send(buffer, 0, buffer.length, this.remotePort, this.remoteAddress, error => {
      if (error !== undefined) {
        console.error('OSCWebSocketServer.sendOscToServer:', error); // eslint-disable-line no-console
      }
    });
  }

  // overrides
  handleOscFromUdp(oscMessageOrBundle) {
    this.sendOscToWebSocket(oscMessageOrBundle);
  }

  handleOscFromWebsocket(oscMessageOrBundle) {
    this.sendOscToServer(oscMessageOrBundle);
  }
}

module.exports = OSCWebSocketServer;
