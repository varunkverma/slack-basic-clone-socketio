function joinNamespace(endpoint) {
  const nsSocket = io(`http://localhost:9000/${endpoint}`);

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
        console.log("Clicked on", e.target.innerHTML, "room");
      });
    });
  });

  // listening on socket for the event to get new messages from server
  nsSocket.on("MSG_TO_CLIENTS", (msg) => {
    document.querySelector("#message").innerHTML += `<li>${msg.text}</li>`;
  });

  // listening to a message that user wants to send
  document.querySelector(".message-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const newMessage = document.querySelector("#user-message").value;
    nsSocket.emit("NEW_MSG_TO_SERVER", {
      text: newMessage,
    });
  });
}
