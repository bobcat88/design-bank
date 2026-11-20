// Shared catalogue behaviour for css.html, wow.html, webgl.html:
// code viewer, support badge, wow/platform tag, sort and platform filter, player or replay.
// META: { id: [wow 1–5, "wdm" platforms] }; PLAY: ids that get Bank.player (or a custom src via srcs[id]).
Bank.cards = function (META, PLAY = [], srcs = {}) {
  if (/[?&]embed/.test(location.search)) document.documentElement.classList.add("embed");
  document.querySelectorAll(".fill").forEach((f) => { f.innerHTML = "<i></i>".repeat(+f.dataset.n); });
  const NAMES = { w: "site", d: "bureau", m: "mobile" }, arts = [...document.querySelectorAll("article")], home = new Map(arts.map((a) => [a, a.parentNode]));
  arts.forEach((a) => {
    const code = a.querySelector("style, script[type^='x-shader']");
    if (code) {
      const det = document.createElement("details"); det.className = "code";
      det.innerHTML = `<summary>Voir le ${code.tagName === "STYLE" ? "CSS" : "shader"}</summary><pre><code></code></pre>`;
      det.querySelector("code").textContent = code.textContent.replace(/^\n|\s+$/g, ""); code.before(det);
    }
    const sup = a.dataset.prop ? "@property" : a.dataset.sup;
    const ok = sup === "@property" ? "registerProperty" in CSS : !sup || CSS.supports(sup);
    if (!ok) a.querySelector("h3").insertAdjacentHTML("beforeend", '<span class="ns">pas supporté ici</span>');
    const [w, p] = META[a.id] || [0, "wdm"];
    a.querySelector("h3").insertAdjacentHTML("afterend", `<span class="tag">wow ${w}/5 · ${[...p].map((c) => NAMES[c]).join(", ")}</span>`);
    if (PLAY.includes(a.id)) { Bank.player(a.querySelector(".demo"), srcs[a.id]); return; }
    let tools = a.querySelector(".tools");
    if (!tools) { tools = document.createElement("div"); tools.className = "tools"; a.querySelector(".demo").after(tools); }
    tools.insertAdjacentHTML("beforeend", '<button type="button" data-act="replay">Rejouer</button>');
  });
  let plat = "all";
  const sort = document.getElementById("sort"), flat = document.getElementById("flat"), chips = document.getElementById("plat");
  const apply = () => {
    const mode = sort.value, score = (a) => (META[a.id] || [0])[0];
    if (mode === "theme") arts.forEach((a) => home.get(a).appendChild(a));
    else arts.slice().sort((x, y) => (score(y) - score(x)) * (mode === "wow" ? 1 : -1)).forEach((a) => flat.appendChild(a));
    flat.hidden = mode === "theme";
    arts.forEach((a) => a.hidden = plat !== "all" && !(META[a.id] || [0, "wdm"])[1].includes(plat[0]));
    document.querySelectorAll("main > h2").forEach((h) => h.hidden = mode !== "theme" || ![...h.nextElementSibling.children].some((a) => !a.hidden));
  };
  if (sort) sort.onchange = apply;
  if (chips) chips.onclick = (e) => { const b = e.target.closest("button"); if (!b) return; plat = b.dataset.p;
    chips.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); apply(); };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act=replay]"); if (!t) return;
    const d = t.closest("article").querySelector(".demo"); d.replaceWith(d.cloneNode(true));
  });
};
