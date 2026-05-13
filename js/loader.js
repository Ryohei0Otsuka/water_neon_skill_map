const isMobile = window.matchMedia("(max-width: 767px)").matches;

function loadCss(path) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  document.head.appendChild(link);
}

if (isMobile) {
  loadCss("./css/mobile.css");
  import("./mobile.js");
} else {
  loadCss("./css/style.css");
  import("./desktop.js");
}