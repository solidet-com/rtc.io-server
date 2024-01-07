const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

const PORT = process.env.PORT || 4009;

const clients = new Map();

io.on("connection", (socket) => {
	socket.on("message", async (message) => {
		const parsedMessage = message;

		if (parsedMessage.category === "Login") {
            console.log("someone logged in")
			const { uid, room } = parsedMessage;

			clients.set(uid, { socket, room, uid });

			socket.broadcast.emit("message", {
				category: "MemberJoined",
				type: "",
				uid: uid,
				room: "/",
			});
		}

		if (
			parsedMessage.type === "offer" ||
			parsedMessage.type === "answer" ||
			parsedMessage.type === "candidate"
		) {

			socket.broadcast.emit("message", parsedMessage);
		}
	});

	socket.on("disconnect", () => {
		for (const [key, value] of clients.entries()) {
			if (value.socket === socket) {
				clients.delete(key);
				break;
			}
		}
	});
});

server.listen(PORT, () => {
	console.log(`Server started on port ${PORT} :)`);
});
