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
  el.textContent = "Welcome to Tyre — Your gateway to discovering Lebanon's coastal treasures and ancient wonders.";
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
    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const message = document.getElementById("contactMessage").value;
    
    if (!name || !email || !message) {
      const lang = document.documentElement.getAttribute("lang") || "en";
      const errorMsg = lang === "ar" ? "يرجى ملء جميع الحقول!" : "Please fill in all fields!";
      alert(errorMsg);
      return;
    }
    
    // Show success message
    const lang = document.documentElement.getAttribute("lang") || "en";
    const successMsg = lang === "ar" 
      ? `شكراً لك ${name}! تم إرسال رسالتك. سنرد عليك على ${email} قريباً.`
      : `Thank you, ${name}! Your message has been sent. We'll get back to you at ${email} soon.`;
    alert(successMsg);
    
    // Reset form
    form.reset();
  });
  
  // Update placeholders on language change
  const updatePlaceholders = () => {
    const lang = document.documentElement.getAttribute("lang") || "en";
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const messageInput = document.getElementById("contactMessage");
    
    if (nameInput && nameInput.hasAttribute("data-placeholder-en")) {
      nameInput.placeholder = lang === "ar" ? nameInput.getAttribute("data-placeholder-ar") : nameInput.getAttribute("data-placeholder-en");
    }
    if (emailInput && emailInput.hasAttribute("data-placeholder-en")) {
      emailInput.placeholder = lang === "ar" ? emailInput.getAttribute("data-placeholder-ar") : emailInput.getAttribute("data-placeholder-en");
    }
    if (messageInput && messageInput.hasAttribute("data-placeholder-en")) {
      messageInput.placeholder = lang === "ar" ? messageInput.getAttribute("data-placeholder-ar") : messageInput.getAttribute("data-placeholder-en");
    }
  };
  
  // Listen for language changes
  const observer = new MutationObserver(updatePlaceholders);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  updatePlaceholders();
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  
  const body = document.body;
  const icon = toggle.querySelector(".theme-icon");
  if (!icon) return;
  
  // Check for saved theme preference or default to dark
  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "light") {
    body.classList.add("light-mode");
    icon.textContent = "☀️";
  }
  
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    body.classList.toggle("light-mode");
    const isLight = body.classList.contains("light-mode");
    icon.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

function initLanguageToggle() {
  const toggle = document.getElementById("langToggle");
  if (!toggle) return;
  
  const html = document.documentElement;
  const body = document.body;
  const langText = toggle.querySelector(".lang-text");
  if (!langText) return;
  
  // Check for saved language preference or default to English
  const currentLang = localStorage.getItem("language") || "en";
  if (currentLang === "ar") {
    html.setAttribute("lang", "ar");
    html.setAttribute("dir", "rtl");
    body.setAttribute("dir", "rtl");
    langText.textContent = "AR";
    updateLanguageContent("ar");
  } else {
    html.setAttribute("lang", "en");
    html.setAttribute("dir", "ltr");
    body.setAttribute("dir", "ltr");
    langText.textContent = "EN";
    updateLanguageContent("en");
  }
  
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentLang = html.getAttribute("lang") || "en";
    const newLang = currentLang === "en" ? "ar" : "en";
    
    html.setAttribute("lang", newLang);
    html.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
    body.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
    langText.textContent = newLang === "ar" ? "AR" : "EN";
    
    localStorage.setItem("language", newLang);
    updateLanguageContent(newLang);
  });
}

function updateLanguageContent(lang) {
  const elements = document.querySelectorAll("[data-en][data-ar]");
  elements.forEach(el => {
    // Check if element contains HTML tags
    const arContent = el.getAttribute("data-ar");
    const enContent = el.getAttribute("data-en");
    
    if (arContent && enContent) {
      // Check if content contains HTML tags
      if (arContent.includes("<") || enContent.includes("<")) {
        el.innerHTML = lang === "ar" ? arContent : enContent;
      } else {
        el.textContent = lang === "ar" ? arContent : enContent;
      }
    }
  });
  
  // Update brand title separately (has both English and Arabic)
  const brandTitle = document.getElementById("brandTitle");
  if (brandTitle) {
    if (lang === "ar") {
      brandTitle.textContent = "مدينة صور";
    } else {
      brandTitle.textContent = "Tyre City";
    }
  }
  
  // Update footer title
  const footerTitle = document.getElementById("footerTitle");
  if (footerTitle) {
    if (lang === "ar") {
      footerTitle.textContent = "مدينة صور";
    } else {
      footerTitle.textContent = "Tyre City";
    }
  }
  
  // Update placeholders
  const inputs = document.querySelectorAll("input[placeholder], textarea[placeholder]");
  inputs.forEach(input => {
    const placeholderEn = input.getAttribute("data-placeholder-en") || input.placeholder;
    const placeholderAr = input.getAttribute("data-placeholder-ar");
    if (placeholderAr) {
      input.setAttribute("data-placeholder-en", placeholderEn);
      input.placeholder = lang === "ar" ? placeholderAr : placeholderEn;
    }
  });
  
  // Update button text content
  const buttons = document.querySelectorAll("button[data-en][data-ar]");
  buttons.forEach(btn => {
    const arText = btn.getAttribute("data-ar");
    const enText = btn.getAttribute("data-en");
    if (arText && enText) {
      btn.textContent = lang === "ar" ? arText : enText;
    }
  });
}

function initPlanVisitModal() {
  const modal = document.getElementById("planVisitModal");
  const openBtn = document.getElementById("planVisitBtn");
  const closeBtn = document.querySelector(".modal-close");
  const bookBtn = document.getElementById("bookTourBtn");
  const downloadBtn = document.getElementById("downloadGuideBtn");
  
  if (!modal || !openBtn) return;
  
  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });
  
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  });
  
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
  
  bookBtn.addEventListener("click", () => {
    const date = document.getElementById("visitDate").value;
    const adults = document.getElementById("adults").value;
    const children = document.getElementById("children").value;
    
    if (!date) {
      alert("Please select a date first!");
      return;
    }
    
    alert(`Tour booking requested!\nDate: ${date}\nAdults: ${adults}, Children: ${children}\n\nWe'll contact you soon to confirm your booking.`);
  });
  
  downloadBtn.addEventListener("click", () => {
    alert("Travel Guide PDF download started!\n\n(Note: This is a demo. In production, this would download the actual PDF guide.)");
  });
  
  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("visitDate").setAttribute("min", today);
  document.getElementById("endDate").setAttribute("min", today);
}

document.addEventListener("DOMContentLoaded", () => {
  setLinks();
  setHeroNote();
  initMap();
  initContactForm();
  initThemeToggle();
  initLanguageToggle();
  initPlanVisitModal();
});
