const WebSocket = require("ws");
const axios = require("axios");

async function getRichieRichResponse(prompt) {
  try {
    const response = await axios.post(
      "http://localhost:8082/v1/chat/completions",
      {
        prompt,
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// Function to get response via WebSocket
async function getRichieRichResponseStream(prompt, onMessage, onClose, onError) {
  const ws = new WebSocket("ws://localhost:8082/v1/stream");

  ws.on("open", () => {
    console.log("WebSocket connection opened.");
    ws.send(prompt);
  });

  ws.on("message", (data) => {
    console.log("Received data: ", data);
    if (onMessage) onMessage(data);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
    if (onClose) onClose();
  });

  ws.on("error", (error) => {
    console.error("WebSocket error: ", error);
    if (onError) onError(error);
  });
}

module.exports = {
  getRichieRichResponse,
  getRichieRichResponseStream,
};