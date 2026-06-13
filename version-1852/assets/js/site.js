(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var clearButton = document.querySelector("[data-clear-search]");
    var emptyResult = document.querySelector("[data-empty-result]");
    if (searchInput) {
        var filterCards = function () {
            var keyword = searchInput.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var match = keyword === "" || haystack.indexOf(keyword) !== -1;
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (emptyResult) {
                emptyResult.classList.toggle("is-visible", visible === 0);
            }
        };
        searchInput.addEventListener("input", filterCards);
        if (clearButton) {
            clearButton.addEventListener("click", function () {
                searchInput.value = "";
                filterCards();
                searchInput.focus();
            });
        }
    }
})();

function initMoviePlayer(streamUrl) {
    var wrap = document.querySelector("[data-player]");
    if (!wrap) {
        return;
    }
    var video = wrap.querySelector("video");
    var cover = wrap.querySelector(".player-cover");
    var attached = false;
    var hlsInstance = null;

    var attachSource = function () {
        if (attached || !video || !streamUrl) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    };

    var beginPlay = function () {
        attachSource();
        wrap.classList.add("is-playing");
        if (video && video.paused) {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }
    };

    if (cover) {
        cover.addEventListener("click", beginPlay);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                beginPlay();
            }
        });
        video.addEventListener("play", function () {
            wrap.classList.add("is-playing");
        });
        video.addEventListener("ended", function () {
            wrap.classList.remove("is-playing");
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
