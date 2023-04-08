import { Server } from "socket.io";
import { createServer } from "http";

const users = [];

const httpServer = createServer();
const io = new Server(httpServer, {cors: {origin: "*"}});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
    // Add the new user to the users array
    users.push({id: socket.id, username: socket.username});

    // Send the updated list of users to all connected clients
    io.emit("user-update", users);
    let currentUser = null

    // Receive a message from the client
    socket.on("send-message", (text) => {
        // Emit the message to all clients as server-update
        socket.to(currentUser).emit("server-update", { text, from: socket.id });
    });

    socket.on("select-user", (id) => {
      currentUser = id
      socket.join(id);
    })

    // Remove the user from the users array when the user disconnects
    socket.on("disconnect", () => {
        const index = users.indexOf(socket);
        if (index !== -1) {
            users.splice(index, 1);
        }

        // Send the updated list of users to all connected clients
        io.emit("user-update", users);
    });
});

io.listen(3000);
