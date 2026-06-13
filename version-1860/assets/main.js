(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initHeader() {
        var header = document.querySelector('[data-site-header]');
        var button = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        var setHeader = function () {
            if (!header) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        setHeader();
        window.addEventListener('scroll', setHeader, { passive: true });
        if (button && mobileNav) {
            button.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };
        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                stop();
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            });
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var source = player.getAttribute('data-src') || (video && video.getAttribute('data-video-src'));
            var started = false;
            var hls = null;
            if (!video || !source) {
                return;
            }
            var playVideo = function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            };
            var start = function () {
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                player.classList.add('is-playing');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    playVideo();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    window.__siteHlsPlayers = window.__siteHlsPlayers || [];
                    window.__siteHlsPlayers.push(hls);
                    return;
                }
                video.src = source;
                playVideo();
            };
            if (button) {
                button.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        });
    }

    function initSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');
        var title = document.querySelector('[data-search-title]');
        var results = document.querySelector('[data-search-results]');
        if (input) {
            input.value = query;
        }
        if (!query || !window.__MOVIE_SEARCH_INDEX__ || !results) {
            return;
        }
        var words = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.__MOVIE_SEARCH_INDEX__.filter(function (item) {
            var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
            return words.every(function (word) {
                return text.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        if (title) {
            title.textContent = matches.length ? '“' + query + '”相关内容' : '未找到相关内容';
        }
        results.innerHTML = matches.map(function (item) {
            return '<article class="movie-card movie-card--small">'
                + '<a class="movie-card__poster" href="' + escapeHTML(item.url) + '">'
                + '<img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">'
                + '<span class="movie-card__badge">' + escapeHTML(item.category) + '</span>'
                + '<span class="movie-card__play">▶</span>'
                + '</a>'
                + '<div class="movie-card__body">'
                + '<h3 class="movie-card__title"><a href="' + escapeHTML(item.url) + '">' + escapeHTML(item.title) + '</a></h3>'
                + '<p class="movie-card__meta">' + escapeHTML(item.year) + ' · ' + escapeHTML(item.region) + ' · ' + escapeHTML(item.type) + '</p>'
                + '<p class="movie-card__summary">' + escapeHTML(item.oneLine) + '</p>'
                + '</div>'
                + '</article>';
        }).join('');
    }

    ready(function () {
        initHeader();
        initHero();
        initImages();
        initPlayers();
        initSearchPage();
    });
})();
