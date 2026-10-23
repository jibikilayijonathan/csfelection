/* La CSF de la Somme — Élections HLM 2026 : animations & interactions */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Apparition des éléments au scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = (el.dataset.delay || 0) + "ms";
        el.classList.add("is-visible");
        revealObs.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- En-tête, barre de progression, retour en haut ---------- */
  var header = document.getElementById("header");
  var progress = document.getElementById("scroll-progress-bar");
  var toTop = document.getElementById("to-top");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 30);
    toTop.classList.toggle("is-visible", y > 700);
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Lien actif dans le menu ---------- */
  var navLinks = document.querySelectorAll(".nav a");
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  if ("IntersectionObserver" in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) navObs.observe(s); });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobile-menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    mobileMenu.classList.toggle("is-open", open);
  }
  burger.addEventListener("click", function () {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* ---------- Pétales aux couleurs du logo ---------- */
  var petalColors = ["#ee8026", "#9e6bae", "#5db43f", "#8a4e3e", "#ffd23f"];
  function spawnPetals(container, count) {
    if (!container || reduceMotion) return;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      var size = 10 + Math.random() * 16;
      p.className = "petal";
      p.style.left = Math.random() * 100 + "%";
      p.style.width = size + "px";
      p.style.height = size * 1.6 + "px";
      p.style.background = petalColors[i % petalColors.length];
      p.style.opacity = (0.35 + Math.random() * 0.5).toFixed(2);
      p.style.animationDuration = 9 + Math.random() * 12 + "s";
      p.style.animationDelay = -Math.random() * 20 + "s";
      p.style.setProperty("--drift", (Math.random() * 200 - 100).toFixed(0) + "px");
      p.style.setProperty("--spin", (Math.random() * 720 - 360).toFixed(0) + "deg");
      container.appendChild(p);
    }
  }
  spawnPetals(document.getElementById("hero-petals"), window.innerWidth < 700 ? 10 : 20);
  spawnPetals(document.getElementById("cta-petals"), window.innerWidth < 700 ? 8 : 14);

  /* ---------- Texte tapé dans la bulle ---------- */
  var typed = document.getElementById("typed");
  var words = ["le logement", "nos loyers", "nos charges", "nos résidences", "nos familles"];
  if (typed && !reduceMotion) {
    var wi = 0, ci = words[0].length, deleting = true;
    setTimeout(function loop() {
      var word = words[wi];
      ci += deleting ? -1 : 1;
      typed.textContent = word.slice(0, ci);
      var delay = deleting ? 45 : 85;
      if (deleting && ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        word = words[wi];
        delay = 300;
      } else if (!deleting && ci === word.length) {
        deleting = true;
        delay = 2200;
      }
      setTimeout(loop, delay);
    }, 2600);
  }

  /* ---------- Compte à rebours (ouverture puis clôture du scrutin) ---------- */
  var OPEN = new Date(2026, 10, 5, 0, 0, 0).getTime();   // 5 novembre 2026
  var CLOSE = new Date(2026, 11, 3, 23, 59, 59).getTime(); // 3 décembre 2026
  var cdTitle = document.getElementById("countdown-title");
  var cdSub = document.getElementById("countdown-sub");
  var cdNums = {};
  document.querySelectorAll(".cd-num").forEach(function (el) { cdNums[el.dataset.unit] = el; });

  function setNum(unit, value) {
    var el = cdNums[unit];
    var str = String(value).padStart(2, "0");
    if (el.textContent === str) return;
    el.textContent = str;
    if (!reduceMotion) {
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
  }

  var cdTimer;
  function updateCountdown() {
    var now = Date.now();
    var target;
    if (now < OPEN) {
      target = OPEN;
    } else if (now < CLOSE) {
      target = CLOSE;
      cdTitle.textContent = "Clôture du scrutin dans :";
      cdSub.textContent = "Le vote est ouvert ! Votez CSF avant le 3 décembre 2026.";
    } else {
      cdTitle.textContent = "Le scrutin est clos";
      cdSub.textContent = "Merci à toutes et tous pour votre mobilisation !";
      ["days", "hours", "minutes", "seconds"].forEach(function (u) { setNum(u, 0); });
      clearInterval(cdTimer);
      return;
    }
    var diff = target - now;
    setNum("days", Math.floor(diff / 86400000));
    setNum("hours", Math.floor((diff % 86400000) / 3600000));
    setNum("minutes", Math.floor((diff % 3600000) / 60000));
    setNum("seconds", Math.floor((diff % 60000) / 1000));
  }
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);

  /* ---------- Compteurs animés ---------- */
  function animateCount(el) {
    var end = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = end; return; }
    var start = null, duration = 1600;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(end * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Effet 3D : affiche et cartes ---------- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function tilt(el, strength) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = "perspective(900px) rotateY(" + (x * strength) + "deg) rotateX(" + (-y * strength) + "deg)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  }
  if (finePointer && !reduceMotion) {
    var poster = document.getElementById("poster");
    if (poster) tilt(poster, 14);
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("transitionend", function once() {
        card.removeEventListener("transitionend", once);
        card.style.transition = "transform .15s ease-out, box-shadow .3s";
      });
      tilt(card, 10);
    });
  }

  /* ---------- Effet d'onde sur les boutons ---------- */
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (reduceMotion) return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - r.left - size / 2 + "px";
      ripple.style.top = e.clientY - r.top - size / 2 + "px";
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    });
  });

  /* ---------- Formulaire de contact ---------- */
  var form = document.getElementById("contact-form");
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 5000);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstInvalid = null;
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      var wrap = input.closest(".field, .consent");
      var ok = input.checkValidity();
      if (wrap) {
        wrap.classList.remove("is-invalid");
        if (!ok) { void wrap.offsetWidth; wrap.classList.add("is-invalid"); }
      }
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    showToast("Merci ! Un militant CSF de la Somme vous recontactera très rapidement.");
    form.reset();
  });
  form.addEventListener("input", function (e) {
    var wrap = e.target.closest(".field, .consent");
    if (wrap && e.target.checkValidity()) wrap.classList.remove("is-invalid");
  });
})();
