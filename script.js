document.addEventListener('DOMContentLoaded', () => {
    const backgroundAnimation = document.querySelector('.background-animation');
    const navLinks = document.querySelectorAll('nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const heroSection = document.getElementById('hero');

    let currentActiveSectionId = 'hero'; // Track the currently active section ID

    // Initial display: hero section only
    heroSection.classList.add('visible');

    // hero section disappears on click
    heroSection.addEventListener('click', () => {
        heroSection.classList.remove('visible');
        heroSection.classList.add('hidden');
    });

    // Get the order of sections from navigation links
    const sectionOrder = Array.from(navLinks).map(link => link.dataset.section);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.dataset.section;
            const targetSection = document.getElementById(targetSectionId);

            if (targetSectionId === currentActiveSectionId) {
                // Clicking the same section, do nothing
                return;
            }

            // Determine direction for the incoming section
            const currentIndex = sectionOrder.indexOf(currentActiveSectionId);
            const targetIndex = sectionOrder.indexOf(targetSectionId);

            let incomingDirection = 'right'; // Default: slide in from right
            if (currentActiveSectionId === 'hero') {
                // If coming from hero, always slide in from right for content sections
                incomingDirection = 'right';
            } else if (targetIndex < currentIndex) {
                incomingDirection = 'left'; // Target is to the left of current
            } else if (targetIndex > currentIndex) {
                incomingDirection = 'right'; // Target is to the right of current
            }

            // Hide all currently visible sections (including hero if it's visible)
            document.querySelectorAll('.content-section.visible, #hero.visible').forEach(visibleSection => {
                visibleSection.classList.remove('visible');
                visibleSection.classList.add('hidden');

                // Apply transform for the outgoing section to slide out in the opposite direction of incoming
                if (visibleSection.id !== 'hero') { // Hero just fades out
                    if (incomingDirection === 'right') { // If new section slides in from right, old one slides out to left
                        visibleSection.style.transform = 'translateX(-100%)';
                    } else { // If new section slides in from left, old one slides out to right
                        visibleSection.style.transform = 'translateX(100%)';
                    }
                }

                visibleSection.addEventListener('transitionend', function handler() {
                    if (visibleSection.id !== 'hero') {
                        visibleSection.style.display = 'none';
                        visibleSection.style.transform = ''; // Reset transform for next time it might be shown
                    }
                    visibleSection.removeEventListener('transitionend', handler);
                }, { once: true }); // Use { once: true } to automatically remove the listener
            });

            // Show the new section
            if (targetSection) {
                // Set initial position based on incoming direction before making it visible
                if (incomingDirection === 'right') {
                    targetSection.style.transform = 'translateX(100%)'; // Start from right
                } else {
                    targetSection.style.transform = 'translateX(-100%)'; // Start from left
                }
                targetSection.style.display = 'block'; // Make it displayable for transition

                // A small delay to ensure the initial transform is applied before the transition starts
                setTimeout(() => {
                    targetSection.classList.remove('hidden');
                    targetSection.classList.add('visible');
                    targetSection.style.transform = 'translateX(0)'; // Slide into view
                }, 50); // Slightly longer delay to ensure transform is set before transition

                currentActiveSectionId = targetSectionId; // Update active section
            }
        });
    });
});
