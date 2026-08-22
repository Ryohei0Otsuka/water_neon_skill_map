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
    .forEach((card) => {
      card.classList.remove("active");
      card.setAttribute("aria-expanded", "false");
    });
}

function createBadge(text) {
  if (!text) return null;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = text;
  return badge;
}

function createMobileDetail(item) {
  const detail = document.createElement("div");
  detail.className = "mobile-card-detail";

  const text = document.createElement("p");
  text.textContent = item.detail || "";
  detail.appendChild(text);

  if (item.url) {
    const link = document.createElement("a");
    link.className = "mobile-detail-link";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View repository ↗";

    link.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    detail.appendChild(link);
  }

  return detail;
}

function createGithubFlyout(item) {
  const flyout = document.createElement("div");
  flyout.className = "github-flyout";

  const title = document.createElement("p");
  title.className = "github-flyout-title";
  title.textContent = "SELECTED WORKS";

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

    const summary = document.createElement("span");
    summary.className = "work-summary";

    const name = document.createElement("span");
    name.className = "work-name";
    name.textContent = work.name;

    const role = document.createElement("small");
    role.className = "work-role";
    role.textContent = work.role;

    summary.appendChild(name);
    summary.appendChild(role);

    const external = document.createElement("span");
    external.className = "external";
    external.textContent = "↗";

    link.appendChild(icon);
    link.appendChild(summary);
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
  card.setAttribute("aria-expanded", "false");

  if (item.type === "github") {
    card.classList.add("github-card");
  }

  if (item.featured) {
    card.classList.add("featured-card");
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

    if (isAlreadyActive) return;

    card.classList.add("active");
    card.setAttribute("aria-expanded", "true");
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
    if (event.key === "Escape") closeCards();
  });
}

initMobile();
