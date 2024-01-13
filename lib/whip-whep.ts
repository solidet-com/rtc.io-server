import express, { Request, Response } from "express";
import { createServer } from "http";
import { ServerOptions } from "..";
const {
  RTCPeerConnection,
  RTCRtpCodecParameters,
  MediaStream,
} = require("werift");

interface WhipManagerOptions {
  rtcHttpServerPort?: number;
  socketIoServerOptions?: Partial<ServerOptions>;
  getIceServers?: () => { urls: string[] }[];
}
const peerConnections = new Map();
const tracks = [];
const rooms = new Map();
export function whipManager(options: WhipManagerOptions = {}) {
  const { rtcHttpServerPort, socketIoServerOptions = {} } = options;

  const app = express();

  app.use(express.json()); // Parse JSON requests
  app.get("/api/", (req:Request, res:Response) => {
    res.status(405).end();
  });

  app.post("/api/:id?", async (req:Request, res:Response) => {
    const id = req.params.id || "";
    const body = req.body;
    const authorizationHeader = req.headers["authorization"];

    const servers = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    };
    const peerConnection = new RTCPeerConnection(
      {
        codecs: {
          audio: [
            new RTCRtpCodecParameters({
              mimeType: "audio/opus",
              clockRate: 160,
              channels: 2,
            }),
          ],
          video: [
            new RTCRtpCodecParameters({
              mimeType: "video/H264",
              clockRate: 90000,
              channels: 2,
              rtcpFeedback: [
                { type: "nack" },
                { type: "nack", parameter: "pli" },
                { type: "goog-remb" },
              ],
            }),
          ],
        },
      },
      servers
    );

    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        `Connection state has changed: ${peerConnection.iceConnectionState}`
      );
    };

    if (id !== "") {
      if (!rooms.has(id)) rooms.set(id, []);

      for (const track of rooms.get(id)) {
        peerConnection.addTransceiver(track, { direction: "sendonly" });
      }
    } else {
      if (!authorizationHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }
      const streamRoom =
        req.headers["authorization"]?.split("Bearer ")[1] || "defaultRoom";

      peerConnection.ontrack = (event: { track: any }) => {
        const track = event.track;
        console.log("TRACK GELDİ");

        if (!rooms.has(streamRoom)) rooms.set(streamRoom, [track]);
        else rooms.get(streamRoom).push(track);

        const trackIndex = rooms.get(streamRoom).indexOf(track);
        track.onended = () => {
          console.log("TRACK ON ENDDD");
          rooms.get(streamRoom).splice(trackIndex, 1);
        };

        const stream = new MediaStream();
        stream.addTrack(track);
      };
    }

    const gatherComplete = new Promise<void>((resolve) => {
      peerConnection.onicegatheringstatechange = (event: {
        target: { iceGatheringState: string };
      }) => {
        if (event.target.iceGatheringState === "complete") {
          resolve();
        }
      };
    });

    if (body.length > 0) {
      const offer = { type: "offer", sdp: body.toString() };
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
    } else {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
    }

    const pcid = generateUUID();

    res.setHeader("Content-Type", "application/sdp");
    peerConnections.set(pcid, peerConnection);

    if (id !== "")
      res
        .status(201)
        .set("Content-Type", "application/sdp")
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Headers", "*")
        .set("Location", `http://${req.headers.host}/${pcid}`)
        .json({
          answer: peerConnection.localDescription.sdp,
          location: `http://${req.headers.host}/${pcid}`,
        });
    else {
      res
        .status(201)
        .set("Content-Type", "application/sdp")
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Headers", "*")
        .set("Location", `http://${req.headers.host}/${pcid}`)
        .end(peerConnection.localDescription.sdp);
    }
  });

  app.patch("/api/:id", (req:Request, res:Response) => {
    if (req.get("Content-Type") !== "application/sdp") {
      res.status(400).end();
      return;
    }

    const id = req.params.id;
    const peerConnection = peerConnections.get(id);
    if (!peerConnection) {
      res.status(400).end();
      return;
    }

    const body: any[] | readonly Uint8Array[] = [];
    req
      .on("data", (chunk) => {
        (body as any[]).push(chunk);
      })
      .on("end", async () => {
        const answer = { type: "answer", sdp: Buffer.concat(body).toString() };
        await peerConnection.setRemoteDescription(answer);
        res.end();
      });
  });

  app.delete("/api/:id", (req, res) => {
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
