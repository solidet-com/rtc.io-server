import rtcServer = require("./lib/index");
import * as io from "socket.io-client";

const rtcio = new rtcServer();
const PORT = 3009;

rtcio.start(PORT);

rtcio.on("welcome", (socket, data) => {
	socket.emit("welcome", data);
});
