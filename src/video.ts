export function pauseVideo(modal: HTMLElement): void {
  // Pause all <video> elements inside the modal before hiding it
  modal.querySelectorAll("video").forEach((video) => {
    if (!video.paused) video.pause();
  });
}
