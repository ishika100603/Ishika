// This script adds a subtle pointer-driven glow to the interactive showcase card.
// It reads the cursor position inside the card and updates CSS variables for the visual effect.

const card = document.getElementById("explore-card");

if (card) {
  const resetTilt = () => {
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  };

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);

    const rotateY = (x - 50) / 6;
    const rotateX = (50 - y) / 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("pointerleave", resetTilt);
  resetTilt();
}
