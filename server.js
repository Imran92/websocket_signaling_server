"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class ConnectedPerson {
    constructor(name, conn) {
        this.Name = name;
        this.Connection = conn;
    }
}
var connectedMap = new Map();
var wss = new WebSocket.Server({ port: 8921 });
wss.on("connection", onConnect);
function onConnect(connection) {
    sendTo(connection, { message: "connected to server" });
    connection.on("message", onMessageHandler);
}
function onMessageHandler(message) {
    var data = JSON.parse("{}");
    console.log(message);
    try {
        data = JSON.parse(message);
    }
    catch (e) {
        console.log(e);
        data = JSON.parse("{}");
    }
    switch (data["messageType"]) {
        case "login":
            onLoginRequest(data, this);
            break;
        case "offer":
            onOfferRequest(data, this);
            break;
        case "candidate":
            onCandidateRequest(data, this);
            break;
        case "answer":
            onOfferAnswerRequest(data, this);
            break;
    }
}
function onLoginRequest(data, conn) {
    conn.userName = data.name;
    connectedMap.set(data.name, new ConnectedPerson(data.name, conn));
    if (!connectedMap.has(data.name)) {
        sendTo(conn, {
            messageType: "login",
            success: true,
            message: "you are connected now!",
        });
    }
    else {
        sendTo(conn, {
            messageType: "login",
            success: true,
            message: "Updated existing connection",
        });
    }
    console.log(connectedMap);
}
function onOfferRequest(data, conn) {
    if (connectedMap.has(data.name)) {
        sendTo(connectedMap.get(data.name).Connection, {
            messageType: "offer",
            offer: data.offer,
            name: conn.userName,
        });
    }
}
function onOfferAnswerRequest(data, conn) {
    if (connectedMap.has(data.name)) {
        sendTo(connectedMap.get(data.name).Connection, {
            messageType: "answer",
            answer: data.answer,
            name: conn.userName,
        });
    }
}
function onCandidateRequest(data, conn) {
    if (connectedMap.has(data.name)) {
        sendTo(connectedMap.get(data.name).Connection, {
            name: conn.userName,
            messageType: "candidate",
            candidate: data.candidate,
        });
    }
}
function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}
//# sourceMappingURL=server.js.map