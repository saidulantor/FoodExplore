/**
 * Bistro Bliss - About Page Animated Statistics Counter
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const factNums = document.querySelectorAll('.fact-num');
        if (!factNums.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    factNums.forEach(el => {
                        const target = parseInt(el.getAttribute('data-target') || el.textContent, 10);
                        el.textContent = '0';
                        let current = 0;
                        const duration = 1200;
                        const stepTime = Math.max(25, Math.floor(duration / target));
                        const timer = setInterval(() => {
                            current += 1;
                            el.textContent = current;
                            if (current >= target) {
                                clearInterval(timer);
                                el.textContent = target;
                            }
                        }, stepTime);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const storyFacts = document.querySelector('.story-facts');
        if (storyFacts) observer.observe(storyFacts);
    });
})();
