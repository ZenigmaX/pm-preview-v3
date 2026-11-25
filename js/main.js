/* Draft-only UI. No network calls. Keep well under 100KB. */
(function () {
  var nav = document.querySelector("#site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Retell placeholders */
  var modal = document.querySelector("#retell-modal");
  var modalText = document.querySelector("#retell-modal-body");
  function openRetell(kind) {
    if (!modal || !modalText) return;
    modalText.textContent = kind === "voice"
      ? "Speak to Live Agent will connect through the Retell AI voice widget once Eugene approves the embed. This draft does not load the widget or any API keys."
      : "Live Text Chat will connect through the Retell AI chat widget once Eugene approves the embed. This draft does not load the widget or any API keys.";
    modal.hidden = false;
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }
  document.querySelectorAll("[data-retell]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openRetell(el.getAttribute("data-retell"));
    });
  });
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.hidden = true;
    });
    var closer = modal.querySelector(".modal-close");
    if (closer) closer.addEventListener("click", function () { modal.hidden = true; });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") modal.hidden = true;
    });
  }

  /* Before / after slider */
  var range = document.querySelector("[data-ba-range]");
  var before = document.querySelector("[data-ba-before]");
  if (range && before) {
    var apply = function () { before.style.width = range.value + "%"; };
    range.addEventListener("input", apply);
    apply();
  }

  /* Maintenance plan builder */
  var wiz = document.querySelector("[data-wizard]");
  if (wiz) {
    var panes = wiz.querySelectorAll(".wiz-pane");
    var bar = wiz.querySelector("[data-progress]");
    var label = wiz.querySelector("[data-progress-label]");
    var total = panes.length;
    var step = 0;

    function show() {
      panes.forEach(function (p, i) { p.classList.toggle("active", i === step); });
      var pct = Math.round(((step + 1) / total) * 100);
      if (bar) bar.style.width = pct + "%";
      if (label) label.textContent = "Step " + (step + 1) + " of " + total + " · " + pct + " percent complete";
      if (step === total - 1) fillSummary();
    }

    function val(name) {
      var el = wiz.querySelector("[name='" + name + "']");
      return el ? (el.value || "").trim() : "";
    }
    function checks(name) {
      return Array.prototype.map.call(
        wiz.querySelectorAll("[name='" + name + "']:checked"),
        function (n) { return n.value; }
      );
    }

    function fillSummary() {
      var map = {
        ptype: val("property_type") || "Not selected",
        services: checks("services").join(", ") || "Not selected",
        freq: val("frequency") || "Not selected",
        details: val("details") || "None",
        address: val("property_address") || "Not provided",
        city: val("city") || "Not provided",
        timing: val("preferred_timing") || "Not selected",
        name: val("name") || "Not provided",
        phone: val("phone") || "Not provided",
        email: val("email") || "Not provided"
      };
      Object.keys(map).forEach(function (k) {
        var t = wiz.querySelector("[data-sum='" + k + "']");
        if (t) t.textContent = map[k];
      });
    }

    wiz.querySelectorAll("[data-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (step < total - 1) { step += 1; show(); }
      });
    });
    wiz.querySelectorAll("[data-back]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (step > 0) { step -= 1; show(); }
      });
    });

    var form = wiz.querySelector("form") || wiz;
    if (form && form.tagName === "FORM") {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        fillSummary();
        var status = wiz.querySelector(".form-status");
        if (status) { status.classList.add("show"); status.focus && status.focus(); }
      });
    }
    show();
  }

  var quote = document.querySelector("form.quote:not([data-wizard] form.quote, [data-wizard] form)");
  document.querySelectorAll("form.quote").forEach(function (form) {
    if (form.closest("[data-wizard]")) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (status) status.classList.add("show");
    });
  });
})();
