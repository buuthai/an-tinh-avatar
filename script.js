const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const input = document.getElementById("photoInput");
const zoom = document.getElementById("zoom");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const frame = new Image();
frame.src = "khung_an_tinh.png";

let photo = null;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let startX = 0, startY = 0, startOX = 0, startOY = 0;

function draw(){
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // Brown background outside the circular avatar.
  ctx.fillStyle = "#4a2815";
  ctx.fillRect(0,0,W,H);

  // Perfectly circular photo area.
  ctx.save();
  ctx.beginPath();
  ctx.arc(W/2,H/2,Math.min(W,H)*0.345,0,Math.PI*2);
  ctx.clip();

  if(photo){
    const base = Math.max(W/photo.width, H/photo.height);
    const s = base * scale;
    const dw = photo.width*s, dh = photo.height*s;
    ctx.drawImage(photo, (W-dw)/2+offsetX, (H-dh)/2+offsetY, dw, dh);
  } else {
    ctx.fillStyle = "#21130b";
    ctx.fillRect(0,0,W,H);
  }
  ctx.restore();

  // Frame artwork is above the user's photo.
  if(frame.complete) ctx.drawImage(frame,0,0,W,H);
}

frame.onload = draw;

input.addEventListener("change", e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    const im = new Image();
    im.onload = ()=>{
      photo = im;
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      zoom.value = 1;
      draw();
    };
    im.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoom.addEventListener("input", ()=>{
  scale = Number(zoom.value);
  draw();
});

resetBtn.addEventListener("click", ()=>{
  scale = 1; offsetX = 0; offsetY = 0;
  zoom.value = 1;
  draw();
});

function pointer(e){
  const r = canvas.getBoundingClientRect();
  return {
    x:(e.clientX-r.left)*(canvas.width/r.width),
    y:(e.clientY-r.top)*(canvas.height/r.height)
  };
}

canvas.addEventListener("pointerdown", e=>{
  if(!photo) return;
  dragging = true;
  canvas.setPointerCapture(e.pointerId);
  const p = pointer(e);
  startX=p.x; startY=p.y;
  startOX=offsetX; startOY=offsetY;
});
canvas.addEventListener("pointermove", e=>{
  if(!dragging) return;
  const p=pointer(e);
  offsetX=startOX+(p.x-startX);
  offsetY=startOY+(p.y-startY);
  draw();
});
canvas.addEventListener("pointerup", ()=>dragging=false);
canvas.addEventListener("pointercancel", ()=>dragging=false);

downloadBtn.addEventListener("click", ()=>{
  if(!photo){
    alert("Vui lòng chọn ảnh trước.");
    return;
  }
  const a=document.createElement("a");
  a.download="Anh-dai-dien-An-Tinh.png";
  a.href=canvas.toDataURL("image/png");
  a.click();
});

draw();
