(() => {
  'use strict';
  const audio = document.getElementById('gleis');
  function closeVideo() {
    const player = document.querySelector('.mp-screen iframe');
    if (!player) return;
    const control = player.closest('.mp-case').querySelector('[data-video]');
    control.setAttribute('aria-expanded','false');
    control.textContent='▷ Video hier öffnen';
    player.remove();
  }
  document.querySelectorAll('[data-cue]').forEach(button => {
    button.addEventListener('click', () => {
      closeVideo();
      audio.currentTime = Number(button.dataset.cue);
      audio.play().catch(() => { audio.focus(); });
    });
  });
  function stopStudio() {
    const stop = document.getElementById('beat-stop');
    if (stop && !stop.disabled) stop.click();
  }
  audio.addEventListener('play', () => { closeVideo(); stopStudio(); });
  for (const id of ['beat-preview','beat-arrange','beat-live-start']) {
    document.getElementById(id)?.addEventListener('click', () => { audio.pause(); closeVideo(); });
  }
  document.querySelectorAll('[data-video]').forEach(button => {
    button.addEventListener('click', () => {
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      closeVideo();
      if (wasOpen) return;
      audio.pause();
      stopStudio();
      const section = button.closest('.mp-case');
      const frame = document.createElement('iframe');
      const start = Number(button.dataset.start);
      const url = new URL('https://www.youtube-nocookie.com/embed/' + button.dataset.video);
      url.searchParams.set('start',String(start));
      frame.src = url.href;
      frame.title = section.querySelector('h4').textContent + ' · Video';
      frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      section.querySelector('.mp-screen').append(frame);
      button.setAttribute('aria-expanded','true');
      button.textContent='Video schliessen';
    });
  });
})();
