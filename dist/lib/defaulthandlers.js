"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDefaultListeners = void 0;
function rtcOfferHandler(socket, data) {
    socket.to(data.target).emit("#offer", data);
}
function rtcAnswerHandler(socket, data) {
    socket.to(data.target).emit("#answer", data);
}
function rtcCandiateHandler(socket, data) {
    socket.to(data.target).emit("#candidate", data);
}
function rtcMessageHandler(socket, data) {
    socket.to(data.target).emit("#rtc-message", data);
}
function addDefaultListeners(socket) {
    socket.on("#offer", (data) => rtcOfferHandler(socket, data));
    socket.on("#answer", (data) => rtcAnswerHandler(socket, data));
    socket.on("#candidate", (data) => rtcCandiateHandler(socket, data));
    socket.on("#rtc-message", (data) => rtcMessageHandler(socket, data));
}
exports.addDefaultListeners = addDefaultListeners;
