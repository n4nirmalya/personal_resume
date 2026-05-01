const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Intersection Observer for general "reveal" animations
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Fixed-Scene Scrollytelling Logic (Interpolated & Bidirectional)
const experienceSection = document.querySelector(".experience-fixed");
const scrollTrigger = document.querySelector(".scroll-trigger");
const jobStages = document.querySelectorAll(".job-stage");
const skillItems = document.querySelectorAll(".skill-progress-item");

const progressionMap = {
  0: { backend: 0, frontend: 0, cloud: 0, data: 0 },
  1: { backend: 15, frontend: 15, cloud: 5, data: 10 }, // Academic
  2: { backend: 40, frontend: 50, cloud: 25, data: 30 }, // Full-Stack
  3: { backend: 70, frontend: 75, cloud: 60, data: 55 }, // Senior MERN
  4: { backend: 95, frontend: 85, cloud: 90, data: 95 }  // Senior Backend
};

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function updateExperienceScene() {
  if (!experienceSection || !scrollTrigger) return;

  const rect = experienceSection.getBoundingClientRect();
  const triggerHeight = scrollTrigger.offsetHeight;
  const relativeScroll = -rect.top / triggerHeight;
  const clampedScroll = Math.min(Math.max(relativeScroll, 0), 1);

  // Determine which segment of the story we are in
  const totalStages = jobStages.length;
  const rawStage = clampedScroll * (totalStages - 1); 
  const stageIndex = Math.floor(rawStage);
  const stageProgress = rawStage - stageIndex;

  // 1. Update Job Stages (Slides)
  const currentJobIndex = Math.min(Math.floor(clampedScroll * totalStages), totalStages - 1);
  jobStages.forEach((stage, idx) => {
    stage.classList.toggle("active", idx === currentJobIndex);
  });

  // 2. Interpolate Skills (Pixel-by-pixel growth)
  const startMap = progressionMap[stageIndex] || progressionMap[0];
  const endMap = progressionMap[stageIndex + 1] || progressionMap[totalStages];
  
  skillItems.forEach(item => {
    const skillName = item.dataset.skill;
    const startVal = startMap[skillName] || 0;
    const endVal = endMap[skillName] || 0;
    
    // Interpolated value
    const currentVal = Math.round(lerp(startVal, endVal, stageProgress));
    
    const fill = item.querySelector(".fill");
    const levelText = item.querySelector(".level");
    
    if (fill) {
      fill.style.transition = "none";
      fill.style.width = `${currentVal}%`;
    }
    if (levelText) levelText.textContent = `${currentVal}%`;
  });

  isTicking = false;
}

window.addEventListener("scroll", () => {
  if (!isTicking) {
    window.requestAnimationFrame(updateExperienceScene);
    isTicking = true;
  }
});

window.addEventListener("resize", updateExperienceScene);
updateExperienceScene();

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.textContent = "☰";
    });
  });
}

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll <= 0) {
    header.style.transform = "translateY(0)";
    header.style.boxShadow = "none";
    return;
  }

  if (currentScroll > lastScroll) {
    // Scrolling down - hide header
    header.style.transform = "translateY(-100%)";
  } else {
    // Scrolling up - show header with shadow
    header.style.transform = "translateY(0)";
    header.style.boxShadow = "var(--shadow-xl)";
  }
  lastScroll = currentScroll;
});
