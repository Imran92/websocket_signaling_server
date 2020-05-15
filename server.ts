import * as WebSocket from "ws";

class ConnectedPerson {
  Name: string;
  Connection: any;
  /**
   *
   */
  constructor(name: string, conn: any) {
    this.Name = name;
    this.Connection = conn;
  }
}

var connectedMap: Map<string, ConnectedPerson> = new Map();

var wss = new WebSocket.Server({ port: 8921 });

wss.on("connection", onConnect);

function onConnect(connection: any) {
  sendTo(connection, { message: "connected to server" });
  connection.on("message", onMessageHandler);
}

function onMessageHandler(message: string) {
  var data: JSON = JSON.parse("{}");
  console.log(message);
  try {
    data = JSON.parse(message);
  } catch (e) {
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

function onLoginRequest(data: any, conn: any) {
  conn.userName = data.name;
  connectedMap.set(data.name, new ConnectedPerson(data.name, conn));
  if (!connectedMap.has(data.name)) {
    sendTo(conn, {
      messageType: "login",
      success: true,
      message: "you are connected now!",
    });
  } else {
    sendTo(conn, {
      messageType: "login",
      success: true,
      message: "Updated existing connection",
    });
  }
  console.log(connectedMap);
}
function onOfferRequest(data: any, conn: any) {
  if (connectedMap.has(data.name)) {
    sendTo(connectedMap.get(data.name).Connection, {
      messageType: "offer",
      offer: data.offer,
      name: conn.userName,
    });
  }
}
function onOfferAnswerRequest(data: any, conn: any) {
  if (connectedMap.has(data.name)) {
    sendTo(connectedMap.get(data.name).Connection, {
      messageType: "answer",
      answer: data.answer,
      name: conn.userName,
    });
  }
}
function onCandidateRequest(data: any, conn: any) {
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
