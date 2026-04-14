(function () {
  const TELEGRAM_URL = "https://t.me/+380663232180";
  const VIBER_URL = "viber://chat?number=%2B380663232180";
  const PHONE_URL = "tel:+380663232180";
  const PHONE_LABEL = "066 323 2180";

  function getIcon(kind) {
    if (kind === "telegram") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19.66 4.01L3.91 10.08c-1.08.43-1.07 1.03-.2 1.3l4.04 1.26 1.56 5.05c.19.52.1.73.64.73.42 0 .6-.19.83-.42l1.96-1.9 4.08 3.01c.75.41 1.29.2 1.48-.69l2.68-12.61c.28-1.09-.42-1.58-1.22-1.22zM8.38 12.35l9.47-5.98c.47-.29.89-.13.54.18l-7.67 6.92-.3 3.28-2.04-4.4z" fill="currentColor"/></svg>';
    }

    if (kind === "viber") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.04 2C7.07 2 4 5.12 4 9.68c0 2.31.79 4.08 2.4 5.4l-.77 3.65c-.07.34.27.62.58.48l3.8-1.72c.61.13 1.25.19 1.93.19 4.93 0 8.06-3.09 8.06-7.66C20 5.18 16.91 2 12.04 2zm4.63 10.93c-.2.56-1.13 1.04-1.57 1.1-.4.05-.91.08-1.47-.09-.34-.1-.77-.25-1.33-.49-2.34-.99-3.86-3.34-3.98-3.5-.12-.16-.95-1.27-.95-2.43 0-1.17.61-1.74.82-1.98.21-.24.46-.3.61-.3.15 0 .31 0 .45.01.14.01.32-.05.5.37.19.46.64 1.58.7 1.69.06.11.1.25.02.41-.08.16-.12.25-.23.39-.11.13-.23.3-.33.41-.11.11-.22.23-.09.45.12.21.56.92 1.2 1.49.82.73 1.51.95 1.73 1.06.21.11.33.09.45-.07.12-.16.52-.61.66-.82.14-.21.28-.17.47-.1.19.07 1.23.58 1.44.69.21.1.35.16.4.25.05.09.05.53-.15 1.09z" fill="currentColor"/></svg>';
    }

    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.49c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.19 2.2z" fill="currentColor"/></svg>';
  }

  function makeLink(kind, label, href) {
    const link = document.createElement("a");
    link.className = "topbar-contact-chip topbar-contact-chip--" + kind;
    link.href = href;
    if (kind !== "phone") {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    link.innerHTML = '<span class="topbar-contact-icon">' + getIcon(kind) + '</span><span>' + label + "</span>";
    return link;
  }

  function mount() {
    const host = document.querySelector(".topbar-meta");
    if (!host || host.querySelector(".topbar-contacts")) {
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "topbar-contacts";
    wrap.appendChild(makeLink("telegram", "Telegram", TELEGRAM_URL));
    wrap.appendChild(makeLink("viber", "Viber", VIBER_URL));
    wrap.appendChild(makeLink("phone", PHONE_LABEL, PHONE_URL));
    host.appendChild(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
