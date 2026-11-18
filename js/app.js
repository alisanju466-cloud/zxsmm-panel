const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const supabaseClient = window.supabase.createClient(
  window.SMM_CONFIG.SUPABASE_URL,
  window.SMM_CONFIG.SUPABASE_ANON_KEY
);

const telegramUser = tg?.initDataUnsafe?.user;

function money(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

async function loadProfile() {
  const welcome = document.getElementById("welcome");

  if (!telegramUser) {
    welcome.textContent = "Open this app inside Telegram";
    return;
  }

  welcome.textContent = `Welcome, ${telegramUser.first_name || "User"}`;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("balance")
    .eq("telegram_id", telegramUser.id)
    .maybeSingle();

  if (!error && data) {
    document.getElementById("balance").textContent = money(data.balance);
  }
}

async function loadServices() {
  const list = document.getElementById("services-list");

  const { data, error } = await supabaseClient
    .from("services")
    .select("id,name,category,price,description,active")
    .eq("active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    list.innerHTML = `
      <div class="error-box">
        <b>Services could not be loaded.</b>
        <p>Check the Supabase table and API permissions.</p>
      </div>`;
    return;
  }

  if (!data || data.length === 0) {
    list.innerHTML = `<p class="muted">No active services found.</p>`;
    return;
  }

  list.innerHTML = data.map(service => `
    <button class="service" onclick="placeOrder(${service.id})">
      <div>
        <b>${escapeHtml(service.name)}</b>
        <small>${escapeHtml(service.category || "General")}</small>
      </div>
      <strong>${money(service.price)}</strong>
    </button>
  `).join("");
}

function openSection(section) {
  const titles = {
    services: "Services",
    orders: "My Orders",
    wallet: "Wallet",
    profile: "Profile"
  };

  document.getElementById("content").innerHTML = `
    <h3>${titles[section]}</h3>
    <div id="section-body"></div>
  `;

  if (section === "services") {
    document.getElementById("section-body").innerHTML =
      `<div id="services-list"><p class="muted">Loading services...</p></div>`;
    loadServices();
  } else {
    document.getElementById("section-body").innerHTML =
      `<p class="muted">This section will be connected next.</p>`;
  }
}

function placeOrder(serviceId) {
  toast(`Service ${serviceId} selected.`);
}

loadProfile();
loadServices();
