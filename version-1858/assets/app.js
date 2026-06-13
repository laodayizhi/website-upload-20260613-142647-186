document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupSearchAndFilters();
    setupPlayer();
});

function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
    });
}

function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
        return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            start();
        });
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
    }

    show(0);
    start();
}

function setupSearchAndFilters() {
    var list = document.querySelector('[data-card-list]');
    if (!list) {
        return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var input = document.querySelector('.site-search');
    var filters = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var counter = document.querySelector('[data-result-count]');

    function cardMatches(card, keyword, selected) {
        var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        if (keyword && haystack.indexOf(keyword) === -1) {
            return false;
        }

        return Object.keys(selected).every(function (key) {
            var value = selected[key];
            if (!value) {
                return true;
            }
            if (key === 'category') {
                return haystack.indexOf(value.toLowerCase()) !== -1;
            }
            return String(card.getAttribute('data-' + key) || '').indexOf(value) !== -1;
        });
    }

    function update() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selected = {};
        filters.forEach(function (filter) {
            selected[filter.getAttribute('data-filter')] = filter.value;
        });

        var visible = 0;
        cards.forEach(function (card) {
            var ok = cardMatches(card, keyword, selected);
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (counter) {
            counter.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
        }
    }

    if (input) {
        input.addEventListener('input', update);
    }
    filters.forEach(function (filter) {
        filter.addEventListener('change', update);
    });
    update();
}

function setupPlayer() {
    var video = document.getElementById('movie-player');
    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');
    var button = document.getElementById('player-toggle');
    var startButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
    var message = document.querySelector('[data-player-message]');
    var hlsInstance = null;

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function loadSource() {
        if (!source) {
            setMessage('播放源暂不可用');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setMessage('');
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage('播放加载中断，请刷新后重试');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function playOrPause() {
        if (video.paused) {
            video.play().catch(function () {
                setMessage('点击视频控件后即可播放');
            });
        } else {
            video.pause();
        }
    }

    function syncButton() {
        if (!button) {
            return;
        }
        button.classList.toggle('is-hidden', !video.paused);
    }

    if (button) {
        button.addEventListener('click', playOrPause);
    }

    startButtons.forEach(function (startButton) {
        startButton.addEventListener('click', function () {
            video.scrollIntoView({ behavior: 'smooth', block: 'center' });
            playOrPause();
        });
    });

    video.addEventListener('play', syncButton);
    video.addEventListener('pause', syncButton);
    video.addEventListener('ended', syncButton);
    video.addEventListener('click', function (event) {
        if (event.target === video) {
            playOrPause();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });

    loadSource();
    syncButton();
}
