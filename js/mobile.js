import { groups } from "./data.js";

const containers = {
  problem: document.getElementById("problem-items"),
  work: document.getElementById("work-items"),
  tech: document.getElementById("tech-items"),
  projects: document.getElementById("project-items")
};

function closeCards() {
  document
    .querySelectorAll(".skill-card, .project-card")
    .forEach((card) => card.classList.remove("active"));
}

function createBadge(text) {
  if (!text) return null;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = text;
  return badge;
}

function createMobileDetail(item) {
  const detail = document.createElement("p");
  detail.className = "mobile-card-detail";
  detail.textContent = item.detail || "";
  return detail;
}

function createGithubFlyout(item) {
  const flyout = document.createElement("div");
  flyout.className = "github-flyout";

  const title = document.createElement("p");
  title.className = "github-flyout-title";
  title.textContent = "PROJECTS";

  const list = document.createElement("ul");
  list.className = "github-list";

  item.works.forEach((work) => {
    const li = document.createElement("li");
    const link = document.createElement("a");

    link.href = work.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    const icon = document.createElement("span");
    icon.className = "work-icon";
    icon.textContent = work.icon;

    const name = document.createElement("span");
    name.textContent = work.name;

    const external = document.createElement("span");
    external.className = "external";
    external.textContent = "↗";

    link.appendChild(icon);
    link.appendChild(name);
    link.appendChild(external);

    li.appendChild(link);
    list.appendChild(li);
  });

  flyout.appendChild(title);
  flyout.appendChild(list);

  return flyout;
}

function createCard(item, groupName) {
  const card = document.createElement("div");
  card.className = groupName === "projects" ? "project-card" : "skill-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");

  if (item.type === "github") {
    card.classList.add("github-card");
  }

  const icon = document.createElement("span");
  icon.className = "card-icon";
  icon.textContent = item.icon;

  const name = document.createElement("span");
  name.className = "card-name";
  name.textContent = item.name;

  const score = document.createElement("span");
  score.className = "score";
  score.textContent = String(item.score);

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(score);

  const badge = createBadge(item.badge);
  if (badge) card.appendChild(badge);

  card.appendChild(createMobileDetail(item));

  if (item.type === "github") {
    card.appendChild(createGithubFlyout(item));
  }

  function activateCard(event) {
    event.stopPropagation();

    const isAlreadyActive = card.classList.contains("active");

    closeCards();

    if (isAlreadyActive) {
      return;
    }

    card.classList.add("active");
  }

  card.addEventListener("click", activateCard);

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateCard(event);
    }
  });

  return card;
}

function renderCards() {
  Object.entries(groups).forEach(([groupName, items]) => {
    containers[groupName].replaceChildren();

    items.forEach((item) => {
      containers[groupName].appendChild(createCard(item, groupName));
    });
  });
}

function initMobile() {
  renderCards();

  document.addEventListener("click", () => {
    closeCards();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCards();
    }
  });
}

initMobile();