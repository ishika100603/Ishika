const message = document.getElementById("message");
const lightBeam = document.getElementById("lightBeam");
const carCursor = document.getElementById("carCursor");

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;

function updateCursor(event) {
  pointerX = event.clientX;
  pointerY = event.clientY;

  carCursor.style.left = `${pointerX}px`;
  carCursor.style.top = `${pointerY}px`;
  lightBeam.style.left = `${pointerX}px`;
  lightBeam.style.top = `${pointerY}px`;

  const messageRect = message.getBoundingClientRect();
  const beamRadius = 180;
  const offsetX = pointerX - messageRect.left;
  const offsetY = pointerY - messageRect.top;
  const isWithinMessage = offsetX > 0 && offsetX < messageRect.width && offsetY > 0 && offsetY < messageRect.height;
  const distanceToBeam = Math.hypot(offsetX - messageRect.width / 2, offsetY - messageRect.height / 2);
  const intensity = isWithinMessage ? Math.max(0, 1 - distanceToBeam / beamRadius) : 0;

  message.style.opacity = `${0.16 + intensity * 0.84}`;
  message.classList.toggle("is-revealed", intensity > 0.2);
}

window.addEventListener("mousemove", updateCursor);
window.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  if (touch) {
    updateCursor({ clientX: touch.clientX, clientY: touch.clientY });
  }
}, { passive: true });

window.addEventListener("resize", () => {
  updateCursor({ clientX: pointerX, clientY: pointerY });
});

updateCursor({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
