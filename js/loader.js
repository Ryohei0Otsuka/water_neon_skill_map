const mobileQuery = window.matchMedia("(max-width: 900px)");
const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

function shouldLoadMobile() {
  return mobileQuery.matches || coarsePointerQuery.matches;
}

async function loadApp() {
  if (shouldLoadMobile()) {
    await import("./mobile.js");
    return;
  }

  await import("./desktop.js");
}

mobileQuery.addEventListener("change", () => {
  window.location.reload();
});

coarsePointerQuery.addEventListener("change", () => {
  window.location.reload();
});

loadApp();