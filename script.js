const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// General Visibility Observer (Hero, Bento, Job Stages)
const visibilityObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        
        // Mobile-specific: Reset and trigger water-fill animations
        if (entry.target.classList.contains("job-stage")) {
          const fills = entry.target.querySelectorAll(".water-fill");
          fills.forEach(fill => {
            const targetW = fill.closest(".matrix-item").style.getPropertyValue("--w") || "0%";
            // Force reset to 0 to ensure animation plays from start every time it's revealed
            fill.style.transition = "none";
            fill.style.width = "0%";
            // Reflow to ensure transition-none takes effect
            fill.offsetHeight; 
            // Smoothly animate to target
            fill.style.transition = "width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
            fill.style.width = targetW;
          });
        }
      } else {
        // Remove visible class to allow re-triggering when scrolling back into view
        entry.target.classList.remove("visible");
        if (entry.target.classList.contains("job-stage")) {
          const fills = entry.target.querySelectorAll(".water-fill");
          fills.forEach(fill => {
            fill.style.transition = "none";
            fill.style.width = "0%";
          });
        }
      }
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
);

// Observe elements that need scroll-triggered visibility
document.querySelectorAll(".reveal, .job-stage, .skill-progress-item, .bento-card").forEach((el) => {
  visibilityObserver.observe(el);
});

// Fixed-Scene Scrollytelling Logic (Interpolated & Bidirectional)
const experienceSection = document.querySelector(".experience-fixed");
const scrollTrigger = document.querySelector(".scroll-trigger");
const jobStages = document.querySelectorAll(".job-stage");
const skillItems = document.querySelectorAll(".skill-progress-item");
const mobileDockItems = document.querySelectorAll(".dock-item");

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

let isTicking = false;

function updateExperienceScene() {
  if (!experienceSection) return;

  const isMobile = window.innerWidth <= 900 || !scrollTrigger || getComputedStyle(scrollTrigger).display === 'none';

  if (isMobile) {
    // Mobile Animation Logic: Sync dock with visible job card
    let activeStageIndex = 0;
    jobStages.forEach((stage, idx) => {
      const rect = stage.getBoundingClientRect();
      // If stage is in the upper half of viewport, consider it the "current" one
      if (rect.top < window.innerHeight * 0.6 && rect.bottom > 200) {
        activeStageIndex = idx + 1;
      }
    });

    if (activeStageIndex > 0) {
      const levels = progressionMap[activeStageIndex];
      mobileDockItems.forEach(item => {
        const skillName = item.dataset.miniSkill;
        const targetLevel = levels[skillName];
        const fill = item.querySelector(".fill");
        if (fill) {
          fill.style.width = `${targetLevel}%`;
        }
      });
      // Also sync the main skill bars in the section if visible
      skillItems.forEach(item => {
        const skillName = item.dataset.skill;
        const targetLevel = levels[skillName];
        const fill = item.querySelector(".fill");
        const levelText = item.querySelector(".level");
        if (fill) {
          fill.style.transition = "width 0.6s ease";
          fill.style.width = `${targetLevel}%`;
        }
        if (levelText) levelText.textContent = `${targetLevel}%`;
      });
    }
    isTicking = false;
    return;
  }

  // Desktop Logic (Existing Interpolation)
  const rect = experienceSection.getBoundingClientRect();
  const triggerHeight = scrollTrigger.offsetHeight;
  const relativeScroll = -rect.top / triggerHeight;
  const clampedScroll = Math.min(Math.max(relativeScroll, 0), 1);

  const totalStages = jobStages.length;
  const rawStage = clampedScroll * (totalStages - 1); 
  const stageIndex = Math.floor(rawStage);
  const stageProgress = rawStage - stageIndex;

  const currentJobIndex = Math.min(Math.floor(clampedScroll * totalStages), totalStages - 1);
  jobStages.forEach((stage, idx) => {
    stage.classList.toggle("active", idx === currentJobIndex);
  });

  const startMap = progressionMap[stageIndex] || progressionMap[0];
  const endMap = progressionMap[stageIndex + 1] || progressionMap[totalStages];
  
  skillItems.forEach(item => {
    const skillName = item.dataset.skill;
    const startVal = startMap[skillName] || 0;
    const endVal = endMap[skillName] || 0;
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

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.textContent = "☰";
    });
  });
}

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
    header.style.transform = "translateY(-100%)";
  } else {
    header.style.transform = "translateY(0)";
    header.style.boxShadow = "var(--shadow-xl)";
  }
  lastScroll = currentScroll;
});
