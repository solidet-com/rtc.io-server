import * as http from "http";
import * as socketIo from "socket.io";
import { ServerMode } from "./types/server-mode";
import { restrictedEvents } from "./constants/restricted-events";
import { addClassicListeners } from "./handlers/classic-handler";
import SocketData from "./interfaces/socket-data";
import SocketInfo from "./interfaces/socket-info";

class rtcServer {
	private server: http.Server | null = null;
	private io: socketIo.Server | null = null;
	public clients: Map<string, SocketData> = new Map();
	public rooms: Map<string, socketIo.Socket[]> = new Map();

	private customEventHandlers: {
		[eventName: string]: (socket: socketIo.Socket, data: any) => void;
	} = {};

	private boundListeners: string[] = [];

	public start(port: number, mode: ServerMode = "classic"): void {
		this.server = http.createServer();
		this.io = new socketIo.Server(this.server, { cors: { origin: "*" } });

		this.server.listen(port, () => {
			console.log(`RTC.IO server is running on port ${port}`);
		});
		
		if (mode === "classic") {
			addClassicListeners(this);
		}

		this.io.on("connection", (socket) => {
			console.log(`Client connected: ${socket.id}`);
			socket.on("login", (data: SocketInfo) => {
				this.clients.set(socket.id, { ...data, socket });
				console.log("biri login oldu")
				socket.emit("login", socket.id);
				console.log(data.room)
				if (data.room) {
					this.emitEventToUserRoom(
						socket.id,
						"user-joined",
						socket.id,
					);
					const existingRoom = this.rooms.get(data.room);

					if (existingRoom) {
						existingRoom.push(socket);
						this.rooms.set(data.room, existingRoom);
					} else {
						this.rooms.set(data.room, [socket]);
					}
				}
			});
			
			for (const eventName in this.customEventHandlers) {
				if (this.customEventHandlers.hasOwnProperty(eventName)) {
					socket.on(eventName, (data: any) => {
						this.customEventHandlers[eventName](socket, data);
					});
					this.boundListeners.push(eventName);
				}
			}
			
			this.activateDefaultListeners(socket);

			socket.on("disconnect", () => {
				console.log(`Client disconnected: ${socket.id}`);
			
				const userRoom = this.clients.get(socket.id)?.room;
			
				if (userRoom) {
					console.log("biri ayrıldı")
					this.emitEventToUserRoom(socket.id, "user-left", socket.id);
					const roomSockets = this.rooms.get(userRoom);
					if (roomSockets) {
						const updatedRoomSockets = roomSockets.filter((roomSocket) => roomSocket.id !== socket.id);
						this.rooms.set(userRoom, updatedRoomSockets);
					}
				}
			
				this.clients.delete(socket.id);
			});
			
		});
	}

	private activateDefaultListeners(socket: socketIo.Socket): void {
		const allEventNames = Object.keys(this.customEventHandlers);
	}

	public getBoundListeners(): string[] {
		return this.boundListeners;
	}

	public emitEventToUserRoom(
		socketId: string,
		eventName: string,
		eventData: any,
	) {
		var userRoom = this.clients.get(socketId)?.room;
	
		if (userRoom) {
			this.rooms.get(userRoom)?.forEach((socket) => {
				if (socket.id !== socketId) {
					socket.emit(eventName, eventData);
				}
			});
		}
	}
	

	public stop(): void {
		if (this.server) {
			this.server.close(() => {
				console.log("Socket.IO server stopped");
			});
		}
	}

	/**
	 * @param {string} eventName - The name of the custom event.
	 * @param {(socket: socketIo.Socket, data: any) => void} handler - The event handler function.
	 * @throws Will throw an error if the eventName is restricted.
	 * @example
	 * rtcServer.on('customEventName', (socket: socketIo.Socket, data: any) => {
	 *  console.log(`Client ${socket.id} sent us this data: ${data}`);
	 * });
	 */
	public on(
		eventName: string,
		handler: (socket: socketIo.Socket, data: any) => void,
	): void {
		/**
		 * List of restricted event names.
		 * //write restricted events here
		 * restrictedEvents = ["connection", "disconnect"]
		 * @type {string[]}
		 */

		if (restrictedEvents.includes(eventName)) {
			throw new Error(`Event name "${eventName}" is not allowed.`);
		}

		this.customEventHandlers[eventName] = handler;
	}
}

export = rtcServer;
