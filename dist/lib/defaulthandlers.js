"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDefaultListeners = addDefaultListeners;
const events_1 = require("./events");
// The rtc.io client multiplexes all signaling (offer/answer/candidate/stream-meta)
// over a single MESSAGE channel — these are the only events the server needs to relay.
function rtcMessageHandler(socket, data) {
    socket.to(data.target).emit(events_1.RtcioEvents.MESSAGE, data);
}
// Fast-path "this socket is leaving" notification. Without it, peers have to
// wait on ICE consent freshness (~30 s, RFC 7675) to declare a vanished peer
// dead. With it, peers can confirm against their own WebRTC layer and tear
// down the matching RTCPeerConnection in a couple of seconds.
function rtcDisconnectingHandler(socket) {
    const ownId = socket.id;
    socket.rooms.forEach((roomId) => {
        if (roomId === ownId)
            return;
        socket.to(roomId).emit(events_1.RtcioEvents.PEER_LEFT, { id: ownId });
    });
}
function addDefaultListeners(socket) {
    socket.on(events_1.RtcioEvents.MESSAGE, (data) => rtcMessageHandler(socket, data));
    socket.on("disconnecting", () => rtcDisconnectingHandler(socket));
}
