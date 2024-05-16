# srtc.io
[![NPM version](https://badge.fury.io/js/srtc.io.svg)](https://www.npmjs.com/package/srtc.io)
![Downloads](https://img.shields.io/npm/dm/srtc.io.svg?style=flat)
[Demo Website](https://rtcio.dev/meet)

## Features

srtc.io enables real-time bidirectional event-based communication. It consists of:

- a Node.js server (this repository)
- a [Javascript client library](https://www.npmjs.com/package/srtc.io-client) for the browser (or a Node.js client)

Its main features are:

- **MediaStream Handling:** Seamlessly emit and listen to MediaStreams for real-time audio and video communication.
- **Server Initialization:** Initiate server-side connections effortlessly with the srtc-io library.
- **Event-based Communication:** Utilize event-driven architecture for handling communication events, such as connection establishment, stream emission, and reception.
- **Socket.IO Capabilites** With srtc.io for WebRTC communication, you retain access to all the rich features and configurations of socket.io, ensuring seamless integration and versatile functionality.

#### How to use 
Basic Usage 
```js
import { io } from "srtc.io-client";

const URL = "<srtc.io server url>";
const socket = io(URL);

// Send stream
getUserMedia({ video: true, audio: true }).then((mediaStream) => {
  socket.stream(stream);
});

// Listen for incoming MediaStreams
socket.on("stream", ({ id, stream }) => {
  // Show stream in some video/canvas element.
})  
```
As the main concern of the library is streamlining the webrtc communication protocols *without* taking the liberty from the user our functions are pretty basic yet highly customizable.

#### _These two code snippets below are the backbone of the webrtc communication for the client-side._  

This code emits the stream to default namespace
```js 
 socket.stream(stream);
```
This code receives the stream from user to be used by the user wherever they may see fit.
```js
socket.on("stream",({id, stream})=>{
  // eg; embed the stream to html5 canvas
})
```
This code shows some attributes and methods to get statistical information of RTCPeerConnection
```js
const peer_id="example-peer-id"
const peer=socket.getPeer(peer_id);    
        
//for detailed info of peer
peer.connection
peer.mediaStream
peer.socketId
        
//for stats
socket.getIceCandidateStats(peer_id);
socket.getSessionStats(peer_id);
socket.getStats(peer_id);
```

Note: You need an srtcio server up and running to be able to achieve webrtc communication.

## SocketIO Documentation
As we are built upon socketio; we inherit all of the features that comes along with socketio.
Please see the documentation of them from [here](https://socket.io/docs/).

The source code of the website can be found [here](https://github.com/socketio/socket.io-website).
