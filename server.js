import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

io.on("connection", (socket) => {
  // receive a message from the client
  socket.on("change-input", (text) => {
    // emit that to all clients as server-update
    io.emit("server-update", text);
  });
});

io.listen(3000);