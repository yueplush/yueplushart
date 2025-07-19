document.addEventListener('DOMContentLoaded', () => {
    const backgroundAnimation = document.querySelector('.background-animation');
    const navLinks = document.querySelectorAll('nav ul li a');
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

            let outgoingTransitionPromises = [];

            // heroセクションがまだ表示されている場合は、それを非表示にするPromiseを追加
            if (heroSection.classList.contains('visible')) {
                heroSection.classList.remove('visible');
                heroSection.classList.add('hidden');
                let heroTransitionPromise = new Promise(resolve => {
                    heroSection.addEventListener('transitionend', function handler() {
                        heroSection.style.display = 'none';
                        heroSection.removeEventListener('transitionend', handler);
                        resolve();
                    }, { once: true });
                });
                outgoingTransitionPromises.push(heroTransitionPromise);
                currentActiveSectionId = ''; // heroが非表示になったらアクティブセクションをリセット
            }

            // 現在表示されているコンテンツセクションを非表示にするPromiseを追加
            document.querySelectorAll('.content-section.visible').forEach(visibleSection => {
                visibleSection.classList.remove('visible');
                visibleSection.classList.add('hidden');

                // Apply transform for the outgoing section to slide out in the opposite direction of incoming
                // Determine direction for the incoming section based on the *current* active section
                const currentIndex = sectionOrder.indexOf(currentActiveSectionId);
                const targetIndex = sectionOrder.indexOf(targetSectionId);

                let outgoingDirection;
                if (currentActiveSectionId === '' || currentActiveSectionId === 'hero') {
                    // If coming from hero or no active content, outgoing direction is not relevant for hero, but for content it's opposite of incoming
                    outgoingDirection = 'left'; // Default for content if hero was active
                } else if (targetIndex < currentIndex) {
                    // New content comes from right, old content goes to left
                    outgoingDirection = 'left';
                } else { // targetIndex > currentIndex
                    // New content comes from left, old content goes to right
                    outgoingDirection = 'right';
                }

                if (outgoingDirection === 'left') {
                    visibleSection.style.transform = 'translateX(-100%)';
                } else {
                    visibleSection.style.transform = 'translateX(100%)';
                }

                let transitionPromise = new Promise(resolve => {
                    visibleSection.addEventListener('transitionend', function handler() {
                        visibleSection.style.display = 'none';
                        visibleSection.style.transform = ''; // Reset transform for next time it might be shown
                        visibleSection.removeEventListener('transitionend', handler);
                        resolve();
                    }, { once: true });
                });
                outgoingTransitionPromises.push(transitionPromise);
            });

            // すべての非表示アニメーションが完了するのを待つ
            Promise.all(outgoingTransitionPromises).then(() => {
                // Determine direction for the incoming section *after* outgoing transitions are complete
                const currentIndex = sectionOrder.indexOf(currentActiveSectionId);
                const targetIndex = sectionOrder.indexOf(targetSectionId);

                let incomingDirection;
                if (currentActiveSectionId === '' || currentActiveSectionId === 'hero') {
                    incomingDirection = 'right'; // heroからコンテンツへの初回遷移時は常に右からスライドイン
                } else if (targetIndex < currentIndex) {
                    incomingDirection = 'right'; // Clicked left of current -> new content slides in from RIGHT
                } else { // targetIndex > currentIndex
                    incomingDirection = 'left'; // Clicked right of current -> new content slides in from LEFT
                }

                // Show the new section
                if (targetSection) {
                    // Set initial position based on incoming direction before making it visible
                    if (incomingDirection === 'right') {
                        targetSection.style.transform = 'translateX(100%)'; // Start from right
                    } else {
                        targetSection.style.transform = 'translateX(-100%)'; // Start from left
                    }
                    targetSection.style.display = 'block'; // Make it displayable for transition

                    // Force reflow to ensure initial transform is applied before transition
                    targetSection.offsetWidth; 

                    // Trigger both opacity and transform transitions simultaneously
                    targetSection.classList.remove('hidden');
                    targetSection.classList.add('visible');
                    targetSection.style.transform = 'translateX(0)'; // Slide into view

                    currentActiveSectionId = targetSectionId; // Update active section
                }
            });
        });
    });
});
