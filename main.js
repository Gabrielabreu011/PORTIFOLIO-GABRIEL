(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  /* conteúdo */
  $("name").textContent = ME.name;
  document.title = ME.name + " Portfólio";
  $("tagline").textContent = ME.tagline;
  $("logo").innerHTML = "&lt;<b>" + ME.name.split(" ")[0].toLowerCase() + "</b>." + (ME.name.split(" ")[1] || "dev").toLowerCase() + " /&gt;";
  $("bio").innerHTML = ME.bio.map(function (p) { return "<p>" + p + "</p>"; }).join("");
  $("stats").innerHTML = ME.stats.map(function (s) {
    return '<div class="stat"><b data-to="' + s.v + '" data-suf="' + s.s + '">' + s.v + s.s + "</b><span>" + s.l + "</span></div>";
  }).join("");
  $("skills").innerHTML = ME.skills.map(function (g) {
    var inner = g.tags
      ? '<div class="chips">' + g.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("") + "</div>"
      : g.items.map(function (i) {
          return '<div class="sk"><div class="sk-top"><span>' + i[0] + "</span><em>" + i[2] + '</em></div><div class="bar" style="--w:' + i[1] + '%"><i></i></div></div>';
        }).join("");
    return '<div class="group reveal"><h3>' + g.g + "</h3>" + inner + "</div>";
  }).join("");
  $("jobs").innerHTML = ME.experience.map(function (j) {
    return '<article class="job reveal"><div class="job-head"><div><h3>' + j.role + '</h3><span class="co">' + j.company + '</span></div><span class="when">' + j.period + "</span></div><ul>" +
      j.bullets.map(function (b) { return "<li>" + b + "</li>"; }).join("") + '</ul><div class="tags">' +
      j.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("") + "</div></article>";
  }).join("");
  function eduCard(kind, title, place, st) {
    return '<div class="card reveal"><div class="idx"><span>' + kind + "</span>" + (st ? '<span class="st">' + st + "</span>" : "") + "</div><h3>" + title + "</h3><p>" + place + "</p></div>";
  }
  var dg = ME.degree;
  $("degree").innerHTML = eduCard(dg.kicker, dg.title, dg.place + " · " + dg.meta, dg.status);
  $("courses").innerHTML = ME.courses.map(function (c) { return eduCard("curso", c.t, c.p, c.st); }).join("");
  var tech = ME.tech.map(function (t) { return "<span>" + t + "</span>"; }).join("");
  $("track").innerHTML = tech + tech;
  $("mail").textContent = ME.email;
  $("contactNote").textContent = ME.contactNote;
  $("links").innerHTML = (ME.links || []).map(function (l) {
    return '<a class="btn" href="' + l.u + '" target="_blank" rel="noopener">' + l.l + " ↗</a>";
  }).join("");
  $("foot").textContent = "© " + new Date().getFullYear() + " " + ME.name;
  $("termBody").innerHTML =
    '<span class="ln"><span class="p">$</span> whoami</span>' +
    '<span class="ln m">' + ME.name.toLowerCase().replace(/\s+/g, "-") + "</span>" +
    '<span class="ln"><span class="p">$</span> stack --top</span>' +
    '<span class="ln m">' + ME.tech.slice(0, 5).join(" · ") + "</span>" +
    '<span class="ln"><span class="p">$</span> status</span>' +
    '<span class="ln ok">' + ME.status + "</span>";

  /* digitação */
  var tEl = $("typed"), ri = 0, ci = 0, del = false;
  function tick() {
    var word = ME.roles[ri];
    tEl.textContent = word.slice(0, ci);
    var wait = del ? 35 : 75;
    if (!del && ci === word.length) { del = true; wait = 1700; }
    else if (del && ci === 0) { del = false; ri = (ri + 1) % ME.roles.length; wait = 350; }
    else { ci += del ? -1 : 1; }
    setTimeout(tick, wait);
  }
  if (reduce) { tEl.textContent = ME.roles[0]; } else { tick(); }

  /* revelar ao rolar + barras + contadores */
  var targets = document.querySelectorAll(".reveal, .bar");
  function count(el) {
    var to = +el.dataset.to, suf = el.dataset.suf, t0 = null;
    if (reduce) return;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min((t - t0) / 1200, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        e.target.querySelectorAll(".bar").forEach(function (b) { b.classList.add("in"); });
        e.target.querySelectorAll("[data-to]").forEach(count);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add("in"); });
  }

  /* brilho e inclinação nos cards */
  var fine = window.matchMedia("(pointer: fine)").matches;
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", x + "px");
      c.style.setProperty("--my", y + "px");
      if (fine && !reduce) {
        var rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
        c.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-3px)";
      }
    });
    c.addEventListener("pointerleave", function () { c.style.transform = ""; });
  });

  /* copiar e-mail */
  $("copy").addEventListener("click", function () {
    var btn = this;
    function done() { btn.textContent = "Copiado ✓"; setTimeout(function () { btn.textContent = "Copiar e-mail"; }, 1800); }
    try {
      navigator.clipboard.writeText(ME.email).then(done, function () {
        var r = document.createRange(); r.selectNodeContents($("mail"));
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = "Selecionado, use Ctrl+C";
      });
    } catch (e) { btn.textContent = "Selecione e copie"; }
  });

  /* barra de progresso */
  var prog = $("progress");
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = "scaleX(" + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* rede de nós animada */
  var cv = $("net"), cx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, pts = [], mouse = { x: -9999, y: -9999 }, running = true;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(110, Math.max(28, (W * H) / 15000)));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.4 + 0.6 });
  }
  function draw() {
    if (!running) return;
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i];
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        var mdx = mouse.x - a.x, mdy = mouse.y - a.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 150 && md > 1) { a.x -= (mdx / md) * 0.6; a.y -= (mdy / md) * 0.6; }
      }
      for (var j = i + 1; j < pts.length; j++) {
        var b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < 16900) {
          cx.strokeStyle = "rgba(70,140,255," + (0.22 * (1 - d / 16900)).toFixed(3) + ")";
          cx.lineWidth = 1;
          cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
        }
      }
      var mx = mouse.x - a.x, my = mouse.y - a.y;
      if (mx * mx + my * my < 22500) {
        cx.strokeStyle = "rgba(106,168,255,0.35)";
        cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(mouse.x, mouse.y); cx.stroke();
      }
      cx.fillStyle = "rgba(106,168,255,0.85)";
      cx.beginPath(); cx.arc(a.x, a.y, a.r, 0, 6.2832); cx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  size(); draw();
  window.addEventListener("resize", function () { size(); if (reduce) draw(); });
  window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running && !reduce) requestAnimationFrame(draw);
  });
})();