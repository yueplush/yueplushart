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
        heroSection.addEventListener('transitionend', function handler() {
            heroSection.style.display = 'none';
            heroSection.removeEventListener('transitionend', handler);
        }, { once: true });
        currentActiveSectionId = ''; // heroが非表示になったらアクティブセクションをリセット
    });

    // Get the order of sections from navigation links
    const sectionOrder = Array.from(navLinks).map(link => link.dataset.section);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.dataset.section;
            const targetSection = document.getElementById(targetSectionId);

            // heroセクションがまだ表示されている場合は、それを非表示にする
            if (heroSection.classList.contains('visible')) {
                heroSection.classList.remove('visible');
                heroSection.classList.add('hidden');
                heroSection.addEventListener('transitionend', function handler() {
                    heroSection.style.display = 'none';
                    heroSection.removeEventListener('transitionend', handler);
                }, { once: true });
                currentActiveSectionId = ''; // heroが非表示になったらアクティブセクションをリセット
            }

            if (targetSectionId === currentActiveSectionId) {
                // Clicking the same section, do nothing
                return;
            }

            // Determine direction for the incoming section
            const currentIndex = sectionOrder.indexOf(currentActiveSectionId);
            const targetIndex = sectionOrder.indexOf(targetSectionId);

            let incomingDirection;
            // heroからコンテンツへの初回遷移時は常に右からスライドイン
            if (currentActiveSectionId === '' || currentActiveSectionId === 'hero') {
                incomingDirection = 'right';
            } else {
                if (targetIndex < currentIndex) {
                    // Clicked left of current -> new content slides in from RIGHT
                    incomingDirection = 'right';
                } else { // targetIndex > currentIndex
                    // Clicked right of current -> new content slides in from LEFT
                    incomingDirection = 'left';
                }
            }

            // Hide all currently visible sections
            document.querySelectorAll('.content-section.visible').forEach(visibleSection => {
                visibleSection.classList.remove('visible');
                visibleSection.classList.add('hidden');

                // Apply transform for the outgoing section to slide out in the opposite direction of incoming
                if (incomingDirection === 'right') { // If new section slides in from right, old one slides out to left
                    visibleSection.style.transform = 'translateX(-100%)';
                } else { // If new section slides in from left, old one slides out to right
                    visibleSection.style.transform = 'translateX(100%)';
                }

                visibleSection.addEventListener('transitionend', function handler() {
                    visibleSection.style.display = 'none';
                    visibleSection.style.transform = ''; // Reset transform for next time it might be shown
                    visibleSection.removeEventListener('transitionend', handler);
                }, { once: true });
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
                targetSection.classList.remove('hidden'); // Make it visible (opacity 1)
                targetSection.classList.add('visible'); // Add visible class for transition

                // Force reflow to ensure initial transform and opacity are applied
                targetSection.offsetWidth; 

                // Trigger the slide-in animation after a very short delay
                setTimeout(() => {
                    targetSection.style.transform = 'translateX(0)'; // Slide into view
                }, 10); // A very short delay to allow reflow to complete

                currentActiveSectionId = targetSectionId; // Update active section
            }
        });
    });
});
