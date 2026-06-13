(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(active + 1);
        }, 5600);
      }
    }

    var globalInput = document.querySelector("[data-global-search]");
    var globalResults = document.querySelector("[data-search-results]");
    if (globalInput && globalResults && window.SEARCH_MOVIES) {
      var renderResults = function () {
        var query = globalInput.value.trim().toLowerCase();
        if (!query) {
          globalResults.innerHTML = "";
          return;
        }
        var hits = window.SEARCH_MOVIES.filter(function (movie) {
          return movie.text.indexOf(query) !== -1;
        }).slice(0, 18);
        if (!hits.length) {
          globalResults.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
          return;
        }
        globalResults.innerHTML = hits.map(function (movie) {
          return '<a class="search-result-card" href="' + escapeHtml(movie.link) + '">' +
            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.meta) + '</span></span>' +
            '</a>';
        }).join("");
      };
      globalInput.addEventListener("input", renderResults);
    }

    var pageInput = document.querySelector("[data-page-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    if (cards.length && (pageInput || chips.length)) {
      var activeFilter = "all";
      var apply = function () {
        var query = pageInput ? pageInput.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = card.getAttribute("data-text") || "";
          var year = card.getAttribute("data-year") || "";
          var matchText = !query || text.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || year === activeFilter;
          card.hidden = !(matchText && matchFilter);
        });
      };
      if (pageInput) {
        pageInput.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });
    }
  });
})();
