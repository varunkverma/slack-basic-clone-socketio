const express = require("express");
const { Server } = require("socket.io");

let namespaces = require("./data/namespaces");
const { NAMESPACES_LIST, NAMESPACE_LOAD_ROOMS } = require("./constants");

const app = express();

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000, () => {
  console.log("Slack server listening @ 9000");
});

const io = new Server(expressServer);

// build an array to sedn back with the image and endpoint for each namespace
const nsData = namespaces.map((ns) => {
  return {
    image: ns.image,
    endPoint: ns.endPoint,
  };
});

// connection to the main/root namespace
io.on("connection", (socket) => {
  // send the prepared data to the client.
  // We need to use socket, instead of io, because we want it to go to just this connected client.
  socket.emit(NAMESPACES_LIST, nsData);
});

// loop through each namespace and listen for a 'connection' event
namespaces.forEach((ns) => {
  io.of(ns.endPoint).on("connection", (nsSocket) => {
    console.log(
      `socket Id "${nsSocket.id}" has joined "${ns.title}" namespace.`
    );

    // a socket has connected to one of the namespaces, send Rooms info back to that Namespace
    nsSocket.emit(NAMESPACE_LOAD_ROOMS, namespaces[0].rooms);
  });
});
