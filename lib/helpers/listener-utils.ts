import rtcServer from "..";
import socketIo from "socket.io";
import IceData from "../interfaces/ice-data";

export function addListener(server: rtcServer, eventType: string): void {
	server.on(eventType, (socket: socketIo.Socket, data: IceData) => {
		console.log("event geldi", eventType, data)
		server.emitEventToUserRoom(socket.id, eventType, data);
	});
}

export function addListeners(server: rtcServer, eventTypes: string[]): void {
	eventTypes.forEach((eventType) => {
		addListener(server, eventType);
	});
}
