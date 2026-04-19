

const tracks = [
  { name: "Огненный поцелуй", src: "assets/audio/besodefuego.mp3" },
  { name: "Сердце дракона", src: "assets/audio/corazondedragon.mp3" },
  { name: "Любовь дракона", src: "assets/audio/elamordeldragon.mp3" },
  { name: "Солнечный ветер", src: "assets/audio/vientodelsol.mp3" },
  { name: "Лети", src: "assets/audio/vuela.mp3" }
];


const themeLabels = {
  main: "Главная тема",
  night: "Ночная атмосфера",
  light: "Свет и покой",
  drama: "Драматическая сцена"
};

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progress = document.getElementById("progress");
const trackName = document.getElementById("track-name");
const chapterTheme = document.getElementById("chapter-theme");
const player = document.getElementById("music-player");

if (audio && playBtn && prevBtn && nextBtn && progress && trackName && chapterTheme && player) {
  const pageTrack = parseInt(document.body.dataset.track ?? "0", 10);
  const pageTheme = document.body.dataset.theme ?? "main";

  let currentTrack = parseInt(localStorage.getItem("immersiveTrack") ?? String(pageTrack), 10);
  let isPlaying = localStorage.getItem("immersivePlaying") === "true";
  let savedTime = parseFloat(localStorage.getItem("immersiveTime") ?? "0");

  function applyTheme(theme) {
    player.classList.remove("theme-main", "theme-night", "theme-light", "theme-drama");
    player.classList.add(`theme-${theme}`);
    chapterTheme.textContent = themeLabels[theme] ?? "Режим чтения";
  }

  function loadTrack(index, resetTime = false) {
    currentTrack = index;
    audio.src = tracks[index].src;
    trackName.textContent = tracks[index].name;
    localStorage.setItem("immersiveTrack", String(index));
    if (resetTime) {
      audio.currentTime = 0;
      localStorage.setItem("immersiveTime", "0");
    }
  }

  applyTheme(pageTheme);

  const previousTrack = parseInt(localStorage.getItem("immersiveTrack") ?? "-1", 10);
  const trackChangedByPage = previousTrack !== pageTrack;

  loadTrack(pageTrack, trackChangedByPage);

  if (!trackChangedByPage && !Number.isNaN(savedTime)) {
    audio.currentTime = savedTime;
  }

  if (isPlaying) {
    audio.play().then(() => {
      playBtn.textContent = "⏸";
    }).catch(() => {
      playBtn.textContent = "▶";
      localStorage.setItem("immersivePlaying", "false");
    });
  } else {
    playBtn.textContent = "▶";
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.textContent = "⏸";
        localStorage.setItem("immersivePlaying", "true");
      }).catch(() => {});
    } else {
      audio.pause();
      playBtn.textContent = "▶";
      localStorage.setItem("immersivePlaying", "false");
    }
  });

  nextBtn.addEventListener("click", () => {
    const next = (currentTrack + 1) % tracks.length;
    loadTrack(next, true);
    audio.play().then(() => {
      playBtn.textContent = "⏸";
      localStorage.setItem("immersivePlaying", "true");
    }).catch(() => {});
  });

  prevBtn.addEventListener("click", () => {
    const prev = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(prev, true);
    audio.play().then(() => {
      playBtn.textContent = "⏸";
      localStorage.setItem("immersivePlaying", "true");
    }).catch(() => {});
  });

  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.value = percent;
    localStorage.setItem("immersiveTime", String(audio.currentTime));
  });

  progress.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (progress.value / 100) * audio.duration;
    localStorage.setItem("immersiveTime", String(audio.currentTime));
  });

  audio.addEventListener("ended", () => {
    const next = (currentTrack + 1) % tracks.length;
    loadTrack(next, true);
    audio.play().then(() => {
      playBtn.textContent = "⏸";
      localStorage.setItem("immersivePlaying", "true");
    }).catch(() => {});
  });
}


const minimizedToggle = document.getElementById("minimized-player-toggle");

if (audio && playBtn && prevBtn && nextBtn && progress && trackName && chapterTheme && player && minimizedToggle) {
  let isMinimized = localStorage.getItem("immersiveMinimized");
  if (isMinimized === null) {
    isMinimized = "true";
    localStorage.setItem("immersiveMinimized", "true");
  }

  function applyMinimizedState() {
    const minimized = localStorage.getItem("immersiveMinimized") === "true";
    player.classList.toggle("is-minimized", minimized);
    minimizedToggle.textContent = minimized ? "＋" : "—";
    minimizedToggle.setAttribute("aria-label", minimized ? "expand player" : "minimize player");
  }

  minimizedToggle.addEventListener("click", () => {
    const nextState = !(localStorage.getItem("immersiveMinimized") === "true");
    localStorage.setItem("immersiveMinimized", String(nextState));
    applyMinimizedState();
  });

  applyMinimizedState();
}


const heartBtn = document.getElementById("heart-player");

if(player && heartBtn){
  heartBtn.addEventListener("click", ()=>{
    player.classList.remove("hidden");
    heartBtn.style.display = "none";
  });

  const minimizedToggle = document.getElementById("minimized-player-toggle");
  if(minimizedToggle){
    minimizedToggle.addEventListener("click", ()=>{
      const minimized = player.classList.contains("is-minimized");
      if(minimized){
        player.classList.add("hidden");
        heartBtn.style.display = "block";
      }
    });
  }
}
