import { GardenWorld } from "./world.js";
import { story } from "./story.js";
import { loadState, saveState, resetState } from "./state.js";

const $ = id => document.getElementById(id);
const canvas = $("world");
const intro = $("intro");
const hint = $("hint");
const panel = $("message-panel");
const guide = $("guide");
const loading = $("loading");
let state = loadState();
let world;
let entered = false;
let activeObject = null;

function updateProgress() {
  const n = state.discoveries.length;
  $("progress-label").textContent = n ? `${n} DISCOVERY${n === 1 ? "" : "IES"} FOUND` : "THE GARDEN IS WAITING";
}

function updateUnlocks() {
  const blossoms = state.discoveries.filter(id => id.startsWith("blossom_")).length;
  const petals = state.discoveries.filter(id => id.startsWith("petal_")).length;
  const roots = state.discoveries.filter(id => id.startsWith("root_")).length;
  state.unlocked.roots = blossoms >= 2;
  state.unlocked.nightGarden = blossoms >= 3 && petals >= 1;
  state.unlocked.finalBloom = state.unlocked.nightGarden && roots >= 1;
  if (state.unlocked.nightGarden) {
    state.atmosphere = "night";
    world?.setNight();
  }
  saveState(state);
}

function showMessage(id) {
  const item = story[id];
  if (!item) return;
  activeObject = id;
  if (!state.discoveries.includes(id)) state.discoveries.push(id);
  updateUnlocks();
  updateProgress();
  $("message-category").textContent = item.category;
  $("message-title").textContent = item.title;
  $("message-body").textContent = item.body;
  $("message-status").textContent = "Discovery saved";
  panel.hidden = false;
  if (world) world.focusObject(id);
  hint.hidden = true;
}

function onObjectTap(data) {
  if (!entered || panel.hidden === false) return;
  if (data.type === "blossom") {
    showMessage(data.id);
  } else if (data.type === "petal") {
    if (!state.discoveries.includes(data.id)) state.discoveries.push(data.id);
    updateUnlocks();
    updateProgress();
    showMessage(data.id);
  }
}

function closeMessage() {
  panel.hidden = true;
  activeObject = null;
  hint.hidden = false;
}

function enterGarden() {
  if (entered) return;
  entered = true;
  intro.classList.add("leaving");
  setTimeout(() => { intro.hidden = true; }, 950);
  hint.hidden = false;
  updateProgress();
}

function resetExperience() {
  state = resetState();
  updateProgress();
  panel.hidden = true;
  guide.hidden = true;
  if (world) {
    world.isNight = false;
    world.scene.background.set("#806076");
    world.scene.fog.color.set("#806076");
    world.scene.fog.near = 17;
    world.scene.fog.far = 54;
    world.ambient.color.set("#ffe5f0");
    world.ambient.groundColor.set("#3e493c");
    world.ambient.intensity = 2.1;
    world.sun.intensity = 3.0;
    world.rim.intensity = 1.7;
    world.blossoms.forEach((b, i) => b.userData.glow.material.color.set(i === 1 ? "#fff0f6" : "#ffb8d3"));
  }
  intro.hidden = false;
  intro.classList.remove("leaving");
  entered = false;
  hint.hidden = true;
}

$("enter-button").addEventListener("click", enterGarden);
$("close-message").addEventListener("click", closeMessage);
$("return-button").addEventListener("click", closeMessage);
$("guide-toggle").addEventListener("click", () => { guide.hidden = !guide.hidden; });
$("close-guide").addEventListener("click", () => { guide.hidden = true; });
$("reset-button").addEventListener("click", resetExperience);
$("sound-toggle").addEventListener("click", () => {
  const button = $("sound-toggle");
  button.textContent = button.textContent === "♫" ? "×" : "♫";
  button.title = "Ambient audio will be added in a later prototype";
});

try {
  world = new GardenWorld(canvas, onObjectTap);
  // Restore the environment if the visitor already unlocked the night garden.
  if (state.unlocked?.nightGarden || state.atmosphere === "night") world.setNight();
  updateProgress();
  setTimeout(() => loading.classList.add("done"), 500);
  setTimeout(() => loading.remove(), 1200);
} catch (error) {
  console.error("Could not initialise the 3D garden:", error);
  loading.innerHTML = '<p>The garden could not start on this device. Please try a modern browser with WebGL enabled.</p>';
}
