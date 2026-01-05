// Tyre center (approx)
const TYRE_CENTER = { lat: 33.27083, lng: 35.19611 };

// Approx markers
const PLACES = {
  tyre: { name: "Tyre / صور (Center)", coords: [33.27083, 35.19611], note: "General center point for navigation." },
  beach:{ name: "Beach area (approx)", coords: [33.2616, 35.1967], note: "Sandy beach zone for relaxing walks." },
  ruins:{ name: "Ruins area (approx)", coords: [33.2676, 35.2099], note: "Archaeological zone — great to visit early." }
};

function setLinks() {
  document.getElementById("btnBeirutToTyre").href =
    `https://www.google.com/maps/dir/?api=1&origin=Beirut&destination=${TYRE_CENTER.lat},${TYRE_CENTER.lng}&travelmode=driving`;

  document.getElementById("btnOSMTyre").href =
    `https://www.openstreetmap.org/#map=13/${TYRE_CENTER.lat}/${TYRE_CENTER.lng}`;
}

function setHeroNote() {
  const el = document.getElementById("heroNote");
  el.textContent = "Tip: You can integrate more features later (gallery, events, Arabic/English toggle).";
}

function initMap() {
  const map = L.map("mapBox").setView([TYRE_CENTER.lat, TYRE_CENTER.lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  Object.values(PLACES).forEach((p) => {
    L.marker(p.coords).addTo(map).bindPopup(`<strong>${p.name}</strong><br>${p.note}`);
  });

  document.getElementById("centerTyre").addEventListener("click", () => map.setView(PLACES.tyre.coords, 13, { animate: true }));
  document.getElementById("goBeach").addEventListener("click", () => map.setView(PLACES.beach.coords, 14, { animate: true }));
  document.getElementById("goRuins").addEventListener("click", () => map.setView(PLACES.ruins.coords, 14, { animate: true }));
}

async function submitContact(form) {
  const status = document.getElementById("contactStatus");
  const btn = document.getElementById("contactSubmit");

  status.className = "status";
  status.textContent = "";
  btn.disabled = true;

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(payload?.error || "Failed to send. Please try again.");
    }

    status.className = "status ok";
    status.textContent = "Message sent successfully ✅";
    form.reset();
  } catch (e) {
    status.className = "status err";
    status.textContent = e.message || "Something went wrong.";
  } finally {
    btn.disabled = false;
  }
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitContact(form);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setLinks();
  setHeroNote();
  initMap();
  initContactForm();
});
