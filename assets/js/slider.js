(function ($) {
    "use strict";

    $(document).ready(function () {
        // 1. Check if the slider element exists. If not, exit early.
        if ($(".sorath-slider").length === 0) {
            return; 
        }

        function playLetterTitles(scope) {
            var title = (scope || document).querySelector(".slider-letter-title");
            if (!title) return;

            if (!title.dataset.ready) {
                var html = "";
                title.innerHTML.split(/<br\s*\/?>/i).forEach(function (line, i) {
                    if (i) html += "<br>";
                    line.trim().split("").forEach(function (char) {
                        html += char === " " ? " " : '<span class="slider-letter">' + char + "</span>";
                    });
                });
                title.innerHTML = html;
                title.dataset.ready = "1";
            }

            title.querySelectorAll(".slider-letter").forEach(function (letter, index) {
                letter.style.animation = "none";
                letter.offsetHeight;
                letter.style.animation = "sliderLetterIn 0.9s ease forwards";
                letter.style.animationDelay = (index * 0.06) + "s";
            });
        }

        /* ============================ Animation Function ============================ */
        function sliderAnimations(elements) {
            var animationEndEvents = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
            elements.each(function () {
                var $this = $(this);
                var delay = $this.data("delay");
                var duration = $this.data("duration");
                var animationType = "sorath-animation " + $this.data("animation");
                
                $this.css({
                    opacity: 1,
                    "animation-delay": delay,
                    "-webkit-animation-delay": delay,
                    "animation-duration": duration,
                });

                $this.addClass(animationType).one(animationEndEvents, function () {
                    $this.removeClass(animationType);
                });
            });
        }

        /* ============================ Swiper Setup ============================ */
        var sliderOptions = {
            init: false,
            speed: 1500,
            loop: true,
            effect: "fade", // Fixed typo: "verticle" isn't a default Swiper effect, usually "vertical" or "fade"
            grabCursor: true,
            allowTouchMove: true,
            simulateTouch: true,
            threshold: 8,
            autoplay: false,
            pagination: {
                el: ".sorath-swiper-pagination",
                clickable: true,
            },
            on: {
                slideChangeTransitionStart: function () {
                    var swiper = this;
                    var animatingElements = $(swiper.slides[swiper.activeIndex]).find("[data-animation]");
                    sliderAnimations(animatingElements);
                    playLetterTitles(swiper.slides[swiper.activeIndex]);
                }
            }
        };

        /* create swiper globally */
        window.mainSlider = new Swiper(".sorath-slider", sliderOptions);

        /* ============================ START AFTER PRELOADER ============================ */
        window.startSliderAfterPreload = function () {
            const swiper = window.mainSlider;
            
            // Check if swiper was actually initialized
            if (!swiper || typeof swiper.init !== 'function') return;

            swiper.init();
            swiper.update();

            const elements = $(swiper.slides[swiper.activeIndex]).find("[data-animation]");
            elements.css("opacity", 0);

            setTimeout(function () {
                const sliderSection = document.querySelector(".slider-section");
                if(sliderSection) {
                    sliderSection.classList.add("slider-ready");
                }
                
                sliderAnimations(elements);
                playLetterTitles(swiper.slides[swiper.activeIndex]);
            }, 80);
        };
    });
})(jQuery);