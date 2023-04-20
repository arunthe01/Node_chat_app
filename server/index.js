const express = require("express");
const app = express();
const router = require("./router");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
app.use(cors());
app.use(router);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("a user connected");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name: name, room: room });
    if (error) return callback(error);
    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name} welcome to the room " ${room} "`,
    });

    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined ${room}`,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    user.room
      ? io.to(user.room).emit("message", { user: user.name, text: message })
      : null;
    callback();
  });



  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(3001, () => {
  console.log("server listening on");
});
