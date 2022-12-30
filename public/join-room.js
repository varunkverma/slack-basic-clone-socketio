function joinRoom(roomName) {
  const updateTotalMembers = (newNumberOfMembers) => {
    // we want to update the room members total that we have joined.
    document.querySelector(
      ".curr-room-num-users"
    ).innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
    document.querySelector(".curr-room-text").innerText = `${roomName}`;
  };
  // send the room name to the server. Since, only server can manage the rooms and client can just join a namespace.
  nsSocket.emit("JOIN_RM", roomName, updateTotalMembers);

  nsSocket.on("LD_RM_HIS", (data) => {
    console.log(data);
    const messagesUl = document.querySelector("#messages");
    messagesUl.innerHTML = "";
    for (const msg of data) {
      messagesUl.innerHTML += buildHTMLMessage(msg);
    }
    messagesUl.scrollTo(0, messagesUl.scrollHeight);
  });

  nsSocket.on("UPD_MEMS", (members) => {
    updateTotalMembers(members);
  });

  const searchBox = document.querySelector("#search-box");
  searchBox.value = "";
  searchBox.addEventListener("input", (e) => {
    console.log(e.target.value);

    let messages = Array.from(document.getElementsByClassName("message-text"));

    messages.forEach((msg) => {
      if (
        msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1
      ) {
        // the message doesn't contain user's seach term
        msg.style.display = "none";
      } else {
        msg.style.display = "block";
      }
    });
  });
}
