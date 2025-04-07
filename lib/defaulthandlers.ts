import { Socket } from "socket.io";
import { MessagePayload } from "./payload";

function rtcOfferHandler(socket: Socket, data: MessagePayload<RTCSessionDescriptionInit>) {
    socket.to(data.target).emit("#offer", data);
}

function rtcAnswerHandler(socket: Socket, data: MessagePayload<RTCSessionDescriptionInit>) {
    socket.to(data.target).emit("#answer", data);
}

function rtcCandiateHandler(socket: Socket, data: MessagePayload<RTCIceCandidate>) {
    socket.to(data.target).emit("#candidate", data);
}

function rtcMessageHandler(socket: Socket, data: MessagePayload<string>) {
    socket.to(data.target).emit("#rtc-message", data);
}

function addDefaultListeners(socket: Socket) {
    socket.on("#offer", (data) => rtcOfferHandler(socket, data));
    socket.on("#answer", (data) => rtcAnswerHandler(socket, data));
    socket.on("#candidate", (data) => rtcCandiateHandler(socket, data));
    socket.on("#rtc-message", (data) => rtcMessageHandler(socket, data));
}

export { addDefaultListeners };
