const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();

  // Telegram theme colors, when available.
  document.documentElement.style.setProperty(
    "--tg-bg",
    tg.themeParams?.bg_color || "#f3f5f7"
  );
}

const telegramUser = tg?.initDataUnsafe?.user;

if (telegramUser) {
  const name = telegramUser.first_name || "User";
  document.getElementById("welcome").textContent = `Welcome, ${name}`;
}

function showComingSoon(name) {
  const toast = document.getElementById("toast");
  toast.textContent = `${name} will be connected in the next step.`;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}
