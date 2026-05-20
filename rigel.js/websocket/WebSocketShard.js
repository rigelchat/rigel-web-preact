import { EventEmitter } from "events";
import { uncompress as snappyUncompress } from "snappyjs";
import { WebSocketShardStatus, GatewayOPCodes, GatewayCloseEventCodes, Events } from "../Constants.js";
import { parseUserAgent } from "../utils/UserAgentParser.js";

import PacketHandlers from "./handlers/index.js";

class WebSocketShard extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;

        this.connectTimeout = null;
        this.connectAttempts = 0;
        this.reconnectInterval = 1000;
        this.textDecoder = new TextDecoder();

        this.reset(true);
    };

    get ping() {
        return this.lastHeartbeatReceived - this.lastHeartbeatSent;
    };

    reset(hard = false) {
        this.status = WebSocketShardStatus.Disconnected;
        this.lastHeartbeatAck = false;
        this.heartbeatInterval = null;
        this.lastHeartbeatReceived = NaN;
        this.lastHeartbeatSent = NaN;
        this.failedToConnectDueToNetworkError = false;
        if (hard) {
            this.seq = 0;
            this.sessionId = null;
        };
    };

    async connect() {
        if (this.ws && this.ws.readyState != WebSocket.CLOSED) return;
        this.connectAttempts++;
        this.status = WebSocketShardStatus.Connecting;
        this.client.emit(Events.ShardReconnecting);

        const url = this.resumeUrl ?? `${await this.client.rest.getGateway()}?v=${this.client.options.ws.version}&encoding=json${this.client.options.compress ? "&compress=snappy" : ""}`;

        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";
        this.ws.addEventListener("open", this.onSocketOpen.bind(this));
        this.ws.addEventListener("message", this.onSocketMessage.bind(this));
        this.ws.addEventListener("error", this.onSocketError.bind(this));
        this.ws.addEventListener("close", this.onSocketClose.bind(this));
    };

    disconnect(reconnect = false) {
        if (!this.ws) return;

        if (this.ws.readyState !== WebSocket.CLOSED) {
            this.ws.removeEventListener("open", this.onSocketOpen);
            this.ws.removeEventListener("message", this.onSocketMessage);
            this.ws.removeEventListener("error", this.onSocketError);
            this.ws.removeEventListener("close", this.onSocketClose);
            try {
                if (reconnect && this.sessionId) {
                    if (this.ws.readyState === WebSocket.OPEN) {
                        this.ws.close(GatewayCloseEventCodes.Resuming);
                    };
                } else {
                    this.ws.close(GatewayCloseEventCodes.Normal);
                };
            } catch (error) {
                this.emit("error", error);
            };
        };

        this.ws = null;
        this.reset();

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        };

        if (this.sessionId && this.connectAttempts >= 10) {
            this.sessionId = null;
        };

        if (reconnect === true) {
            this.reset(true);
        };

        if (reconnect === "auto" && this.sessionId) {
            this.connect().catch(() => {});
        } else if (reconnect !== false) {
            this.connectTimeout = setTimeout(() => this.connect().catch(() => {}), this.reconnectInterval);
            this.reconnectInterval = Math.min(Math.round(this.reconnectInterval * (Math.random() * 2 + 1)), 30000);
        };
    };

    identify() {
        const { os, browser } = parseUserAgent();
        const ua = navigator.userAgent;

        this.status = WebSocketShardStatus.Identifying;
        this.sendPacket(GatewayOPCodes.Identify, {
            token: this.client.token,
            capabilities: this.client.options.capabilities,
            properties: {
                os,
                browser,
                browser_user_agent: ua,
                release_channel: "unknown"
            }
        });
    };

    resume() {
        this.status = WebSocketShardStatus.Resuming;
        this.sendPacket(GatewayOPCodes.Resume, {
            token: this.client.token,
            session_id: this.sessionId,
            seq: this.seq
        });
    };

    heartbeat() {
        if (this.status === WebSocketShardStatus.Resuming || this.status === WebSocketShardStatus.Identifying) return;
        if (!this.lastHeartbeatAck) return this.disconnect("auto");
        this.lastHeartbeatAck = false;
        this.lastHeartbeatSent = Date.now();
        this.sendPacket(GatewayOPCodes.Heartbeat);
    };

    sendPacket(op, d = null) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (this.client.options.debug) {
                console.groupCollapsed(
                    `%c ${this.constructor.name} %c %c ↑ %c %s`,
                    `background: #5966f3; color: #ffffff; border-radius: 4px;`, null,
                    `background: #39b54a; color: #000000; border-radius: 4px;`, null,
                    Object.entries(GatewayOPCodes).find(([k, v]) => v === op)[0]
                );
                console.log("op:", op);
                console.log("d:", d);
                console.groupEnd();
            };
            const json = JSON.stringify({ op, d });
            this.ws.send(json);
        };
    };

    onSocketOpen() {
        if (this.connectTimeout) {
            clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        };
        this.connectAttempts = 0;
        this.reconnectInterval = 1000;
        this.status = WebSocketShardStatus.Handshaking;
        this.lastHeartbeatAck = true;
    };

    onSocketMessage(evt) {
        const packet = this.unpackMessage(evt.data, evt.data instanceof ArrayBuffer);

        if (!packet) {
            console.warn(
                `%c ${this.constructor.name} %c Received unparsable packet`,
                `background: #5966f3; color: #ffffff; border-radius: 4px;`, null,
                evt.data
            );
            return;
        };

        if (this.client.options.debug) {
            console.groupCollapsed(
                `%c ${this.constructor.name} %c %c ↓ %c %s`,
                `background: #5966f3; color: #ffffff; border-radius: 4px;`, null,
                `background: #ffc706; color: #000000; border-radius: 4px;`, null,
                (Object.entries(GatewayOPCodes).find(([k, v]) => v === packet.op)?.[0] || `Unknown(${packet.op})`) + (packet.t ? " " + packet.t : "")
            );
            for (const k in packet) {
                console.log(`${k}:`, packet[k]);
            };
            console.groupEnd();
        };

        if (packet.s) {
            this.seq = packet.s;
        };

        switch (packet.op) {
            case GatewayOPCodes.Dispatch: {
                if (PacketHandlers[packet.t]) {
                    PacketHandlers[packet.t](this.client, packet, this);
                };
            }; break;

            case GatewayOPCodes.Heartbeat: {
                this.heartbeat();
            }; break;

            case GatewayOPCodes.Reconnect: {
                this.disconnect(true);
            }; break;

            case GatewayOPCodes.InvalidSession: {
                this.seq = 0;
                this.sessionId = null;
                this.resumeUrl = null;
                this.identify();
            }; break;

            case GatewayOPCodes.Hello: {
                if (packet.d.heartbeat_interval > 0) {
                    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
                    this.heartbeatInterval = setInterval(() => this.heartbeat(), packet.d.heartbeat_interval);
                };

                if (this.sessionId) {
                    this.resume();
                } else {
                    this.identify();
                };
            }; break;

            case GatewayOPCodes.HeartbeatACK: {
                this.lastHeartbeatAck = true;
                this.lastHeartbeatReceived = Date.now();
            }; break;
        };
    };

    onSocketError(evt) {
        this.emit("error", evt);
        this.client.emit(Events.ShardError, evt);
        this.failedToConnectDueToNetworkError = true;
    };

    onSocketClose(evt) {
        this.emit("close", evt);
        this.client.emit(Events.ShardDisconnect, evt);

        switch (evt.code) {
            case GatewayCloseEventCodes.Normal: this.disconnect(true); break;
            case GatewayCloseEventCodes.Resuming: break;
            case GatewayCloseEventCodes.UnknownError: this.disconnect("auto"); break;
            case GatewayCloseEventCodes.UnknownOpcode: this.disconnect("auto"); break;
            case GatewayCloseEventCodes.DecodeError: this.disconnect("auto"); break;
            case GatewayCloseEventCodes.NotAuthenticated: this.disconnect("auto"); break;
            case GatewayCloseEventCodes.AuthenticationFailed: this.disconnect(false); break;
            case GatewayCloseEventCodes.AlreadyAuthenticated: this.disconnect(true); break;
            case GatewayCloseEventCodes.InvalidSeq: this.disconnect(true); break;
            case GatewayCloseEventCodes.RateLimited: this.disconnect(true); break;
            case GatewayCloseEventCodes.SessionTimedOut: this.disconnect("auto"); break;
            case GatewayCloseEventCodes.InvalidShard: this.disconnect(false); break;
            case GatewayCloseEventCodes.ShardingRequired: this.disconnect(false); break;
            case GatewayCloseEventCodes.InvalidAPIVersion: this.disconnect(false); break;
            case GatewayCloseEventCodes.InvalidIntents: this.disconnect(false); break;
            case GatewayCloseEventCodes.DisallowedIntents: this.disconnect(false); break;
            default: this.disconnect("auto");
        };
    };

    unpackMessage(data, isBinary) {
        if (!isBinary) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error("Error unpacking message:", error); // todo: emit error
                return null;
            };
        };

        try {
            const compressed = new Uint8Array(data);
            const decompressed = snappyUncompress(compressed);
            const text = this.textDecoder.decode(decompressed);
            return JSON.parse(text);
        } catch (error) {
            console.error("Error unpacking message:", error); // todo: emit error
            return null;
        };
    };
};

export default WebSocketShard;