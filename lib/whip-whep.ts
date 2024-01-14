import express, { Request, Response } from "express";
import { createServer } from "http";
import { ServerOptions } from "..";
const bodyParser = require('body-parser');
const url = require('url');
const { RTCPeerConnection, RTCRtpCodecParameters, MediaStream } = require('werift');

const app = express();
app.use(bodyParser.raw({ type: 'application/sdp' }));

const peerConnections = new Map();
const tracks:any[] = [];

interface WhipManagerOptions {
  rtcHttpServerPort?: number;
  socketIoServerOptions?: Partial<ServerOptions>;
}
const rooms = new Map();
export function whipManager(options: WhipManagerOptions = {}) {
  const { rtcHttpServerPort, socketIoServerOptions = {} } = options;


  app.get('/', (req, res) => {
    res.status(405).end();
  });
  
  app.post('/:id?', async (req, res) => {
    const id = req.params.id || '';
    console.log("get id")
    console.log(id)
    const body = req.body;
    const authorizationHeader = req.headers["authorization"];
    
  
  
    const servers = {
      iceServers: [
        {
          urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
    };
    const peerConnection = new RTCPeerConnection({
      codecs: {
        audio: [
          new RTCRtpCodecParameters({
            mimeType: "audio/opus",
            clockRate: 48000,
            channels: 2,
          }),
        ],
        video: [
          new RTCRtpCodecParameters({
            mimeType: "video/H264",
            clockRate: 90000,
            rtcpFeedback: [
              { type: "nack" },
              { type: "nack", parameter: "pli" },
              { type: "goog-remb" },
            ],
          }),
        ],
      },
    }, servers);
  
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`Connection state has changed: ${peerConnection.iceConnectionState}`);
    };
  
    if (id !== '') {
      // Handle case for creating an answer
      for (const track of tracks) {
          console.log("id is not null")
          console.log(track.stream)
        if (track.stream.id !== id) {
          continue;
        }
       // console.log(`Adding track: ${track.id}`);
        await peerConnection.addTransceiver(track, { direction: 'sendonly' });
      }
    } else {
      if (!authorizationHeader) {
          // Handle the case where the header is not present
          return res.status(401).json({ error: "Authorization header missing" });
        }
      
        const streamRoom=req.headers["authorization"]?.split("Bearer ")[1]
      // Handle case for creating an offer
      peerConnection.ontrack = (event: { track: { streamId: string | undefined; onended: () => void; }; }) => {
       // console.log(`Got track: ${event.track.id}`);
        tracks.push(event.track);
        console.log(event.track)
        console.log("stream room")
        console.log(streamRoom)
        event.track.streamId=streamRoom
        const trackIndex = tracks.indexOf(event.track);
        event.track.onended = () => {
          tracks.splice(trackIndex, 1);
        };
  
        const stream = new MediaStream();
        stream.addTrack(event.track);
      };
    }
  
    const gatherComplete = new Promise<void>(resolve => {
      peerConnection.onicegatheringstatechange = (event: { target: { iceGatheringState: string; }; }) => {
        if (event.target.iceGatheringState === 'complete') {
          resolve();
        }
      };
    });
  
    if (body.length > 0) {
      //console.log(body);
      const offer = { type: 'offer', sdp: body.toString() };
      console.log("Received offer:");
      //console.log(offer.sdp);
      await peerConnection.setRemoteDescription(offer);
  
      const answer = await peerConnection.createAnswer();
      console.log("Created answer:");
     // console.log(answer.sdp);
  
      await peerConnection.setLocalDescription(answer);
    } else {
      const offer = await peerConnection.createOffer();
      console.log("Created offer:");
      //console.log(offer.sdp);
      await peerConnection.setLocalDescription(offer);
    }
  
    //await gatherComplete;
  
    const pcid = generateUUID();
  
    res.setHeader('Content-Type', 'application/sdp');
    
  
    console.log("Sending answer:");
    //console.log(peerConnection.localDescription.sdp);
    console.log("sent res")
    //console.log(res)
    res.status(201)
    .set('Content-Type', 'application/sdp')
    .set('Access-Control-Allow-Origin', '*')
    .set('Access-Control-Allow-Headers', '*')
    .set('Location', `http://${req.headers.host}/${pcid}`)
    .send(peerConnection.localDescription.sdp);
  
    peerConnections.set(pcid, peerConnection);
  });
  
  app.patch('/:id', (req, res) => {
    if (req.get('Content-Type') !== 'application/sdp') {
      res.status(400).end();
      return;
    }
  
    const id = req.params.id;
    const peerConnection = peerConnections.get(id);
  
    if (!peerConnection) {
      res.status(404).end();
      return;
    }
  
    const body:any = [];
    req.on('data', chunk => {
      body.push(chunk);
    }).on('end', async () => {
      const answer = { type: 'answer', sdp: Buffer.concat(body).toString() };
      await peerConnection.setRemoteDescription(answer);
      res.end();
    });
  });
  
  app.delete('/:id', (req, res) => {
    const id = req.params.id;
    const peerConnection = peerConnections.get(id);
  
    if (!peerConnection) {
      res.status(404).end();
      return;
    }
  
    peerConnection.close();
    peerConnections.delete(id);
    res.end();
  });

  const server = createServer(app);

  server.listen(rtcHttpServerPort, () => {
    console.log(`RTC HTTP server listening on port ${rtcHttpServerPort}`);
  });

  return server;
}

// Helper function to generate UUID
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
