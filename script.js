/* ==========================================================
   script.js  -  LOGIC NG "LET'S CONNECT" PAGE
   Gabay: hanapin ang number (1-14) para madaling makita ang section.
   Kung personal details lang ang papalitan (links, numbers, photo, email keys) = section 1 (CONFIG) lang.
   ========================================================== */

/* ==========================================================
   1. CONFIG  -  DITO MO PALITAN ANG MGA PERSONAL DETAILS
   Photo, links, phone numbers at email settings. Huwag nang galawin ang ibang code kung ito lang ang papalitan.
   ========================================================== */
const CONFIG = {
  // Pangalan (ginagamit sa contact file at sa alt text ng photo)
  name: "John Jeremy",

  // Profile picture: filename ng picture mo (hal. "me.jpg"). Kapag walang laman ("") o hindi nahanap, placeholder na avatar ang lalabas.
  photo: "pfp.jpg",

  // Links ng social buttons. Palitan lang ang laman ng quotes.
  facebook: "https://www.facebook.com/john.jeremy.33633",
  // TINGNAN: dating "john.jeremy33633" (walang tuldok) ito, hindi tugma sa Facebook link. I-test ang link na ito.
  messenger: "https://www.messenger.com/t/john.jeremy.33633", // diretso sa chat thread (hindi sa profile)
  instagram: "https://www.instagram.com/_jerym",
  tiktok: "https://www.tiktok.com/@_jerym",

  // Text sa ilalim ng bawat social button (para tugma sa link)
  handles: {
    facebook: "John Jeremy",
    messenger: "Chat with me",
    instagram: "@_jerym",
    tiktok: "@_jerym",
  },

  // Mga numero sa Call popup at Save contact. label = kung paano ipapakita, tel = para sa phone app.
  // Ang una ang lalabas sa "Call now" button. Hanggang 2 numero ang kasya sa popup.
  phones: [
    { label: "+63 994 613 3680", tel: "+639946133680" },
    { label: "+63 931 896 4245", tel: "+639318964245" },
  ],

  // EMAIL (mailto): pag pinindot ang "Send now", magbubukas ang email app ng bisita na nakalagay na ang To, subject at message.
  email: "johnjeremymm@gmail.com",
  emailSubject: "Message from my website",
  smsNumber: "+639946133680", // tatanggap ng SMS kapag "Switch to SMS" ang pinili

  // SAVE CONTACT: dagdag na detalye ng contact card. Walang laman = hindi isasama sa card.
  // firstName / lastName: kung walang laman, hinahati mula sa name sa taas. Ang phones, email, social links at photo ay galing din sa taas.
  contact: {
    firstName: "",
    lastName: "",
    company: "",
    jobTitle: "",
    website: "",
    address: "",
    note: "",
  },
  // Android: subukan muna ang share sheet. Kung walang Contacts na lumalabas sa share sheet ng phone mo, gawing false para direktang .vcf na.
  androidShare: true,
};
/* ==========================================================
   2. HELPERS + PAGE SIZE
   $("id") = shortcut ng document.getElementById("id").
   ========================================================== */
const $ = (id) => document.getElementById(id);
// matchMedia listener na gumagana pati sa lumang Safari (walang addEventListener sa MediaQueryList)
const onMQ = (mq, fn) =>
  mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
const stage = $("stage"),
  root = document.documentElement;
let mode = "email";
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
const EASE = "cubic-bezier(.22,1,.36,1)";
// Kinukuwenta ang --u (1 design unit) ayon sa screen. DAPAT kapareho ng formula sa style.css (section 1).
// Naka-freeze habang may popup/keyboard para hindi tumalon ang layout.
const landMQ = matchMedia("(orientation:landscape)");
let lastU = 0,
  lastH = "";
function size(force) {
  if (
    force !== true &&
    (document.querySelector(".ov.on") || stage.classList.contains("typing"))
  )
    return;
  const W = innerWidth,
    H = innerHeight,
    land = landMQ.matches,
    base = Math.min(W, 720) / 941;
  const u =
    land && W >= 560
      ? Math.min(1, Math.max(0.2, Math.min(W / 1960, H / 1280)))
      : land
        ? base
        : Math.min(base, H / 1685);
  const hv = land ? "auto" : H + "px";
  // isinusulat lang kapag nagbago talaga ang value, para hindi mag-relayout ang buong page nang walang dahilan
  if (u !== lastU) {
    root.style.setProperty("--u", u + "px");
    lastU = u;
  }
  if (hv !== lastH) {
    root.style.setProperty("--H", hv);
    lastH = hv;
  }
}
// Pini-pause ang walang-katapusang pulse/ping (CSS: :root.pause) habang may keyboard o popup
const syncPause = () =>
  root.classList.toggle(
    "pause",
    stage.classList.contains("typing") || callOpen || pvOpen,
  );
size();
// TWO-COLUMN MODE (landscape/desktop): inilalagay sa right column ang social buttons + message card.
// Pag nag-rotate pabalik sa portrait, ibinabalik sila sa dating pwesto.
const twoMQ = matchMedia("(orientation:landscape) and (min-width:560px)");
const rc = document.createElement("div");
rc.className = "rc";
const stk = document.querySelector(".stack"),
  hdiEl = document.querySelector(".hdi"),
  cardEl = document.querySelector(".card"),
  cardNext = cardEl.nextElementSibling;
// Lilipat ng pwesto ang .stack at .card depende kung two-column o isang column.
function arrange() {
  if (twoMQ.matches) {
    if (!rc.parentNode) {
      stage.insertBefore(rc, cardEl);
      rc.append(stk, cardEl);
    }
  } else if (rc.parentNode) {
    hdiEl.append(stk);
    stage.insertBefore(cardEl, cardNext);
    rc.remove();
  }
}
arrange();
onMQ(twoMQ, arrange);
// isang beses lang kada frame ang resize work (dati: bawat resize event)
let rszRaf = 0;
addEventListener("resize", () => {
  if (rszRaf) return;
  rszRaf = requestAnimationFrame(() => {
    rszRaf = 0;
    size();
    if (callOpen && !callBusy) placeGlow();
  });
});
// Pinipigilan ang page na gumalaw/tumalon habang bukas ang popup o keyboard
if (window.visualViewport) {
  const pin = () => {
    if (document.querySelector(".ov.on")) scrollTo(0, 0);
  };
  visualViewport.addEventListener("scroll", pin);
  visualViewport.addEventListener("resize", pin);
}
addEventListener(
  "scroll",
  () => {
    if (scrollY && document.querySelector(".ov.on")) scrollTo(0, 0);
  },
  { passive: true },
);
/* ==========================================================
   3. ILAGAY ANG LINKS, NUMBERS AT PHOTO MULA SA CONFIG
   Dito kinukuha ng mga buttons ang laman galing sa CONFIG sa taas.
   ========================================================== */
$("fb").href = CONFIG.facebook;
$("ms").href = CONFIG.messenger;
$("ig").href = CONFIG.instagram;
$("tt").href = CONFIG.tiktok;
$("fbh").textContent = CONFIG.handles.facebook;
$("msh").textContent = CONFIG.handles.messenger;
$("igh").textContent = CONFIG.handles.instagram;
$("tth").textContent = CONFIG.handles.tiktok;
// Ang numero sa ilalim ng "Call now": kung may nakasulat sa index.html (<span id="callnum">), iyon ang lalabas.
// Kung walang laman ang span, gagamitin ang unang numero sa CONFIG.phones.
if (!$("callnum").textContent.trim())
  $("callnum").textContent = CONFIG.phones[0].label;
CONFIG.phones.forEach((p, i) => {
  const a = $("n" + (i + 1));
  if (!a) return; // may 3rd+ number sa CONFIG pero walang slot sa popup: laktawan, huwag mag-crash
  a.href = "tel:" + p.tel;
  const m = /^(\+\d+)\s+(.+)$/.exec(p.label),
    cc = m ? m[1] : "",
    digits = m ? m[2] : p.label,
    tag = p.tag || (i ? "Alternate" : "Primary");
  a.setAttribute("aria-label", "Call " + p.label);
  a.innerHTML =
    '<span class="pw"><svg class="pi" viewBox="0 0 100 100"><path transform="translate(9 9) scale(3.4)" fill="#fff" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg></span><span class="nb"><span class="tg">' +
    tag +
    (cc ? "<i>" + cc + "</i>" : "") +
    '</span><span class="nn">' +
    digits +
    '</span><small>Tap to call</small></span><span class="pa"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M7 6h11v11"/></svg></span>';
  a.addEventListener("click", () => setTimeout(closeCall, 300));
});
// Kung walang photo o hindi ma-load ang file, ibabalik ang placeholder avatar (walang sirang image icon)
["n1", "n2"].forEach((id, i) => {
  if (!CONFIG.phones[i]) $(id).style.display = "none";
});
// photoReady: tapos na ang pag-decode ng picture BAGO tumakbo ang intro. Dati, sa gitna ng animation
// nagde-decode ang malaking picture sa main thread, kaya nagha-hitch ang mga unang frames.
let photoReady = Promise.resolve();
if (CONFIG.photo) {
  const img = new Image();
  img.alt = CONFIG.name;
  img.decoding = "async";
  img.src = CONFIG.photo;
  const dec = img.decode
    ? img.decode()
    : new Promise((ok, no) => {
        img.onload = ok;
        img.onerror = no;
      });
  // kapag nag-fail ang load, ang placeholder avatar ang mananatili
  photoReady = dec.then(
    () => $("photo").replaceChildren(img),
    () => {},
  );
}
/* ==========================================================
   4. ENTRANCE ANIMATION
   play() = pinapatakbo ang animation pag-load, refresh, o pagbalik sa page.
   ========================================================== */
let doneT;
function play() {
  clearTimeout(doneT);
  stage.classList.remove("go", "done");
  void stage.offsetWidth;
  stage.classList.add("go");
  // ang pinakahuling animation ay natatapos mga ~1.65s (sa --spd: 0.75); 2000 ay may buffer
  doneT = setTimeout(() => stage.classList.add("done"), 2000);
}
// Hinihintay muna ang font at photo (hanggang 800ms lang) bago mag-play ang intro.
// Nakatago pa rin ang lahat (opacity 0) habang naghihintay, kaya walang makikitang flash.
// Layunin: walang font-swap o image-decode na tatama sa gitna ng animation.
const wait = (p, ms) =>
  Promise.race([
    Promise.resolve(p).catch(() => {}),
    new Promise((r) => setTimeout(r, ms)),
  ]);
const fontsReady =
  document.fonts && document.fonts.load
    ? Promise.all(
        ["300", "800"].map((w) =>
          document.fonts.load(w + ' 1em "Plus Jakarta Sans"'),
        ),
      )
    : Promise.resolve();
Promise.all([wait(fontsReady, 450), wait(photoReady, 450)]).then(() => play());
addEventListener("pageshow", (e) => {
  if (e.persisted) play();
});
/* ==========================================================
   5. POPUP HELPERS
   Nagsasara ang popup pag pinindot ang labas nito o ang Esc key.
   ========================================================== */
const show = (el) => el.classList.add("on");
const hide = (el) => {
  el.classList.remove("on");
  if (document.activeElement) document.activeElement.blur();
  setTimeout(size, 50);
};
document.querySelectorAll(".ov").forEach((o) =>
  o.addEventListener("click", (e) => {
    if (
      e.target === o ||
      e.target.hasAttribute("data-close") ||
      e.target.id === "cbg"
    )
      o.id === "callov" ? closeCall() : hide(o);
  }),
);
addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document
      .querySelectorAll(".ov.on")
      .forEach((o) => (o.id === "callov" ? closeCall() : hide(o)));
});
// CALL NOW: bubukas ang popup ng mga numero (lahat ng device). Ang pag-save ng contact ay nasa hiwalay na "Save contact" button (section 15).
$("call").onclick = openCall;
/* ==========================================================
   6. PAGE LOCK (walang drag ng buong page)
   Pinapayagan na ang pinch-zoom at pag-pan kapag naka-zoom (accessibility). Ang pinipigilan lang ay ang
   pag-drag/rubber-band ng page. Gumagalaw pa rin ang textarea, popup sheet at scrollable na .stage.
   ========================================================== */
// Naka-cache ang orientation para hindi bumabasa ng layout (scrollHeight) sa bawat touchmove sa portrait.
let isLand = landMQ.matches;
onMQ(landMQ, () => {
  isLand = landMQ.matches;
  syncLock();
});
function lockMove(e) {
  if (e.touches.length > 1) return;
  if (window.visualViewport && visualViewport.scale > 1.01) return;
  if (e.target.closest("textarea, .sheet")) return;
  e.preventDefault();
}
// Portrait lang naka-lock ang drag. Sa landscape nag-i-scroll ang .stage, kaya walang blocking listener (mas smooth ang scroll).
const syncLock = () =>
  document[isLand ? "removeEventListener" : "addEventListener"]("touchmove", lockMove, { passive: false });
syncLock();
/* ==========================================================
   7. CALL POPUP
   Lumalaki palabas mula sa Call button, at bumabalik doon pag isinara. openCall() / closeCall().
   ========================================================== */
let callOpen = false,
  callBusy = false;
const sglow = $("sglow");
// Inilalagay ang glow layer sa eksaktong pwesto ng sheet (pagkatapos ng open animation)
function placeGlow() {
  const r = $("csheet").getBoundingClientRect();
  Object.assign(sglow.style, {
    left: r.left + "px",
    top: r.top + "px",
    width: r.width + "px",
    height: r.height + "px",
  });
}
// Sinusukat ang pwesto ng Call button para sa grow/shrink animation ng popup
function callGeom() {
  const b = $("call").getBoundingClientRect(),
    r = $("csheet").getBoundingClientRect();
  const dx = b.left + b.width / 2 - (r.left + r.width / 2),
    dy = b.top + b.height / 2 - (r.top + r.height / 2);
  const ix = Math.max(0, (r.width - b.width) / 2),
    iy = Math.max(0, (r.height - b.height) / 2);
  const rad = parseFloat(getComputedStyle($("call")).borderRadius) || 40;
  return {
    from: "translate3d(" + dx + "px," + dy + "px,0)",
    clipFrom:
      "inset(" +
      iy +
      "px " +
      ix +
      "px " +
      iy +
      "px " +
      ix +
      "px round " +
      Math.min(rad, 60) +
      "px)",
    clipTo: "inset(0px 0px 0px 0px round 28px)",
  };
}
function openCall() {
  if (callOpen || callBusy) return;
  callOpen = callBusy = true;
  syncPause();
  const ov = $("callov"),
    sh = $("csheet"),
    bg = $("cbg"),
    btn = $("call");
  ov.classList.add("on");
  const g = callGeom(),
    D = reduce ? 1 : 480;
  // sariling layer ang sheet habang gumagalaw, tinatanggal pagkatapos
  sh.style.willChange = "transform, clip-path";
  bg.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduce ? 1 : 300,
    easing: "ease",
  });
  sh.animate(
    [
      { transform: g.from, clipPath: g.clipFrom },
      { transform: "none", clipPath: g.clipTo },
    ],
    { duration: D, easing: EASE },
  ).onfinish = () => {
    sh.style.willChange = "";
    // glow: opacity lang (CSS transition), hindi na animated box-shadow
    placeGlow();
    sglow.classList.add("on");
    if (CONFIG.phones[0]) $("n1").focus({ preventScroll: true });
    callBusy = false;
  };
  sh.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduce ? 1 : 160,
    easing: "ease-out",
  });
  [...sh.children].forEach((el, i) =>
    el.animate(
      [
        { opacity: 0, transform: "translate3d(0,16px,0) scale(.97)" },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: reduce ? 1 : 420,
        delay: reduce ? 0 : 120 + i * 55,
        easing: EASE,
        fill: "backwards",
      },
    ),
  );
  sh.querySelectorAll(".opt .pi").forEach((ic, i) => {
    if (reduce) return;
    ic.animate(
      [
        { transform: "scale(.4) rotate(0)" },
        { transform: "scale(1.12) rotate(-14deg)", offset: 0.5 },
        { transform: "scale(1) rotate(0)" },
      ],
      { duration: 520, delay: 240 + i * 80, easing: EASE, fill: "backwards" },
    );
  });
}
function closeCall() {
  if (!callOpen || callBusy) return;
  callBusy = true;
  const ov = $("callov"),
    sh = $("csheet"),
    bg = $("cbg"),
    btn = $("call");
  sglow.classList.remove("on");
  const g = callGeom(),
    D = reduce ? 1 : 340,
    opt = { duration: D, easing: EASE, fill: "forwards" };
  [...sh.children].forEach((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: reduce ? 1 : 120,
      easing: "ease-in",
      fill: "forwards",
    }),
  );
  bg.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: reduce ? 1 : 280,
    delay: reduce ? 0 : 60,
    easing: "ease",
    fill: "forwards",
  });
  sh.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: reduce ? 1 : 170,
    delay: reduce ? 0 : D - 170,
    easing: "ease-in",
    fill: "forwards",
  });
  sh.animate(
    [
      { transform: "none", clipPath: g.clipTo },
      { transform: g.from, clipPath: g.clipFrom },
    ],
    opt,
  ).onfinish = () => {
    [sh, bg, ...sh.children].forEach((el) =>
      el.getAnimations().forEach((a) => a.cancel()),
    );
    hide(ov);
    callOpen = callBusy = false;
    syncPause();
    // balik ang focus sa Call button (para sa keyboard users)
    btn.focus({ preventScroll: true });
  };
}
/* ==========================================================
   8. EMAIL / PHONE MODE
   mode = "email" o "phone" (SMS). Pinapalitan ng switch button sa card (switchMode sa section 12).
   ========================================================== */
$("sw").onclick = () => switchMode();
/* ==========================================================
   9. MESSAGE BOX + KEYBOARD LIFT
   Pag nag-type sa card, dahan-dahang tumataas ang page para hindi matakpan ng keyboard.
   Pag pinindot ang expand icon, lumalaki ang textbox hanggang sa taas ng keyboard.
   Huwag galawin kung gumagana na (maselan ang spring animation dito).
   ========================================================== */
const msg = $("msg"),
  box = msg.parentElement,
  card = document.querySelector(".card"),
  hd = document.querySelector(".hd");
hd.style.transition = "none";
let poll = 0,
  expanded = false,
  boxBase = 0,
  chromeH = 0;
let closing = false,
  curH = 0,
  shiftCur = 0,
  vH = 0,
  vS = 0,
  raf = 0,
  lastT = 0,
  t0 = 0;
let kbBase = 0,
  kbSeen = false,
  kbMax = 0,
  typingT = 0,
  mH = -1,
  mTop = 0,
  mBot = 0;
let kbRatio = 0;
try {
  kbRatio = +localStorage.getItem("kbr") || 0;
} catch (e) {}
const coarse = matchMedia("(pointer:coarse)").matches;
const IOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
// Sa iOS, pina-pan ng Safari ang visual viewport kaya ito ang pang-counter
const vvTop = () =>
  IOS && window.visualViewport ? window.visualViewport.offsetTop : 0;
const vk = navigator.virtualKeyboard;
if (vk) {
  try {
    vk.overlaysContent = true;
    vk.addEventListener("geometrychange", () => lift());
  } catch (e) {}
}
// Kung gaano kababa ang nakikitang bahagi ng screen (bawas ang keyboard)
function visBottom() {
  const vv = window.visualViewport;
  // iOS: height lang ng nakikitang bahagi (hindi isinasama ang offsetTop)
  let b = vv ? (IOS ? vv.height : vv.offsetTop + vv.height) : innerHeight;
  if (vk && vk.overlaysContent && vk.boundingRect && vk.boundingRect.height > 0)
    b = innerHeight - vk.boundingRect.height;
  return b;
}
const baseH = () =>
  158 * (parseFloat(root.style.getPropertyValue("--u")) || 0) ||
  box.offsetHeight;
const landscape = () => innerWidth > innerHeight;
function effBottom() {
  const b = visBottom();
  if (!coarse) return b;
  if (b < kbBase - 60) {
    kbSeen = true;
    kbMax = Math.max(kbMax, (kbBase - b) / kbBase);
    return b;
  }
  if (kbSeen || performance.now() - typingT > 1200) return b;
  return Math.min(
    b,
    kbBase * (1 - (kbRatio > 0.2 && kbRatio < 0.6 ? kbRatio : 0.4)),
  );
}
function checkKb() {
  if (coarse && kbSeen && expanded && !closing && visBottom() >= kbBase - 60) {
    setExpanded(false);
    msg.blur();
  }
}
// Sinusukat ang card kung ang textbox ay may taas na h (hindi bawat frame)
function measure(h) {
  if (Math.abs(h - mH) < 0.5) return;
  const prev = box.style.height;
  box.style.height = h + "px";
  mTop = card.offsetTop - (landscape() ? stage.scrollTop : 0);
  mBot = mTop + card.offsetHeight;
  mH = h;
  box.style.height = prev;
}
function goals(eb) {
  const gh =
    closing || !expanded ? boxBase : Math.max(boxBase, eb - 20 - chromeH);
  if (closing) return [gh, 0];
  measure(gh);
  return [gh, Math.max(0, Math.min(mBot + 10 - eb, mTop - 10))];
}
// Isang frame ng spring animation: sabay ang paglaki ng textbox at pagtaas ng page
function frame(t) {
  raf = 0;
  const dt = Math.min(0.05, Math.max(8e-3, (t - lastT) / 1e3));
  lastT = t;
  const eb = effBottom();
  checkKb();
  const w = closing ? 22 : 18,
    [gh, gs] = goals(eb);
  vH += (w * w * (gh - curH) - 2 * w * vH) * dt;
  curH = Math.max(boxBase, curH + vH * dt);
  vS += (w * w * (gs - shiftCur) - 2 * w * vS) * dt;
  shiftCur = Math.max(0, shiftCur + vS * dt);
  const done =
    (Math.abs(gh - curH) < 0.5 &&
      Math.abs(gs - shiftCur) < 0.5 &&
      Math.abs(vH) < 30 &&
      Math.abs(vS) < 30) ||
    t - t0 > 2500;
  if (done) {
    curH = gh;
    shiftCur = gs;
    vH = vS = 0;
  }
  box.style.height = done && !expanded ? "" : curH + "px";
  stage.style.transform = "translate3d(0," + (vvTop() - shiftCur) + "px,0)";
  if (!done) raf = requestAnimationFrame(frame);
  else if (closing) finishTyping();
}
function kick() {
  if (!raf) {
    lastT = t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }
}
// Tinatawag tuwing nagbabago ang keyboard/text: sinisimulan ang animation
function lift() {
  if (!stage.classList.contains("typing")) return;
  if (!boxBase) {
    boxBase = baseH();
    curH = boxBase;
    chromeH = card.offsetHeight - box.offsetHeight;
    mH = -1;
  }
  const eb = effBottom();
  checkKb();
  if (reduce) {
    const [gh, gs] = goals(eb);
    curH = gh;
    shiftCur = gs;
    box.style.height = expanded ? gh + "px" : "";
    stage.style.transform = "translate3d(0," + (vvTop() - gs) + "px,0)";
    return;
  }
  kick();
}
// Tapos na ang pag-type: ibinabalik sa normal ang lahat
function finishTyping() {
  cancelAnimationFrame(raf);
  raf = 0;
  closing = false;
  if (kbSeen && kbMax > 0.2 && kbMax < 0.6) {
    kbRatio = kbMax;
    try {
      localStorage.setItem("kbr", kbMax.toFixed(3));
    } catch (e) {}
  }
  kbSeen = false;
  kbMax = 0;
  box.style.height = "";
  hd.style.flex = "";
  boxBase = 0;
  chromeH = 0;
  curH = 0;
  shiftCur = 0;
  vH = 0;
  vS = 0;
  mH = -1;
  stage.classList.remove("typing");
  syncPause();
  stage.style.transition = "";
  stage.style.transform = "";
  setTimeout(size, 450);
}
function setExpanded(v) {
  expanded = v;
  $("open")
    .querySelector("path")
    .setAttribute(
      "d",
      v
        ? "M21 9h-6V3M3 15h6v6M15 9l6-6M9 15l-6 6"
        : "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
    );
  $("open").setAttribute(
    "aria-label",
    v ? "Collapse message box" : "Expand message box",
  );
}
// Focus sa textbox = simula ng typing mode
const typingOn = () => {
  closing = false;
  if (!stage.classList.contains("typing")) {
    kbBase = visBottom();
    typingT = performance.now();
    kbSeen = false;
    kbMax = 0;
    mH = -1;
    if (!landscape()) hd.style.flex = "0 0 " + hd.offsetHeight + "px";
    stage.classList.add("typing");
    syncPause();
    stage.style.transition = "none";
  }
  lift();
  clearInterval(poll);
  let n = 0;
  poll = setInterval(() => {
    lift();
    if (++n > 14) clearInterval(poll);
  }, 120);
};
// Blur sa textbox = bumababa pabalik ang page
const typingOff = () => {
  clearInterval(poll);
  setExpanded(false);
  if (reduce || !boxBase) {
    finishTyping();
    return;
  }
  closing = true;
  kick();
};
msg.addEventListener("focus", typingOn);
msg.addEventListener("blur", (e) => {
  if (!e.relatedTarget || !e.relatedTarget.closest(".card"))
    setTimeout(() => {
      if (document.activeElement !== msg) typingOff();
    }, 220);
});
addEventListener("resize", () => {
  mH = -1;
});
addEventListener("resize", lift);
msg.addEventListener("input", lift);
// tanggal ang pulang error border pag nag-type na ulit
msg.addEventListener("input", () => box.classList.remove("bad"));
if (window.visualViewport) {
  visualViewport.addEventListener("resize", lift);
  visualViewport.addEventListener("scroll", lift);
}
$("open").addEventListener("mousedown", (e) => e.preventDefault());
$("open").onclick = () => {
  const v = !expanded;
  if (
    v &&
    coarse &&
    stage.classList.contains("typing") &&
    kbSeen &&
    visBottom() >= kbBase - 60
  ) {
    kbSeen = false;
    kbMax = 0;
    typingT = performance.now();
    msg.blur();
  }
  setExpanded(v);
  msg.focus({ preventScroll: true });
  lift();
};
stage.addEventListener("click", (e) => {
  if (stage.classList.contains("typing") && !e.target.closest(".card"))
    msg.blur();
});
/* ==========================================================
   10. PROFILE PHOTO VIEWER
   Pinindot ang pfp = lilipad sa gitna at magiging malaking 1:1 photo. Pindutin ulit para isara.
   ========================================================== */
const pv = $("pv"),
  pvbox = $("pvbox"),
  pvi = $("pvi"),
  pvdot = $("pvdot"),
  pvcap = $("pvcap"),
  pvbg = $("pvbg"),
  av = $("av");
let pvOpen = false,
  pvBusy = false;
// Kinukuwenta kung saan at gaano kalaki ang malaking photo
function pvGeom() {
  const S = Math.round(Math.min(innerWidth * 0.86, innerHeight * 0.6, 620));
  const left = (innerWidth - S) / 2,
    top = (innerHeight - S) / 2 - 22;
  const r = av.getBoundingClientRect(),
    k = r.width / S;
  const dx = r.left + r.width / 2 - (left + S / 2),
    dy = r.top + r.height / 2 - (top + S / 2);
  return {
    S,
    left,
    top,
    from: "translate(" + dx + "px," + dy + "px) scale(" + k + ")",
  };
}
function pvLayout(g) {
  Object.assign(pvbox.style, {
    width: g.S + "px",
    height: g.S + "px",
    left: g.left + "px",
    top: g.top + "px",
    padding: g.S * 0.032 + "px",
  });
  pvi.style.borderWidth = g.S * 0.018 + "px";
  pvcap.style.top = g.top + g.S + 30 + "px";
}
// Bukas: pfp -> gitna ng screen
function openPV() {
  if (pvOpen || pvBusy) return;
  pvBusy = true;
  pvi.innerHTML = $("photo").innerHTML;
  const g = pvGeom();
  pvLayout(g);
  pv.classList.add("on");
  av.style.visibility = "hidden";
  const o = { duration: reduce ? 1 : 540, easing: EASE };
  pvbg.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduce ? 1 : 280,
    easing: "ease",
  });
  pvbox.animate(
    [
      { transform: g.from, borderRadius: "50%" },
      { transform: "none", borderRadius: "10%" },
    ],
    o,
  );
  pvi.animate([{ borderRadius: "50%" }, { borderRadius: "7.5%" }], o);
  pvdot.animate([{ transform: "scale(1)" }, { transform: "scale(0)" }], {
    duration: reduce ? 1 : 300,
    easing: EASE,
    fill: "forwards",
  });
  pvbox.style.borderRadius = "10%";
  pvi.style.borderRadius = "7.5%";
  pvOpen = true;
  syncPause();
  setTimeout(
    () => {
      pv.classList.add("landed");
      pvBusy = false;
    },
    reduce ? 1 : 400,
  );
}
// Sara: bumabalik sa pfp
function closePV() {
  if (!pvOpen || pvBusy) return;
  pvBusy = true;
  pv.classList.remove("landed");
  const g = pvGeom(),
    D = reduce ? 1 : 400,
    o = { duration: D, easing: EASE, fill: "forwards" };
  pvdot.getAnimations().forEach((a) => a.cancel());
  pvdot.animate(
    [
      { transform: "scale(0)" },
      { transform: "scale(0)", offset: 0.55 },
      { transform: "scale(1)" },
    ],
    { duration: D, easing: EASE, fill: "forwards" },
  );
  pvbg.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: D,
    easing: "ease",
    fill: "forwards",
  });
  pvbox.animate(
    [
      { transform: "none", borderRadius: "10%" },
      { transform: g.from, borderRadius: "50%" },
    ],
    o,
  );
  pvi.animate([{ borderRadius: "7.5%" }, { borderRadius: "50%" }], o);
  setTimeout(() => {
    av.style.visibility = "";
    pv.classList.remove("on");
    [pvbg, pvbox, pvi, pvdot].forEach((el) =>
      el.getAnimations().forEach((a) => a.cancel()),
    );
    pvOpen = false;
    pvBusy = false;
    syncPause();
  }, D + 30);
}
av.addEventListener("click", () => {
  if (stage.classList.contains("typing")) {
    msg.blur();
    setTimeout(openPV, 520);
  } else openPV();
});
av.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openPV();
  }
});
pv.addEventListener("click", closePV);
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePV();
});
addEventListener("resize", () => {
  if (pvOpen && !pvBusy) pvLayout(pvGeom());
});
/* ==========================================================
   11. PAG-ROTATE NG SCREEN
   Pag nag-rotate: isinasara ang keyboard state at kinukuwenta ulit ang laki ng page.
   ========================================================== */
let rotT = [];
function onRotate() {
  if (stage.classList.contains("typing")) {
    clearInterval(poll);
    setExpanded(false);
    finishTyping();
    msg.blur();
  }
  stage.style.transform = "";
  stage.scrollTop = 0;
  scrollTo(0, 0);
  rotT.forEach(clearTimeout);
  rotT = [0, 100, 300, 700].map((t) =>
    setTimeout(() => {
      size(true);
      scrollTo(0, 0);
      if (pvOpen && !pvBusy) pvLayout(pvGeom());
    }, t),
  );
}
addEventListener("orientationchange", onRotate);
onMQ(matchMedia("(orientation:portrait)"), onRotate);
/* ==========================================================
   12. EFFECTS
   Icon swap (mail/sms/check), confetti pag nasend, at animation ng Email <-> Phone switch.
   ========================================================== */
const ICONS = {
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="m2.5 6 9.5 7.5L21.5 6M2.5 18.5l7-7M21.5 18.5l-7-7"/>',
  sms: '<path d="M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-9l-5 4v-4H4A1.5 1.5 0 0 1 2.5 15V6A1.5 1.5 0 0 1 4 4.5z"/><path d="M7.5 10.5h.01M12 10.5h.01M16.5 10.5h.01" stroke-width="2.6"/>',
  check:
    '<path d="M4.5 12.5l5 5L19.5 7" pathLength="1" stroke-width="2.4" style="stroke-dasharray:1;stroke-dashoffset:1"/>',
};
const sico = $("sico"),
  card2 = document.querySelector(".card");
let icoKind = "mail",
  icoTok = 0;
// Pinapalitan ang icon sa Send button (may flying animation)
function setIcon(kind, fly) {
  const k = ++icoTok;
  icoKind = kind;
  const out = sico.animate(
    fly
      ? [
          { transform: "none", opacity: 1 },
          {
            transform: "translate3d(54px,-40px,0) rotate(22deg) scale(.3)",
            opacity: 0,
          },
        ]
      : [
          { transform: "none", opacity: 1 },
          {
            transform:
              "translate3d(" +
              (kind === "sms" ? -18 : 18) +
              "px,0,0) scale(.55)",
            opacity: 0,
          },
        ],
    {
      duration: reduce ? 1 : fly ? 380 : 170,
      easing: fly ? "cubic-bezier(.5,0,.9,.4)" : "ease-in",
      fill: "forwards",
    },
  );
  out.onfinish = () => {
    out.cancel();
    if (k !== icoTok) return;
    sico.innerHTML = ICONS[kind];
    sico.animate(
      kind === "check"
        ? [
            { transform: "scale(.2) rotate(-80deg)", opacity: 0 },
            { transform: "scale(1.18) rotate(8deg)", opacity: 1, offset: 0.65 },
            { transform: "none", opacity: 1 },
          ]
        : [
            {
              transform:
                "translate3d(" +
                (kind === "sms" ? 18 : -18) +
                "px,0,0) scale(.55)",
              opacity: 0,
            },
            {
              transform: "translate3d(0,0,0) scale(1.12)",
              opacity: 1,
              offset: 0.7,
            },
            { transform: "none", opacity: 1 },
          ],
      { duration: reduce ? 1 : 440, easing: EASE },
    );
    if (kind === "check")
      sico
        .querySelector("path")
        .animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration: reduce ? 1 : 420,
          delay: reduce ? 0 : 160,
          easing: "ease-out",
          fill: "both",
        });
  };
}
// Confetti pag successful ang send
function burst(el) {
  if (reduce) return;
  const w = document.createElement("i");
  w.className = "burst";
  el.appendChild(w);
  const cols = [
    "#b98cff",
    "#6aa8ff",
    "#ff7ad9",
    "#4cf2c8",
    "#ffffff",
    "#ffd36a",
  ];
  for (let i = 0; i < 14; i++) {
    const d = document.createElement("b"),
      a = (i / 14) * Math.PI * 2 + Math.random() * 0.5,
      r = 70 + Math.random() * 90,
      z = 5 + Math.random() * 5;
    d.style.cssText =
      "background:" +
      cols[i % cols.length] +
      ";width:" +
      z +
      "px;height:" +
      z * (i % 3 ? 1 : 1.8) +
      "px;border-radius:" +
      (i % 3 ? "50%" : "2px");
    w.appendChild(d);
    const dx = Math.cos(a) * r,
      dy = Math.sin(a) * r - 34,
      rot = (Math.random() - 0.5) * 540;
    d.animate(
      [
        { transform: "translate3d(0,0,0) rotate(0) scale(.4)", opacity: 1 },
        {
          transform:
            "translate3d(" +
            dx +
            "px," +
            dy +
            "px,0) rotate(" +
            rot * 0.6 +
            "deg) scale(1)",
          opacity: 1,
          offset: 0.55,
        },
        {
          transform:
            "translate3d(" +
            dx * 1.12 +
            "px," +
            (dy + 70) +
            "px,0) rotate(" +
            rot +
            "deg) scale(.3)",
          opacity: 0,
        },
      ],
      {
        duration: 950 + Math.random() * 350,
        easing: "cubic-bezier(.2,.7,.3,1)",
        fill: "forwards",
      },
    );
  }
  setTimeout(() => w.remove(), 1500);
}
function ringFx(el, cls, color, kf, dur, delay) {
  if (reduce) return;
  const r = document.createElement("i");
  r.className = cls;
  if (color) r.style.borderColor = color;
  el.appendChild(r);
  r.animate(kf, {
    duration: dur,
    delay: delay || 0,
    easing: "cubic-bezier(.2,.7,.3,1)",
    fill: "both",
  }).onfinish = () => r.remove();
}
// Effects pag nabuksan na ang email/SMS app: check icon, confetti, rings
function sentFx() {
  const sb = $("send");
  toast("Draft is ready. Press Send in your app to finish.");
  sb.classList.add("ok");
  setIcon("check", true);
  burst(sb);
  ringFx(
    sb,
    "sring",
    "",
    [
      { transform: "scale(1)", opacity: 0.9 },
      { transform: "scale(1.45,2.1)", opacity: 0 },
    ],
    800,
  );
  ringFx(
    sb,
    "sring",
    "",
    [
      { transform: "scale(1)", opacity: 0.7 },
      { transform: "scale(1.45,2.1)", opacity: 0 },
    ],
    800,
    160,
  );
  ringFx(
    card2,
    "cring",
    "#7dffb5",
    [
      { transform: "scale(1)", opacity: 0.85 },
      { transform: "scale(1.06)", opacity: 0 },
    ],
    1e3,
  );
  // Hindi binubura ang message: hindi natin alam kung natuloy ang pagsend sa email/SMS app. Babalik sa normal ang button pagkatapos.
  setTimeout(() => {
    sb.classList.remove("ok");
    setIcon(mode === "phone" ? "sms" : "mail");
  }, 2400);
}
function slide(el, text) {
  if (reduce) {
    el.textContent = text;
    return;
  }
  const o = el.animate(
    [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translate3d(0,-10px,0)" },
    ],
    { duration: 130, easing: "ease-in", fill: "forwards" },
  );
  o.onfinish = () => {
    el.textContent = text;
    o.cancel();
    el.animate(
      [
        { opacity: 0, transform: "translate3d(0,12px,0)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 380, easing: EASE },
    );
  };
}
// Email <-> Phone: ang pill, label, icon at card ay sabay nagbabago
function switchMode() {
  mode = mode === "email" ? "phone" : "email";
  const ph = mode === "phone",
    pill = $("pill"),
    pt = $("pt"),
    sb = $("send"),
    dir = ph ? 1 : -1;
  if (reduce) {
    pt.textContent = ph ? "SMS" : "Email";
    pill.classList.toggle("ph", ph);
  } else {
    const f = document.createElement("i");
    f.className = "pfill";
    f.style.background = ph
      ? "linear-gradient(90deg,#0b8a4a,#22c36f)"
      : "linear-gradient(90deg,#4c14c4,#7a2ff0)";
    pill.appendChild(f);
    f.animate(
      [
        { clipPath: "circle(0% at 50% 50%)" },
        { clipPath: "circle(78% at 50% 50%)" },
      ],
      { duration: 560, easing: EASE, fill: "forwards" },
    ).onfinish = () => {
      pill.classList.toggle("ph", ph);
      f.remove();
    };
    const o = pt.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: "translate3d(" + -dir * 26 + "px,0,0)", opacity: 0 },
      ],
      { duration: 160, easing: "ease-in", fill: "forwards" },
    );
    o.onfinish = () => {
      pt.textContent = ph ? "SMS" : "Email";
      o.cancel();
      pt.animate(
        [
          { transform: "translate3d(" + dir * 26 + "px,0,0)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 420, easing: EASE },
      );
    };
    pill.animate(
      [
        { transform: "none" },
        { transform: "scale(1.14,.82)", offset: 0.22 },
        { transform: "scale(.95,1.1)", offset: 0.5 },
        { transform: "scale(1.03,.98)", offset: 0.75 },
        { transform: "none" },
      ],
      { duration: 640, easing: "ease-out" },
    );
  }
  slide($("swl"), ph ? "Switch to Email" : "Switch to SMS");
  if (!sb.disabled && !sb.classList.contains("ok")) {
    slide($("sendt"), ph ? "Send SMS" : "Send now");
    setIcon(ph ? "sms" : "mail");
  }
  if (!reduce) {
    $("sw").animate(
      [
        { transform: "rotate(0) scale(1)" },
        { transform: "rotate(200deg) scale(.88)", offset: 0.5 },
        { transform: "rotate(360deg) scale(1)" },
      ],
      { duration: 620, easing: EASE },
    );
    ringFx(
      card2,
      "cring",
      ph ? "#4cf2a0" : "#b98cff",
      [
        { transform: "scale(1)", opacity: 0.7 },
        { transform: "scale(1.04)", opacity: 0 },
      ],
      800,
    );
    box.animate(
      [
        { borderColor: "rgba(110,80,200,.55)" },
        { borderColor: ph ? "#4cf2a0" : "#b98cff", offset: 0.3 },
        { borderColor: "rgba(110,80,200,.55)" },
      ],
      { duration: 800 },
    );
  }
}
/* ==========================================================
   13. TOAST
   toast(text) = maliit na message sa ibaba. flag(el) = shake/pula kapag walang laman.
   ========================================================== */
let toastT;
function toast(t, ms) {
  const el = $("toast");
  el.textContent = t;
  el.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("on"), ms || 3600);
}
function flag(el) {
  el.classList.remove("bad");
  void el.offsetWidth;
  el.classList.add("bad");
}
/* ==========================================================
   14. PAG-SEND NG MESSAGE (+ fallback)
   Email mode: binubuksan ang email app ng bisita (mailto) na nakalagay na ang To, Subject at Message.
   Phone mode: binubuksan ang SMS app ng bisita gamit ang smsNumber.
   ========================================================== */
// Binubuksan ang email/SMS app. Kapag walang app na nagbukas (hal. desktop na walang mail app), kinokopya ang message at may toast na instruction.
function copyText(t) {
  try {
    if (navigator.clipboard)
      return navigator.clipboard.writeText(t).then(
        () => true,
        () => false,
      );
  } catch (e) {}
  return Promise.resolve(false);
}
let appBusy = false; // iwas double-tap na nagbubukas ng app nang dalawang beses
function openApp(url, onOpen, onFail) {
  if (appBusy) return;
  appBusy = true;
  let left = false;
  const mark = () => {
    if (left) return;
    left = true;
    onOpen();
  };
  addEventListener("blur", mark, { once: true });
  document.addEventListener("visibilitychange", mark, { once: true });
  location.href = url;
  setTimeout(() => {
    removeEventListener("blur", mark);
    document.removeEventListener("visibilitychange", mark);
    appBusy = false;
    if (!left) onFail();
  }, 4000); // 4s: may permission prompt ang ibang browser, kaya hindi dapat madaling ideklarang failed
}
function send() {
  const m = msg.value.trim();
  if (!m) {
    flag(box);
    msg.focus({ preventScroll: true });
    toast("Please write a message first.");
    return;
  }
  if (mode === "phone") {
    const sep = IOS ? "&" : "?";
    openApp(
      "sms:" + CONFIG.smsNumber + sep + "body=" + encodeURIComponent(m),
      sentFx,
      () =>
        copyText(m).then((ok) =>
          toast(
            ok
              ? "Couldn’t open SMS. Message copied, text it to " + CONFIG.smsNumber
              : "Couldn’t open SMS. Text me at " + CONFIG.smsNumber,
          ),
        ),
    );
    return;
  }
  toast("Opening your email app. Press Send there to finish.");
  openApp(
    "mailto:" +
      CONFIG.email +
      "?subject=" +
      encodeURIComponent(CONFIG.emailSubject) +
      "&body=" +
      encodeURIComponent(m),
    sentFx,
    () =>
      copyText(m).then((ok) =>
        toast(
          ok
            ? "No email app found. Message copied, email it to " + CONFIG.email
            : "No email app found. Email me at " + CONFIG.email,
        ),
      ),
  );
}
$("send").onclick = send;
// Desktop: Ctrl/Cmd + Enter para mag-send habang nasa textbox
msg.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    send();
  }
});
/* ==========================================================
   15. SAVE CONTACT
   Walang web API na nagsisingit ng contact nang tahimik (ang navigator.contacts ay pambasa/pampili lang, hindi pangsulat).
   Ang pinakamalapit na totoo: iOS = bubukas ang native "Add Contact" card; Android = share sheet (kung suportado), kung hindi, .vcf download;
   Desktop = .vcf download. Nabubuo ang card mula sa CONFIG; walang backend. Hindi sinasabing "saved" hangga't hindi kumpirmado ng user.
   ========================================================== */
const saveBtn = $("save"),
  saveSub = $("savesub"),
  saveIdle = saveSub.textContent;
const ANDROID = /Android/i.test(navigator.userAgent);
// In-app browsers (Messenger, Facebook, Instagram, TikTok) ay humaharang ng file/share
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|Messenger|TikTok|musical_ly|Bytedance|; wv\)/i.test(navigator.userAgent);
const utf8 = new TextEncoder();
const oneLine = (s) => String(s == null ? "" : s).replace(/[\r\n]+/g, " ").trim();
const esc = (s) => oneLine(s).replace(/([\\;,])/g, "\\$1");
const escMulti = (s) =>
  String(s).trim().replace(/\r\n|\r/g, "\n").replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
// vCard line folding: hanggang 75 octets bawat linya, hindi pinuputol ang UTF-8 character
function fold(line) {
  let out = "", cur = "", n = 0;
  for (const ch of line) {
    const b = ch.charCodeAt(0) < 128 ? 1 : utf8.encode(ch).length;
    if (n + b > 75) {
      out += cur + "\r\n ";
      cur = "";
      n = 1;
    }
    cur += ch;
    n += b;
  }
  return out + cur;
}
function vcard(photo) {
  const c = CONFIG.contact || {},
    parts = CONFIG.name.trim().split(/\s+/);
  let first = c.firstName,
    last = c.lastName;
  if (!first && !last) {
    last = parts.length > 1 ? parts.pop() : "";
    first = parts.join(" ");
  }
  const full = oneLine(((first || "") + " " + (last || "")).trim() || CONFIG.name);
  const r = ["BEGIN:VCARD", "VERSION:3.0", "N:" + esc(last || "") + ";" + esc(first || "") + ";;;", "FN:" + esc(full)];
  if (c.company) r.push("ORG:" + esc(c.company));
  if (c.jobTitle) r.push("TITLE:" + esc(c.jobTitle));
  CONFIG.phones.forEach((p, i) => {
    const t = oneLine(p.tel).replace(/[^\d+]/g, "");
    if (t) r.push("TEL;TYPE=CELL,VOICE" + (i ? "" : ",PREF") + ":" + t);
  });
  if (CONFIG.email) r.push("EMAIL;TYPE=INTERNET:" + oneLine(CONFIG.email));
  if (c.website) r.push("URL:" + oneLine(c.website));
  if (c.address) r.push("ADR;TYPE=HOME:;;" + esc(c.address) + ";;;;");
  if (c.note) r.push("NOTE:" + escMulti(c.note));
  [["Facebook", CONFIG.facebook], ["Instagram", CONFIG.instagram], ["TikTok", CONFIG.tiktok]]
    .filter((x) => x[1])
    .forEach(([label, url], i) => r.push("item" + (i + 1) + ".URL:" + oneLine(url), "item" + (i + 1) + ".X-ABLabel:" + label));
  if (photo) r.push("PHOTO;ENCODING=b;TYPE=JPEG:" + photo);
  r.push("END:VCARD");
  return r.map(fold).join("\r\n") + "\r\n";
}
// Maliit (256px) na JPEG ng profile photo para sa card; kung pumalya, walang photo
function loadPhoto() {
  return new Promise((ok) => {
    if (!CONFIG.photo) return ok("");
    const im = new Image();
    im.onload = () => {
      try {
        const m = Math.min(im.naturalWidth, im.naturalHeight),
          s = Math.min(256, m),
          cv = document.createElement("canvas");
        cv.width = cv.height = s;
        cv.getContext("2d").drawImage(im, (im.naturalWidth - m) / 2, (im.naturalHeight - m) / 2, m, m, 0, 0, s, s);
        ok(cv.toDataURL("image/jpeg", 0.85).split(",")[1] || "");
      } catch (e) {
        ok("");
      }
    };
    im.onerror = () => ok("");
    im.src = CONFIG.photo;
  });
}
// Inihahanda nang maaga para sync ang click (kailangan ng share sheet ang user gesture)
let vcf = null,
  vcfP = null,
  saving = false;
function prepare() {
  return (
    vcfP ||
    (vcfP = loadPhoto()
      .then((ph) => {
        const name = CONFIG.name.replace(/\s+/g, "-") + ".vcf",
          blob = new Blob([vcard(ph)], { type: "text/vcard;charset=utf-8" });
        let file = null;
        try {
          file = new File([blob], name, { type: "text/vcard" });
        } catch (e) {}
        return (vcf = { blob, file, name });
      })
      .catch((e) => {
        vcfP = null;
        throw e;
      }))
  );
}
setTimeout(prepare, 2500);
const objUrl = (b) => {
  const u = URL.createObjectURL(b);
  setTimeout(() => URL.revokeObjectURL(u), 60000);
  return u;
};
function setBusy(on) {
  saving = on;
  saveBtn.classList.toggle("busy", on);
  saveBtn.setAttribute("aria-busy", on);
  saveSub.textContent = on ? "Preparing contact" : saveIdle;
}
function download(v) {
  const a = document.createElement("a");
  a.href = objUrl(v.blob);
  a.download = v.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast("Contact file prepared. Open it to add to your contacts.");
}
function deliver(v) {
  if (IOS) {
    toast("Opening contact card. Tap Create New Contact to save.");
    const u = objUrl(v.blob);
    // home-screen mode: sa in-app view para may Done button (iwas ma-stuck); sa Safari tab: diretso
    if (navigator.standalone) window.open(u, "_blank");
    else location.href = u;
    return setTimeout(() => setBusy(false), 1500);
  }
  if (ANDROID && CONFIG.androidShare && v.file && navigator.canShare && navigator.canShare({ files: [v.file] }))
    return navigator
      .share({ files: [v.file], title: CONFIG.name })
      .then(
        () => toast("Card shared. Finish adding it in the app you chose."),
        (e) => {
          if (!e || e.name !== "AbortError") download(v);
        },
      )
      .then(() => setBusy(false));
  download(v);
  setTimeout(() => setBusy(false), 1200);
}
function saveFail() {
  setBusy(false);
  toast("Unable to open contacts. Save this number manually: " + CONFIG.phones[0].label, 5000);
}
const run = (v) => {
  try {
    deliver(v);
  } catch (e) {
    saveFail();
  }
};
saveBtn.onclick = () => {
  if (saving) return;
  if (IN_APP)
    return toast("This in-app browser can't save contacts. Open this page in Safari or Chrome.", 5000);
  setBusy(true);
  if (vcf) run(vcf);
  else prepare().then(run, saveFail);
};