(() => {
  const LIGHTBOX_CLASS = "image-lightbox";
  const ZOOMABLE_CLASS = "is-zoomable";

  const existing = document.querySelector(`.${LIGHTBOX_CLASS}`);
  if (existing) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = LIGHTBOX_CLASS;
  overlay.hidden = true;
  overlay.innerHTML = `
    <button class="image-lightbox-close" type="button" aria-label="Закрити перегляд">×</button>
    <div class="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Збільшене фото товару">
      <img class="image-lightbox-image" alt="">
    </div>
  `;

  const image = overlay.querySelector(".image-lightbox-image");
  const closeButton = overlay.querySelector(".image-lightbox-close");

  const closeLightbox = () => {
    overlay.hidden = true;
    image.src = "";
    image.alt = "";
    document.body.classList.remove("lightbox-open");
  };

  const openLightbox = (sourceImage) => {
    const src = sourceImage?.getAttribute("src");

    if (!src) {
      return;
    }

    image.src = src;
    image.alt = sourceImage.getAttribute("alt") || "";
    overlay.hidden = false;
    document.body.classList.add("lightbox-open");
  };

  const enhanceProductMedia = (root = document) => {
    root.querySelectorAll(".product-media").forEach((media) => {
      const mediaImage = media.querySelector("img");

      if (!mediaImage) {
        return;
      }

      media.classList.add(ZOOMABLE_CLASS);

      if (!media.hasAttribute("tabindex")) {
        media.tabIndex = 0;
      }

      media.setAttribute("role", "button");
      media.setAttribute(
        "aria-label",
        `Відкрити збільшене фото: ${mediaImage.getAttribute("alt") || "товар"}`
      );
    });
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target === closeButton) {
      closeLightbox();
    }
  });

  document.addEventListener("click", (event) => {
    const media = event.target.closest(".product-media.is-zoomable");

    if (!media || overlay.contains(event.target)) {
      return;
    }

    openLightbox(media.querySelector("img"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      closeLightbox();
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const media = event.target.closest(".product-media.is-zoomable");

    if (!media) {
      return;
    }

    event.preventDefault();
    openLightbox(media.querySelector("img"));
  });

  document.body.appendChild(overlay);
  enhanceProductMedia();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }

        if (node.matches?.(".product-media")) {
          enhanceProductMedia(node.parentElement || node);
          return;
        }

        enhanceProductMedia(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
