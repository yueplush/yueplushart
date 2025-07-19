document.addEventListener('DOMContentLoaded', () => {
    const backgroundAnimation = document.querySelector('.background-animation');

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        backgroundAnimation.appendChild(particle);

        const size = Math.random() * 5 + 1; // 1px to 6px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // ランダムな色（黒ベースに合うように調整）
        const hue = Math.random() * 360; // 0-360
        const saturation = Math.random() * 30 + 70; // 70-100%
        const lightness = Math.random() * 20 + 70; // 70-90%
        particle.style.backgroundColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${Math.random() * 0.5 + 0.2})`;

        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        const duration = Math.random() * 15 + 10; // 10s to 25s
        const delay = Math.random() * 10; // 0s to 10s

        // より複雑な動き
        const endX = Math.random() * window.innerWidth;
        const endY = Math.random() * window.innerHeight;

        particle.animate([
            { transform: `translate(0, 0) scale(1)`, opacity: 0.2 },
            { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(${Math.random() * 0.5 + 0.75})`, opacity: 0.8 },
            { transform: `translate(${Math.random() * window.innerWidth - startX}px, ${Math.random() * window.innerHeight - startY}px) scale(1)`, opacity: 0.2 }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out'
        });

        // パーティクルが多すぎると重くなるので、一定数を超えたら古いものを削除
        if (backgroundAnimation.children.length > 150) { // パーティクル数を少し増やす
            backgroundAnimation.removeChild(backgroundAnimation.children[0]);
        }
    }

    // CSSでパーティクルのスタイルを定義
    const style = document.createElement('style');
    style.innerHTML = `
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            will-change: transform, opacity; /* パフォーマンス改善 */
        }
    `;
    document.head.appendChild(style);

    // 一定間隔でパーティクルを生成
    setInterval(createParticle, 150); // 生成間隔を短くする

    // 初期パーティクルをいくつか生成
    for (let i = 0; i < 80; i++) { // 初期パーティクル数を増やす
        createParticle();
    }
});
