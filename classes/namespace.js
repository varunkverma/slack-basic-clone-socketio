class Namespace {
  constructor(id, title, image, endPoint) {
    this.id = id;
    this.title = title;
    this.image = image;
    this.endPoint = endPoint;
    this.rooms = [];
  }

  addRoom(room) {
    this.rooms.push(room);
  }
}

module.exports = Namespace;
