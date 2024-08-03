const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("get_server_time", ({ currentClientTime }) => {
    const tolerance = 5000;
    const currentTime = Date.now();

    const timeDifference = Math.abs(currentTime - currentClientTime);

    const isTimeManipulated = timeDifference > tolerance;

    socket.emit("received_server_time", { isTimeManipulated });
  });

  socket.on("check_if_auction_ended", ({ endsAt }) => {
    const dateNow = Date.now();

    const isAuctionEnded = endsAt <= dateNow;

    socket.emit("received_auction_end_status", { isAuctionEnded });
  });

  socket.on("new_bid", (bid) => {
    const { auctionIdForSocket, amountForSocket, upcomingEndsAt } = bid;

    io.emit("price_updated", {
      auctionIdForSocket,
      amountForSocket,
      upcomingEndsAt,
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
