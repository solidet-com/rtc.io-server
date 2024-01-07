import { ServerMode } from "../types/server-mode";

export default interface ServerOptions {
    port: number;
    mode?: ServerMode;
    codec?: string;
  }