import { io } from "./app.js";

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // message event
  socket.on("sendMessage", (data) => {
    console.log("Message:", data);

    // broadcast to everyone (or use rooms for private chat)
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
