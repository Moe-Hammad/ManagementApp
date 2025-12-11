# WebSocket-uebersicht

Kurze Dokumentation der STOMP/WebSocket-Verbindungen in der App und wie das Frontend sie nutzt.

---

## Grundprinzip (Frontend)
- Eine globale Verbindung, verwaltet in `src/services/wsClient.ts` (STOMP ueber SockJS).
- URL: `{EXPO_PUBLIC_BACKEND_URL}` (HTTP/HTTPS), Pfad `/ws` (SockJS handhabt `/ws/info` etc.).
- Authentifizierung: JWT im Header `Authorization: Bearer <token>` beim STOMP `CONNECT`.
- Heartbeat: Client sendet alle 15s (`heart-beat: "15000,15000"`).
- Reconnect: Backoff (Start 5s); alle Subscriptions werden nach Reconnect neu registriert.
- Subscriptions sind sauber entfernbar via `unsubscribe()`, die Verbindung kann komplett per `disconnectWebSocket()` beendet werden.

## Kanaele (Destinations)
- `/user/queue/messages`  
  Nutzt `subscribeUserMessages(token, userId, onMessage, onError?)`  
  Zweck: Chat-Nachrichten in Echtzeit.

- `/user/queue/requests`  
  Nutzt `subscribeUserRequests(token, onMessage, onError?)`  
  Zweck: Team-Requests live empfangen/aktualisieren.

- `/user/queue/assignments`  
  Nutzt `subscribeUserAssignments(token, onMessage, onError?)`  
  Zweck: Aufgaben-/Task-Zuweisungen live empfangen.

## Lebenszyklus im Frontend
- Verbindung: Beim ersten Subscribe wird `ensureConnected(token)` aufgerufen -> baut die globale WS-Verbindung auf.
- Subscriben: `manager.subscribe(destination, cb)` sendet STOMP `SUBSCRIBE`, sobald die Verbindung steht.
- Nachrichten: Bei `MESSAGE` wird der Body als JSON geparst und an den Callback gereicht.
- Reconnect: Bei `close`/`error` wird automatisch erneut verbunden; vorhandene Subscriptions werden mit denselben IDs resubscribed.
- Unsubscribe: `subscription.unsubscribe()` sendet STOMP `UNSUBSCRIBE` (wenn verbunden) und entfernt den Callback.
- Disconnect (Logout): `disconnectWebSocket()` beendet Verbindung, Heartbeat, Reconnect-Timeouts und leert die Subscriptions.

## Typischer Flow pro Feature
- Chats  
  - Hook/Screen ruft `subscribeUserMessages(...)` auf.  
  - Bei neuen Nachrichten: Redux/State-Update.  
  - Beim Verlassen/Unmount: `disconnect()` des zurueckgegebenen Sub-Objekts.

- Requests  
  - Hook `useRequests` abonniert `subscribeUserRequests`.  
  - Bei neuen/aktualisierten Requests -> `upsertRequest` in Redux.  
  - Bei Logout/Unmount -> `disconnect()` des Sub-Objekts.

- Assignments  
  - Fuer Employees: `subscribeUserAssignments`.  
  - Updates kommen ins Assignment-Redux (`upsertAssignment`).  
  - Cleanup wie oben.

## Backend (Kurz)
- WS-Endpoint: `/ws` (Spring STOMP, mit SockJS).  
- User-spezifische Queues mit Prefix `/user/queue/...` (Spring schickt automatisch an den authentifizierten User).  
- Auth via JWT aus dem HTTP-Header bei STOMP `CONNECT`.  
- Heartbeat-Intervalle werden vom Client angeboten; Server akzeptiert/antwortet gemaess STOMP-Standard.

## Troubleshooting / Hinweise
- Kein Token -> keine Verbindung; Callback `onError` nutzen, um UI-Status anzupassen.
- Bei 401/403 auf der WS-Strecke: Token pruefen/refreshen, dann erneut `connect`.
- Reconnect-Backoff aktuell 5s fest; UI kann den Status (z. B. `wsStatus`) anzeigen.
- Beim Hot-Reload oder App-Wechsel immer pruefen, ob `disconnectWebSocket()` gebraucht wird (z. B. nach Logout).
