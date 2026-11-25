/* Draft-only UI. Keep well under 100KB. */
(function () {
  var nav = document.querySelector("#site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Retell: load the official widget only when config values are present. */
  var modal = document.querySelector("#retell-modal");
  var modalText = document.querySelector("#retell-modal-body");
  var retellCfg = window.QPM_RETELL || {};
  function filled(v) { return typeof v === "string" && v.trim().length > 0; }
  var chatReady = filled(retellCfg.publicKey) && filled(retellCfg.chatAgentId);
  var voiceReady = filled(retellCfg.voicePublicKey) && filled(retellCfg.voiceAgentId);
  var retellReady = chatReady || voiceReady;

  function mountRetellWidget() {
    if (!retellReady) return;
    if (document.getElementById("retell-widget")) return;
    var s = document.createElement("script");
    s.id = "retell-widget";
    s.src = "https://dashboard.retellai.com/retell-widget-v2.js";
    s.async = true;
    if (chatReady) {
      s.setAttribute("data-public-key", retellCfg.publicKey.trim());
      s.setAttribute("data-agent-id", retellCfg.chatAgentId.trim());
    }
    if (voiceReady) {
      s.setAttribute("data-voice-public-key", retellCfg.voicePublicKey.trim());
      s.setAttribute("data-voice-agent-id", retellCfg.voiceAgentId.trim());
    }
    s.setAttribute("data-title", "Quick Property Maintenance");
    s.setAttribute("data-color", "#C4A574");
    s.setAttribute("data-fab-text", "Live desk");
    document.body.appendChild(s);
  }
  mountRetellWidget();

  function findRetellFab() {
    return document.querySelector("[class*='retell'] button, #retell-widget-container button, iframe[src*='retell']");
  }
  function openRetell(kind) {
    if (retellReady) {
      mountRetellWidget();
      var fab = findRetellFab();
      if (fab) {
        fab.click();
        return;
      }
      if (modal && modalText) {
        modalText.textContent = "The live desk widget is loading. Use the Live desk control when it appears on this page.";
        modal.hidden = false;
        var closeBtn = modal.querySelector(".modal-close");
        if (closeBtn) closeBtn.focus();
      }
      return;
    }
    if (!modal || !modalText) return;
    modalText.textContent = kind === "voice"
      ? "Speak to Live Agent will connect through the Retell AI voice widget once the public key and voice agent ID are added in js/retell-config.js. This draft does not load the widget or any API keys."
      : "Live Text Chat will connect through the Retell AI chat widget once the public key and chat agent ID are added in js/retell-config.js. This draft does not load the widget or any API keys.";
    modal.hidden = false;
    var closeBtn2 = modal.querySelector(".modal-close");
    if (closeBtn2) closeBtn2.focus();
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
    var fenceFollow = wiz.querySelector("[data-fence-followup]");
    var fenceNew = wiz.querySelector("[data-fence-new]");
    var fenceRepair = wiz.querySelector("[data-fence-repair]");
    var fenceBox = wiz.querySelector("input[name='services'][value='Fences and gates']");
    var photoInput = wiz.querySelector("input[name='photos']");
    var photoErrors = wiz.querySelectorAll("[data-photo-error]");
    var photoCountLabel = wiz.querySelector("[data-photo-count]");

    function show() {
      panes.forEach(function (p, i) { p.classList.toggle("active", i === step); });
      var pct = Math.round(((step + 1) / total) * 100);
      if (bar) bar.style.width = pct + "%";
      if (label) label.textContent = "Step " + (step + 1) + " of " + total + " · " + pct + " percent complete";
      if (step === total - 1) fillSummary();
      var pane = panes[step];
      if (pane) {
        var heading = pane.querySelector("h2");
        if (heading && heading.focus) heading.setAttribute("tabindex", "-1");
      }
    }

    function val(name) {
      var first = wiz.querySelector("[name='" + name + "']");
      if (first && first.type === "radio") {
        var checked = wiz.querySelector("[name='" + name + "']:checked");
        return checked ? (checked.value || "").trim() : "";
      }
      return first ? (first.value || "").trim() : "";
    }
    function checks(name) {
      return Array.prototype.map.call(
        wiz.querySelectorAll("[name='" + name + "']:checked"),
        function (n) { return n.value; }
      );
    }
    function isHidden(el) {
      return !!(el && el.closest("[hidden]"));
    }

    function fencesOn() {
      return !!(fenceBox && fenceBox.checked);
    }

    function syncFence() {
      var on = fencesOn();
      if (fenceFollow) fenceFollow.hidden = !on;
      var work = val("fence_work");
      if (fenceNew) fenceNew.hidden = !(on && work === "New fence");
      if (fenceRepair) fenceRepair.hidden = !(on && work === "Repair");
      var wrap = wiz.querySelector("[data-sum-fence]");
      if (wrap) wrap.hidden = !on;
    }

    function photoCount() {
      return (photoInput && photoInput.files) ? photoInput.files.length : 0;
    }
    function updatePhotoCount() {
      var n = photoCount();
      var text = n === 0
        ? "No photos attached yet. Photos are essential and must be sent."
        : (n === 1 ? "1 photo attached." : n + " photos attached.");
      if (photoCountLabel) photoCountLabel.textContent = text;
      if (n > 0) {
        photoErrors.forEach(function (el) { el.classList.remove("show"); });
      }
    }
    function requirePhotos() {
      if (photoCount() > 0) {
        photoErrors.forEach(function (el) { el.classList.remove("show"); });
        return true;
      }
      photoErrors.forEach(function (el) { el.classList.add("show"); });
      return false;
    }

    function visibleRequiredOk(pane) {
      var ok = true;
      var firstBad = null;
      pane.querySelectorAll("select[required], input[required], textarea[required]").forEach(function (el) {
        if (isHidden(el)) return;
        if (el.type === "file") return;
        if (el.type === "checkbox" || el.type === "radio") return;
        if (!(el.value || "").trim()) {
          ok = false;
          if (!firstBad) firstBad = el;
        }
      });
      pane.querySelectorAll("[data-required-group]").forEach(function (group) {
        if (isHidden(group)) return;
        var name = group.getAttribute("data-required-group");
        if (!name) return;
        var any = group.querySelector("input[name='" + name + "']:checked");
        if (!any) {
          ok = false;
          if (!firstBad) firstBad = group.querySelector("input");
          var err = group.querySelector(".field-error");
          if (err) err.classList.add("show");
        } else {
          var err2 = group.querySelector(".field-error");
          if (err2) err2.classList.remove("show");
        }
      });
      if (firstBad && firstBad.focus) firstBad.focus();
      return ok;
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
        email: val("email") || "Not provided",
        photos: photoCount() === 0 ? "None attached" : (photoCount() === 1 ? "1 photo attached" : photoCount() + " photos attached"),
        fence_work: val("fence_work") || "Not selected",
        fence_material: val("fence_material") || "Not selected",
        fence_height: val("fence_height") || "Not selected",
        fence_length: val("fence_length") || "Not selected",
        fence_gates: val("fence_gates") || "Not selected",
        fence_repair: checks("fence_repair").join(", ") || "Not selected",
        fence_post_size: val("fence_post_size") || "Not selected",
        fence_post_count: val("fence_post_count") || "Not selected",
        fence_post_condition: checks("fence_post_condition").join(", ") || "Not selected",
        fence_footage: val("fence_footage") || "Not selected",
        fence_side_access: val("fence_side_access") || "Not selected",
        fence_yard_access: val("fence_yard_access") || "Not selected",
        fence_setting: val("fence_setting") || "Not selected",
        fence_timeline: val("fence_timeline") || "Not selected"
      };
      Object.keys(map).forEach(function (k) {
        var t = wiz.querySelector("[data-sum='" + k + "']");
        if (t) t.textContent = map[k];
      });
      var work = val("fence_work");
      var newRow = wiz.querySelector("[data-sum-new]");
      var repairRow = wiz.querySelector("[data-sum-repair]");
      if (newRow) newRow.hidden = work !== "New fence";
      if (repairRow) repairRow.hidden = work !== "Repair";
    }

    if (fenceBox) fenceBox.addEventListener("change", syncFence);
    wiz.querySelectorAll("input[name='fence_work']").forEach(function (el) {
      el.addEventListener("change", syncFence);
    });
    if (photoInput) photoInput.addEventListener("change", updatePhotoCount);
    syncFence();
    updatePhotoCount();

    wiz.querySelectorAll("[data-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        var pane = panes[step];
        if (pane && !visibleRequiredOk(pane)) return;
        if (pane && pane.getAttribute("data-step") === "4" && !requirePhotos()) return;
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
        if (!visibleRequiredOk(panes[step] || panes[total - 1])) return;
        if (!requirePhotos()) {
          step = 3;
          show();
          if (photoInput && photoInput.focus) photoInput.focus();
          return;
        }
        fillSummary();
        var status = wiz.querySelector(".form-status");
        if (status) { status.classList.add("show"); status.focus && status.focus(); }
      });
    }
    show();
  }

  document.querySelectorAll("form.quote").forEach(function (form) {
    if (form.closest("[data-wizard]")) return;
    var photoInput = form.querySelector("input[name='photos']");
    var photoError = form.querySelector("[data-photo-error]");
    var photoCountLabel = form.querySelector("[data-photo-count]");
    function count() { return (photoInput && photoInput.files) ? photoInput.files.length : 0; }
    function updateCount() {
      if (!photoCountLabel) return;
      var n = count();
      photoCountLabel.textContent = n === 0
        ? "No photos attached yet. Photos are essential and must be sent."
        : (n === 1 ? "1 photo attached." : n + " photos attached.");
      if (n > 0 && photoError) photoError.classList.remove("show");
    }
    if (photoInput) photoInput.addEventListener("change", updateCount);
    updateCount();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (photoInput && count() === 0) {
        if (photoError) photoError.classList.add("show");
        if (photoInput.focus) photoInput.focus();
        return;
      }
      var status = form.querySelector(".form-status");
      if (status) status.classList.add("show");
    });
  });
})();
