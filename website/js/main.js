// CodeForge Website JavaScript
(function() {
    'use strict';

    // Global variables
    let isLoaded = false;
    let heroCanvas, heroCtx;
    let particles = [];
    let mousePos = { x: 0, y: 0 };
    let performanceChart;

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeWebsite();
    });

    // Main initialization function
    function initializeWebsite() {
        setupLoading();
        setupNavigation();
        setupHeroCanvas();
        setupScrollAnimations();
        setupDemoTabs();
        setupPlatformTabs();
        setupPerformanceChart();
        setupVideoModal();
        setupAnalytics();
        
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100
            });
        }

        // Hide loading screen after initialization
        setTimeout(hideLoadingScreen, 1500);
    }

    // Loading screen management
    function setupLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        
        // Simulate loading progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                clearInterval(progressInterval);
                progress = 100;
            }
        }, 200);
    }

    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';
            isLoaded = true;
        }
    }

    // Navigation management
    function setupNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Smooth scroll for anchor links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offsetTop = target.offsetTop - 70;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // Hero canvas animation
    function setupHeroCanvas() {
        heroCanvas = document.getElementById('hero-canvas');
        if (!heroCanvas) return;

        heroCtx = heroCanvas.getContext('2d');
        resizeCanvas();

        // Initialize particles
        initParticles();

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
        });

        // Start animation
        animateHero();

        // Resize handler
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        if (!heroCanvas) return;
        
        heroCanvas.width = heroCanvas.offsetWidth;
        heroCanvas.height = heroCanvas.offsetHeight;
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * heroCanvas.width,
                y: Math.random() * heroCanvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 200 // Blue to purple range
            });
        }
    }

    function animateHero() {
        if (!heroCtx || !isLoaded) {
            requestAnimationFrame(animateHero);
            return;
        }

        // Clear canvas
        heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

        // Update and draw particles
        particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Mouse interaction
            const dx = mousePos.x - particle.x;
            const dy = mousePos.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x -= dx * force * 0.01;
                particle.y -= dy * force * 0.01;
            }

            // Boundary check
            if (particle.x < 0 || particle.x > heroCanvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > heroCanvas.height) particle.vy *= -1;

            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(heroCanvas.width, particle.x));
            particle.y = Math.max(0, Math.min(heroCanvas.height, particle.y));

            // Draw particle
            heroCtx.beginPath();
            heroCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            heroCtx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
            heroCtx.fill();

            // Draw connections
            particles.slice(index + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (150 - distance) / 150 * 0.2;
                    heroCtx.beginPath();
                    heroCtx.moveTo(particle.x, particle.y);
                    heroCtx.lineTo(otherParticle.x, otherParticle.y);
                    heroCtx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${opacity})`;
                    heroCtx.lineWidth = 1;
                    heroCtx.stroke();
                }
            });
        });

        requestAnimationFrame(animateHero);
    }

    // Scroll animations
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.dataset.animate;
                    element.classList.add(`animate-${animation}`);
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });

        // Parallax scrolling for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    // Demo tabs functionality
    function setupDemoTabs() {
        const demoTabs = document.querySelectorAll('.demo-tab');
        const demoVideos = document.querySelectorAll('.demo-video');

        demoTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetDemo = tab.dataset.demo;

                // Remove active class from all tabs and videos
                demoTabs.forEach(t => t.classList.remove('active'));
                demoVideos.forEach(v => v.classList.remove('active'));

                // Add active class to clicked tab and corresponding video
                tab.classList.add('active');
                const targetVideo = document.getElementById(`demo-${targetDemo}`);
                if (targetVideo) {
                    targetVideo.classList.add('active');
                }

                // Track analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'demo_tab_click', {
                        'event_category': 'engagement',
                        'event_label': targetDemo,
                        'value': 1
                    });
                }
            });
        });
    }

    // Platform tabs functionality
    function setupPlatformTabs() {
        const platformTabs = document.querySelectorAll('.platform-tab');
        const platformInfos = document.querySelectorAll('.platform-info');

        platformTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPlatform = tab.dataset.platform;

                // Remove active class from all tabs and info sections
                platformTabs.forEach(t => t.classList.remove('active'));
                platformInfos.forEach(info => info.classList.remove('active'));

                // Add active class to clicked tab and corresponding info
                tab.classList.add('active');
                const targetInfo = document.getElementById(`platform-${targetPlatform}`);
                if (targetInfo) {
                    targetInfo.classList.add('active');
                }

                // Track analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'platform_tab_click', {
                        'event_category': 'engagement',
                        'event_label': targetPlatform,
                        'value': 1
                    });
                }
            });
        });
    }

    // Performance chart setup
    function setupPerformanceChart() {
        const chartCanvas = document.getElementById('performance-chart');
        if (!chartCanvas || typeof Chart === 'undefined') return;

        const ctx = chartCanvas.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)');

        performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['CodeForge', 'GitHub Copilot', 'Tabnine', 'Kite', 'IntelliCode'],
                datasets: [{
                    label: 'Accuracy (%)',
                    data: [88, 64, 52, 43, 38],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(107, 114, 128, 0.6)',
                        'rgba(107, 114, 128, 0.6)',
                        'rgba(107, 114, 128, 0.6)',
                        'rgba(107, 114, 128, 0.6)'
                    ],
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(107, 114, 128, 0.8)',
                        'rgba(107, 114, 128, 0.8)',
                        'rgba(107, 114, 128, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Accuracy: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a1a1aa',
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a1a1aa',
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutCubic'
                }
            }
        });

        // Animate chart when in view
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    performanceChart.update();
                    chartObserver.unobserve(entry.target);
                }
            });
        });

        chartObserver.observe(chartCanvas);
    }

    // Video modal functionality
    function setupVideoModal() {
        const modal = document.getElementById('video-modal');
        const modalVideo = document.getElementById('modal-video');
        const playButtons = document.querySelectorAll('.play-button');
        const closeButton = document.querySelector('.video-close');

        playButtons.forEach(button => {
            button.addEventListener('click', () => {
                const videoSrc = button.dataset.video || 'assets/demos/showcase.mp4';
                modalVideo.src = videoSrc;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Track video modal open
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'video_modal_open', {
                        'event_category': 'engagement',
                        'event_label': videoSrc,
                        'value': 1
                    });
                }
            });
        });

        if (closeButton) {
            closeButton.addEventListener('click', closeVideoModal);
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeVideoModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeVideoModal();
            }
        });
    }

    // Analytics setup
    function setupAnalytics() {
        // Track scroll depth
        let maxScroll = 0;
        const scrollMilestones = [25, 50, 75, 100];
        
        window.addEventListener('scroll', throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && maxScroll < milestone) {
                    maxScroll = milestone;
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            'event_category': 'engagement',
                            'event_label': `${milestone}%`,
                            'value': milestone
                        });
                    }
                }
            });
        }, 1000));

        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn, .download-btn');
            if (button) {
                const trackingData = {
                    button_text: button.textContent.trim(),
                    button_class: button.className,
                    section: getSection(button)
                };

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'button_click', {
                        'event_category': 'engagement',
                        'event_label': trackingData.button_text,
                        'custom_parameters': trackingData
                    });
                }
            }
        });

        // Track form interactions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'conversion',
                        'event_label': form.id || 'unknown_form'
                    });
                }
            });
        });

        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (typeof gtag !== 'undefined') {
                gtag('event', 'time_on_page', {
                    'event_category': 'engagement',
                    'value': timeSpent
                });
            }
        });
    }

    // Utility functions
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function getSection(element) {
        const section = element.closest('section');
        return section ? section.id || section.className : 'unknown';
    }

    function copyVSCodeCommand() {
        const command = 'code --install-extension codeforge.codeforge';
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(command).then(() => {
                showToast('Command copied to clipboard!');
            }).catch(() => {
                fallbackCopyTextToClipboard(command);
            });
        } else {
            fallbackCopyTextToClipboard(command);
        }

        // Track copy action
        if (typeof gtag !== 'undefined') {
            gtag('event', 'copy_command', {
                'event_category': 'engagement',
                'event_label': 'vscode_install_command'
            });
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showToast('Command copied to clipboard!');
        } catch (err) {
            showToast('Unable to copy command. Please copy manually.');
        }

        document.body.removeChild(textArea);
    }

    function showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: Inter, sans-serif;
            font-weight: 500;
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    function closeVideoModal() {
        const modal = document.getElementById('video-modal');
        const modalVideo = document.getElementById('modal-video');
        
        modal.classList.remove('active');
        modalVideo.pause();
        modalVideo.src = '';
        document.body.style.overflow = 'auto';
    }

    function playShowcaseVideo() {
        const modal = document.getElementById('video-modal');
        const modalVideo = document.getElementById('modal-video');
        
        modalVideo.src = 'assets/demos/showcase.mp4';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Track showcase video play
        if (typeof gtag !== 'undefined') {
            gtag('event', 'showcase_video_play', {
                'event_category': 'engagement',
                'event_label': 'hero_showcase'
            });
        }
    }

    // Make functions available globally
    window.copyVSCodeCommand = copyVSCodeCommand;
    window.closeVideoModal = closeVideoModal;
    window.playShowcaseVideo = playShowcaseVideo;

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_load_time', {
                        'event_category': 'performance',
                        'value': loadTime
                    });
                }
            }, 1000);
        });
    }

    // Service Worker registration for offline support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

})(); 