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

// Form Submission
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const formProps = Object.fromEntries(formData);
    
    // Here you would typically send the form data to your backend
    // For now, we'll just log it and show a success message
    console.log('Form submitted:', formProps);
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    
    // Clear form
    contactForm.reset();
});

// Case Study Progress Bar Animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const progressBars = card.querySelectorAll('.progress-fill');
            
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width + '%';
                }, 300);
            });
            
            // Unobserve after animation to prevent re-triggering
            progressObserver.unobserve(card);
        }
    });
}, observerOptions);

// Observe all case study cards
document.addEventListener('DOMContentLoaded', () => {
    const caseStudyCards = document.querySelectorAll('.case-study-card');
    caseStudyCards.forEach(card => {
        progressObserver.observe(card);
    });
});

// Case Study Button Interactions
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-case-study')) {
        e.preventDefault();
        
        // Get the parent card to identify which case study
        const card = e.target.closest('.case-study-card');
        const title = card.querySelector('h3').textContent;
        
        // Create a modal-like experience (for now, just an alert)
        // In a real implementation, you'd open a detailed case study page
        showCaseStudyModal(title, card);
    }
});

// Case Study Modal Function
function showCaseStudyModal(title, card) {
    // Extract key metrics for the modal
    const metrics = Array.from(card.querySelectorAll('.metric')).map(metric => {
        const value = metric.querySelector('.metric-value').textContent;
        const label = metric.querySelector('.metric-label').textContent;
        return `${label}: ${value}`;
    });
    
    const strategy = Array.from(card.querySelectorAll('.strategy-section li')).map(li => 
        li.textContent
    );
    
    const modalContent = `
${title}

Key Results:
${metrics.join('\n')}

Strategy Implemented:
${strategy.join('\n')}

This is a preview. In a full implementation, this would open a detailed case study page with:
• Before/after screenshots
• Detailed timeline
• Client testimonials
• Technical implementation details
• ROI analysis

Would you like to discuss a similar project for your business?
    `;
    
    alert(modalContent);
    
    // In a real implementation, you'd create a proper modal or navigate to a case study page
    // Example: window.location.href = `/case-studies/${title.toLowerCase().replace(/\s+/g, '-')}`;
}

// Enhanced Card Hover Effects
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.case-study-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add subtle scale effect to metrics
            const metrics = card.querySelectorAll('.metric');
            metrics.forEach((metric, index) => {
                setTimeout(() => {
                    metric.style.transform = 'scale(1.02)';
                    metric.style.transition = 'transform 0.2s ease';
                }, index * 50);
            });
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset metrics scale
            const metrics = card.querySelectorAll('.metric');
            metrics.forEach(metric => {
                metric.style.transform = 'scale(1)';
            });
        });
    });
}); 