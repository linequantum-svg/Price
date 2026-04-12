(() => {
  const MOBILE_WIDTH = 560;

  const parentBlocks = Array.from(document.querySelectorAll(".category-parent-block"));
  if (!parentBlocks.length) {
    return;
  }

  const isMobile = () => window.innerWidth <= MOBILE_WIDTH;

  function syncState(force = false) {
    const mobile = isMobile();

    parentBlocks.forEach((block) => {
      const label = block.querySelector(".category-parent-label");
      const nav = block.querySelector(".subcategory-nav");
      const hasActive = !!block.querySelector(".category-nav-sublink.is-active");

      if (!label || !nav) {
        return;
      }

      if (!label.dataset.bound) {
        label.dataset.bound = "true";
        label.tabIndex = 0;
        label.setAttribute("role", "button");
        label.addEventListener("click", () => {
          if (!isMobile()) {
            return;
          }

          const expanded = block.classList.toggle("is-open");
          label.setAttribute("aria-expanded", expanded ? "true" : "false");
        });

        label.addEventListener("keydown", (event) => {
          if (!isMobile()) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            label.click();
          }
        });
      }

      if (!mobile) {
        block.classList.remove("is-collapsible");
        block.classList.remove("is-open");
        label.setAttribute("aria-expanded", "true");
        nav.hidden = false;
        return;
      }

      block.classList.add("is-collapsible");

      if (force) {
        block.classList.toggle("is-open", hasActive);
      } else if (!block.classList.contains("is-open") && hasActive) {
        block.classList.add("is-open");
      }

      const expanded = block.classList.contains("is-open");
      label.setAttribute("aria-expanded", expanded ? "true" : "false");
      nav.hidden = !expanded;
    });
  }

  syncState(true);
  window.addEventListener("resize", () => syncState(false));
})();
