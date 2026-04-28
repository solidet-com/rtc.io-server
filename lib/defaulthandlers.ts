import { Socket } from "socket.io";
import { MessagePayload } from "./payload";
import { RtcioEvents } from "./events";

// The rtc.io client multiplexes all signaling (offer/answer/candidate/stream-meta)
// over a single MESSAGE channel — these are the only events the server needs to relay.
function rtcMessageHandler(socket: Socket, data: MessagePayload<unknown>) {
    socket.to(data.target).emit(RtcioEvents.MESSAGE, data);
}

// Fast-path "this socket is leaving" notification. Without it, peers have to
// wait on ICE consent freshness (~30 s, RFC 7675) to declare a vanished peer
// dead. With it, peers can confirm against their own WebRTC layer and tear
// down the matching RTCPeerConnection in a couple of seconds.
function rtcDisconnectingHandler(socket: Socket) {
    const ownId = socket.id;
    socket.rooms.forEach((roomId) => {
        if (roomId === ownId) return;
        socket.to(roomId).emit(RtcioEvents.PEER_LEFT, { id: ownId });
    });
}

function addDefaultListeners(socket: Socket) {
    socket.on(RtcioEvents.MESSAGE, (data: MessagePayload<unknown>) => rtcMessageHandler(socket, data));
    socket.on("disconnecting", () => rtcDisconnectingHandler(socket));
}

export { addDefaultListeners };

