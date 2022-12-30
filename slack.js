const express = require("express");
const { Server } = require("socket.io");

let namespaces = require("./data/namespaces");

const {
  NAMESPACES_LIST,
  NAMESPACE_LOAD_ROOMS,
  JOIN_ROOM,
  NEW_MESSAGE_TO_SERVER,
  MESSAGE_TO_CLIENTS,
  LOAD_ROOM_HISTORY,
  UPDATE_MEMBERS,
} = require("./constants");

const app = express();

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000, () => {
  console.log("Slack server listening @ 9000");
});

const io = new Server(expressServer);

// build an array to sedn back with the image and endpoint for each namespace
const getNameSpaceData = () =>
  namespaces.map((ns) => {
    return {
      image: ns.image,
      endPoint: ns.endPoint,
    };
  });

// connection to the main/root namespace
io.on("connection", (socket) => {
  // console.log(socket.handshake);

  // send the prepared data to the client.
  // We need to use socket, instead of io, because we want it to go to just this connected client.
  const nsData = getNameSpaceData();
  socket.emit(NAMESPACES_LIST, nsData);
});

// loop through each namespace and listen for a 'connection' event
namespaces.forEach((ns) => {
  io.of(ns.endPoint).on("connection", (nsSocket) => {
    const username = nsSocket.handshake.query.username || "Unknown";
    const namespace = nsSocket.nsp.name;

    console.log(
      `socket Id "${nsSocket.id}" has joined "${ns.title}" namespace.`
    );

    // a socket has connected to one of the namespaces, send Rooms info back to that Namespace
    nsSocket.emit(NAMESPACE_LOAD_ROOMS, ns.rooms);

    // when a client joins a room in this namespace
    nsSocket.on(JOIN_ROOM, async (roomToJoin, numberOfUsersAckCB) => {
      // deal with history once we have it
      // before we join a room, we should leave all other rooms
      const [, ...roomNames] = nsSocket.rooms;
      // console.log(roomNames);
      const promiseToLeaveAllRooms = [];
      for (roomNameToLeave of roomNames) {
        promiseToLeaveAllRooms.push(nsSocket.leave(roomNameToLeave));
      }
      await Promise.all(promiseToLeaveAllRooms);
      for (roomNameToLeave of roomNames) {
        updateMembersCount(namespace, roomNameToLeave);
      }
      nsSocket.join(roomToJoin);

      // io.of(ns.endPoint)
      //   .in(roomToJoin)
      //   .fetchSockets()
      //   .then((sockets) => {
      //     numberOfUsersAckCB(sockets.length);
      //   });

      const roomObj = getRoomByNamespaceAndRoom(namespace, roomToJoin);

      nsSocket.emit(LOAD_ROOM_HISTORY, roomObj.history);

      updateMembersCount(namespace, roomToJoin);
    });

    nsSocket.on(NEW_MESSAGE_TO_SERVER, (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username,
        avatar: "https://via.placeholder.com/30",
      };
      // console.log(fullMsg);
      // send this message to all the sockets that are in the same room as this socket
      // the user will be in the 2nd element of this set. That is because the socket ALWAYS join its own rooms on connection
      const [, roomName] = nsSocket.rooms;
      console.log(nsSocket.nsp.name, roomName, nsSocket.rooms);
      const namespace = nsSocket.nsp.name;

      // we need to find the Room Object of this namespace
      const roomObj = getRoomByNamespaceAndRoom(namespace, roomName);
      // console.log(roomObj);
      roomObj.history.push(fullMsg);
      // the reason we are doing io, because if we use socket, the sender won't receive the text that he has sent
      io.of(namespace).in(roomName).emit(MESSAGE_TO_CLIENTS, fullMsg);
    });
  });
});

function getRoomsByNamespace(nsEP) {
  const namespace = namespaces.find((ns) => ns.endPoint === nsEP);
  return (namespace && namespace.rooms) || [];
}

function getRoomByNamespaceAndRoom(nsEP, roomName) {
  const rooms = getRoomsByNamespace(nsEP);
  return rooms.find((room) => room.title === roomName) || [];
}

function updateMembersCount(namespace, room) {
  // send back the number of users in this room to all the sockets connected to this room
  io.of(namespace)
    .in(room)
    .fetchSockets()
    .then((sockets) => {
      io.of(namespace).in(room).emit(UPDATE_MEMBERS, sockets.length);
    });
}
