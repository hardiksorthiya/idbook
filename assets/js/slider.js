(function ($) {
    "use strict";

    $(document).ready(function () {
        // 1. Check if the slider element exists. If not, exit early.
        if ($(".sorath-slider").length === 0) {
            return; 
        }

        function hideCornerFloatOnHero() {
            var floatEl = document.querySelector(".design-float:not(.hero-float)");
            if (!floatEl) return;
            var slider = document.querySelector(".slider-section");
            var onHero = slider && slider.getBoundingClientRect().bottom > 120;
            floatEl.style.visibility = onHero ? "hidden" : "";
            floatEl.style.pointerEvents = onHero ? "none" : "";
        }

        window.addEventListener("scroll", hideCornerFloatOnHero, { passive: true });
        window.addEventListener("resize", hideCornerFloatOnHero);
        var smoothWrap = document.getElementById("sorath-smooth-wrapper");
        if (smoothWrap) smoothWrap.addEventListener("scroll", hideCornerFloatOnHero, { passive: true });
        if (window.ScrollTrigger) {
            ScrollTrigger.addEventListener("scrollEnd", hideCornerFloatOnHero);
        }
        hideCornerFloatOnHero();

        function playLetterTitles(scope) {
            var title = (scope || document).querySelector(".slider-letter-title");
            if (!title) return;

            if (!title.dataset.ready) {
                var html = "";
                function addText(text, accent) {
                    var wordStart = true;
                    text.split("").forEach(function (char) {
                        if (char === " " || char === "\n") {
                            html += char === "\n" ? "" : " ";
                            wordStart = true;
                            return;
                        }
                        var shown = wordStart ? char.toLocaleUpperCase() : char;
                        wordStart = false;
                        html += '<span class="slider-letter' + (accent ? " is-accent" : "") + '">' + shown + "</span>";
                    });
                }
                function walk(node, accent) {
                    node.childNodes.forEach(function (child) {
                        if (child.nodeType === 3) {
                            addText(child.textContent, accent);
                        } else if (child.nodeName === "BR") {
                            html += "<br>";
                        } else {
                            walk(child, accent || child.nodeName === "SPAN");
                        }
                    });
                }
                walk(title, false);
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
                hideCornerFloatOnHero();
            }, 80);
        };
    });
})(jQuery);