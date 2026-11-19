const targetDate = new Date("2026-11-21T00:00:00+02:00");

function updateCountdown() {
  const remaining = Math.max(0, targetDate.getTime() - Date.now());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 30000);

document.getElementById("openGift").addEventListener("click", () => {
  document.getElementById("chapters").scrollIntoView({ behavior: "smooth" });
});

const chapters = [...document.querySelectorAll(".chapter")];
const chapterProgress = document.getElementById("chapterProgress");

function updateChapterProgress() {
  const completed = chapters.filter((chapter) => chapter.classList.contains("complete")).length;
  chapterProgress.style.width = `${completed * 20}%`;
}

chapters.forEach((chapter) => {
  const toggle = chapter.querySelector(".chapter-toggle");
  toggle.addEventListener("click", () => {
    if (toggle.disabled) return;
    const isOpen = chapter.classList.contains("open");
    chapter.classList.toggle("open", !isOpen);
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  chapter.querySelector(".chapter-action").addEventListener("click", () => {
    if (chapter.classList.contains("complete")) return;
    chapter.classList.remove("open");
    chapter.classList.add("complete");
    toggle.setAttribute("aria-expanded", "false");
    chapter.querySelector(".chapter-state").textContent = "تم";

    const nextChapter = chapters[chapters.indexOf(chapter) + 1];
    if (nextChapter) {
      nextChapter.classList.add("unlocked");
      const nextToggle = nextChapter.querySelector(".chapter-toggle");
      nextToggle.disabled = false;
      nextToggle.setAttribute("aria-expanded", "false");
      nextChapter.querySelector(".chapter-state").textContent = "جاهز";
      nextChapter.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      document.getElementById("letterCard").classList.add("open");
      document.getElementById("letterCard").querySelector(".letter-back").setAttribute("aria-hidden", "false");
      launchConfetti();
      setTimeout(() => document.querySelector(".letter-section").scrollIntoView({ behavior: "smooth" }), 500);
    }
    updateChapterProgress();
  });
});

const letterCard = document.getElementById("letterCard");
document.getElementById("openLetter").addEventListener("click", () => {
  document.getElementById("chapters").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("closeLetter").addEventListener("click", () => {
  letterCard.classList.remove("open");
  letterCard.querySelector(".letter-back").setAttribute("aria-hidden", "true");
});

const photoInput = document.getElementById("photoInput");
let activePhoto = null;
document.querySelectorAll(".photo").forEach((button) => {
  button.addEventListener("click", () => {
    activePhoto = button;
    photoInput.click();
  });
});
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file || !activePhoto) return;
  const reader = new FileReader();
  reader.onload = () => {
    activePhoto.style.backgroundImage = `url("${reader.result}")`;
    activePhoto.querySelector("span:first-child").textContent = "تمت إضافة الصورة";
  };
  reader.readAsDataURL(file);
});

let audioContext = null;
let ambient = null;
const soundButton = document.getElementById("soundButton");
soundButton.addEventListener("click", () => {
  if (!audioContext) audioContext = new AudioContext();
  if (ambient) {
    ambient.forEach((node) => node.stop());
    ambient = null;
    soundButton.classList.remove("playing");
    document.getElementById("soundLabel").textContent = "صوت";
    return;
  }

  ambient = [261.63, 329.63, 392].map((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.018 : 0.008;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    return oscillator;
  });
  soundButton.classList.add("playing");
  document.getElementById("soundLabel").textContent = "شغال";
});

function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ["#c9a44f", "#eedb9e", "#f2ead8", "#080808"];
  const pieces = Array.from({ length: 120 }, () => ({
    x: canvas.width * 0.5 + (Math.random() - 0.5) * 220,
    y: canvas.height * 0.65,
    vx: (Math.random() - 0.5) * 10,
    vy: -Math.random() * 12 - 4,
    size: Math.random() * 7 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.18;
      piece.rotation += 0.08;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
      ctx.restore();
    });
    frame += 1;
    if (frame < 160) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}
