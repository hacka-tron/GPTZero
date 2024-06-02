const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");

const { getRichieRichResponse } = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");

const PORT = 8081;
const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ noServer: true });

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const requestPrompt = req.body.prompt;
  const response = await getRichieRichResponse(requestPrompt);
  const responseHTML = RRML2HTML(response);
  res.send(responseHTML);
});

// WebSocket connection handler for frontend connections
wsServer.on("connection", async (ws) => {
  ws.on("message", async (prompt) => {
    console.log("Received prompt from frontend: ", prompt);
    const modelWs = await getRichieRichResponseStream(
      prompt,
      (data) => ws.send(data),
      () => ws.close(),
      (error) => {
        console.error(error);
        ws.close();
      }
    );

    // Close the connection with the third-party WebSocket when frontend WebSocket is closed
    ws.on("close", () => {
      modelWs.close();
    });
  });
});

// Upgrade HTTP server to handle WebSocket connections from frontend
server.on("upgrade", (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  if (pathname === "/v1/stream") {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
      wsServer.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
