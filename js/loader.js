const mobileQuery = window.matchMedia("(max-width: 900px)");

async function loadApp() {
  if (mobileQuery.matches) {
    await import("./mobile.js");
    return;
  }

  await import("./desktop.js");
}

mobileQuery.addEventListener("change", () => {
  window.location.reload();
});

loadApp();