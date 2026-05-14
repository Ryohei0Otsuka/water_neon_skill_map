const mobileQuery = window.matchMedia("(max-width: 768px)");

async function loadApp() {
  if (mobileQuery.matches) {
    await import("./mobile.js");
    return;
  }

  await import("./desktop.js");
}

loadApp();