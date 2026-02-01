# Architecture Overview

This application is a real-time collaborative drawing system where multiple users can draw simultaneously on a shared HTML canvas. It uses WebSockets (Socket.io) for low-latency communication and maintains a global synchronized drawing state.

The system is designed with two parallel drawing flows:

1. Live point streaming for immediate visual feedback
2. Stroke-based state storage for consistency, undo/redo, and new user synchronization

## 1. High-Level System Components

### Client (Frontend)

- HTML Canvas (raw Canvas API)
- Drawing logic (brush, eraser, stroke smoothing)
- WebSocket client (Socket.io)
- UI controls (color picker, brush size, undo/redo)

### Server (Backend)

- Node.js + Express
- Socket.io WebSocket server
- Global canvas state storage (strokes array)
- User color management
- Undo/redo stack

## 2. Data Flow Diagram (Textual)

User draws on canvas  
↓  
Client captures mouse movement points  
↓  
Client sends live points via WebSocket (`drawPoint`)  
↓  
Server broadcasts points to all other users  
↓  
Other clients draw the line in real time  

When stroke ends:  
↓  
Client sends full stroke (`newStroke`)  
↓  
Server stores stroke in global state  
↓  
Server broadcasts stroke for permanent sync  

When new user joins:  
↓  
Server sends full stroke history (`initCanvas`)  
↓  
Client redraws entire canvas 

## 3. WebSocket Protocol & Events

### Client → Server

|Event       | Description                                        |
|------------|----------------------------------------------------|
| drawPoint  | Sends individual drawing points for live rendering |
| newStroke  | Sends completed stroke for global storage          |
| endStroke  | Indicates stroke completion                        |
| undo       | Requests global undo                               |
| redo       | Requests global redo                               |
| cursorMove | Sends cursor position for user indicators          |

### Server → Client

| Event        | Description                          |
|--------------|--------------------------------------|
| drawPoint    | Broadcasts live drawing points       |
| drawStroke   | Broadcasts completed stroke          |
| initCanvas   | Sends full canvas state to new users |
| canvasUpdate | Sends updated state after undo/redo  |
| cursorMove   | Broadcasts user cursor positions     |
| cursorLeave  | Removes cursor on disconnect         |
| userColor    | Assigns unique color to each user    |

## 4. Drawing Data Structure

Each stroke is stored as:

```js
{
  color: string,
  width: number,
  points: [
    { x: number, y: number },
    ...
  ]
}
```

The system stores vector-style drawing commands instead of pixel data.

### Advantages

- Lightweight network data transfer  
- Enables global undo and redo functionality  
- Allows full canvas redraw at any time  
- Efficient synchronization across users  

## 5. Live Drawing Strategy

The system uses a hybrid approach combining live streaming and authoritative state storage.

### Live Streaming (Fast Preview)

- Individual points sent continuously using `drawPoint`  
- Rendered immediately for other users  
- Uses quadratic curves for smoother drawing  

### Authoritative State (Consistency)

- Full stroke sent after mouse release using `newStroke`  
- Stored on the server  
- Used for undo/redo and new user synchronization  

### This approach balances:

- Low latency  
- Visual accuracy  
- Performance  

## 6. Global Undo / Redo Strategy

The server maintains:

- `strokes[]` → current canvas state  
- `redoStack[]` → removed strokes  

### Undo Process

1. Pop last stroke from `strokes`  
2. Push into `redoStack`  
3. Broadcast updated canvas state  

### Redo Process

1. Pop from `redoStack`  
2. Push back into `strokes`  
3. Broadcast updated canvas state  

Since the server controls the state:

- All users remain synchronized  
- One user can undo another user's drawing  

## 7. Conflict Handling

Multiple users can draw simultaneously.

This is handled by:

- Independent live point streams per user  
- Server broadcasting events without locking  

Since strokes are additive:

- No blocking is required  
- All drawings merge naturally in real time  

Undo operations are applied sequentially on the server state.

## 8. User Management

### Unique Color Assignment

- Server assigns colors from a predefined pool  
- Colors are reused when users disconnect  

### Cursor Indicators

- Each user streams cursor position  
- Displayed as colored dots on the canvas  

This provides real-time awareness of other users.

## 9. Performance Decisions

### Why not send full strokes continuously?

- Would increase network traffic  
- Adds latency  
- Makes scaling harder  

### Why use stroke vectors instead of pixels?

- Smaller data size  
- Easier redraw  
- Supports undo/redo  
- Better performance  

### Why separate live preview and final state?

- Live streaming for responsiveness  
- Stroke storage for consistency  

## 10. Scalability Considerations

The current design supports:

- Multiple concurrent users smoothly  

Future improvements could include:

- Multiple rooms or canvases  
- Throttling drawing events  
- Binary message formats  

## 11. Summary

This application uses:

- Real-time WebSocket streaming for collaboration  
- Stroke-based vector storage for global consistency  
- Server-controlled state for undo/redo  
- Lightweight event-based synchronization  

### The design achieves:

✔ Smooth real-time drawing  
✔ Accurate synchronization  
✔ Global undo/redo  
✔ Efficient performance  

