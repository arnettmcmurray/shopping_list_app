// === DOM Elements ===
const itemForm = document.getElementById("itemForm");
const itemInput = document.getElementById("itemInput");
const itemList = document.getElementById("itemList");
const totalItemsEl = document.getElementById("totalItems");
const gotItemsEl = document.getElementById("gotItems");
const remainingItemsEl = document.getElementById("remainingItems");
const filters = document.querySelector(".filters");

// Profile card elements (if present on page)
const profileCard = document.querySelector(".profile-card");
const profileName = profileCard ? profileCard.querySelector("p strong") : null;
const profileEmail = profileCard
  ? profileCard.querySelector("p:last-of-type")
  : null;

// === State ===
let totalItems = 0;
let gotItems = 0;
let items = []; // persistent list
let showingDemo = false;
let profile = null;

// === Init from localStorage ===
window.addEventListener("DOMContentLoaded", () => {
  // Load items
  const saved = JSON.parse(localStorage.getItem("shoppingList")) || [];
  if (saved.length === 0) {
    showDemoItems();
    showingDemo = true;
  } else {
    saved.forEach((obj) => createItem(obj.text, obj.got));
    updateStats();
  }

  // Load profile
  profile = JSON.parse(localStorage.getItem("userProfile")) || {
    username: "Demo User",
    email: "user@example.com",
  };
  updateProfileUI();
});

// === Show Demo Items (not saved) ===
function showDemoItems() {
  const demoData = [
    { text: "Milk", got: false },
    { text: "Eggs", got: true },
  ];
  demoData.forEach((obj) => {
    const li = document.createElement("li");
    li.className = "item demo" + (obj.got ? " got" : "");
    const span = document.createElement("span");
    span.className = "item-text";
    span.textContent = obj.text + " (example)";
    span.style.color = "#888";
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.disabled = true;
    removeBtn.style.opacity = 0.5;
    li.appendChild(span);
    li.appendChild(removeBtn);
    itemList.appendChild(li);
  });
}

// === Add Item ===
itemForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = itemInput.value.trim();
  if (text === "") return;

  // Clear demo placeholders if showing
  if (showingDemo) {
    itemList.innerHTML = "";
    showingDemo = false;
  }

  createItem(text, false);
  itemInput.value = "";
  itemInput.focus();
  saveItems();
});

// === Create Item Function ===
function createItem(text, got = false) {
  const li = document.createElement("li");
  li.className = "item" + (got ? " got" : "");
  const span = document.createElement("span");
  span.className = "item-text";
  span.textContent = text;
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";
  li.appendChild(span);
  li.appendChild(removeBtn);
  itemList.appendChild(li);

  totalItems++;
  if (got) gotItems++;
  updateStats();

  items.push({ text, got });
}

// === Event Delegation ===
itemList?.addEventListener("click", function (e) {
  const target = e.target;

  // block demo items
  if (target.closest(".demo")) return;

  if (target.classList.contains("remove-btn")) {
    const li = target.parentElement;
    const text = li.querySelector(".item-text").textContent;
    if (li.classList.contains("got")) gotItems--;
    totalItems--;
    items = items.filter((i) => i.text !== text);
    li.remove();
    updateStats();
    saveItems();
  } else if (
    target.classList.contains("item-text") ||
    target.classList.contains("item")
  ) {
    const li = target.classList.contains("item")
      ? target
      : target.parentElement;
    li.classList.toggle("got");
    const text = li.querySelector(".item-text").textContent;
    const obj = items.find((i) => i.text === text);
    if (li.classList.contains("got")) {
      gotItems++;
      if (obj) obj.got = true;
    } else {
      gotItems--;
      if (obj) obj.got = false;
    }
    updateStats();
    saveItems();
  }
});

// === Filters ===
filters?.addEventListener("click", function (e) {
  if (e.target.tagName !== "BUTTON") return;
  const filter = e.target.dataset.filter;
  document.querySelectorAll(".item").forEach((li) => {
    if (li.classList.contains("demo")) return; // always show demo
    if (filter === "all") li.style.display = "flex";
    else if (filter === "got")
      li.style.display = li.classList.contains("got") ? "flex" : "none";
    else if (filter === "need")
      li.style.display = li.classList.contains("got") ? "none" : "flex";
  });
});

// === Stats Update ===
function updateStats() {
  totalItemsEl.textContent = totalItems;
  gotItemsEl.textContent = gotItems;
  remainingItemsEl.textContent = totalItems - gotItems;
}

// === Save Items ===
function saveItems() {
  localStorage.setItem("shoppingList", JSON.stringify(items));
}

// === Keyboard Shortcuts ===
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    itemInput.value = "";
    itemInput.blur();
  }
});

// === Profile Logic ===
function updateProfileUI() {
  if (!profileCard) return;
  const strongTag = profileCard.querySelector("strong");
  if (strongTag) strongTag.textContent = profile.username;
  const emailTag = profileCard.querySelector("p:last-of-type");
  if (emailTag) emailTag.textContent = "Email: " + profile.email;
}

// Hook register form if on register.html
const registerForm = document.querySelector(".register-form");
registerForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username && email && password) {
    profile = { username, email };
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("Registered! Profile saved.");
    window.location.href = "profile.html";
  }
});
