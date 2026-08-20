(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function getSaveData() {
    return !!(navigator.connection && navigator.connection.saveData);
  }

  function getLowMemory() {
    return !!(navigator.deviceMemory && navigator.deviceMemory <= 2);
  }

  function initReveal(root, options) {
    var selector = options.selector || "[data-motion='reveal'], .motion-reveal";
    var nodes = Array.prototype.slice.call(root.querySelectorAll(selector));

    nodes.forEach(function (node, index) {
      if (!node.style.getPropertyValue("--motion-index")) {
        node.style.setProperty("--motion-index", String(index));
      }
    });

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return function () {};
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: options.rootMargin || "0px 0px -10% 0px",
        threshold: options.threshold || 0.08
      }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });

    return function () {
      observer.disconnect();
    };
  }

  function initWords(root, options) {
    var selector = options.selector || "[data-motion-words]";
    var nodes = Array.prototype.slice.call(root.querySelectorAll(selector));

    nodes.forEach(function (node) {
      if (node.dataset.motionPrepared === "true") return;
      if (node.children.length > 0) return;

      var text = (node.textContent || "").trim().replace(/\s+/g, " ");
      if (!text) return;

      node.dataset.motionPrepared = "true";
      node.classList.add("motion-words");
      node.setAttribute("aria-label", text);
      node.textContent = "";

      var words = text.split(" ");

      words.forEach(function (word, index) {
        var span = document.createElement("span");
        span.className = "motion-word";
        span.style.setProperty("--word-index", String(index));
        span.setAttribute("aria-hidden", "true");
        span.textContent = word;
        node.appendChild(span);
        if (index < words.length - 1) {
          node.appendChild(document.createTextNode(" "));
        }
      });
    });

    return function () {};
  }

  function initParallax(root, options) {
    if (reduceMotion.matches || getSaveData()) return function () {};

    var maxLayers = options.maxLayers || (getLowMemory() ? 1 : 3);
    var nodes = Array.prototype.slice
      .call(root.querySelectorAll(options.selector || "[data-motion-parallax]"))
      .slice(0, maxLayers);

    if (!nodes.length) return function () {};

    var ticking = false;
    var active = true;

    function update() {
      if (!active) return;
      ticking = false;

      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      nodes.forEach(function (node) {
        var rect = node.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        var speed = Number(node.dataset.motionSpeed || options.speed || 14);
        var progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        var y = Math.max(-speed, Math.min(speed, progress * -speed));
        node.style.setProperty("--parallax-y", y.toFixed(2));
      });
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    return function () {
      active = false;
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }

  function initLightweightMotion(root, options) {
    var targetRoot = root || document;
    var config = options || {};
    var cleanups = [
      initWords(targetRoot, config.words || {}),
      initReveal(targetRoot, config.reveal || {}),
      initParallax(targetRoot, config.parallax || {})
    ];

    return function cleanupLightweightMotion() {
      cleanups.forEach(function (cleanup) {
        cleanup();
      });
    };
  }

  window.initLightweightMotion = initLightweightMotion;

  if (!window.__LIGHTWEIGHT_MOTION_AUTO_DISABLED__) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        initLightweightMotion(document);
      });
    } else {
      initLightweightMotion(document);
    }
  }
})();
