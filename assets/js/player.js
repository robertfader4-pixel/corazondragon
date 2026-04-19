
(function () {
  var tracks = [
    { name: "Огненный поцелуй", src: "assets/audio/besodefuego.mp3" },
    { name: "Сердце дракона", src: "assets/audio/corazondedragon.mp3" },
    { name: "Любовь дракона", src: "assets/audio/elamordeldragon.mp3" },
    { name: "Солнечный ветер", src: "assets/audio/vientodelsol.mp3" },
    { name: "Лети", src: "assets/audio/vuela.mp3" }
  ];

  var themeLabels = {
    main: "Главная тема",
    night: "Ночная атмосфера",
    light: "Свет и покой",
    drama: "Драматическая сцена"
  };

  var audio = document.getElementById("audio");
  var playBtn = document.getElementById("play-btn");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");
  var progress = document.getElementById("progress");
  var trackName = document.getElementById("track-name");
  var chapterTheme = document.getElementById("chapter-theme");
  var player = document.getElementById("music-player");
  var heartBtn = document.getElementById("heart-player");
  var minimizedToggle = document.getElementById("minimized-player-toggle");

  if (!audio || !playBtn || !prevBtn || !nextBtn || !progress || !trackName || !chapterTheme || !player) {
    return;
  }

  var body = document.body || document.getElementsByTagName("body")[0];
  var pageTrack = 0;
  var pageTheme = "main";

  if (body && body.getAttribute("data-track")) {
    pageTrack = parseInt(body.getAttribute("data-track"), 10);
    if (isNaN(pageTrack)) pageTrack = 0;
  }
  if (body && body.getAttribute("data-theme")) {
    pageTheme = body.getAttribute("data-theme") || "main";
  }

  var storage = {
    get: function (key, fallback) {
      try {
        var value = window.localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {}
    }
  };

  var currentTrack = parseInt(storage.get("immersiveTrack", String(pageTrack)), 10);
  if (isNaN(currentTrack) || currentTrack < 0 || currentTrack >= tracks.length) {
    currentTrack = pageTrack;
  }

  var savedTime = parseFloat(storage.get("immersiveTime", "0"));
  if (isNaN(savedTime) || savedTime < 0) savedTime = 0;

  var isPlaying = storage.get("immersivePlaying", "false") === "true";
  var isMinimized = storage.get("immersiveMinimized", "true") === "true";
  var previousTrack = parseInt(storage.get("immersiveTrack", String(pageTrack)), 10);
  if (isNaN(previousTrack)) previousTrack = pageTrack;
  var trackChangedByPage = previousTrack !== pageTrack;

  function addClass(el, name) {
    if (!el) return;
    if (el.classList) el.classList.add(name);
    else if ((" " + el.className + " ").indexOf(" " + name + " ") < 0) el.className += " " + name;
  }

  function removeClass(el, name) {
    if (!el) return;
    if (el.classList) el.classList.remove(name);
    else el.className = (" " + el.className + " ").replace(" " + name + " ", " ").trim();
  }

  function toggleClass(el, name, state) {
    if (state) addClass(el, name);
    else removeClass(el, name);
  }

  function applyTheme(theme) {
    removeClass(player, "theme-main");
    removeClass(player, "theme-night");
    removeClass(player, "theme-light");
    removeClass(player, "theme-drama");
    addClass(player, "theme-" + theme);
    chapterTheme.textContent = themeLabels[theme] || "Режим чтения";
  }

  function loadTrack(index, resetTime) {
    if (index < 0) index = 0;
    if (index >= tracks.length) index = 0;
    currentTrack = index;
    audio.src = tracks[index].src;
    trackName.textContent = tracks[index].name;
    storage.set("immersiveTrack", String(index));
    if (resetTime) {
      try { audio.currentTime = 0; } catch (e) {}
      storage.set("immersiveTime", "0");
    }
  }

  function safePlay() {
    var result;
    try {
      result = audio.play();
      if (result && typeof result.then === "function") {
        result.then(function () {
          playBtn.textContent = "⏸";
          storage.set("immersivePlaying", "true");
        })["catch"](function () {
          playBtn.textContent = "▶";
          storage.set("immersivePlaying", "false");
        });
      } else {
        playBtn.textContent = "⏸";
        storage.set("immersivePlaying", "true");
      }
    } catch (e) {
      playBtn.textContent = "▶";
      storage.set("immersivePlaying", "false");
    }
  }

  function safePause() {
    try { audio.pause(); } catch (e) {}
    playBtn.textContent = "▶";
    storage.set("immersivePlaying", "false");
  }

  function openPlayer() {
    removeClass(player, "hidden");
    if (heartBtn) heartBtn.style.display = "none";
  }

  function closePlayerToHeart() {
    addClass(player, "hidden");
    if (heartBtn) heartBtn.style.display = "block";
  }

  function applyMinimizedState() {
    toggleClass(player, "is-minimized", isMinimized);
    if (minimizedToggle) {
      minimizedToggle.textContent = isMinimized ? "＋" : "—";
      minimizedToggle.setAttribute("aria-label", isMinimized ? "expand player" : "minimize player");
    }
  }

  applyTheme(pageTheme);
  loadTrack(pageTrack, trackChangedByPage);

  if (!trackChangedByPage) {
    try { audio.currentTime = savedTime; } catch (e) {}
  }

  applyMinimizedState();
  closePlayerToHeart();

  if (heartBtn) {
    heartBtn.addEventListener("click", function () {
      openPlayer();
      isMinimized = false;
      storage.set("immersiveMinimized", "false");
      applyMinimizedState();
    });
  }

  if (minimizedToggle) {
    minimizedToggle.addEventListener("click", function () {
      isMinimized = !isMinimized;
      storage.set("immersiveMinimized", isMinimized ? "true" : "false");
      applyMinimizedState();
      if (isMinimized) {
        closePlayerToHeart();
      } else {
        openPlayer();
      }
    });
  }

  playBtn.addEventListener("click", function () {
    if (audio.paused) safePlay();
    else safePause();
  });

  nextBtn.addEventListener("click", function () {
    var next = currentTrack + 1;
    if (next >= tracks.length) next = 0;
    loadTrack(next, true);
    openPlayer();
    safePlay();
  });

  prevBtn.addEventListener("click", function () {
    var prev = currentTrack - 1;
    if (prev < 0) prev = tracks.length - 1;
    loadTrack(prev, true);
    openPlayer();
    safePlay();
  });

  audio.addEventListener("timeupdate", function () {
    var percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.value = percent;
    storage.set("immersiveTime", String(audio.currentTime));
  });

  progress.addEventListener("input", function () {
    if (!audio.duration) return;
    try {
      audio.currentTime = (progress.value / 100) * audio.duration;
      storage.set("immersiveTime", String(audio.currentTime));
    } catch (e) {}
  });

  audio.addEventListener("ended", function () {
    var next = currentTrack + 1;
    if (next >= tracks.length) next = 0;
    loadTrack(next, true);
    safePlay();
  });

  if (isPlaying) {
    safePlay();
  } else {
    playBtn.textContent = "▶";
  }
})();
