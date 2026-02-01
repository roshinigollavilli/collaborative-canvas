# Real-Time Collaborative Drawing Canvas

A real-time multi-user drawing application built using the raw HTML Canvas API and WebSockets (Socket.io).  
Multiple users can draw simultaneously on a shared canvas and see each other’s drawings instantly.

The project focuses on real-time synchronization, efficient canvas rendering, and global undo/redo handling.

---

## Features

### Drawing Tools
- Brush tool
- Eraser tool
- Multiple brush colors (color picker)
- Adjustable stroke width

### Real-Time Collaboration
- Live drawing synchronization across users
- Smooth drawing using quadratic curves
- Cursor indicators showing other users' positions

### Global State Management
- Global undo and redo (one user can undo another user’s drawing)
- New users receive existing drawings on join

### User Management
- Unique color assigned to each user for identification
- Cursor color matches user identity

---

## Tech Stack

### Frontend
- HTML  
- CSS  
- JavaScript (Raw Canvas API)

### Backend
- Node.js  
- Socket.io (WebSockets)

---

## Project Structure

collaborative-canvas/
├── client/
│ ├── index.html
│ ├── style.css
│ ├── canvas.js
│ └── main.js
├── server/
│ └── server.js
├── package.json
├── README.md
└── ARCHITECTURE.md

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-github-repo-link>
cd collaborative-canvas
```
### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Start the server

```bash
node server.js
```
Server runs on:
```arduino
http://localhost:3000
```
### 4. Run the client

Open:
```bash
client/index/html
```

---

## How to Test Real-Time Collaboration

1. Open `index.html` in 2 or more browser tabs  
2. Draw in one tab  
3. Observe real-time drawing in other tabs  

Try:

- Changing brush colors  
- Using eraser  
- Undo / Redo  
- Drawing simultaneously in multiple tabs  

---

## Known Limitations

- No authentication system (intentionally omitted as per assignment)  
- Single shared room (multi-room support can be added)  
- Draw events are not throttled (can be optimized for large scale)  

---

## Total Time Spent

Approximately 2–3 days

---

## Future Improvements

- Multiple drawing rooms  
- Touch support for mobile devices  
- Shape drawing tools (rectangle, circle, text)  
- Online user list  
- Performance optimizations  

---

## Documentation

Detailed system design, data flow, and real-time synchronization strategy are explained in:

ARCHITECTURE.md

---

## Summary

This project demonstrates:

- Real-time collaborative drawing using WebSockets  
- Efficient Canvas API usage with smooth curves  
- Global undo/redo synchronization  
- Multi-user state management  

It focuses on performance, synchronization, and clean system design as required by the assignment.
