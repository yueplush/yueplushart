document.addEventListener('DOMContentLoaded', () => {
    const backgroundAnimation = document.querySelector('.background-animation');
    const navLinks = document.querySelectorAll('nav ul li a:not(.patreon-button)');
    const heroSection = document.getElementById('hero');

    let currentActiveSectionId = 'hero'; // Track the currently active section ID

    // Initial display: hero section only
    heroSection.classList.add('visible');

    // hero section disappears on click
    heroSection.addEventListener('click', () => {
        if (heroSection.classList.contains('visible')) {
            heroSection.classList.remove('visible');
            heroSection.classList.add('hidden');
            heroSection.addEventListener('transitionend', function handler() {
                heroSection.style.display = 'none';
                heroSection.removeEventListener('transitionend', handler);
            }, { once: true });
            currentActiveSectionId = ''; // heroが非表示になったらアクティブセクションをリセット
        }
    });

    // Get the order of sections from navigation links
    const sectionOrder = Array.from(navLinks).map(link => link.dataset.section);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.dataset.section;
            const targetSection = document.getElementById(targetSectionId);

            // クリックされたセクションが既にアクティブな場合は何もしない
            if (targetSectionId === currentActiveSectionId) {
                return;
            }

            // heroセクションがまだ表示されている場合は、それを非表示にする
            if (heroSection.classList.contains('visible')) {
                heroSection.classList.remove('visible');
                heroSection.classList.add('hidden');
                setTimeout(() => {
                    heroSection.style.display = 'none';
                }, 500); // CSS transition duration
                currentActiveSectionId = ''; // heroが非表示になったらアクティブセクションをリセット
            }

            // 現在表示されているコンテンツセクションを非表示にする
            document.querySelectorAll('.content-section.visible').forEach(visibleSection => {
                visibleSection.classList.remove('visible');
                visibleSection.classList.add('hidden');

                // Apply transform for the outgoing section to slide out in the opposite direction of incoming
                const currentIndex = sectionOrder.indexOf(currentActiveSectionId);
                const targetIndex = sectionOrder.indexOf(targetSectionId);

                let outgoingDirection;
                if (currentActiveSectionId === '' || currentActiveSectionId === 'hero') {
                    outgoingDirection = 'left';
                } else if (targetIndex < currentIndex) {
                    outgoingDirection = 'left';
                } else { 
                    outgoingDirection = 'right';
                }

                if (outgoingDirection === 'left') {
                    visibleSection.style.transform = 'translateX(-100%)';
                } else {
                    visibleSection.style.transform = 'translateX(100%)';
                }

                // Set display: none after transition completes
                setTimeout(() => {
                    visibleSection.style.display = 'none';
                    visibleSection.style.transform = ''; // Reset transform
                }, 500); // CSS transition duration
            });

            // 新しいセクションを表示
            setTimeout(() => {
                if (targetSection) {
                    // Determine direction for the incoming section
                    const currentIndex = sectionOrder.indexOf(currentActiveSectionId);
                    const targetIndex = sectionOrder.indexOf(targetSectionId);

                    let incomingDirection;
                    if (currentActiveSectionId === '' || currentActiveSectionId === 'hero') {
                        incomingDirection = 'right';
                    } else if (targetIndex < currentIndex) {
                        incomingDirection = 'right';
                    } else { 
                        incomingDirection = 'left';
                    }

                    // Set initial position based on incoming direction before making it visible
                    if (incomingDirection === 'right') {
                        targetSection.style.transform = 'translateX(100%)';
                    } else {
                        targetSection.style.transform = 'translateX(-100%)';
                    }
                    targetSection.style.display = 'block';

                    // Force reflow
                    targetSection.offsetWidth; 

                    // Trigger transition
                    targetSection.classList.remove('hidden');
                    targetSection.classList.add('visible');
                    targetSection.style.transform = 'translateX(0)';

                    currentActiveSectionId = targetSectionId; // Update active section
                }
            }, 250); // Delay for new section to appear (half of transition duration)
        });
    });
});
