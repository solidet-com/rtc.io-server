import { Socket } from "socket.io";
import { MessagePayload } from "./payload";
import { RtcioEvents } from "./events";

function rtcOfferHandler(socket: Socket, data: MessagePayload<RTCSessionDescriptionInit>) {
    socket.to(data.target).emit(RtcioEvents.OFFER, data);
}

function rtcAnswerHandler(socket: Socket, data: MessagePayload<RTCSessionDescriptionInit>) {
    socket.to(data.target).emit(RtcioEvents.ANSWER, data);
}

function rtcCandidateHandler(socket: Socket, data: MessagePayload<RTCIceCandidate>) {
    socket.to(data.target).emit(RtcioEvents.CANDIDATE, data);
}

function rtcMessageHandler(socket: Socket, data: MessagePayload<string>) {
    socket.to(data.target).emit(RtcioEvents.MESSAGE, data);
}

function rtcStreamMetaHandler(socket: Socket, data: MessagePayload<unknown>) {
    socket.to(data.target).emit(RtcioEvents.STREAM_META, data);
}

function addDefaultListeners(socket: Socket) {
    socket.on(RtcioEvents.OFFER,       (data: MessagePayload<RTCSessionDescriptionInit>) => rtcOfferHandler(socket, data));
    socket.on(RtcioEvents.ANSWER,      (data: MessagePayload<RTCSessionDescriptionInit>) => rtcAnswerHandler(socket, data));
    socket.on(RtcioEvents.CANDIDATE,   (data: MessagePayload<RTCIceCandidate>) => rtcCandidateHandler(socket, data));
    socket.on(RtcioEvents.MESSAGE,     (data: MessagePayload<string>) => rtcMessageHandler(socket, data));
    socket.on(RtcioEvents.STREAM_META, (data: MessagePayload<unknown>) => rtcStreamMetaHandler(socket, data));
}

export { addDefaultListeners };

