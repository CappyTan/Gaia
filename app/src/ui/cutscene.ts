// Fullscreen CUTSCENE player. Fades the whole app out to black, plays a video at full resolution
// (letterboxed, never cropped/upscaled), then fades the video out and the app back in — calling
// `onDone` once the screen is clear so the caller can resume (e.g. apply the ability's damage).
//
// Audio: play() is kicked SYNCHRONOUSLY from the caller's click handler so the user-gesture lets the
// sound through; if a browser still blocks it we retry muted (muted autoplay is always allowed) so the
// cutscene always plays. Pure presentation — no game state here.

const FADE_MS = 420;

/** Fade out, play `url` fullscreen, fade back in, then call `onDone`. Call from within a click handler. */
export function playCutscene(url: string, onDone: () => void): void {
  const scrim = document.createElement("div");
  scrim.className = "cutscene-scrim";          // black wash over the app
  const video = document.createElement("video");
  video.className = "cutscene-video";
  video.src = url;
  video.autoplay = true; video.controls = false; video.playsInline = true;
  video.setAttribute("playsinline", ""); video.preload = "auto";
  document.body.appendChild(scrim);
  document.body.appendChild(video);

  let done = false;
  const finish = () => {
    if (done) return; done = true;
    clearTimeout(failT);
    video.style.opacity = "0"; scrim.style.opacity = "0";   // fade video out, then the black wash
    window.setTimeout(() => { video.remove(); scrim.remove(); onDone(); }, FADE_MS + 30);
  };
  video.onended = finish;
  video.onerror = finish;
  const failT = window.setTimeout(finish, 30000);           // hard safety so a stuck load can't strand the turn

  // start playback now (in the gesture) for audio; muted fallback if the browser blocks it
  const p = video.play();
  if (p && p.catch) p.catch(() => { video.muted = true; video.play().catch(() => finish()); });

  requestAnimationFrame(() => { scrim.style.opacity = "1"; });        // app → black
  window.setTimeout(() => { video.style.opacity = "1"; }, FADE_MS + 10); // black → cutscene (already playing)
}
