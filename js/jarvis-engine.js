/**
 * BAKAR VAI - JARVIS ENGINE
 * Manages the synchronized Arc Reactor ACTIVATE sequence with bakar_06.png,
 * background soundtrack cross-fader (no music bar), 3D holographic tilt,
 * biometric telemetry dials, and HUD navigation.
 */

class JarvisEngine {
  constructor() {
    this.tracks = {
      6: { id: 6, title: "Jericho Detonation", file: "Music/06.mp3" },
      1: { id: 1, title: "Summit Inventions", file: "Music/01.mp3" },
      2: { id: 2, title: "Turf Sports Spirit", file: "Music/02.mp3" },
      3: { id: 3, title: "Coastal Happy Life", file: "Music/03.mp3" },
      4: { id: 4, title: "River Sci-Fi Voyage", file: "Music/04.mp3" },
      5: { id: 5, title: "Hustle Sudden Tour", file: "Music/05.mp3" }
    };

    this.currentTrackId = 6;
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.loop = true;
    this.isMuted = false;
    this.isActivated = false;

    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this._setupActivationFlow();
      this._setupAudioToggle();
      this._setupHologramCards();
      this._setupCarousel();
      this._setupTelemetryObserver();
      this._setupDockNav();
      this._setupForm();
      this._setupDesktopToggle();
    });
  }

  /* ==========================================================================
     1. 5-SECOND ARC REACTOR IGNITION & MISSILE BLAST SEQUENCE
     ========================================================================== */
  _setupActivationFlow() {
    const activateBtn = document.getElementById("btn-activate-core");
    const standbyScreen = document.getElementById("standby-screen");
    const activationStage = document.getElementById("activation-stage");
    const flashOverlay = document.getElementById("arc-flash-overlay");
    const chargeGauge = document.getElementById("arc-charge-gauge");
    const chargeBar = document.getElementById("arc-charge-bar");
    const statusText = document.getElementById("standby-status-text");
    const coils = document.querySelectorAll(".arc-coil");
    const redetonateBtn = document.getElementById("btn-redetonate");

    if (!activateBtn) return;

    activateBtn.addEventListener("click", () => {
      if (this.isActivated) return;
      this.isActivated = true;

      // Start 5-second Arc Reactor charging animation
      standbyScreen.classList.add("charging");
      activateBtn.textContent = "CHARGING...";
      activateBtn.style.color = "var(--stark-gold)";
      activateBtn.style.borderColor = "var(--stark-gold)";
      activateBtn.style.pointerEvents = "none";

      if (chargeGauge) chargeGauge.style.display = "block";

      // 1. Synthesize audio charging whine via Web Audio API (60Hz -> 880Hz over 5s)
      this._playCapacitorChargingAudio(5.0);

      // 2. Sequential coil ignition across 5 seconds (10 coils, one every ~450ms)
      coils.forEach((coil, idx) => {
        setTimeout(() => {
          coil.classList.add("ignited");
          if (navigator.vibrate) navigator.vibrate(15);
        }, idx * 450);
      });

      // 3. Smooth 5-second progress bar and status telemetry updates
      const startTime = Date.now();
      const durationMs = 5000;

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(Math.round((elapsed / durationMs) * 100), 100);

        if (chargeBar) chargeBar.style.width = `${pct}%`;

        if (statusText) {
          if (pct < 25) {
            statusText.innerHTML = `<span class="arc-dot"></span> PALLADIUM CORE IGNITED: ${pct}%`;
          } else if (pct < 55) {
            statusText.innerHTML = `<span class="arc-dot" style="background:var(--stark-gold)"></span> CHARGING CAPACITORS: ${pct}% • 1.8 GJ`;
          } else if (pct < 85) {
            statusText.innerHTML = `<span class="arc-dot" style="background:#ffffff"></span> CONTAINMENT SPINNING: ${pct}% • 3.2 GJ`;
          } else {
            statusText.innerHTML = `<span class="arc-dot" style="background:var(--stark-red)"></span> CRITICAL OVERLOAD: ${pct}% • JERICHO ARMED!`;
          }
        }

        if (pct >= 100) {
          clearInterval(progressInterval);
        }
      }, 50);

      // 4. AT EXACTLY 5.0 SECONDS (5000ms): MISSILE BLAST DETONATION!
      setTimeout(() => {
        // Flash overlay
        if (flashOverlay) {
          flashOverlay.classList.add("flash");
          setTimeout(() => flashOverlay.classList.remove("flash"), 350);
        }

        // Show Bakar_06 in full missile blast posture
        if (activationStage) {
          activationStage.classList.add("active", "stage-blast");
        }

        // Camera Violent Screen Shake
        document.body.classList.remove("screen-detonate-shake");
        void document.body.offsetWidth;
        document.body.classList.add("screen-detonate-shake");
        setTimeout(() => document.body.classList.remove("screen-detonate-shake"), 1200);

        // Haptic rumble
        if (navigator.vibrate) navigator.vibrate([150, 60, 250, 50, 300]);

        // Audio Ignition: Blast 06.mp3 (Jericho) at full volume!
        this.playTrack(6);
      }, 5000);

      // 5. Dissolve Standby Screen into full JARVIS interface after missile blast
      setTimeout(() => {
        if (standbyScreen) {
          standbyScreen.classList.add("dissolved");
        }
      }, 7200);
    });

    // Re-detonate trigger in Hero section
    if (redetonateBtn) {
      redetonateBtn.addEventListener("click", () => {
        if (navigator.vibrate) navigator.vibrate([80, 120, 200]);

        document.body.classList.remove("screen-detonate-shake");
        void document.body.offsetWidth;
        document.body.classList.add("screen-detonate-shake");

        // Replay 06.mp3
        this.playTrack(6);

        const heroImg = document.querySelector(".hero-img");
        if (heroImg) {
          heroImg.style.filter = "brightness(2) contrast(1.4)";
          setTimeout(() => {
            heroImg.style.filter = "contrast(1.15) saturate(1.2)";
          }, 450);
        }
      });
    }
  }

  /* Synthesizes a sci-fi capacitor charging whine building over durationSec */
  _playCapacitorChargingAudio(durationSec) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      // Rise smoothly to 880Hz at 5s
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + durationSec);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + (durationSec * 0.8));
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec + 0.15);
    } catch (e) {
      console.log("Audio synthesis notice:", e);
    }
  }

  /* ==========================================================================
     2. BACKGROUND SOUNDTRACK ENGINE (NO MUSIC BAR)
     ========================================================================== */
  playTrack(trackNumber) {
    const track = this.tracks[trackNumber];
    if (!track) return;

    this.currentTrackId = trackNumber;
    this.audio.src = track.file;
    this.audio.muted = this.isMuted;

    this.audio.play().then(() => {
      this._updateAudioToggleUI(true);
    }).catch((err) => {
      console.log("Audio autoplay policy notice:", err);
    });
  }

  _setupAudioToggle() {
    const toggle = document.getElementById("hud-audio-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      if (this.audio.paused) {
        this.audio.play();
        this._updateAudioToggleUI(true);
      } else {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        this._updateAudioToggleUI(!this.isMuted);
      }
    });
  }

  _updateAudioToggleUI(isPlaying) {
    const toggle = document.getElementById("hud-audio-toggle");
    const label = document.getElementById("audio-toggle-label");
    if (!toggle) return;

    toggle.classList.toggle("playing", isPlaying);
    if (label) {
      label.textContent = isPlaying ? "JARVIS AUDIO [ON]" : "JARVIS AUDIO [MUTED]";
    }
  }

  /* ==========================================================================
     3. 3D GYRO / PARALLAX TILT ON HOLOGRAPHIC CARDS
     ========================================================================== */
  _setupHologramCards() {
    const cards = document.querySelectorAll(".vision-card");

    cards.forEach((card) => {
      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(700px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      };

      const handleReset = () => {
        card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleReset);
      card.addEventListener("touchmove", handleMove, { passive: true });
      card.addEventListener("touchend", handleReset);
    });
  }

  /* ==========================================================================
     4. TOUCH CAROUSEL & DYNAMIC SOUNDTRACK SWITCHING
     ========================================================================== */
  _setupCarousel() {
    const carousel = document.getElementById("visions-carousel");
    const slides = document.querySelectorAll(".vision-slide");
    const dotsContainer = document.getElementById("carousel-dots");

    if (!carousel || slides.length === 0) return;

    // Create dots
    dotsContainer.innerHTML = "";
    slides.forEach((slide, i) => {
      const dot = document.createElement("div");
      dot.className = `c-dot ${i === 0 ? "active" : ""}`;
      dot.addEventListener("click", () => {
        slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll(".c-dot");

    // IntersectionObserver to detect active slide and switch music
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Array.from(slides).indexOf(entry.target);
          dots.forEach((d, i) => d.classList.toggle("active", i === index));

          const trackId = parseInt(entry.target.getAttribute("data-track"), 10);
          if (trackId && this.isActivated && trackId !== this.currentTrackId) {
            this.playTrack(trackId);
          }
        }
      });
    }, { root: carousel, threshold: 0.6 });

    slides.forEach((s) => observer.observe(s));
  }

  /* ==========================================================================
     5. STARK ARMOR TELEMETRY DIALS (SVG ANIMATION)
     ========================================================================== */
  _setupTelemetryObserver() {
    const dials = document.querySelectorAll(".matrix-dial");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const circle = entry.target.querySelector(".matrix-circle-val");
          const pct = parseInt(entry.target.getAttribute("data-pct") || "90", 10);
          if (circle) {
            const offset = 201 - (201 * pct) / 100;
            circle.style.strokeDashoffset = offset;
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    dials.forEach((d) => observer.observe(d));
  }

  /* ==========================================================================
     6. JARVIS BOTTOM NAVIGATION DOCK
     ========================================================================== */
  _setupDockNav() {
    const dockBtns = document.querySelectorAll(".dock-btn");
    const sections = document.querySelectorAll("section[id]");

    dockBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (navigator.vibrate) navigator.vibrate(15);
        const targetId = btn.getAttribute("href").replace("#", "");
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        dockBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    window.addEventListener("scroll", () => {
      let currentId = "";
      sections.forEach((sec) => {
        const top = sec.offsetTop - 180;
        if (window.scrollY >= top) {
          currentId = sec.getAttribute("id");
        }
      });

      if (currentId) {
        dockBtns.forEach((btn) => {
          const href = btn.getAttribute("href").replace("#", "");
          btn.classList.toggle("active", href === currentId);
        });
      }
    }, { passive: true });
  }

  /* ==========================================================================
     7. COMM-LINK TRANSMISSION FORM
     ========================================================================== */
  _setupForm() {
    const form = document.getElementById("comm-form");
    const feedback = document.getElementById("comm-feedback");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (navigator.vibrate) navigator.vibrate([30, 40, 60]);

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.textContent = "TRANSMITTING TO JARVIS...";
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.textContent = "TRANSMISSION DELIVERED ✓";
          submitBtn.style.borderColor = "var(--arc-cyan)";
          submitBtn.style.color = "var(--arc-cyan)";
        }
        if (feedback) {
          feedback.style.display = "block";
          feedback.textContent = "Signal logged in Bakar Vai's Stark Server.";
        }
        form.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.textContent = "TRANSMIT MESSAGE";
            submitBtn.style.borderColor = "";
            submitBtn.style.color = "";
          }
        }, 4000);
      }, 800);
    });
  }

  /* ==========================================================================
     8. DESKTOP VIEW MODE TOGGLE (PHONE / WIDE)
     ========================================================================== */
  _setupDesktopToggle() {
    const toggleBtn = document.getElementById("view-mode-btn");
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("wide-mode");
      const isWide = document.body.classList.contains("wide-mode");
      toggleBtn.innerHTML = isWide ? "📱 Phone View" : "🖥️ Wide View";
    });
  }
}

// Instantiate engine
window.jarvisEngine = new JarvisEngine();
