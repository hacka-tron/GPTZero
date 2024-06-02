export class WebSocketService {
    constructor(url) {
        this.url = url;
        this.ws = null;
    }

    connect(onMessage, onClose, onError) {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("WebSocket connection opened.");
        };

        this.ws.onmessage = (event) => {
            console.log("Received data: ", event.data);
            if (onMessage) onMessage(event.data);
        };

        this.ws.onclose = () => {
            console.log("WebSocket connection closed.");
            if (onClose) onClose();
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error: ", error);
            if (onError) onError(error);
        };
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.error("WebSocket connection is not open.");
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default WebSocketService;
