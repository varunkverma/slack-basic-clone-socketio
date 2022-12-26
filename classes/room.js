class Room {
  constructor(id, title, namespace, isPrivate = false) {
    this.id = id;
    this.title = title;
    this.namespace = namespace;
    this.isPrivate = isPrivate;
    this.history = [];
  }

  addMessage(msg) {
    this.history.push(msg);
  }
  clearHistory() {
    this.history = [];
  }
}

module.exports = Room;
