export function pauseVideo(popup: HTMLElement): void {
  // Pause all <video> elements inside the popup before hiding it
  popup.querySelectorAll("video").forEach((video) => {
    if (!video.paused) video.pause();
  });
}
