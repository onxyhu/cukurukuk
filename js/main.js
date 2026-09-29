(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var THEME_KEY = "cukurukuk-theme";
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");

  function readStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      window.localStorage.setItem(THEME_KEY, value);
    } catch (err) {
      return;
    }
  }

  (function initTheme() {
    var stored = readStoredTheme();
    var prefersLight =
      window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme = stored || (prefersLight ? "light" : "dark");
    root.setAttribute("data-theme", theme);
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
    });
  }

  var header = document.querySelector(".site-header");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuToggle = document.getElementById("menuToggle");
  var siteNav = document.getElementById("siteNav");
  var navLinks = siteNav ? siteNav.querySelectorAll(".nav-link") : [];

  function setMenu(open) {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    siteNav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", function () {
      var open = menuToggle.getAttribute("aria-expanded") === "true";
      setMenu(!open);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealItems.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  function formatNumber(value, decimals) {
    if (decimals > 0) {
      return value.toFixed(decimals);
    }
    return String(Math.round(value));
  }

  function animateCounter(element) {
    var target = parseFloat(element.getAttribute("data-count"));
    if (isNaN(target)) return;

    var decimals = parseInt(element.getAttribute("data-decimals") || "0", 10);
    var suffix = element.getAttribute("data-suffix") || "";
    var duration = reduceMotion ? 0 : 1500;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = duration === 0 ? 1 : Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatNumber(target * eased, decimals) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (element) {
      counterObserver.observe(element);
    });
  } else {
    counters.forEach(animateCounter);
  }

  var sections = ["about", "stats", "performance", "achievements", "halloffame", "contact"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var isActive = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", isActive);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
