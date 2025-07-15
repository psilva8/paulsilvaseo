// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    // Toggle Nav
    navLinks.classList.toggle('nav-active');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    
    // Animate Links
    links.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

    // Hamburger Animation
    hamburger.classList.toggle('toggle');
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu if open
            if (navLinks.classList.contains('nav-active')) {
                hamburger.click();
            }
        }
    });
});

// Enhanced Form Submission with Formspree
const contactForm = document.getElementById('contact-form');
const submitButton = contactForm.querySelector('.submit-button');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    setFormLoading(true);
    hideFormStatus();
    
    try {
        const formData = new FormData(contactForm);
        
        // Submit to Formspree
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showFormStatus('success', 
                '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully. I\'ll get back to you within 24 hours.'
            );
            contactForm.reset();
            
            // Track successful submission (you can add analytics here)
            console.log('Form submitted successfully');
            
        } else {
            const data = await response.json();
            if (data.errors) {
                const errorMessages = data.errors.map(error => error.message).join(', ');
                throw new Error(errorMessages);
            } else {
                throw new Error('Something went wrong. Please try again.');
            }
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormStatus('error', 
            '<i class="fas fa-exclamation-triangle"></i> Sorry, there was an error sending your message. Please try again or email me directly at paul@paulsilvamarketing.com'
        );
    } finally {
        setFormLoading(false);
    }
});

function setFormLoading(loading) {
    if (loading) {
        submitButton.classList.add('loading');
        submitButton.disabled = true;
    } else {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

function showFormStatus(type, message) {
    formStatus.className = `form-status ${type}`;
    formStatus.innerHTML = message;
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFormStatus() {
    formStatus.className = 'form-status';
    formStatus.innerHTML = '';
}

// Form validation enhancements
document.addEventListener('DOMContentLoaded', () => {
    const formInputs = contactForm.querySelectorAll('input, textarea, select');
    
    formInputs.forEach(input => {
        // Real-time validation feedback
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            // Clear any previous error styling
            input.style.borderColor = '';
        });
    });
});

function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
        field.style.borderColor = '#ef4444';
        return false;
    }
    
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            field.style.borderColor = '#ef4444';
            return false;
        }
    }
    
    field.style.borderColor = '#10b981';
    return true;
}

// Audit Viewer Functionality
class AuditViewer {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 10;
        this.zoomLevel = 1;
        this.isFullscreen = false;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateProgress();
        this.preloadImages();
    }
    
    bindEvents() {
        // Navigation arrows
        document.querySelector('.prev-arrow').addEventListener('click', () => this.prevPage());
        document.querySelector('.next-arrow').addEventListener('click', () => this.nextPage());
        
        // Thumbnail clicks
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const pageNum = parseInt(thumb.dataset.page);
                this.goToPage(pageNum);
            });
        });
        
        // Zoom controls
        document.querySelector('[data-zoom="in"]').addEventListener('click', () => this.zoomIn());
        document.querySelector('[data-zoom="out"]').addEventListener('click', () => this.zoomOut());
        
        // Fullscreen toggle
        document.querySelector('.fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Mouse wheel zoom (when holding Ctrl)
        document.querySelector('.audit-page-container').addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) this.zoomIn();
                else this.zoomOut();
            }
        });
        
        // Touch/Mouse drag for zoomed images
        this.setupDragFunctionality();
        
        // Double-click to zoom
        document.querySelector('.audit-page-container').addEventListener('dblclick', () => {
            if (this.zoomLevel === 1) this.zoomIn();
            else this.resetZoom();
        });
        
        // Escape key for fullscreen exit
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.toggleFullscreen();
            }
        });
    }
    
    setupDragFunctionality() {
        const container = document.querySelector('.audit-page-container');
        
        container.addEventListener('mousedown', (e) => this.startDrag(e));
        container.addEventListener('mousemove', (e) => this.drag(e));
        container.addEventListener('mouseup', () => this.endDrag());
        container.addEventListener('mouseleave', () => this.endDrag());
        
        // Touch events for mobile
        container.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drag(e.touches[0]);
        });
        container.addEventListener('touchend', () => this.endDrag());
    }
    
    startDrag(e) {
        if (this.zoomLevel <= 1) return;
        
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        const activeImg = document.querySelector('.audit-page.active');
        const rect = activeImg.getBoundingClientRect();
        this.scrollLeft = rect.left;
        this.scrollTop = rect.top;
        
        document.body.style.cursor = 'grabbing';
    }
    
    drag(e) {
        if (!this.isDragging || this.zoomLevel <= 1) return;
        
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        
        const activeImg = document.querySelector('.audit-page.active');
        activeImg.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(${this.zoomLevel})`;
    }
    
    endDrag() {
        this.isDragging = false;
        document.body.style.cursor = '';
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) return;
        
        // Remove active class from current page and thumbnail
        document.querySelector('.audit-page.active').classList.remove('active');
        document.querySelector('.thumbnail.active').classList.remove('active');
        
        // Add active class to new page and thumbnail
        document.querySelector(`[data-page="${pageNum}"].audit-page`).classList.add('active');
        document.querySelector(`[data-page="${pageNum}"].thumbnail`).classList.add('active');
        
        this.currentPage = pageNum;
        this.updateProgress();
        this.updatePageCounter();
        this.updateNavigationButtons();
        this.resetZoom();
        
        // Smooth scroll thumbnail into view
        const activeThumbnail = document.querySelector('.thumbnail.active');
        activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    updateProgress() {
        const progressPercentage = (this.currentPage / this.totalPages) * 100;
        document.querySelector('.audit-progress .progress-fill').style.width = `${progressPercentage}%`;
    }
    
    updatePageCounter() {
        document.querySelector('.current-page').textContent = this.currentPage;
    }
    
    updateNavigationButtons() {
        const prevBtn = document.querySelector('.prev-arrow');
        const nextBtn = document.querySelector('.next-arrow');
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === this.totalPages;
    }
    
    zoomIn() {
        if (this.zoomLevel < 3) {
            this.zoomLevel += 0.5;
            this.applyZoom();
        }
    }
    
    zoomOut() {
        if (this.zoomLevel > 1) {
            this.zoomLevel -= 0.5;
            this.applyZoom();
        }
    }
    
    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
    }
    
    applyZoom() {
        const activeImg = document.querySelector('.audit-page.active');
        
        if (this.zoomLevel === 1) {
            activeImg.style.transform = 'translate(-50%, -50%) scale(1)';
            activeImg.classList.remove('zoomed');
        } else {
            activeImg.style.transform = `translate(-50%, -50%) scale(${this.zoomLevel})`;
            activeImg.classList.add('zoomed');
        }
        
        // Update zoom button states
        document.querySelector('[data-zoom="out"]').disabled = this.zoomLevel <= 1;
        document.querySelector('[data-zoom="in"]').disabled = this.zoomLevel >= 3;
    }
    
    toggleFullscreen() {
        const viewer = document.querySelector('.audit-viewer');
        const fullscreenBtn = document.querySelector('.fullscreen-btn');
        
        if (!this.isFullscreen) {
            viewer.classList.add('fullscreen');
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            this.isFullscreen = true;
        } else {
            viewer.classList.remove('fullscreen');
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            this.isFullscreen = false;
        }
    }
    
    handleKeyboard(e) {
        // Only handle keyboard if audit viewer is visible
        if (!document.querySelector('.audit-viewer')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevPage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextPage();
                break;
            case '+':
            case '=':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.zoomIn();
                }
                break;
            case '-':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.zoomOut();
                }
                break;
            case '0':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.resetZoom();
                }
                break;
            case 'f':
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
    
    preloadImages() {
        // Preload next few images for smoother navigation
        for (let i = this.currentPage + 1; i <= Math.min(this.currentPage + 3, this.totalPages); i++) {
            const img = new Image();
            img.src = `images/audit-pages/page-${i.toString().padStart(2, '0')}.png`;
        }
    }
}

// Initialize Audit Viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.audit-viewer')) {
        const auditViewer = new AuditViewer();
        
        // Add loading states for images
        document.querySelectorAll('.audit-page').forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            img.addEventListener('error', () => {
                img.style.opacity = '0.5';
                console.warn(`Failed to load audit page: ${img.src}`);
            });
        });
    }
}); 