(function ($) {
    "use strict";

    $(document).ready(function () {
        // 1. Check if the slider element exists. If not, exit early.
        if ($(".sorath-slider").length === 0) {
            return; 
        }

        function alignFloatWithSliderButton() {
            var floatEl = document.querySelector(".design-float");
            if (!floatEl) return;

            var width = window.innerWidth;
            if (width > 1279) {
                floatEl.style.bottom = "";
                floatEl.style.left = "";
                return;
            }

            var slider = document.querySelector(".slider-section");
            var btn = slider ? slider.querySelector(".swiper-slide-active .tl-primary-btn") : null;
            var rect = btn ? btn.getBoundingClientRect() : null;
            var sliderRect = slider ? slider.getBoundingClientRect() : null;
            var onHero = rect && sliderRect && rect.width > 20 && rect.bottom > 120 && rect.top < window.innerHeight - 40 && rect.bottom <= sliderRect.bottom + 4;
            if (!onHero) {
                if (!sliderRect || sliderRect.bottom < 80) {
                    floatEl.style.bottom = "";
                    floatEl.style.left = "";
                }
                return;
            }

            var icon = floatEl.querySelector(".design-float-icon");
            var iconH = icon ? icon.offsetHeight : 60;
            var bottom = window.innerHeight - (rect.top + (rect.height + iconH) / 2);
            if (bottom < 0) bottom = 0;
            if (width < 992 && bottom < 16) bottom = 16;
            floatEl.style.bottom = Math.round(bottom) + "px";

            if (width >= 992) {
                var iconW = icon ? icon.offsetWidth : 60;
                var left = rect.left - iconW - 36;
                if (left < 12) left = 12;
                floatEl.style.left = Math.round(left) + "px";
            } else {
                floatEl.style.left = "";
            }
        }

        var alignTimer;
        var alignWatch;
        var lastBottom = null;
        var stableRuns = 0;
        var watchTicks = 0;

        function scheduleAlign() {
            clearTimeout(alignTimer);
            alignTimer = setTimeout(alignFloatWithSliderButton, 60);
        }

        function startAlignWatch() {
            clearInterval(alignWatch);
            lastBottom = null;
            stableRuns = 0;
            watchTicks = 0;
            alignWatch = setInterval(function () {
                var btn = document.querySelector(".slider-section .swiper-slide-active .tl-primary-btn");
                var bottom = btn ? Math.round(btn.getBoundingClientRect().bottom) : null;
                if (bottom !== null && bottom === lastBottom) stableRuns += 1;
                else stableRuns = 0;
                lastBottom = bottom;
                alignFloatWithSliderButton();
                watchTicks += 1;
                if ((stableRuns >= 6 && watchTicks > 8) || watchTicks > 24) clearInterval(alignWatch);
            }, 200);
        }

        window.addEventListener("resize", function () {
            scheduleAlign();
            startAlignWatch();
        });
        window.addEventListener("scroll", scheduleAlign, { passive: true });
        var smoothWrap = document.getElementById("sorath-smooth-wrapper");
        if (smoothWrap) smoothWrap.addEventListener("scroll", scheduleAlign, { passive: true });
        window.addEventListener("load", startAlignWatch);
        startAlignWatch();

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
                },
                slideChangeTransitionEnd: function () {
                    alignFloatWithSliderButton();
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
                alignFloatWithSliderButton();
                startAlignWatch();
            }, 80);
        };
    });
})(jQuery);