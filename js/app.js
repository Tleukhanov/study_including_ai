/* ============================================================
   AI-2 trainer — app logic
   Hash router, topic rendering, quiz engine, local progress.
   ============================================================ */

(function () {
  "use strict";

  var TOPICS = window.TOPICS || [];
  var COURSE = window.COURSE || { name: "AI-2", tagline: "Тренажёр" };
  var STORAGE_KEY = "ai2-trainer.v1";
  var THEME_KEY = "ai2-trainer.theme";
  var LETTERS = ["А", "Б", "В", "Г"];

  /* ---------- storage ---------- */

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var data = JSON.parse(raw);
      return data && typeof data === "object" ? data : {};
    } catch (e) {
      return {};
    }
  }

  var progress = loadProgress();

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      /* storage may be full or disabled — the app still works in memory */
    }
  }

  function topicProgress(topic) {
    var entry = progress[topic.id] || {};
    var total = topic.quiz.length;
    var best = Number.isFinite(entry.best) ? Math.max(0, Math.min(entry.best, total)) : 0;
    return { best: best, total: total, done: total > 0 && best >= total };
  }

  function totals() {
    var best = 0;
    var total = 0;
    var done = 0;
    TOPICS.forEach(function (t) {
      var p = topicProgress(t);
      best += p.best;
      total += p.total;
      if (p.done) done += 1;
    });
    return { best: best, total: total, done: done, pct: total ? Math.round((best / total) * 100) : 0 };
  }

  /* ---------- helpers ---------- */

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function findTopic(id) {
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].id === id) return TOPICS[i];
    }
    return null;
  }

  function topicIndex(topic) {
    return TOPICS.indexOf(topic);
  }

  function nextTopicOf(topic) {
    var i = topicIndex(topic);
    return TOPICS[(i + 1) % TOPICS.length];
  }

  /* ---------- theme ---------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* ignore */
    }
    var label = document.getElementById("themeLabel");
    var icon = document.getElementById("themeIcon");
    if (label) label.textContent = theme === "dark" ? "Светлая тема" : "Тёмная тема";
    if (icon) icon.textContent = theme === "dark" ? "◐" : "◑";
  }

  function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (e) {
      saved = null;
    }
    applyTheme(saved === "light" ? "light" : "dark");
  }

  /* ---------- sidebar ---------- */

  function renderNav(activeId) {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var html = '<div class="nav-label">Темы курса</div>';
    TOPICS.forEach(function (t) {
      var p = topicProgress(t);
      html +=
        '<a class="nav-item' +
        (t.id === activeId ? " active" : "") +
        (p.done ? " done" : "") +
        '" href="#/topic/' +
        esc(t.id) +
        '" title="' +
        esc(t.title) +
        '">' +
        '<span class="nav-num">' +
        esc(t.num) +
        "</span>" +
        '<span class="nav-title">' +
        esc(t.short) +
        "</span>" +
        '<span class="nav-score">' +
        p.best +
        "/" +
        p.total +
        "</span></a>";
    });
    nav.innerHTML = html;
  }

  function updateOverall() {
    var t = totals();
    var pct = document.getElementById("overallPct");
    var bar = document.getElementById("overallBar");
    var sub = document.getElementById("overallSub");
    if (pct) pct.textContent = t.pct + "%";
    if (bar) bar.style.width = t.pct + "%";
    if (sub) sub.textContent = t.best + " из " + t.total + " вопросов";
  }

  /* ---------- home ---------- */

  function renderHome() {
    var main = document.getElementById("main");
    var t = totals();
    var tasks = 0;
    TOPICS.forEach(function (topic) {
      tasks += topic.tasks.length;
    });

    var firstOpen = TOPICS[0];
    for (var i = 0; i < TOPICS.length; i++) {
      if (!topicProgress(TOPICS[i]).done) {
        firstOpen = TOPICS[i];
        break;
      }
    }
    var continueLabel = t.best > 0 ? "Продолжить: " + firstOpen.short : "Начать с " + firstOpen.short;

    var cards = TOPICS.map(function (topic) {
      var p = topicProgress(topic);
      var pct = p.total ? Math.round((p.best / p.total) * 100) : 0;
      return (
        '<a class="topic-card" href="#/topic/' +
        esc(topic.id) +
        '" style="--accent:' +
        esc(topic.accent) +
        '">' +
        '<div class="topic-card-top">' +
        '<span class="kicker">' +
        esc(topic.kicker) +
        "</span>" +
        (p.done ? '<span class="badge-done">пройдено</span>' : "") +
        "</div>" +
        "<h3>" +
        esc(topic.title) +
        "</h3>" +
        "<p>" +
        esc(topic.summary) +
        "</p>" +
        '<div class="card-meta"><span>' +
        topic.tasks.length +
        " задач</span><span>" +
        topic.quiz.length +
        " вопросов</span></div>" +
        '<div class="card-foot"><div class="meter"><span style="width:' +
        pct +
        '%"></span></div><span class="card-score">' +
        p.best +
        "/" +
        p.total +
        "</span></div>" +
        "</a>"
      );
    }).join("");

    main.innerHTML =
      '<div class="home">' +
      '<section class="home-hero"><div class="hero-inner">' +
      '<div class="kicker">' +
      esc(COURSE.name) +
      " · " +
      esc(COURSE.tagline) +
      "</div>" +
      "<h1>Пять тем. <em>Одна понятная картина.</em></h1>" +
      '<p class="lead">' +
      esc(COURSE.description) +
      " Каждый блок — короткая теория, разобранные задачи и тест с мгновенной проверкой ответа.</p>" +
      '<div class="hero-actions">' +
      '<a class="btn primary" href="#/topic/' +
      esc(firstOpen.id) +
      '">' +
      esc(continueLabel) +
      " →</a>" +
      '<a class="btn" href="#/topic/' +
      esc(TOPICS[TOPICS.length - 1].id) +
      '">Lab 7 · CV</a>' +
      "</div>" +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><b>' +
      TOPICS.length +
      "</b><span>тем</span></div>" +
      '<div class="hero-stat"><b>' +
      tasks +
      "</b><span>задач с решением</span></div>" +
      '<div class="hero-stat"><b>' +
      t.total +
      "</b><span>вопросов в квизах</span></div>" +
      '<div class="hero-stat"><b>' +
      t.best +
      "/" +
      t.total +
      "</b><span>твой прогресс</span></div>" +
      "</div></div></section>" +
      '<section class="block"><div class="section-head"><h2>Темы</h2><span>' +
      t.done +
      " из " +
      TOPICS.length +
      " пройдено</span></div>" +
      '<div class="topic-grid">' +
      cards +
      "</div></section>" +
      "</div>";
  }

  /* ---------- topic ---------- */

  function theoryCard(block, index) {
    return (
      '<article class="theory-card"><h3><span class="num">' +
      pad(index + 1) +
      "</span>" +
      esc(block.title) +
      '</h3><div class="prose">' +
      block.html +
      "</div></article>"
    );
  }

  function taskItem(task, index) {
    return (
      '<details class="task"><summary>' +
      '<span class="t-num">' +
      pad(index + 1) +
      "</span>" +
      '<span class="t-title">' +
      esc(task.title) +
      "</span>" +
      '<span class="t-chev">›</span>' +
      "</summary>" +
      '<div class="task-body">' +
      '<div class="task-q"><span class="label">Условие</span>' +
      task.question +
      "</div>" +
      (task.hint
        ? '<details class="task-hint"><summary>Подсказка</summary>' +
          '<div class="task-hint-body">' +
          task.hint +
          "</div></details>"
        : "") +
      '<details class="task-solution"><summary>Показать решение</summary>' +
      '<div class="task-a"><span class="label">Решение</span>' +
      task.answer +
      "</div></details></div></details>"
    );
  }

  function renderTopic(topic) {
    var main = document.getElementById("main");
    var p = topicProgress(topic);
    var i = topicIndex(topic);
    var prev = i > 0 ? TOPICS[i - 1] : null;
    var next = i < TOPICS.length - 1 ? TOPICS[i + 1] : null;

    var navHtml = '<nav class="topic-nav">';
    if (prev) {
      navHtml +=
        '<a href="#/topic/' +
        esc(prev.id) +
        '"><small>← Предыдущая</small><strong>' +
        esc(prev.short) +
        "</strong></a>";
    } else {
      navHtml += "<span></span>";
    }
    if (next) {
      navHtml +=
        '<a class="next" href="#/topic/' +
        esc(next.id) +
        '"><small>Следующая →</small><strong>' +
        esc(next.short) +
        "</strong></a>";
    } else {
      navHtml += '<a class="next" href="#/"><small>К началу →</small><strong>Все темы</strong></a>';
    }
    navHtml += "</nav>";

    main.innerHTML =
      '<div class="topic-page" style="--accent:' +
      esc(topic.accent) +
      '">' +
      '<a class="back" href="#/">← Все темы</a>' +
      '<header class="topic-head">' +
      '<div class="kicker">' +
      esc(topic.kicker) +
      "</div>" +
      "<h1>" +
      esc(topic.title) +
      "</h1>" +
      '<p class="lead">' +
      esc(topic.summary) +
      "</p>" +
      '<div class="chips">' +
      '<span class="chip">' +
      topic.tasks.length +
      " задач с решением</span>" +
      '<span class="chip">' +
      topic.quiz.length +
      " вопросов</span>" +
      '<span class="chip chip-muted">' +
      esc(topic.source) +
      "</span>" +
      "</div></header>" +
      '<section class="block"><div class="section-head"><h2>Теория</h2><span>' +
      topic.theory.length +
      " блока</span></div>" +
      '<div class="theory-grid">' +
      topic.theory.map(theoryCard).join("") +
      "</div></section>" +
      '<section class="block"><div class="section-head"><h2>Задачи и решения</h2><span>задача → подсказка → решение</span></div>' +
      topic.tasks.map(taskItem).join("") +
      "</section>" +
      '<section class="block quiz-block" id="quiz"><div class="section-head"><h2>Проверь себя</h2>' +
      '<span id="quizBest">лучший результат: ' +
      p.best +
      "/" +
      p.total +
      "</span></div>" +
      '<div class="quiz-shell" id="quizMount"></div></section>' +
      navHtml +
      "</div>";

    mountQuiz(topic);
  }

  /* ---------- quiz ---------- */

  function mountQuiz(topic) {
    var mount = document.getElementById("quizMount");
    if (!mount) return;

    var index = 0;
    var answers = new Array(topic.quiz.length).fill(null);
    var score = 0;

    function progressPct() {
      return Math.round(((index + 1) / topic.quiz.length) * 100);
    }

    function renderQuestion() {
      var q = topic.quiz[index];
      var answered = answers[index] !== null;
      var html =
        '<div class="quiz-top"><span class="q-index">Вопрос ' +
        (index + 1) +
        " из " +
        topic.quiz.length +
        '</span><span class="q-score">' +
        score +
        " верно</span></div>" +
        '<div class="meter quiz-meter"><span style="width:' +
        progressPct() +
        '%"></span></div>' +
        '<h3 class="q-text">' +
        esc(q.q) +
        "</h3>" +
        '<div class="options">';

      q.options.forEach(function (opt, optIndex) {
        var cls = "option";
        if (answered) {
          if (optIndex === q.correct) cls += " correct";
          else if (optIndex === answers[index]) cls += " wrong";
          else cls += " dim";
        }
        html +=
          '<button class="' +
          cls +
          '" type="button" data-opt="' +
          optIndex +
          '"' +
          (answered ? " disabled" : "") +
          '><span class="opt-key">' +
          LETTERS[optIndex] +
          "</span><span>" +
          esc(opt) +
          "</span></button>";
      });

      html += "</div>";

      if (answered) {
        var head =
          answers[index] === q.correct
            ? "<b>Верно.</b> "
            : "<b>Неверно.</b> Правильный ответ: <b>" + esc(q.options[q.correct]) + "</b>. ";
        html +=
          '<div class="explain">' +
          head +
          esc(q.explain) +
          "</div>";
      }

      html += '<div class="quiz-actions">';
      if (answered) {
        html +=
          '<button class="btn primary" type="button" id="qNext">' +
          (index === topic.quiz.length - 1 ? "Показать результат" : "Далее →") +
          "</button>";
      } else {
        html += '<span class="fine" style="margin:0">Выбери один вариант ответа</span>';
      }
      html += "</div>";

      mount.innerHTML = html;

      Array.prototype.forEach.call(mount.querySelectorAll("[data-opt]"), function (btn) {
        btn.addEventListener("click", function () {
          choose(Number(btn.getAttribute("data-opt")));
        });
      });

      var nextBtn = document.getElementById("qNext");
      if (nextBtn) nextBtn.addEventListener("click", advance);
    }

    function choose(optIndex) {
      if (answers[index] !== null) return;
      answers[index] = optIndex;
      if (optIndex === topic.quiz[index].correct) score += 1;
      renderQuestion();
    }

    function advance() {
      if (index < topic.quiz.length - 1) {
        index += 1;
        renderQuestion();
        return;
      }
      finish();
    }

    function finish() {
      var total = topic.quiz.length;
      var pct = total ? Math.round((score / total) * 100) : 0;

      var previous = progress[topic.id] || {};
      var previousBest = Number.isFinite(previous.best) ? previous.best : 0;
      if (score > previousBest) {
        progress[topic.id] = { best: score, total: total, at: Date.now() };
        saveProgress();
      }

      renderNav(topic.id);
      updateOverall();
      var bestLabel = document.getElementById("quizBest");
      if (bestLabel) {
        bestLabel.textContent = "лучший результат: " + Math.max(score, previousBest) + "/" + total;
      }

      var ringColor = pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--warn)" : "var(--bad)";
      var title;
      var message;
      if (pct === 100) {
        title = "Идеально";
        message = "Все вопросы закрыты. Можно переходить к следующей теме или вернуться к задачам.";
      } else if (pct >= 80) {
        title = "Хороший результат";
        message = "База уверенная. Разбери ошибки ниже, чтобы закрыть оставшиеся пробелы.";
      } else if (pct >= 50) {
        title = "Половина пути";
        message = "Вернись к теории и разобранным задачам, затем пройди квиз ещё раз.";
      } else {
        title = "Стоит вернуться к теории";
        message = "Начни с блока «Теория» и задач с решениями — потом возвращайся к вопросам.";
      }

      var wrong = [];
      topic.quiz.forEach(function (q, qi) {
        if (answers[qi] !== q.correct) {
          wrong.push({ q: q, chosen: answers[qi], index: qi });
        }
      });

      var review = '<div class="review">';
      if (wrong.length) {
        review += "<h4>Разбор ошибок · " + wrong.length + "</h4>";
        wrong.forEach(function (item) {
          review +=
            '<div class="review-item"><div class="rq">' +
            esc(item.q.q) +
            '</div><div class="ra">Правильно: <b>' +
            esc(item.q.options[item.q.correct]) +
            "</b>" +
            (item.chosen !== null ? " · Ты выбрал: " + esc(item.q.options[item.chosen]) : "") +
            "</div></div>";
        });
      } else {
        review += "<h4>Ошибок нет</h4><div class=\"review-empty\">Все ответы верные.</div>";
      }
      review += "</div>";

      var next = nextTopicOf(topic);
      var nextLabel = topicIndex(topic) === TOPICS.length - 1 ? "К первой теме →" : "Следующая тема →";

      mount.innerHTML =
        '<div class="quiz-result">' +
        '<div class="ring" style="--pct:' +
        pct +
        ";--ring:" +
        ringColor +
        '"><span>' +
        score +
        "/" +
        total +
        "<small>" +
        pct +
        "%</small></span></div>" +
        "<h3>" +
        esc(title) +
        "</h3><p>" +
        esc(message) +
        "</p>" +
        review +
        '<div class="quiz-actions" style="justify-content:center">' +
        '<button class="btn primary" type="button" id="qRestart">Пройти заново</button>' +
        '<a class="btn" href="#/topic/' +
        esc(next.id) +
        '">' +
        esc(nextLabel) +
        "</a></div></div>";

      var restart = document.getElementById("qRestart");
      if (restart) {
        restart.addEventListener("click", function () {
          index = 0;
          answers = new Array(topic.quiz.length).fill(null);
          score = 0;
          renderQuestion();
        });
      }

      var quizSection = document.getElementById("quiz");
      if (quizSection) quizSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    renderQuestion();
  }

  /* ---------- routing ---------- */

  function parseRoute() {
    var raw = String(location.hash || "").replace(/^#/, "");
    var path = raw.replace(/^\/+/, "");
    var parts = path.split("/").filter(Boolean);
    if (parts[0] === "topic" && parts[1]) {
      return { name: "topic", id: decodeURIComponent(parts[1]) };
    }
    return { name: "home" };
  }

  function render() {
    var route = parseRoute();
    var activeId = null;

    if (route.name === "topic") {
      var topic = findTopic(route.id);
      if (topic) {
        activeId = topic.id;
        document.title = topic.title + " · AI-2";
        renderTopic(topic);
      } else {
        document.title = "AI-2 · Тренажёр по темам";
        renderHome();
      }
    } else {
      document.title = "AI-2 · Тренажёр по темам";
      renderHome();
    }

    renderNav(activeId);
    updateOverall();
    window.scrollTo(0, 0);
  }

  /* ---------- data sanity check (console only) ---------- */

  function validateData() {
    var seen = {};
    TOPICS.forEach(function (t) {
      if (!t.id || seen[t.id]) console.warn("[trainer] duplicate or empty topic id:", t.id);
      seen[t.id] = true;
      if (!t.quiz || !t.quiz.length) console.warn("[trainer] topic without quiz:", t.id);
      (t.quiz || []).forEach(function (q, qi) {
        if (!q.options || q.options.length !== 4) {
          console.warn("[trainer] " + t.id + " q" + (qi + 1) + ": expected 4 options");
        }
        if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= (q.options || []).length) {
          console.warn("[trainer] " + t.id + " q" + (qi + 1) + ": bad correct index");
        }
      });
    });
  }

  /* ---------- boot ---------- */

  function boot() {
    if (!TOPICS.length) {
      document.getElementById("main").innerHTML =
        '<div class="home"><section class="home-hero"><div class="hero-inner">' +
        "<h1>Нет данных</h1><p class=\"lead\">Файлы тем не загрузились. Проверь порядок script-тегов в index.html.</p>" +
        "</div></section></div>";
      return;
    }

    initTheme();
    validateData();

    var themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
      });
    }

    var resetBtn = document.getElementById("resetProgress");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!window.confirm("Сбросить прогресс по всем темам? Это действие нельзя отменить.")) return;
        progress = {};
        saveProgress();
        render();
      });
    }

    window.addEventListener("hashchange", render);
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
