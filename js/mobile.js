import { groups } from "./data.js";

const containers = {
  problem: document.getElementById("problem-items"),
  work: document.getElementById("work-items"),
  tech: document.getElementById("tech-items"),
  projects: document.getElementById("project-items")
};

const groupLabels = {
  problem: "問題検知・構造化",
  work: "業務改善・運用設計",
  tech: "技術実装・制作支援",
  projects: "制作物・GitHub"
};

function createMobileModal() {
  const modal = document.createElement("div");
  modal.className = "mobile-modal";
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="mobile-modal-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-modal-title">
      <button class="mobile-modal-close" type="button" aria-label="閉じる">×</button>
      <p class="mobile-modal-kicker" id="mobile-modal-kicker"></p>
      <h3 class="mobile-modal-title" id="mobile-modal-title"></h3>
      <p class="mobile-modal-score" id="mobile-modal-score"></p>
      <p class="mobile-modal-text" id="mobile-modal-text"></p>
    </div>
  `;

  document.body.appendChild(modal);

  const closeButton = modal.querySelector(".mobile-modal-close");

  function closeModal() {
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("visible")) {
      closeModal();
    }
  });

  return {
    element: modal,
    open(item, groupName) {
      const kicker = modal.querySelector("#mobile-modal-kicker");
      const title = modal.querySelector("#mobile-modal-title");
      const score = modal.querySelector("#mobile-modal-score");
      const text = modal.querySelector("#mobile-modal-text");

      kicker.textContent = groupLabels[groupName] || "Skill";
      title.textContent = item.name;

      const scoreText = typeof item.score === "number"
        ? `Score: ${item.score} / ${item.badge || "Skill"}`
        : item.badge || "";

      score.textContent = scoreText;
      text.textContent = item.detail || "詳細情報はありません。";

      modal.classList.add("visible");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const closeButton = modal.querySelector(".mobile-modal-close");
      closeButton.focus();
    }
  };
}

const mobileModal = createMobileModal();

function createCard(item, groupName) {
  const card = document.createElement("div");
  card.className = groupName === "projects" ? "project-card" : "skill-card";

  if (item.type !== "github") {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${item.name} の詳細を開く`);
  }

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

    return card;
  }

  card.addEventListener("click", () => {
    mobileModal.open(item, groupName);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      mobileModal.open(item, groupName);
    }
  });

  return card;
}

Object.entries(groups).forEach(([groupName, items]) => {
  items.forEach((item) => {
    containers[groupName].appendChild(createCard(item, groupName));
  });
});