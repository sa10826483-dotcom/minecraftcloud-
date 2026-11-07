"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinecraftRcon = void 0;
class MinecraftRcon {
    host;
    port;
    password;
    socket = null;
    reqId = 1;
    authenticated = false;
    constructor(host, port, password) {
        this.host = host;
        this.port = port;
        this.password = password;
    }
    connect(timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            if (typeof window !== 'undefined') {
                return reject(new Error('MinecraftRcon cannot be executed directly in the browser'));
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const net = require('net');
            this.socket = new net.Socket();
            this.socket.setTimeout(timeoutMs);
            this.socket.on('timeout', () => {
                this.disconnect();
                reject(new Error(`RCON connection timed out after ${timeoutMs}ms to ${this.host}:${this.port}`));
            });
            this.socket.on('error', (err) => {
                this.disconnect();
                reject(err);
            });
            this.socket.connect(this.port, this.host, async () => {
                try {
                    await this.authenticate();
                    resolve();
                }
                catch (authErr) {
                    this.disconnect();
                    reject(authErr);
                }
            });
        });
    }
    authenticate() {
        return new Promise((resolve, reject) => {
            if (!this.socket)
                return reject(new Error('Socket not initialized'));
            const authId = this.reqId++;
            const packet = this.buildPacket(authId, 3, this.password);
            const onData = (data) => {
                this.socket?.removeListener('data', onData);
                if (data.length < 12) {
                    return reject(new Error('Invalid RCON auth response length'));
                }
                const respId = data.readInt32LE(4);
                if (respId === -1) {
                    return reject(new Error('RCON authentication failed: Bad password'));
                }
                this.authenticated = true;
                resolve();
            };
            this.socket.on('data', onData);
            this.socket.write(packet);
        });
    }
    sendCommand(command, timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.authenticated) {
                return reject(new Error('RCON client not connected or not authenticated'));
            }
            const cmdId = this.reqId++;
            const packet = this.buildPacket(cmdId, 2, command);
            let responseBuffer = Buffer.alloc(0);
            const timer = setTimeout(() => {
                this.socket?.removeListener('data', onData);
                resolve(this.cleanMinecraftColorCodes(responseBuffer.toString('utf8')));
            }, timeoutMs);
            const onData = (data) => {
                responseBuffer = Buffer.concat([responseBuffer, data]);
                if (responseBuffer.length >= 12) {
                    const packetLen = responseBuffer.readInt32LE(0);
                    if (responseBuffer.length >= packetLen + 4) {
                        clearTimeout(timer);
                        this.socket?.removeListener('data', onData);
                        const body = responseBuffer.subarray(8, responseBuffer.length - 2).toString('utf8');
                        resolve(this.cleanMinecraftColorCodes(body));
                    }
                }
            };
            this.socket.on('data', onData);
            this.socket.write(packet);
        });
    }
    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.destroy();
            this.socket = null;
        }
        this.authenticated = false;
    }
    buildPacket(id, type, body) {
        const bodyBuffer = Buffer.from(body, 'utf8');
        const length = bodyBuffer.length + 10;
        const packet = Buffer.alloc(length + 4);
        packet.writeInt32LE(length, 0);
        packet.writeInt32LE(id, 4);
        packet.writeInt32LE(type, 8);
        bodyBuffer.copy(packet, 12);
        packet.writeInt8(0, 12 + bodyBuffer.length);
        packet.writeInt8(0, 13 + bodyBuffer.length);
        return packet;
    }
    cleanMinecraftColorCodes(text) {
        return text.replace(/§[0-9a-fk-or]/gi, '').trim();
    }
}
exports.MinecraftRcon = MinecraftRcon;
