const cards = Array.from(document.querySelectorAll(".option-card"));
const homeScene = document.getElementById("homeScene");
const pageScene = document.getElementById("pageScene");
const hud = document.getElementById("hud");
const pageEyebrow = document.getElementById("pageEyebrow");
const pageTitle = document.getElementById("pageTitle");
const pageText = document.getElementById("pageText");
const contentPanel = document.getElementById("contentPanel");
const beam = document.getElementById("beam");

const destinations = [
  {
    eyebrow: "About Us",
    title: "About Us",
    text: "We build immersive digital journeys that feel like stepping into a living story. Every route is designed to guide the visitor with clarity, drama, and charm.",
  },
  {
    eyebrow: "Contact",
    title: "Contact",
    text: "Reach out for launches, brand stories, or cinematic web experiences. We welcome collaborations that need a bold and memorable first impression.",
  },
];

let selectedIndex = 0;
let currentView = "home";

function updateSelection() {
  cards.forEach((card, index) => {
    card.classList.toggle("is-active", index === selectedIndex);
  });
}

function showDestination(index) {
  const destination = destinations[index];
  pageEyebrow.textContent = destination.eyebrow;
  pageTitle.textContent = destination.title;
  pageText.textContent = destination.text;
}

function enterDestination() {
  showDestination(selectedIndex);
  currentView = "page";
  homeScene.classList.add("is-hidden");
  pageScene.classList.add("is-active");
  pageScene.setAttribute("aria-hidden", "false");
  hud.textContent = "Use the arrow keys to switch scenes. Press Enter to return home.";

  contentPanel.classList.remove("is-lit");
  beam.style.width = "0";
  void beam.offsetWidth;
  beam.style.width = "86%";

  window.setTimeout(() => {
    contentPanel.classList.add("is-lit");
  }, 650);
}

function returnHome() {
  currentView = "home";
  homeScene.classList.remove("is-hidden");
  pageScene.classList.remove("is-active");
  pageScene.setAttribute("aria-hidden", "true");
  contentPanel.classList.remove("is-lit");
  beam.style.width = "0";
  hud.textContent = "Use the arrow keys to ride between destinations. Press Enter to enter.";
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    if (currentView === "home") {
      selectedIndex = (selectedIndex + 1) % cards.length;
      updateSelection();
    } else {
      selectedIndex = (selectedIndex + 1) % destinations.length;
      showDestination(selectedIndex);
    }
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    if (currentView === "home") {
      selectedIndex = (selectedIndex - 1 + cards.length) % cards.length;
      updateSelection();
    } else {
      selectedIndex = (selectedIndex - 1 + destinations.length) % destinations.length;
      showDestination(selectedIndex);
    }
  }

  if (event.key === "Enter") {
    event.preventDefault();
    if (currentView === "home") {
      enterDestination();
    } else {
      returnHome();
    }
  }
});

updateSelection();
