function joinNamespace(endpoint) {
  if (nsSocket) {
    // check to see if nsSocket is actually is a socket
    nsSocket.close();

    // remove the event listener before its added again
    document
      .querySelector("#user-message")
      .removeEventListener("submit", onFormSubmit);
  }

  nsSocket = io(`http://localhost:9000${endpoint}`);

  // When server sends information about the rooms of the namespace
  nsSocket.on("NS_LD_RMS", (nsRooms = []) => {
    const roomListDiv = document.querySelector(".room-list");

    roomListDiv.innerHTML = "";

    nsRooms.forEach((room) => {
      let glyph = "globe";
      if (room.isPrivate) {
        glyph = "lock";
      }
      roomListDiv.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.title}</li>`;
    });

    // add a click listener to each room
    const roomNodes = document.getElementsByClassName("room");
    Array.from(roomNodes).forEach((roomNodeEle) => {
      roomNodeEle.addEventListener("click", (e) => {
        console.log("Clicked on", e.target.innerText, "room");
        joinRoom(e.target.innerText);
      });
    });

    // add room automatically, first time here. Basically join the first room in the namespace.
    const topRoom = document.querySelector(".room");
    const topRoomName = topRoom.innerText;

    // join the top room
    joinRoom(topRoomName);
  });

  // listening on socket for the event to get new messages from server
  nsSocket.on("MSG_TO_CLIENTS", (msg) => {
    console.log("MSG FROM SERVER", msg);
    const messageUL = document.querySelector("#messages");
    messageUL.innerHTML += buildHTMLMessage(msg);
    messageUL.scrollTo(0, messageUL.scrollHeight);
  });

  // listening to a message that user wants to send
  document
    .querySelector(".message-form")
    .addEventListener("submit", onFormSubmit);
}

function onFormSubmit(e) {
  e.preventDefault();

  const newMessageEle = document.querySelector("#user-message");
  const newMessage = newMessageEle.value;

  nsSocket.emit("NEW_MSG_TO_SERVER", {
    text: newMessage,
  });

  newMessageEle.value = "";
}

function buildHTMLMessage({ text, time, avatar, username }) {
  const convertedDate = new Date(time).toLocaleString();
  const newHTMLMSG = `<li>
  <div class="user-image">
      <img src="${avatar}" />
  </div>
  <div class="user-message">
      <div class="user-name-time">${username} <span>${convertedDate}</span></div>
      <div class="message-text">${text}</div>
  </div>
</li>`;
  return newHTMLMSG;
}
