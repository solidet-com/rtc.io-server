"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whipManager = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const body_parser_1 = __importDefault(require("body-parser"));
const url = require("url");
const cors = require("cors");
const { RTCPeerConnection, RTCRtpCodecParameters, MediaStream } = require("werift");
const app = (0, express_1.default)();
app.use(body_parser_1.default.raw({ type: "application/sdp" }));
const peerConnections = new Map();
const tracks = [];
const rooms = new Map();
function whipManager(options = {}) {
    const { rtcHttpServerPort, socketIoServerOptions = {} } = options;
    app.use(cors());
    app.get("/", (req, res) => {
        res.status(405).end();
    });
    app.post("/:id?", (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = req.params.id || "";
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
                        clockRate: 160,
                        channels: 2,
                    }),
                ],
                video: [
                    new RTCRtpCodecParameters({
                        mimeType: "video/H264",
                        clockRate: 90000,
                        channels: 2,
                        rtcpFeedback: [{ type: "nack" }, { type: "nack", parameter: "pli" }, { type: "goog-remb" }],
                    }),
                ],
            },
        }, servers);
        peerConnection.oniceconnectionstatechange = () => {
            console.log(`Connection state has changed: ${peerConnection.iceConnectionState}`);
        };
        if (id !== "") {
            //console.log("in first if")
            // console.log(id)
            if (!rooms.has(id))
                rooms.set(id, []);
            for (const track of rooms.get(id)) {
                //  console.log("id is not null")
                //  console.log(track.kind)
                peerConnection.addTransceiver(track, { direction: "sendonly" });
            }
        }
        else {
            if (!authorizationHeader) {
                return res.status(401).json({ error: "Authorization header missing" });
            }
            const streamRoom = ((_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1]) || "";
            peerConnection.ontrack = (event) => {
                const track = event.track;
                console.log("TRACK GELDİ");
                //console.log("id in ontrack")
                //console.log(streamRoom)
                if (!rooms.has(streamRoom))
                    rooms.set(streamRoom, [track]);
                else
                    rooms.get(streamRoom).push(track);
                // console.log("check track streamID")
                const trackIndex = rooms.get(streamRoom).indexOf(track);
                track.onended = () => {
                    console.log("TRACK ON ENDDD");
                    rooms.get(streamRoom).splice(trackIndex, 1);
                };
                const stream = new MediaStream();
                stream.addTrack(track);
            };
        }
        const gatherComplete = new Promise((resolve) => {
            peerConnection.onicegatheringstatechange = (event) => {
                if (event.target.iceGatheringState === "complete") {
                    resolve();
                }
            };
        });
        if (body.length > 0) {
            //console.log(body);
            const offer = { type: "offer", sdp: body.toString() };
            yield peerConnection.setRemoteDescription(offer);
            const answer = yield peerConnection.createAnswer();
            yield peerConnection.setLocalDescription(answer);
        }
        else {
            const offer = yield peerConnection.createOffer();
            yield peerConnection.setLocalDescription(offer);
        }
        const pcid = generateUUID();
        res.setHeader("Content-Type", "application/sdp");
        peerConnections.set(pcid, peerConnection);
        if (id !== "")
            res.status(201)
                .set("Content-Type", "application/sdp")
                .set("Access-Control-Allow-Origin", "*")
                .set("Access-Control-Allow-Headers", "*")
                .set("Location", `http://${req.headers.host}/${pcid}`)
                .json({ answer: peerConnection.localDescription.sdp, location: `http://${req.headers.host}/${pcid}` });
        else {
            res.status(201)
                .set("Content-Type", "application/sdp")
                .set("Access-Control-Allow-Origin", "*")
                .set("Access-Control-Allow-Headers", "*")
                .set("Location", `http://${req.headers.host}/${pcid}`)
                .end(peerConnection.localDescription.sdp);
        }
        //console.log("END OF REQUEST")
    }));
    app.patch("/:id", (req, res) => {
        if (req.get("Content-Type") !== "application/sdp") {
            res.status(400).end();
            return;
        }
        const id = req.params.id;
        const peerConnection = peerConnections.get(id);
        //console.log("patch geldi")
        if (!peerConnection) {
            // console.log("hata aldım pc yok")
            res.status(400).end();
            return;
        }
        const body = [];
        req.on("data", (chunk) => {
            body.push(chunk);
        }).on("end", () => __awaiter(this, void 0, void 0, function* () {
            const answer = { type: "answer", sdp: Buffer.concat(body).toString() };
            yield peerConnection.setRemoteDescription(answer);
            res.end();
        }));
    });
    app.delete("/:id", (req, res) => {
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
    const server = (0, http_1.createServer)(app);
    server.listen(rtcHttpServerPort, () => {
        console.log(`RTC HTTP server listening on port ${rtcHttpServerPort}`);
    });
    return server;
}
exports.whipManager = whipManager;
// Helper function to generate UUID
function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
