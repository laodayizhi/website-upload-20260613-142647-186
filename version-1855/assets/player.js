(function () {
  window.initMoviePlayer = function (videoId, sourceUrl, overlayId, buttonId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      if (!video) {
        return;
      }
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!prepared) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    }
  };
})();
