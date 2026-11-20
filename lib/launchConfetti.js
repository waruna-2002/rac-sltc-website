import confetti from "canvas-confetti";

/**
 * Dignified, elegant ceremonial confetti for official formal inaugurations.
 * Subtle, sophisticated, not overwhelming or chaotic.
 */
export function fireLaunchCelebration() {
  if (typeof window === "undefined") return;

  const colors = ["#ffb81c", "#e6007e", "#ffffff", "#ffd700"];

  // Single graceful, formal celebration burst
  confetti({
    particleCount: 75,
    spread: 70,
    origin: { y: 0.65 },
    colors,
    gravity: 0.85,
    scalar: 0.9,
    ticks: 200,
    disableForReducedMotion: true,
  });

  // Soft left and right gentle drift
  setTimeout(() => {
    confetti({
      particleCount: 35,
      angle: 60,
      spread: 45,
      origin: { x: 0.1, y: 0.7 },
      colors,
      gravity: 0.9,
      scalar: 0.8,
    });
    confetti({
      particleCount: 35,
      angle: 120,
      spread: 45,
      origin: { x: 0.9, y: 0.7 },
      colors,
      gravity: 0.9,
      scalar: 0.8,
    });
  }, 300);
}
