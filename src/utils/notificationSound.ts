// Web Audio API & Browser Notification utilities for new order alerts

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a bright, pleasant 3-tone chime sound (C5 -> E5 -> G5) using pure Web Audio API.
 * Works natively in all modern browsers without external audio assets.
 */
export function playOrderNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Melody notes in Hz: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 523.25, duration: 0.15, delay: 0 },
      { freq: 659.25, duration: 0.15, delay: 0.12 },
      { freq: 783.99, duration: 0.25, delay: 0.24 },
      { freq: 1046.50, duration: 0.45, delay: 0.42 }
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);

      // Envelope
      gain.gain.setValueAtTime(0, now + note.delay);
      gain.gain.linearRampToValueAtTime(0.3, now + note.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.duration);
    });
  } catch (err) {
    console.warn('Could not play Web Audio API notification chime:', err);
  }
}

/**
 * Vibrates the user's mobile device if supported
 */
export function vibrateDevice(): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 300]);
    } catch {
      // Ignore if permission denied
    }
  }
}

/**
 * Requests desktop browser push notification permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }
  return 'denied';
}

/**
 * Displays a system level desktop/mobile push notification
 */
export function showBrowserNotification(title: string, body: string): void {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          dir: 'rtl',
          lang: 'ar'
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('Browser Notification error:', err);
      }
    }
  }
}
