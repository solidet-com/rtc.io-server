import rtcServer from "..";
import { addListeners } from "../helpers/listener-utils";

export function addClassicListeners(server: rtcServer): void {
	addListeners(server, ["offer", "answer", "candidate"]);
}

