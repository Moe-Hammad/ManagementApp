# WebSocket-uebersicht

Diese Seite erklaert, wie die STOMP-Verbindung zwischen Frontend (React Native/Expo) und Backend (Spring) funktioniert, welche Endpunkte/Queues genutzt werden und was bei Reconnect/Heartbeat passiert.

---

## Architektur auf einen Blick
- **Transport:** SockJS ueber HTTP/HTTPS nach `{EXPO_PUBLIC_BACKEND_URL}/ws` (SockJS bedient auch `/ws/info`).
- **Protokoll:** STOMP 1.2, Heartbeats 15000/15000 ms.
- **Auth:** JWT im STOMP `CONNECT` Header `Authorization: Bearer <token>`.
- **Single Connection:** Eine globale STOMP-Session, verwaltet in `src/services/wsClient.ts`; mehrere Subscriptions haengen daran.

## Ablauf im Frontend (wsClient)
1) Erstes `subscribe*` ruft `ensureConnected(token)` -> baut die globale SockJS-Verbindung auf.
2) STOMP-Handshake: Client sendet `CONNECT` mit JWT, Heartbeat-Angebot, akzeptierten Versionen.
3) Nach `CONNECTED` werden alle bekannten Destinations resubscribed.
4) Nachrichten (`MESSAGE`) werden als JSON geparst und an die Callbacks gegeben.
5) Heartbeats: Alle 15s sendet der Client ein LF, der Broker antwortet ebenfalls -> Ping/Pong auf STOMP-Ebene.
6) Reconnect: Bei Close/Error aktiviert der Client nach 5s erneut und subscribed alles neu.
7) Cleanup: `disconnectWebSocket()` beendet Verbindung, Heartbeat und Subscriptions (z. B. bei Logout).

## Kanaele (Destinations)
- `/user/queue/messages`  
  `subscribeUserMessages(token, userId, onMessage, onError?)`  
  Echtzeit-Chatnachrichten fuer den eingeloggten User.

- `/user/queue/requests`  
  `subscribeUserRequests(token, onMessage, onError?)`  
  Live-Updates fuer Requests (Manager/Employee).

- `/user/queue/assignments`  
  `subscribeUserAssignments(token, onMessage, onError?)`  
  Live-Updates fuer Task-/Assignment-Zuweisungen.

## Backend (Spring)
- Endpoint + Broker:
```java
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final WebSocketAuthChannelInterceptor authInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue")
              .setHeartbeatValue(new long[]{15000, 15000});
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authInterceptor);
    }
}
```

- Auth (CONNECT-Interceptor, Principal = `uid` aus JWT):
```java
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);
            var claims = jwtTokenProvider.parseClaims(token);
            String uid = claims.get("uid", String.class);
            String role = claims.get("role", String.class);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(uid, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role)));
            accessor.setUser(auth);
            log.info("WS CONNECT principal={} role={}", uid, role);
        }
        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader(HttpHeaders.AUTHORIZATION);
        String header = (authHeaders != null && !authHeaders.isEmpty()) ? authHeaders.get(0) : null;
        if (header != null && header.toLowerCase().startsWith("bearer ")) {
            return header.substring(7).trim();
        }
        return null;
    }
}
```

- Senden an einen User (Principal muss `uid` sein):
```java
@Component
@RequiredArgsConstructor
public class RequestEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public void publishCreated(RequestDto dto) {
        var event = new RequestEvent("request_created", dto);
        messagingTemplate.convertAndSendToUser(dto.getManagerId().toString(), "/queue/requests", event);
        messagingTemplate.convertAndSendToUser(dto.getEmployeeId().toString(), "/queue/requests", event);
    }
}
```

- Heartbeats: SimpleBroker sendet/erwartet 15000/15000 ms (siehe `setHeartbeatValue`).

## Lebenszyklus je Feature
- **Chats:** `subscribeUserMessages` -> Redux `addMessage` im Callback -> Unsubscribe beim Unmount.
- **Requests:** `subscribeUserRequests` -> Redux `upsertRequest` -> Statusanzeigen ueber `wsStatus`.
- **Assignments:** `subscribeUserAssignments` -> Redux `upsertAssignment` -> Statusanzeigen ueber `wsAssignmentsStatus`.

## Frontend (React Native/Expo)
- Client-Setup (SockJS + STOMP, eine globale Verbindung):
```ts
// src/services/wsClient.ts (Ausschnitt)
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";
const sockUrl = API_BASE_URL + "/ws";

this.client = new Client({
  webSocketFactory: () => new SockJS(sockUrl),
  connectHeaders: { Authorization: `Bearer ${token}` },
  reconnectDelay: 5000,
  heartbeatIncoming: 15000,
  heartbeatOutgoing: 15000,
  onConnect: () => { this.connected = true; this.connecting = false; this.resubscribeAll(); },
  onDisconnect: () => { this.connected = false; this.connecting = false; },
  onWebSocketClose: () => { this.connected = false; this.connecting = false; },
  onStompError: (frame) => { this.connected = false; this.connecting = false; console.warn(frame); },
});
```

- Subscriben/Senden:
```ts
const sub = manager.subscribe("/user/queue/requests", (msg: IMessage) => {
  const payload = JSON.parse(msg.body);
  dispatch(upsertRequest(payload.payload ?? payload));
});

// Publish Beispiel
manager.send("/app/some-endpoint", { foo: "bar" });
```

- Typische Nutzung:
  - `subscribeUserMessages` / `subscribeUserRequests` / `subscribeUserAssignments` rufen intern `ensureConnected(token)` auf.
  - Im Hook `useWebSockets` werden die Subscriptions beim Mount aufgebaut und beim Unmount `disconnect()`ed.

## Troubleshooting
- Kein CONNECT/CONNECTED im Backend-Log: STOMP-Subprotocol fehlt oder JWT nicht akzeptiert; Header `Authorization: Bearer <token>` pruefen.
- Keine Lieferung an `/user/queue/...`: Principal muss dem String entsprechen, den `convertAndSendToUser` nutzt (hier: `uid` aus JWT).
- Haeufige Reconnects: Netzwerk, falsche URL, oder Heartbeat-Mismatch; URL `{EXPO_PUBLIC_BACKEND_URL}/ws` (kein `ws://` bei SockJS) pruefen.
- Doppelte Items im UI: Subscriptions liefern eventuell Duplikate; deduplizieren vor dem Rendern (siehe RequestsTab).
