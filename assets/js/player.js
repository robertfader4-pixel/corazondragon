
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

  function $(id){ return document.getElementById(id); }

  var player = $("simple-player");
  var launcher = $("player-launcher");
  var playerHeader = $("simple-player-header");
  var minimizeBtn = $("player-minimize");
  var closeBtn = $("player-close");
  var playBtn = $("player-play");
  var prevBtn = $("player-prev");
  var nextBtn = $("player-next");
  var progress = $("player-progress");
  var audio = $("audio");
  var trackName = $("player-track-name");
  var themeName = $("player-theme-name");
  var playlist = $("player-playlist");

  if (!player || !launcher || !audio || !playBtn || !prevBtn || !nextBtn || !progress || !trackName || !themeName || !playlist) {
    return;
  }

  var body = document.body || document.getElementsByTagName("body")[0];
  var pageTheme = (body && body.getAttribute("data-theme")) || "main";
  var pageTrack = parseInt((body && body.getAttribute("data-track")) || "0", 10);
  if (isNaN(pageTrack)) pageTrack = 0;

  var storage = {
    get: function (key, fallback) {
      try {
        var value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, value); } catch (e) {}
    }
  };

  var currentTrack = parseInt(storage.get("simpleTrack", String(pageTrack)), 10);
  if (isNaN(currentTrack) || currentTrack < 0 || currentTrack >= tracks.length) currentTrack = pageTrack;
  var savedTime = parseFloat(storage.get("simpleTime", "0"));
  if (isNaN(savedTime) || savedTime < 0) savedTime = 0;
  var isPlaying = storage.get("simplePlaying", "false") === "true";
  var isMinimized = storage.get("simpleMinimized", "false") === "true";
  var wasOpen = storage.get("simpleOpen", "false") === "true";
  var previousTrack = parseInt(storage.get("simpleTrack", String(pageTrack)), 10);
  var trackChangedByPage = previousTrack !== pageTrack;

  function addClass(el, name){ if (el.classList) el.classList.add(name); else if ((" " + el.className + " ").indexOf(" " + name + " ") < 0) el.className += " " + name; }
  function removeClass(el, name){ if (el.classList) el.classList.remove(name); else el.className = (" " + el.className + " ").replace(" " + name + " ", " ").trim(); }
  function hasClass(el, name){ return el.classList ? el.classList.contains(name) : ((" " + el.className + " ").indexOf(" " + name + " ") >= 0); }

  function applyTheme(theme) {
    removeClass(player, "theme-main");
    removeClass(player, "theme-night");
    removeClass(player, "theme-light");
    removeClass(player, "theme-drama");
    addClass(player, "theme-" + theme);
    themeName.textContent = themeLabels[theme] || "Режим чтения";
  }

  function renderPlaylist() {
    playlist.innerHTML = "";
    for (var i = 0; i < tracks.length; i++) {
      (function(index){
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = tracks[index].name;
        if (index === currentTrack) addClass(btn, "active");
        btn.addEventListener("click", function () {
          loadTrack(index, true);
          renderPlaylist();
          safePlay();
        });
        playlist.appendChild(btn);
      })(i);
    }
  }

  function loadTrack(index, resetTime) {
    if (index < 0) index = 0;
    if (index >= tracks.length) index = 0;
    currentTrack = index;
    audio.src = tracks[index].src;
    trackName.textContent = tracks[index].name;
    storage.set("simpleTrack", String(index));
    if (resetTime) {
      try { audio.currentTime = 0; } catch (e) {}
      storage.set("simpleTime", "0");
    }
  }

  function safePlay() {
    var result;
    try {
      result = audio.play();
      if (result && typeof result.then === "function") {
        result.then(function () {
          playBtn.textContent = "⏸";
          storage.set("simplePlaying", "true");
        })["catch"](function () {
          playBtn.textContent = "▶";
          storage.set("simplePlaying", "false");
        });
      } else {
        playBtn.textContent = "⏸";
        storage.set("simplePlaying", "true");
      }
    } catch (e) {
      playBtn.textContent = "▶";
      storage.set("simplePlaying", "false");
    }
  }

  function safePause() {
    try { audio.pause(); } catch (e) {}
    playBtn.textContent = "▶";
    storage.set("simplePlaying", "false");
  }

  function openPlayer() {
    removeClass(player, "hidden");
    launcher.style.display = "none";
    storage.set("simpleOpen", "true");
    if (window.innerWidth <= 820) {
      player.style.left = "auto";
      player.style.top = "auto";
      player.style.right = "10px";
      player.style.bottom = "78px";
    }
  }

  function closePlayer() {
    addClass(player, "hidden");
    launcher.style.display = "block";
    storage.set("simpleOpen", "false");
  }

  function applyMinimized() {
    if (isMinimized) addClass(player, "minimized");
    else removeClass(player, "minimized");
  }

  applyTheme(pageTheme);
  loadTrack(pageTrack, trackChangedByPage);
  if (!trackChangedByPage) {
    try { audio.currentTime = savedTime; } catch (e) {}
  }
  renderPlaylist();
  applyMinimized();

  if (wasOpen) openPlayer();
  else closePlayer();

  launcher.addEventListener("click", function () {
    openPlayer();
  });

  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", function () {
      isMinimized = !isMinimized;
      storage.set("simpleMinimized", isMinimized ? "true" : "false");
      applyMinimized();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      closePlayer();
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
    renderPlaylist();
    safePlay();
  });

  prevBtn.addEventListener("click", function () {
    var prev = currentTrack - 1;
    if (prev < 0) prev = tracks.length - 1;
    loadTrack(prev, true);
    renderPlaylist();
    safePlay();
  });

  progress.addEventListener("input", function () {
    if (!audio.duration) return;
    try {
      audio.currentTime = (progress.value / 100) * audio.duration;
      storage.set("simpleTime", String(audio.currentTime));
    } catch (e) {}
  });

  audio.addEventListener("timeupdate", function () {
    var percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.value = percent;
    storage.set("simpleTime", String(audio.currentTime));
  });

  audio.addEventListener("ended", function () {
    var next = currentTrack + 1;
    if (next >= tracks.length) next = 0;
    loadTrack(next, true);
    renderPlaylist();
    safePlay();
  });

  if (isPlaying) safePlay();
  else playBtn.textContent = "▶";

  // Drag support: mouse + touch
  var dragActive = false;
  var offsetX = 0;
  var offsetY = 0;

  function getPoint(evt) {
    if (evt.touches && evt.touches.length) return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    return { x: evt.clientX, y: evt.clientY };
  }

  function startDrag(evt) {
    if (hasClass(player, "hidden")) return;
    if (window.innerWidth <= 820) return;
    var point = getPoint(evt);
    var rect = player.getBoundingClientRect();
    dragActive = true;
    offsetX = point.x - rect.left;
    offsetY = point.y - rect.top;
    player.style.left = rect.left + "px";
    player.style.top = rect.top + "px";
    player.style.right = "auto";
    player.style.bottom = "auto";
    if (evt.preventDefault) evt.preventDefault();
  }

  function moveDrag(evt) {
    if (!dragActive) return;
    if (window.innerWidth <= 820) return;
    var point = getPoint(evt);
    var x = point.x - offsetX;
    var y = point.y - offsetY;
    var maxX = window.innerWidth - player.offsetWidth - 6;
    var maxY = window.innerHeight - player.offsetHeight - 6;
    if (x < 6) x = 6;
    if (y < 6) y = 6;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;
    player.style.left = x + "px";
    player.style.top = y + "px";
  }

  function endDrag() {
    dragActive = false;
  }

  if (playerHeader) {
    playerHeader.addEventListener("mousedown", startDrag);
    playerHeader.addEventListener("touchstart", startDrag, { passive: false });
  }
  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("touchmove", moveDrag, { passive: false });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
})();


  window.addEventListener("resize", function () {
    if (window.innerWidth <= 820) {
      player.style.left = "auto";
      player.style.top = "auto";
      player.style.right = "10px";
      player.style.bottom = "78px";
    }
  });
