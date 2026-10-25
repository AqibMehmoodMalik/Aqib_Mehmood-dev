/* =========================================================
   Aqib Mehmood | Portfolio interactions
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll progress + back-to-top ---------- */
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    if (toTop) toTop.hidden = h.scrollTop < 700;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + "ms"; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Typed headline ---------- */
  const typed = $("#typed");
  if (typed && !reduceMotion) {
    const words = ["AI / ML Engineer", "Python Developer", "RAG & LLM Builder", "Computer Vision Engineer"];
    let w = 0, c = 0, del = false;
    const step = () => {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(step, 1600); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; return setTimeout(step, 350); }
      c += del ? -1 : 1;
      setTimeout(step, del ? 35 : 75);
    };
    step();
  }

  /* ---------- Hero photo: tap support on touch ---------- */
  const photo = $("#heroPhoto");
  photo?.addEventListener("click", () => photo.classList.toggle("active"));

  /* ---------- Hero canvas: neural-network particles ---------- */
  const canvas = $("#heroCanvas");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, pts, raf;
    const mouse = { x: -999, y: -999 };
    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(90, Math.floor((w * h) / 14000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.283);
        ctx.fillStyle = "rgba(125,170,255,.8)"; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = dx * dx + dy * dy;
          if (d < 14000) {
            ctx.strokeStyle = `rgba(110,150,255,${(1 - d / 14000) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
        const mx = pts[i].x - mouse.x, my = pts[i].y - mouse.y, md = mx * mx + my * my;
        if (md < 22000) {
          ctx.strokeStyle = `rgba(34,211,166,${(1 - md / 22000) * 0.6})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); init(); draw(); });
    $(".hero").addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    $(".hero").addEventListener("mouseleave", () => { mouse.x = mouse.y = -999; });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf); else draw();
    });
  }

  /* ---------- Interactive "find the bug" challenge ---------- */
  const bug = $("#bugLine");
  if (bug) {
    const solve = () => {
      if (bug.classList.contains("fixed")) return;
      bug.textContent = "history = model.fit(x_train, y_train, epochs=50)";
      bug.classList.add("fixed");
      $("#challengeStatus").hidden = false;
      $("#challengeResult").hidden = false;
      $("#challengeHint").hidden = true;
      $("#challenge").classList.add("done");
    };
    bug.addEventListener("click", solve);
    bug.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); solve(); } });
  }

  /* ---------- Project filters ---------- */
  const filters = $$(".filter");
  const projects = $$("#projectGrid .project");
  const projectCount = $(".workspace-count");
  const filterCount = $("#projectFilterCount");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.toggle("active", b === btn); b.setAttribute("aria-selected", b === btn); });
    const f = btn.dataset.filter;
    let visibleCount = 0;
    projects.forEach((p) => {
      const show = f === "all" || p.dataset.cat.split(" ").includes(f);
      p.classList.toggle("hide", !show);
      if (show) { p.classList.add("in"); visibleCount++; }
    });
    if (projectCount) projectCount.textContent = `${visibleCount} projects`;
    if (filterCount) filterCount.textContent = visibleCount;
  }));

  /* ---------- Level-up skills mini game ---------- */
  const groups = $$("#skillGroups .skill-group");
  if (groups.length) {
    const fill = $("#xpFill"), text = $("#xpText"), lvl = $("#lvlNum"), done = $("#levelComplete");
    const KEY = "am_skills_v1";
    const render = () => {
      const n = groups.filter((g) => g.getAttribute("aria-pressed") === "true").length;
      fill.style.width = (n / groups.length) * 100 + "%";
      text.textContent = `${n} / ${groups.length} skill groups unlocked`;
      lvl.textContent = n + 1;
      done.hidden = n !== groups.length;
      store.set(KEY, JSON.stringify(groups.map((g) => g.getAttribute("aria-pressed") === "true")));
    };
    try {
      const saved = JSON.parse(store.get(KEY) || "[]");
      groups.forEach((g, i) => g.setAttribute("aria-pressed", saved[i] ? "true" : "false"));
    } catch { /* ignore */ }
    groups.forEach((g) => g.addEventListener("click", () => {
      g.setAttribute("aria-pressed", g.getAttribute("aria-pressed") === "true" ? "false" : "true");
      render();
    }));
    $("#lvlReset").addEventListener("click", () => {
      groups.forEach((g) => g.setAttribute("aria-pressed", "false")); store.del(KEY); render();
    });
    render();
  }

  /* ---------- Aqib-AI (client-side CV assistant) ---------- */
  const KB = [
    { k: "hello hi hey greetings", a: "Hello! 👋 Ask me about Aqib's projects, skills, experience, education or how to contact him." },
    { k: "who about summary introduce yourself profile background", a: "<b>Aqib Mehmood</b> is an AI &amp; ML Engineer with <b>2 years</b> of hands-on experience building scalable, production-ready AI systems. He specializes in <b>RAG</b>, <b>LLM integration</b>, <b>computer vision</b> and <b>automated workflows</b>, and is experienced across the full lifecycle, from training models in TensorFlow/PyTorch to deploying APIs with FastAPI, Flask and Django." },
    { k: "impactful best proud biggest highlight achievement project notable", a: "Career highlights:<ul><li><b>AI-Powered EDI Error Resolution</b>: LLM + RAG system that automatically resolves failed SAP/PRO to PartnerLinQ transactions and resubmits them, reducing manual effort.</li><li><b>Broiler Health Monitoring</b>: real-time YOLOv8 system that detects healthy vs. sick birds and feeds an admin dashboard.</li><li><b>Liver Tumor Segmentation</b>: V-Net deep-learning final year project on CT scans.</li></ul>" },
    { k: "rag retrieval augmented generation vector embeddings qdrant pinecone", a: "Aqib builds <b>Retrieval-Augmented Generation</b> systems. At QIntellect he built an LLM + RAG automation that analyzes failed EDI transactions, resolves common errors and resubmits them. He works with vector databases like <b>Qdrant</b> and <b>Pinecone</b>, plus Supabase and PostgreSQL." },
    { k: "llm large language prompt engineering chatbot openai agents agent", a: "LLM experience includes <b>prompt engineering</b>, RAG pipelines, multi-agent chatbot work (<b>AI-Codegen / OpenHands AI</b>: agent orchestration, state management, Docker runtimes), AI commentary generation for baseball recaps, and an NLP-powered mental health chatbot." },
    { k: "computer vision yolo yolov8 opencv face detection image segmentation chicken broiler poultry", a: "Computer vision work:<ul><li><b>Broiler Chicken Health Monitoring</b>: YOLOv8 real-time detection and tracking with an admin dashboard.</li><li><b>Face Recognition Attendance System</b>: OpenCV face recognition with Excel logging.</li><li><b>Signature Detector</b>: YOLO-based signature detection in images.</li><li><b>Liver Tumor Segmentation</b>: V-Net on the LiTS dataset.</li></ul>" },
    { k: "skills technologies tech stack languages tools know", a: "Core skills:<ul><li><b>Languages:</b> Python, Java, C++</li><li><b>AI/ML:</b> ML, Deep Learning, NLP, LLMs, RAG, Computer Vision (YOLOv8, OpenCV), TensorFlow, PyTorch, Scikit-learn, NLTK</li><li><b>Backend:</b> Django, Flask, FastAPI, REST APIs</li><li><b>Scraping:</b> Scrapy, Selenium, BeautifulSoup</li><li><b>Databases:</b> MySQL, PostgreSQL, Supabase, Qdrant, Pinecone</li><li><b>Frontend/Tools:</b> React, Tailwind, Bootstrap, Git, Docker, Linux</li></ul>" },
    { k: "ai ml machine learning deep learning nlp skills", a: "Aqib's AI/ML toolkit covers regression, classification, CNNs, RNNs, LSTM and image segmentation (V-Net), using <b>NumPy, Pandas, Scikit-learn, TensorFlow, PyTorch</b> and <b>NLTK</b>." },
    { k: "backend api fastapi django flask rest deploy deployment docker", a: "Aqib deploys high-performance APIs with <b>FastAPI</b>, <b>Flask</b> and <b>Django</b>. Examples: QuickBooks Online integration (OAuth 2.0, webhooks, REST in FastAPI), the Django-based ApnaKarobar.co platform with Celery, and Dockerized agent runtimes at StepSharp." },
    { k: "experience work job career history companies employment", a: "Experience timeline:<ul><li><b>AI/ML Engineer</b> | QIntellect Technologies (May–Sept 2026)</li><li><b>Python Developer</b> | Software Pattern, Islamabad (Jan–May 2026)</li><li><b>Python Developer</b> | StepSharp Digital Pty Ltd, Remote (Jun–Sept 2025)</li><li><b>Python AI/ML Engineer</b> | Freelance (Jun 2024–Jun 2025)</li></ul>" },
    { k: "qintellect qintellect technologies edi sap partnerlinq", a: "At <b>QIntellect Technologies</b> (Rahim Yar Khan) Aqib built the <b>Broiler Chicken Health Monitoring System</b> (YOLOv8) and the <b>AI-Powered EDI Error Resolution System</b> (LLM + RAG)." },
    { k: "software pattern scraping scrapy selenium beautifulsoup contact data extraction", a: "At <b>Software Pattern</b> (Islamabad) he built automated scraping solutions with Scrapy, Selenium and BeautifulSoup to extract structured business contact data, with cleaning, database integration and reporting for lead generation." },
    { k: "stepsharp openhands codegen baseball stripe recap", a: "At <b>StepSharp Digital</b> (remote) Aqib improved the multi-agent <b>AI-Codegen (OpenHands AI)</b> platform, including orchestration, state management, Docker runtime and Stripe payments, and built the <b>AI Baseball Recap System</b> that turns rosters and game videos into highlights and AI commentary." },
    { k: "freelance quickbooks apnakarobar mental health attendance annotation", a: "Freelance projects: <b>QuickBooks API integration</b>, <b>ApnaKarobar.co</b> (Django + Celery earning platform), a privacy-focused <b>Mental Health Chatbot</b>, a <b>Face Recognition Attendance System</b>, and <b>data annotation</b> for student result prediction." },
    { k: "education degree university study bs final year fyp liver tumor v-net vnet kfueit", a: "Aqib holds a <b>BS in Artificial Intelligence (2022–2026)</b> from KFUEIT, Rahim Yar Khan. His Final Year Project is <b>Liver Tumor Segmentation</b>, a V-Net deep-learning model for CT scans (LiTS dataset), with a full ML pipeline integrated into a Django app." },
    { k: "certification certificate certified", a: "Aqib holds an <b>AI Engineer Certificate</b>." },
    { k: "language languages urdu english speak", a: "Aqib is proficient in <b>Urdu</b> and <b>English</b>." },
    { k: "contact email phone hire reach call whatsapp linkedin connect available", a: "You can reach Aqib at:<ul><li>📧 <a href='mailto:devaqibmalik@gmail.com'>devaqibmalik@gmail.com</a></li><li>📞 <a href='tel:+923348344844'>+92 334 8344844</a></li><li>💬 <a href='https://wa.me/923348344844' target='_blank' rel='noopener'>WhatsApp</a></li><li>💼 <a href='https://linkedin.com/in/aqib-mehmood-malik' target='_blank' rel='noopener'>LinkedIn</a></li></ul>" },
    { k: "location where based live remote city country", a: "Aqib is based in <b>Rahim Yar Khan, Pakistan</b> and has experience working remotely with international teams." },
    { k: "apart different unique why hire strength strengths", a: "What sets Aqib apart: <b>end-to-end ownership</b> (data → model → API → dashboard), <b>production-minded engineering</b> (error handling, secure auth, Docker, scalability) and the ability to <b>bridge business needs and technical execution</b>." },
    { k: "web scraping automation workflow", a: "Aqib builds automation and scraping pipelines with <b>Scrapy, Selenium and BeautifulSoup</b>, plus LLM-driven workflows that resolve errors and resubmit transactions automatically." },
    { k: "cv resume download pdf", a: "You can download Aqib's resume from the <a href='assets/Aqib_Mehmood_AI_ML_Engineer_CV_2k26.pdf' target='_blank' rel='noopener'>Download CV</a> link." },
    { k: "text to voice text-to-speech speech audio", a: "The <b>Text-To-Voice</b> project converts written content into spoken audio for accessible, hands-free listening." },
    { k: "invoice text extract invoice-text-extract invoices document json excel", a: "The <b>Invoice-Text-Extract</b> project extracts structured text from invoice documents and saves the output as JSON and Excel." },
    { k: "signature detector signature-detection yolo signatures image", a: "The <b>Signature-Detector</b> is a Python computer-vision project using a YOLO model to locate signatures in images with varied image quality." },
    { k: "ocr chatbot ocr-chatbot image prompt extract text excel", a: "The <b>OCR Chatbot</b> responds to prompts about an image, extracts text from it, and exports recognized text to Excel." },
    { k: "jervas jervas.ai ai assistant", a: "<b>JERVAS.AI</b> is an AI assistant project focused on natural-language interaction and practical task support." },
    { k: "diabetes prediction diabetes risk machine learning", a: "<b>Diabetes Prediction</b> is a supervised machine-learning project that uses health indicators to estimate risk for educational purposes, not as a medical diagnosis." },
    { k: "heart disease prediction heart-disease cardiac risk", a: "<b>Heart Disease Prediction</b> is a supervised learning project that analyzes health indicators to estimate risk for educational purposes, not as a medical diagnosis." },
    { k: "movie recommendation recommender recommend movies", a: "The <b>Movie Recommendation System</b> suggests movies based on user preferences and patterns in movie data." },
  ];
  const CASE_STUDIES = [
    { terms: ["broiler", "chicken", "poultry"], targets: ["broiler-health-monitoring", "broiler-impact"], title: "Broiler Chicken Health Monitoring" },
    { terms: ["edi", "partnerlinq", "sap/pro"], targets: ["edi-error-resolution", "edi-impact"], title: "AI-Powered EDI Error Resolution" },
    { terms: ["liver", "tumor", "v-net", "vnet", "segmentation", "lits"], targets: ["liver-tumor-segmentation", "liver-impact", "challenge"], title: "Liver Tumor Segmentation" },
    { terms: ["invoice"], targets: ["invoice-text-extract"], title: "Invoice-Text-Extract" },
    { terms: ["signature"], targets: ["signature-detector"], title: "Signature-Detector" },
    { terms: ["ocr"], targets: ["ocr-chatbot"], title: "OCR Chatbot" },
    { terms: ["text-to-voice", "text to voice", "text-to-speech"], targets: ["text-to-voice"], title: "Text-To-Voice" },
    { terms: ["attendance", "face recognition", "face-recognition"], targets: ["face-recognition-attendance"], title: "Face Recognition Attendance System" },
    { terms: ["jervas"], targets: ["jervas-ai"], title: "JERVAS.AI" },
    { terms: ["diabetes"], targets: ["diabetes-prediction"], title: "Diabetes Prediction" },
    { terms: ["heart disease", "heart-disease"], targets: ["heart-disease-prediction"], title: "Heart Disease Prediction" },
    { terms: ["movie recommendation", "movie recommender", "recommendation system"], targets: ["movie-recommendation"], title: "Movie Recommendation System" },
  ];
  const caseStudyFor = (q) => CASE_STUDIES.find((study) => study.terms.some((term) => q.toLowerCase().includes(term)));
  let highlightTimer;
  const focusCaseStudy = (study, question) => {
    const targets = study.targets.map((id) => document.getElementById(id)).filter(Boolean);
    const project = targets.find((target) => target.classList.contains("project"));
    if (project?.classList.contains("hide")) filters.find((button) => button.dataset.filter === "all")?.click();
    targets.forEach((target) => target.classList.add("case-highlight"));
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => targets.forEach((target) => target.classList.remove("case-highlight")), 3600);
    const codeRequested = /\b(code|snippet|bug|train\.py)\b/i.test(question);
    const metricsRequested = /\b(metrics?|impact|results?|benchmarks?|accuracy)\b/i.test(question);
    const destination = codeRequested
      ? targets.find((target) => target.id === "challenge")
      : metricsRequested
        ? targets.find((target) => target.classList.contains("impact-card"))
        : null;
    (destination || project || targets[0])?.scrollIntoView({ behavior: "instant", block: "center" });
  };
  const STOP = new Set("a an the is are of to in on for and or with what whats about does do did has have his he aqib tell me can you how who which any".split(" "));
  const tok = (s) => s.toLowerCase().replace(/[^a-z0-9+\-# ]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));
  const KBT = KB.map((e) => ({ ...e, t: new Set(tok(e.k)) }));
  const answer = (q) => {
    const qt = tok(q);
    let best = null, score = 0;
    KBT.forEach((e) => {
      const s = qt.reduce((n, t) => n + (e.t.has(t) ? 1 : [...e.t].some((k) => k.length > 3 && (k.startsWith(t) || t.startsWith(k)) && t.length > 3) ? 0.5 : 0), 0);
      if (s > score) { score = s; best = e; }
    });
    return score > 0 ? best.a : "Hmm, I don't have that in Aqib's career data yet. Try asking about his <b>projects</b>, <b>skills</b>, <b>experience</b>, <b>education</b> or <b>contact details</b>, or reach him directly at <a href='mailto:devaqibmalik@gmail.com'>devaqibmalik@gmail.com</a>.";
  };

  const chatBody = $("#chatBody"), chatForm = $("#chatForm"), chatInput = $("#chatInput");
  const chatPanel = $("#chat"), chatToggle = $("#chatToggle");
  const toggleChat = (open) => {
    if (!chatPanel || !chatToggle) return;
    chatPanel.hidden = !open;
    chatToggle.setAttribute("aria-expanded", String(open));
    if (open) chatInput?.focus();
  };
  chatToggle?.addEventListener("click", () => toggleChat(chatPanel.hidden));
  $("#chatClose")?.addEventListener("click", () => toggleChat(false));
  const addMsg = (html, who, raw = false) => {
    const d = document.createElement("div");
    d.className = "msg " + who;
    if (raw) d.textContent = html; else d.innerHTML = html;
    chatBody.appendChild(d);
    chatBody.scrollTop = chatBody.scrollHeight;
    return d;
  };
  const ask = (q) => {
    q = q.trim(); if (!q) return;
    addMsg(q, "user", true);
    const t = addMsg('<span class="typing-dots"><i></i><i></i><i></i></span>', "bot");
    const study = caseStudyFor(q);
    const interviewQuestion = /\b(interview|assessment|scheduling|schedule|book a call)\b/i.test(q)
      || (/\b(available|availability)\b/i.test(q) && /\b(you|aqib|work|hire|job|role|position|recruiter)\b/i.test(q));
    const interviewPrompt = "Yes. Aqib is currently open to new opportunities and happy to discuss interview availability. Aqib is remote-friendly. Which interview format would you prefer?";
    const options = '<div class="interview-options"><button type="button" data-interview-format="Remote assessment">Remote assessment</button><button type="button" data-interview-format="Live interview">Live interview</button><button type="button" data-interview-format="Flexible">Flexible</button></div>';
    const metricsQuestion = /\b(metrics?|impact|results?|benchmarks?|accuracy)\b/i.test(q);
    const wireframeQuestion = /\b(wireframes?|mockups?|prototypes?)\b/i.test(q);
    const codeQuestion = /\b(code|snippet|bug|train\.py)\b/i.test(q);
    const unavailableDetail = study && (metricsQuestion || wireframeQuestion || (codeQuestion && !study.targets.includes("challenge")));
    const detailNotice = !study ? "" : metricsQuestion
      ? `The portfolio does not currently publish numeric benchmark metrics for <b>${study.title}</b>. I've highlighted the documented project impact and scope.`
      : wireframeQuestion
        ? `No wireframes are included for <b>${study.title}</b> yet. I've highlighted the project details currently available.`
        : `No code snippet is included for <b>${study.title}</b> yet. I've highlighted the documented project details.`;
    setTimeout(() => {
      t.innerHTML = interviewQuestion
        ? interviewPrompt + options
        : unavailableDetail
          ? detailNotice + `<br><a class="case-link" href="#${study.targets[0]}">View ${study.title}</a>`
          : answer(q) + (study ? `<br><a class="case-link" href="#${study.targets[0]}">View ${study.title}</a>` : "");
      if (study) focusCaseStudy(study, q);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, reduceMotion ? 0 : 450);
  };
  chatBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-interview-format]");
    if (!button) return;
    const format = button.dataset.interviewFormat;
    const message = encodeURIComponent(`Hello Aqib, I would like to schedule an interview. My preferred format is ${format}.`);
    addMsg(format, "user", true);
    addMsg(`Preference noted: <b>${format}</b>. Use the button below to arrange an interview time.<br><a class="schedule-link" href="https://wa.me/923348344844?text=${message}" target="_blank" rel="noopener noreferrer">Schedule on WhatsApp</a>`, "bot");
  });
  chatForm?.addEventListener("submit", (e) => { e.preventDefault(); ask(chatInput.value); chatInput.value = ""; });
  $$("#chatSuggest button").forEach((b) => b.addEventListener("click", () => ask(b.textContent)));

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  if (form) {
    const status = $("#formStatus"), btn = $("#sendBtn");
    const ENDPOINT = form.getAttribute("action") || "";
    const configured = ENDPOINT && !ENDPOINT.includes("YOUR_FORM_ID");
    const valid = (el) => {
      const ok = el.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) : el.value.trim().length > 1;
      el.classList.toggle("invalid", !ok); return ok;
    };
    $$("input:not(.hp), textarea", form).forEach((el) => el.addEventListener("input", () => el.classList.remove("invalid")));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status"; status.textContent = "";
      const fields = [form.name, form.email, form.message];
      if (!fields.map(valid).every(Boolean)) { status.classList.add("err"); status.textContent = "Please fill in all fields correctly."; return; }
      if (form._gotcha.value) return; // bot

      const data = new FormData(form);
      if (configured) {
        btn.disabled = true; btn.textContent = "Sending…";
        try {
          const res = await fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error();
          form.reset(); status.classList.add("ok"); status.textContent = "Thanks! Your message has been sent. I'll get back to you soon.";
        } catch {
          status.classList.add("err"); status.textContent = "Something went wrong. Please email me directly at devaqibmalik@gmail.com.";
        } finally { btn.disabled = false; btn.textContent = "Send"; }
      } else {
        // Fallback: open the visitor's email client with the message prefilled
        const subject = encodeURIComponent("Portfolio inquiry from " + data.get("name"));
        const body = encodeURIComponent(`${data.get("message")}\n\nFrom: ${data.get("name")} (${data.get("email")})`);
        window.location.href = `mailto:devaqibmalik@gmail.com?subject=${subject}&body=${body}`;
        status.classList.add("ok"); status.textContent = "Opening your email app…";
      }
    });
  }
})();
