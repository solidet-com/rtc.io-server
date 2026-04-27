"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDefaultListeners = addDefaultListeners;
const events_1 = require("./events");
// The rtc.io client multiplexes all signaling (offer/answer/candidate/stream-meta)
// over a single MESSAGE channel — these are the only events the server needs to relay.
function rtcMessageHandler(socket, data) {
    socket.to(data.target).emit(events_1.RtcioEvents.MESSAGE, data);
}
function addDefaultListeners(socket) {
    socket.on(events_1.RtcioEvents.MESSAGE, (data) => rtcMessageHandler(socket, data));
}
