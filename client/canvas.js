const socket = io("http://localhost:3000");

let canvasEle = document.getElementById("canvas");
let context = canvasEle.getContext("2d");

const rect = canvasEle.getBoundingClientRect();
canvasEle.width = rect.width;
canvasEle.height = rect.height;

context.lineCap = "round";
context.lineJoin = "round";



let colorEle = document.getElementById("color");
let sizeEle = document.getElementById("size");

let brushBtn = document.getElementById("brush");
let eraserBtn = document.getElementById("eraser");

let undoBtn = document.getElementById("undoBtn");
let redoBtn = document.getElementById("redoBtn");

let myColor = "#000000";

let redoStack = [];
let strokes = [];
let cursors = {};

let currentStroke = null;

let lastX, lastY;
let isDrawing = false;
let isEraser = false;

// For live remote drawing
let remoteLastPoint = {};

// -------------------- MOUSE DOWN --------------------

canvasEle.addEventListener("mousedown", (event) => {
  isDrawing = true;

  lastX = event.offsetX;
  lastY = event.offsetY;

  context.beginPath();
  context.moveTo(lastX, lastY);

  currentStroke = {
    color: isEraser ? "#ffffff" : colorEle.value,
    width: sizeEle.value,
    points: [{ x: lastX, y: lastY }],
  };
});

// -------------------- MOUSE MOVE --------------------

canvasEle.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;
  
    let currentX = event.offsetX;
    let currentY = event.offsetY;
  
    let midX = (lastX + currentX) / 2;
    let midY = (lastY + currentY) / 2;
  
    context.strokeStyle = isEraser ? "#ffffff" : colorEle.value;
    context.lineWidth = sizeEle.value;
  
    context.quadraticCurveTo(lastX, lastY, midX, midY);
    context.stroke();
  
    currentStroke.points.push({ x: currentX, y: currentY });
  
    // SEND POINT
    socket.emit("drawPoint", {
      id: socket.id,
      x: currentX,
      y: currentY,
      color: isEraser ? "#ffffff" : colorEle.value,
      width: sizeEle.value,
    });
  
    // cursor
    socket.emit("cursorMove", {
      id: socket.id,
      x: currentX,
      y: currentY,
      color: myColor,
    });
  
    lastX = currentX;
    lastY = currentY;
  });
  

// -------------------- MOUSE UP --------------------

canvasEle.addEventListener("mouseup", () => {
  isDrawing = false;

  strokes.push(currentStroke);
  socket.emit("newStroke", currentStroke);

  socket.emit("endStroke", socket.id);

  currentStroke = null;
  redoStack = [];
});

// -------------------- ERASER / BRUSH --------------------

eraserBtn.onclick = () => (isEraser = true);
brushBtn.onclick = () => (isEraser = false);

// -------------------- REDRAW --------------------

function redrawCanvas() {
    context.clearRect(0, 0, canvasEle.width, canvasEle.height);
  
    for (let stroke of strokes) {
      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
  
      let points = stroke.points;
  
      context.moveTo(points[0].x, points[0].y);
  
      for (let i = 1; i < points.length; i++) {
        let midX = (points[i - 1].x + points[i].x) / 2;
        let midY = (points[i - 1].y + points[i].y) / 2;
  
        context.quadraticCurveTo(
          points[i - 1].x,
          points[i - 1].y,
          midX,
          midY
        );
      }
  
      context.stroke();
    }
  }
  

// Draw Cursor
function drawCursors() {
  
    for (let id in cursors) {
      const c = cursors[id];
  
      context.beginPath();
      context.fillStyle = c.color;
      context.arc(c.x, c.y, 5, 0, Math.PI * 2);
      context.fill();
    }
  }
  

// -------------------- UNDO --------------------

undoBtn.onclick = () => {
  socket.emit("undo");
};

//Redo
redoBtn.onclick = () => {
    socket.emit("redo");
}

// -------------------- SOCKET EVENTS --------------------

// LIVE POINT RECEIVE
socket.on("drawPoint", (data) => {
    const id = data.id;
  
    if (!remoteLastPoint[id]) {
      remoteLastPoint[id] = { x: data.x, y: data.y };
      context.beginPath();
      context.moveTo(data.x, data.y);
      return;
    }
  
    let last = remoteLastPoint[id];
  
    let midX = (last.x + data.x) / 2;
    let midY = (last.y + data.y) / 2;
  
    context.strokeStyle = data.color;
    context.lineWidth = data.width;
  
    context.quadraticCurveTo(last.x, last.y, midX, midY);
    context.stroke();
  
    remoteLastPoint[id] = { x: data.x, y: data.y };
  });
  
  

// END STROKE CLEANUP
socket.on("endStroke", (id) => {
  delete remoteLastPoint[id];
});

// FULL STROKE SYNC
socket.on("drawStroke", (stroke) => {
  strokes.push(stroke);
  redrawCanvas();
});

// INITIAL LOAD
socket.on("initCanvas", (serverStrokes) => {
  strokes = serverStrokes;
  redrawCanvas();
});

// GLOBAL UNDO UPDATE
socket.on("canvasUpdate", (serverStrokes) => {
  strokes = serverStrokes;
  redrawCanvas();
});

//Assign Unique color to user
socket.on("userColor", (color) => {
    myColor = color;
    colorEle.value = color; // show in picker
});

socket.on("cursorMove", (data) => {
    cursors[data.id] = data;
    drawCursors();
  });
  
  socket.on("cursorLeave", (id) => {
    delete cursors[id];
  });
  