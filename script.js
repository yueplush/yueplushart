document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const heroSection = document.getElementById('hero');

    // 初期表示: heroセクションのみ表示
    heroSection.classList.add('visible');

    // heroセクションがクリックされたら非表示にする
    heroSection.addEventListener('click', () => {
        heroSection.classList.remove('visible');
        heroSection.classList.add('hidden');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.dataset.section;
            const targetSection = document.getElementById(targetSectionId);

            // 現在表示されているすべてのセクション（heroを含む）をフェードアウト
            document.querySelectorAll('.content-section.visible, #hero.visible').forEach(visibleSection => {
                visibleSection.classList.remove('visible');
                visibleSection.classList.add('hidden');
                // アニメーション終了後にdisplay:noneを適用
                visibleSection.addEventListener('transitionend', function handler() {
                    // heroセクションはpointer-eventsで制御するためdisplay:noneは不要
                    if (visibleSection.id !== 'hero') {
                        visibleSection.style.display = 'none';
                    }
                    visibleSection.removeEventListener('transitionend', handler);
                });
            });

            // 新しいセクションをフェードイン
            if (targetSection) {
                targetSection.style.display = 'block'; // displayをblockにしてからopacityを1にする
                setTimeout(() => {
                    targetSection.classList.remove('hidden');
                    targetSection.classList.add('visible');
                }, 10); // 短い遅延でトランジションをトリガー
            }
        });
    });
});
