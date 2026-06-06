const defaultGangCharacters = [
    { href: 'char-Kalos.html', emoji: '🧢', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780753720/Kalos_Char_Art.png', name: '卡羅斯' },
    { href: 'char-Prittle.html', emoji: '🐰', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780753720/Prittle_Char_Art.png', name: '花生糖' },
    { href: 'char-Annie.html', emoji: '😇', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780753720/Annie_Char_Art.png', name: '安妮' },
    { href: 'char-Rann.html', emoji: '😈', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780753720/Rann_Char_Art.png', name: '雷恩' },
    { href: 'char-Hook.html', emoji: '🐯', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780762173/Hook_Char_Art.png', name: '虎仔' },
    { href: 'char-Cled.html', emoji: '🛠️', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780762173/Cled_Char_Art.png', name: '克勒德' },
    { href: 'char-Penny.html', emoji: '🐦', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780762172/Penny_Char_Art.png', name: '潘妮' },
    { href: 'char-Guden.html', emoji: '🐌', iconUrl: 'https://res.cloudinary.com/ddotapoxu/image/upload/v1780762172/Guden_Char_Art.png', name: '小蝸牛股等' }
];

function buildGangHtml(activeName, gangList = defaultGangCharacters) {
    // Build final gang list by merging the canonical defaults with any page-provided overrides.
    // This centralizes `iconUrl`/images in `defaultGangCharacters` so pages don't need to repeat them.
    const overrides = (gangList || []).reduce((acc, g) => {
        if (g && g.name) acc[g.name] = g;
        return acc;
    }, {});

    const finalList = defaultGangCharacters.map(def => {
        const over = overrides[def.name] || {};
        return Object.assign({}, def, over);
    });

    return finalList.map(item => {
        const activeClass = item.name === activeName ? ' active' : '';
        const iconHtml = item.iconUrl
            ? `<img src="${item.iconUrl}" alt="${item.name}" />`
            : (item.emoji ? `<div class="char-img-placeholder">${item.emoji}</div>` : `<div class="char-img-placeholder">?</div>`);

        return `
            <a class="char-card${activeClass}" href="${item.href}">
                <div class="char-img-box">
                    ${iconHtml}
                </div>
                <div class="char-name">${item.name}</div>
            </a>
        `;
    }).join('');
}

function buildSlidesHtml(slides) {
    return slides.map(slide => {
        const fallback = slide.image.replace(/\.png$/, '.jpg');
        return `
            <div class="slide-item" onclick="location.href='index.html?date=${slide.date}'">
                <img src="${slide.image}"
                     onerror="this.onerror=null; this.src='${fallback}'"
                     alt="${slide.date}">
                <div class="slide-date">${slide.date}</div>
            </div>
        `;
    }).join('');
}

function renderCharacterPage(config) {
    const root = document.getElementById('page-root');
    if (!root) return;

    document.title = config.pageTitle || `SMALL - ${config.hero.name}`;

    root.innerHTML = `
        <header class="header">
            <nav class="nav">
                <div class="nav-left">
                    <a href="index.html">漫畫</a>
                    <a href="characters.html">關於</a>
                </div>
                <div class="nav-logo">
                    <img src="https://res.cloudinary.com/ddotapoxu/image/upload/v1770606840/SMALLL.png"
                         alt="SMALL" onclick="location.href='index.html'">
                </div>
                <div class="nav-right">
                    <a href="#">連載</a>
                    <a href="#">更多</a>
                </div>
            </nav>
        </header>

        <section class="hero">
            <div class="hero-img">
                <img src="${config.hero.image}"
                     onerror="this.onerror=null; this.src='${config.hero.fallback}'"
                     alt="${config.hero.name}">
            </div>
            <div class="hero-info">
                <div class="char-name-en">${config.hero.name}</div>
                <div class="char-name-zh">${config.hero.enName}</div>
                <div class="first-appearance">
                    <span class="tag-label">初次登場</span>
                    <span class="tag-value">—— ${config.hero.firstAppearance}</span>
                </div>
                <p class="char-desc">${config.hero.description}</p>
                <div class="did-you-know">你知道嗎？</div>
                <p class="trivia-text">${config.hero.trivia}</p>
            </div>
        </section>

        <hr class="divider">

        <div class="quote-section">
            <div class="quote-inner">${config.quote}</div>
        </div>

        <hr class="divider">

        <section class="comics-section">
            <div class="section-title">出場漫畫</div>
            <div class="slider-outer">
                <button class="slider-btn prev" id="sliderPrev">‹</button>
                <div class="slider-viewport">
                    <div class="slider-track" id="sliderTrack">
                        ${buildSlidesHtml(config.slides)}
                    </div>
                </div>
                <button class="slider-btn next" id="sliderNext">›</button>
            </div>
        </section>

        <hr class="divider">

        <section class="gang-section">
            <h2>角色介紹</h2>
            <div class="gang-grid">
                ${buildGangHtml(config.activeName, config.gangList)}
            </div>
        </section>

        <footer class="footer">
            <div class="footer-content">
                <div class="footer-left">© Smallstudio1104 ・ 保留所有權利</div>
                <img class="footer-logo"
                     src="https://res.cloudinary.com/ddotapoxu/image/upload/v1770606840/SMALLL.png"
                     alt="SMALL Logo"
                     onclick="location.href='index.html'">
            </div>
            <div class="footer-links">
                <a href="index.html">漫畫連載</a>·
                <a href="characters.html">關於與角色</a>·
                <a href="#">其他連載</a>·
                <a href="#">更多作品</a>
            </div>
        </footer>
    `;

    const track = document.getElementById('sliderTrack');
    const slides = track.querySelectorAll('.slide-item');
    const total = slides.length;
    let current = 0;

    function goTo(index) {
        current = (index + total) % total;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
    }

    document.getElementById('sliderPrev').addEventListener('click', function() {
        goTo(current - 1);
    });

    document.getElementById('sliderNext').addEventListener('click', function() {
        goTo(current + 1);
    });
}

window.renderCharacterPage = renderCharacterPage;
