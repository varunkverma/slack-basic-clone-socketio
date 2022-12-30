const username = prompt("What is your username?");
// const socket = io("http://localhost:9000");
const socket = io("http://localhost:9000", {
  query: {
    username,
  },
});
let nsSocket = "";

// listen for NS_LIST, which is the list of all namespaces
socket.on("NS_LIST", (nsData = []) => {
  const namespacesDiv = document.querySelector(".namespaces");
  namespacesDiv.innerHTML = "";
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endPoint}><img src="${ns.image}"/></div>`;
  });

  // add a click listener for each namespace
  Array.from(document.getElementsByClassName("namespace")).forEach((ele) => {
    ele.addEventListener("click", (e) => {
      const nsEndPoint = ele.getAttribute("ns");
      joinNamespace(nsEndPoint);
    });
  });

  joinNamespace("/wiki");
});
