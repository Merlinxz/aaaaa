// ====== Fix 100vh on mobile to avoid scroll ======
function setVhUnit() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
}
setVhUnit();
window.addEventListener('resize', setVhUnit);

// ====== Elements ======
var video = document.getElementById('bg-video');
var fallback = document.getElementById('bg-fallback');
var playToggle = document.getElementById('playToggle');
var muteToggle = document.getElementById('muteToggle');
var autoPlayNote = document.getElementById('autoPlayNote');

// ====== Helpers ======
function showFallback() {
    try {
        if (fallback) fallback.classList.remove('hidden');
        if (video && video.parentElement) video.remove();
    } catch (e) {
        console.warn('Fallback error:', e);
    }
}

function syncControls() {
    if (!video || !playToggle || !muteToggle) return;

    // Play/Pause icon only
    var playIcon = playToggle.querySelector('i');
    if (video.paused) {
        if (playIcon) playIcon.className = 'fa-solid fa-play';
    } else {
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
    }

    // Mute/Unmute icon only
    var muteIcon = muteToggle.querySelector('i');
    if (video.muted) {
        if (muteIcon) muteIcon.className = 'fa-solid fa-volume-xmark';
    } else {
        if (muteIcon) muteIcon.className = 'fa-solid fa-volume-high';
    }
}

function attemptAutoplay() {
    if (!video) return;
    try {
        video.muted = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(function () {
                if (autoPlayNote) autoPlayNote.classList.add('hidden');
                syncControls();
            }).catch(function () {
                if (autoPlayNote) autoPlayNote.classList.remove('hidden');
                syncControls();
            });
        } else {
            if (autoPlayNote) autoPlayNote.classList.add('hidden');
            syncControls();
        }
    } catch (err) {
        if (autoPlayNote) autoPlayNote.classList.remove('hidden');
        syncControls();
    }
}

// ====== Events ======
if (playToggle) {
    playToggle.addEventListener('click', function () {
        if (!video) return;
        try {
            if (video.paused) {
                var p = video.play();
                if (p && typeof p.then === 'function') {
                    p.then(syncControls).catch(function () {
                        if (autoPlayNote) autoPlayNote.classList.remove('hidden');
                        syncControls();
                    });
                } else {
                    syncControls();
                }
            } else {
                video.pause();
                syncControls();
            }
        } catch (e) {
            if (autoPlayNote) autoPlayNote.classList.remove('hidden');
            syncControls();
        }
    });
}

if (muteToggle) {
    muteToggle.addEventListener('click', function () {
        if (!video) return;
        video.muted = !video.muted;
        syncControls();
    });
}

document.addEventListener('visibilitychange', function () {
    if (!video) return;
    if (document.hidden) {
        try {
            video.pause();
        } catch (e) {}
    } else {
        attemptAutoplay();
    }
});

if (video) {
    video.addEventListener('error', showFallback);
    video.addEventListener('stalled', function () {
        setTimeout(showFallback, 2000);
    });
    video.addEventListener('play', syncControls);
    video.addEventListener('pause', syncControls);
    video.addEventListener('volumechange', syncControls);
    video.addEventListener('loadeddata', syncControls);
}

// Start
attemptAutoplay();