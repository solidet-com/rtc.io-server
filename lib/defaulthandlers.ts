import { Socket } from "socket.io";
import { MessagePayload } from "./payload";
import { RtcioEvents } from "./events";

// The rtc.io client multiplexes all signaling (offer/answer/candidate/stream-meta)
// over a single MESSAGE channel — these are the only events the server needs to relay.
function rtcMessageHandler(socket: Socket, data: MessagePayload<unknown>) {
    socket.to(data.target).emit(RtcioEvents.MESSAGE, data);
}

function addDefaultListeners(socket: Socket) {
    socket.on(RtcioEvents.MESSAGE, (data: MessagePayload<unknown>) => rtcMessageHandler(socket, data));
}

export { addDefaultListeners };

