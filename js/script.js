document.addEventListener('DOMContentLoaded', function(){
       
        // бургер
        const headerWrap = document.querySelector('.js-header');
        var burger = document.querySelector('.js-burger')
        var nav = document.querySelector('.js-header-menu');
        document.addEventListener('click', e => {
        if(!e.target.matches('.js-burger')){}
                else{
                burger.classList.toggle('clicked');
                nav.classList.toggle('show');
                headerWrap.classList.toggle('header-wrap__active');
                }
                if(!e.target.matches('.frame-link')){}
                else {
                        e.preventDefault();
                        burger.classList.remove('clicked');
                        nav.classList.remove('show');
                        headerWrap.classList.remove('header-wrap__active');
                }
        })
       

        // Full Page Scroll
        const helper = {
                debounce(method, delay, context) {
                let inDebounce;
                return function () {
                clearTimeout(inDebounce);
                inDebounce = setTimeout(() => {
                        method.apply(context, arguments);
                }, delay);
                };
                }
        };
        class ScrollPages {
        constructor(currentPageNumber, totalPageNumber, pages) {
        this.currentPageNumber = currentPageNumber;
        this.totalPageNumber = totalPageNumber;
        this.pages = pages;
        this.viewHeight = document.documentElement.clientHeight;

        this.lastScrollTime = 0;
        this.scrollTimeout = 800; // Prevent fast repeat
        this.scrollLocked = false;

        // Map frame IDs to their 1-based index
        this.frameMap = {};
        const frames = document.querySelectorAll('.frame');
        frames.forEach((frame, i) => {
        const id = frame.id;
        if (id) this.frameMap[id] = i + 1;
        });
        }

        handleWheel(event) {
        event.preventDefault();

        const now = Date.now();
        const deltaY = event.deltaY;

        if (Math.abs(deltaY) < 30) return;

        if (now - this.lastScrollTime < this.scrollTimeout || this.scrollLocked) {
        return;
        }

        this.lastScrollTime = now;
        this.scrollLocked = true;

        if (deltaY > 0) {
        this.scrollDown();
        } else {
        this.scrollUp();
        }

        setTimeout(() => {
        this.scrollLocked = false;
        }, this.scrollTimeout);
        }

        scrollUp() {
        if (this.currentPageNumber > 1) {
        this.currentPageNumber--;
        this.updateNav();
        this.pages.style.top = (-this.viewHeight * (this.currentPageNumber - 1)) + 'px';
        }
        }

        scrollDown() {
        if (this.currentPageNumber < this.totalPageNumber) {
        this.currentPageNumber++;
        this.updateNav();
        this.pages.style.top = (-this.viewHeight * (this.currentPageNumber - 1)) + 'px';
        }
        }

        scrollTo(targetPageNumber) {
        if (targetPageNumber < 1 || targetPageNumber > this.totalPageNumber) {
        console.warn(`Invalid scroll target: ${targetPageNumber}`);
        return;
        }

        this.currentPageNumber = targetPageNumber;
        this.pages.style.top = (-this.viewHeight * (this.currentPageNumber - 1)) + 'px';
        this.updateNav();
        }

        updateNav() {
        if (!this.navDots) return;

        // Remove active class from all nav links
        this.navDots.forEach(dot => dot.classList.remove('frame-link__active'));

        // Find the frame ID for the current page
        const frames = document.querySelectorAll('.frame');
        const currentFrame = frames[this.currentPageNumber - 1];
        if (!currentFrame) return;

        const currentId = currentFrame.id;
        if (!currentId) return;

        // Add active class to ALL navDots whose href matches currentId
        this.navDots.forEach(dot => {
        const href = dot.getAttribute('href');
        if (href === `#${currentId}`) {
                dot.classList.add('frame-link__active');
        }
        });
        }

        initNav() {
        this.navDots = Array.from(document.querySelectorAll('.frame-link'));
        if (this.navDots.length === 0) return;

        // Remove all active states, then add to first valid one
        this.navDots.forEach(dot => dot.classList.remove('frame-link__active'));

        // Find first nav dot whose href corresponds to an existing frame
        for (const dot of this.navDots) {
        const href = dot.getAttribute('href');
        if (!href || !href.startsWith('#')) continue;

        const targetId = href.slice(1);
        if (this.frameMap[targetId]) {
                dot.classList.add('frame-link__active');
                break;
        }
        }

        // Setup click handlers
        this.navDots.forEach(dot => {
        dot.addEventListener('click', e => {
                e.preventDefault();
                const href = dot.getAttribute('href');
                if (!href || !href.startsWith('#')) return;

                const targetId = href.slice(1);
                const pageNumber = this.frameMap[targetId];

                if (pageNumber) {
                this.scrollTo(pageNumber);

                this.navDots.forEach(d => d.classList.remove('frame-link__active'));
                // Add active class to all navDots with this href
                this.navDots.forEach(d => {
                if (d.getAttribute('href') === href) {
                d.classList.add('frame-link__active');
                }
                });
                } else {
                console.warn(`No frame found for nav href: ${href}`);
                }
        });
        });
        }

        resize() {
        this.viewHeight = document.documentElement.clientHeight;
        this.pages.style.height = this.viewHeight + 'px';
        this.pages.style.top = -this.viewHeight * (this.currentPageNumber - 1) + 'px';
        }

        init() {
        const handleResize = helper.debounce(this.resize, 500, this);
        this.pages.style.height = this.viewHeight + 'px';

        this.initNav(); // Initialize nav using existing HTML

        // Wheel for desktop
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Touch events
        document.addEventListener('touchstart', event => {
        this.startY = event.touches[0].pageY;
        this.startX = event.touches[0].pageX;
        }, { passive: false });

        document.addEventListener('touchmove', event => {
        if (!event.cancelable) return;

        const el = event.target.closest('.js-scrollable');
        if (el) {
                const { scrollTop, scrollHeight, offsetHeight, scrollLeft, scrollWidth, offsetWidth } = el;

                const atTop = scrollTop === 0;
                const atBottom = scrollTop + offsetHeight >= scrollHeight;
                const atLeft = scrollLeft === 0;
                const atRight = scrollLeft + offsetWidth >= scrollWidth;

                const currentY = event.touches[0].pageY;
                const currentX = event.touches[0].pageX;
                const deltaY = this.startY - currentY;
                const deltaX = this.startX - currentX;

                if (Math.abs(deltaX) > Math.abs(deltaY)) return;

                const isScrollingDown = deltaY > 0;
                const isScrollingUp = deltaY < 0;

                if ((isScrollingDown && !atBottom) || (isScrollingUp && !atTop)) return;
        }

        event.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', event => {
        const endY = event.changedTouches[0].pageY;
        const deltaY = this.startY - endY;

        if (Math.abs(deltaY) > 40) {
                if (deltaY > 0) {
                this.scrollDown();
                } else {
                this.scrollUp();
                }
        }
        }, { passive: false });

        window.addEventListener('resize', handleResize);
        }
        }

        // Initialize after DOM ready
        const frames = document.querySelectorAll('.frame');
        const scrollManager = new ScrollPages(1, frames.length, document.getElementById('_frames'));
        scrollManager.init();



        // parallax 
        (function () {
                const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || ('ontouchstart' in window);

                if (isMobile) {
                // Don't run the parallax effect on mobile devices
                return;
                }

                const elements = document.querySelectorAll('[data-parallax]');
                const state = { x: 0, y: 0 };

                document.addEventListener('mousemove', (e) => {
                const { innerWidth: width, innerHeight: height } = window;
                const offsetX = (e.clientX / width - 0.5) * 2; 
                const offsetY = (e.clientY / height - 0.5) * 2; 

                state.x = offsetX;
                state.y = offsetY;
                });

                function animate() {
                elements.forEach(el => {
                const speed = parseFloat(el.dataset.speed) || 0.3;
                const translateX = -state.x * 50 * speed;
                const translateY = -state.y * 50 * speed;
                const rotateZ = -state.x * 10 * speed;

                el.style.transform = `translate(${translateX}px, ${translateY}px) rotateZ(${rotateZ}deg)`;
                });

                requestAnimationFrame(animate);
                }

                animate();
        })();

        // Update fullscreen container colors based on active section
        function updateFullscreenContainerColors(activeSection) {
                const header = document.querySelector('.header');
                const headerLogo = document.querySelectorAll('.header-logo path');
                const container = document.querySelector('.js-vector');
                const vectorPaths = document.querySelectorAll('.js-vector-fill');
                const headerBtn = document.querySelector('.header-btn');
                if (activeSection.classList.contains('frame-0') || activeSection.classList.contains('frame-6')) {
                document.querySelector('.js-vector').classList.add('not-active');
                }
                else{
                    document.querySelector('.js-vector').classList.remove('not-active');
                    document.querySelector('.js-vector').classList.remove('hidden');
                }
                if(activeSection.classList.contains('frame-1')) {
                   headerBtn.classList.add('_dark_color')
                }
                else {
                   headerBtn.classList.remove('_dark_color')
                }
                if(!activeSection.classList.contains('frame-0') && !activeSection.classList.contains('frame-1')) {
                   header.classList.remove('_unique_color');
                   headerLogo.forEach(path => {
                      path.classList.add('_white_color');
                   })
                }
                else {
                headerLogo.forEach(path => {
                   header.classList.add('_unique_color');
                   path.classList.remove('_white_color');
                })
                }
                if (container && activeSection) {
                        const bgColor = activeSection.getAttribute('data-vector-color');
                        const vectorColor = activeSection.getAttribute('data-vector-bg-color');
                        const headerBtnColor = activeSection.getAttribute('data-header-btn-color');

                        if (bgColor) {
                        container.style.backgroundColor = bgColor;
                        }

                        if (vectorColor) {
                                vectorPaths.forEach(path => {
                                        path.setAttribute('fill', vectorColor);
                                });
                        }
                        if(headerBtnColor){
                                headerBtn.style.backgroundColor = headerBtnColor;
                        }
                }
        }
        const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
                if (entry.isIntersecting) {
                updateFullscreenContainerColors(entry.target);
                }
        });
        }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
        });
        document.querySelectorAll('.frame').forEach(section => {
        sectionObserver.observe(section);
        });
        const handleInViewport = (entries) => {
        entries.forEach(entry => {
                const el = entry.target;
                el.classList.toggle('is-inViewport', entry.isIntersecting);
                if (entry.isIntersecting && !el.classList.contains('watched')) {
                el.classList.add('watched');
                }
        });
        };
        const inViewportObserver = new IntersectionObserver(handleInViewport, {
        rootMargin: '0% 0% 0% 0%',
        threshold: 0.1
        });

        // Start observing all elements with `data-inviewport`
        document.querySelectorAll('[data-inviewport]').forEach(el => {
        inViewportObserver.observe(el);
        });

})




