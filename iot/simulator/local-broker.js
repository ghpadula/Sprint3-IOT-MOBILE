#!/usr/bin/env node
const aedes = require('aedes')();
const net = require('net');
const http = require('http');
const ws = require('websocket-stream');

const TCP_PORT = Number(process.env.TCP_PORT || 1883);
const WS_PORT = Number(process.env.WS_PORT || 8888);

net.createServer(aedes.handle).listen(TCP_PORT, () => console.log(`✔ MQTT TCP em mqtt://0.0.0.0:${TCP_PORT}`));
const httpServer = http.createServer();
ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(WS_PORT, () => console.log(`✔ MQTT WebSocket em ws://0.0.0.0:${WS_PORT}`));

aedes.on('client', (c) => console.log(`+ cliente ${c.id}`));
aedes.on('clientDisconnect', (c) => console.log(`- cliente ${c.id}`));
aedes.on('subscribe', (subs, c) => console.log(`  ${c?.id} assinou ${subs.map((s) => s.topic).join(', ')}`));
