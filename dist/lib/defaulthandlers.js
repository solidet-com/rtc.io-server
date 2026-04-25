"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDefaultListeners = void 0;
const events_1 = require("./events");
function rtcOfferHandler(socket, data) {
    socket.to(data.target).emit(events_1.RtcioEvents.OFFER, data);
}
function rtcAnswerHandler(socket, data) {
    socket.to(data.target).emit(events_1.RtcioEvents.ANSWER, data);
}
function rtcCandidateHandler(socket, data) {
    socket.to(data.target).emit(events_1.RtcioEvents.CANDIDATE, data);
}
function rtcMessageHandler(socket, data) {
    socket.to(data.target).emit(events_1.RtcioEvents.MESSAGE, data);
}
function rtcStreamMetaHandler(socket, data) {
    socket.to(data.target).emit(events_1.RtcioEvents.STREAM_META, data);
}
function addDefaultListeners(socket) {
    socket.on(events_1.RtcioEvents.OFFER, (data) => rtcOfferHandler(socket, data));
    socket.on(events_1.RtcioEvents.ANSWER, (data) => rtcAnswerHandler(socket, data));
    socket.on(events_1.RtcioEvents.CANDIDATE, (data) => rtcCandidateHandler(socket, data));
    socket.on(events_1.RtcioEvents.MESSAGE, (data) => rtcMessageHandler(socket, data));
    socket.on(events_1.RtcioEvents.STREAM_META, (data) => rtcStreamMetaHandler(socket, data));
}
exports.addDefaultListeners = addDefaultListeners;
