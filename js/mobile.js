import { groups } from "./data.js";

const containers = {
  problem: document.getElementById("problem-items"),
  work: document.getElementById("work-items"),
  tech: document.getElementById("tech-items"),
  projects: document.getElementById("project-items")
};

function createCard(item, groupName) {
  const card = document.createElement("div");
  card.className = groupName === "projects" ? "project-card" : "skill-card";

  const icon = document.createElement("span");
  icon.className = "card-icon";
  icon.textContent = item.icon;

  const name = document.createElement("span");
  name.className = "card-name";
  name.textContent = item.name;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = item.badge || String(item.score ?? "");

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(badge);

  if (item.type === "github") {
    card.classList.add("github-card");

    const flyout = document.createElement("div");
    flyout.className = "github-flyout";

    const title = document.createElement("p");
    title.className = "github-flyout-title";
    title.textContent = "GITHUB WORKS";

    const list = document.createElement("ul");
    list.className = "github-list";

    item.works.forEach((work) => {
      const li = document.createElement("li");
      const link = document.createElement("a");

      link.href = work.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `${work.name} をGitHubで開く`);

      const workIcon = document.createElement("span");
      workIcon.textContent = work.icon;

      const workName = document.createElement("span");
      workName.textContent = work.name;

      const external = document.createElement("span");
      external.className = "external";
      external.textContent = "↗";

      link.appendChild(workIcon);
      link.appendChild(workName);
      link.appendChild(external);

      li.appendChild(link);
      list.appendChild(li);
    });

    flyout.appendChild(title);
    flyout.appendChild(list);
    card.appendChild(flyout);
  }

  return card;
}

Object.entries(groups).forEach(([groupName, items]) => {
  items.forEach((item) => {
    containers[groupName].appendChild(createCard(item, groupName));
  });
});