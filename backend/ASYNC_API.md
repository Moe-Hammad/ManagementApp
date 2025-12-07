# Async API (WebSocket / STOMP)

## Server
- URL: ws://localhost:8080/ws (Host/Port wird nach Deployment angepasst)
- Protokoll: STOMP ueber WebSocket
- Security: JWT Pflicht. CONNECT muss Header `Authorization: Bearer <token>` senden (wird im WebSocketAuthChannelInterceptor geprueft).

## Channels

### /topic/requests (SUBSCRIBE)
- Zweck: Echtzeit-Events zu Manager/Employee-Requests.
- Payload (RequestEvent):
```json
{
  "type": "request_created | request_updated",
  "payload": {
    "id": "UUID",
    "managerId": "UUID",
    "employeeId": "UUID",
    "status": "PENDING | APPROVED | REJECTED",
    "message": "string",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```
- payload entspricht RequestDto.
- Application-Destination-Prefix: /app (derzeit keine @MessageMapping-Handler definiert).

## Client-Beispiel (JS, @stomp/stompjs)
```js
import { Client } from "@stomp/stompjs";

const token = "<JWT>";
const client = new Client({
  brokerURL: "ws://localhost:8080/ws",
  connectHeaders: {
    Authorization: `Bearer ${token}`,
  },
});

client.onConnect = () => {
  client.subscribe("/topic/requests", (frame) => {
    const event = JSON.parse(frame.body);
    console.log(event.type, event.payload);
  });
};

client.activate();
```
