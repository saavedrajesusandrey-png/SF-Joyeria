const WA_NUMBER = '573507098325';
let loupeScale = 2.2;

// 0. PANTALLA DE CARGA LLAMATIVA CON CONTADOR Y APERTURA DE CORTINAS
(function initVaultPreloader() {
    const preloader = document.getElementById('preloader');
    const barFill = document.getElementById('preloaderBarFill');
    const percentLabel = document.getElementById('preloaderPercent');
    const statusText = document.getElementById('preloaderStatus');
    if (!preloader) return;

    let progress = 0;
    let pageReady = false;
    let finished = false;
    const startTime = performance.now();
    const MIN_SHOW_MS = 1250;

    const messages = [
        'Puliendo detalles en oro 18k...',
        'Preparando 34 diseños exclusivos...',
        'Listos para brillar...'
    ];

    const interval = setInterval(() => {
        const cap = pageReady ? 100 : 88;
        const step = pageReady ? 12 : Math.max(2, Math.round((cap - progress) * 0.18));
        progress = Math.min(cap, progress + step);

        if (barFill) barFill.style.width = `${progress}%`;
        if (percentLabel) percentLabel.textContent = `${progress}%`;

        if (statusText) {
            if (progress < 45) statusText.textContent = messages[0];
            else if (progress < 85) statusText.textContent = messages[1];
            else statusText.textContent = messages[2];
        }

        if (progress >= 100 && !finished) {
            finished = true;
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('reveal-site');
                document.body.classList.remove('no-scroll');
                setTimeout(() => preloader.remove(), 800);
            }, 180);
        }
    }, 55);

    function markReady() {
        const elapsed = performance.now() - startTime;
        const wait = Math.max(0, MIN_SHOW_MS - elapsed);
        setTimeout(() => {
            pageReady = true;
        }, wait);
    }

    if (document.readyState === 'complete') {
        markReady();
    } else {
        window.addEventListener('load', markReady, { once: true });
    }

    setTimeout(() => { pageReady = true; }, 3800);
})();

let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('globalToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function slugify(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// 1. EFECTO RIPPLE
document.querySelectorAll('.btn-interactive').forEach(button => {
    button.addEventListener('click', function(e) {
        const circle = document.createElement('span');
        const diameter = Math.max(this.clientWidth, this.clientHeight);
        const radius = diameter / 2;
        const rect = this.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');

        const ripple = this.getElementsByClassName('ripple')[0];
        if (ripple) ripple.remove();
        this.appendChild(circle);
    });
});

// 2. BRILLO DINÁMICO EN TARJETAS AL MOVER CURSOR / DEDO
document.querySelectorAll('.shine-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x.toFixed(1)}%`);
        card.style.setProperty('--my', `${y.toFixed(1)}%`);
    });
});

// 3. CONTADOR DE VISITAS PARA VERCEL (/api/visits)
function renderVisitNumber(counterElement, totalVisits) {
    let hasAnimated = false;
    const numericTarget = Number(totalVisits) || 0;

    function animateCount() {
        const rect = counterElement.getBoundingClientRect();
        if (rect.top <= window.innerHeight && !hasAnimated) {
            hasAnimated = true;
            let current = 0;
            const increment = Math.max(1, Math.ceil(numericTarget / 35));
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericTarget) {
                    counterElement.innerText = numericTarget.toLocaleString('es-CO');
                    clearInterval(timer);
                } else {
                    counterElement.innerText = current.toLocaleString('es-CO');
                }
            }, 30);
        }
    }

    window.addEventListener('scroll', animateCount, { passive: true });
    animateCount();
}

async function initVisitCounter() {
    const counterElement = document.getElementById('visitCount');
    if (!counterElement) return;

    try {
        const res = await fetch('/api/visits', { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            if (typeof data.visits === 'number') {
                renderVisitNumber(counterElement, data.visits);
                return;
            }
        }
    } catch (_) {}

    const BASE_VISITS = 2125;
    const localVisits = parseInt(localStorage.getItem('sf_jewelry_visits') || '0', 10) + 1;
    localStorage.setItem('sf_jewelry_visits', localVisits);
    renderVisitNumber(counterElement, BASE_VISITS + localVisits);
}

// 4. LOGO INTERACTIVO
let badgeTimeout;
function toggleLogoTooltip() {
    const badge = document.getElementById('logoBadge');
    if (!badge) return;
    badge.classList.toggle('show');
    clearTimeout(badgeTimeout);
    if (badge.classList.contains('show')) {
        badgeTimeout = setTimeout(() => badge.classList.remove('show'), 3500);
    }
}

function handleLogoClick(e) {
    if (e && e.target.closest('.badge-action-btn')) return;
    toggleLogoTooltip();
}

function openLogoPreview(e) {
    if (e) e.stopPropagation();
    const badge = document.getElementById('logoBadge');
    if (badge) badge.classList.remove('show');
    openModal(
        'SF Joyería — Identidad Oficial',
        'Creaciones artesanales en tejidos, balines, piezas personalizadas y oro laminado de 18k. Toca "Activar Lupa" para ver el emblema de cerca.',
        'logo.jpg',
        true
    );
}

document.addEventListener('click', (e) => {
    const badge = document.getElementById('logoBadge');
    const trigger = document.getElementById('brandLogoTrigger');
    if (badge && trigger && !trigger.contains(e.target)) {
        badge.classList.remove('show');
    }
});

// 5. MENÚ MÓVIL Y POSICIÓN EXACTA DEL NAVBAR
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navItems = document.querySelectorAll('.nav-item');

function syncNavPosition() {
    if (!navbar) return;
    const rect = navbar.getBoundingClientRect();
    document.documentElement.style.setProperty('--nav-bottom', `${Math.max(56, Math.round(rect.bottom))}px`);
}

function closeMobileMenu() {
    if (!navMenu || !menuToggle) return;
    navMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
}

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        syncNavPosition();
        const isOpen = navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('no-scroll', isOpen);
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-xmark', isOpen);
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });
}

// 6. NAVBAR CON SCROLL Y RESIZE
window.addEventListener('scroll', function() {
    if (!navbar) return;
    if (window.scrollY > 40) {
        navbar.style.padding = '9px 5%';
    } else {
        navbar.style.padding = '12px 5%';
    }
    syncNavPosition();
}, { passive: true });

window.addEventListener('resize', () => {
    syncNavPosition();
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}, { passive: true });

// 7. SISTEMA DE FAVORITOS (GUARDADO EN DISPOSITIVO + COTIZAR LISTA)
const FAV_STORAGE_KEY = 'sf_joyeria_favoritos_v1';
let favoriteSlugs = new Set(JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]'));

function saveFavorites() {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(Array.from(favoriteSlugs)));
    updateFavoritesUI();
}

function updateFavoritesUI() {
    const count = favoriteSlugs.size;
    const filterCount = document.getElementById('filterFavCount');
    const dockCount = document.getElementById('dockFavCount');
    const favDock = document.getElementById('favDock');

    if (filterCount) filterCount.textContent = count;
    if (dockCount) dockCount.textContent = count;
    if (favDock) favDock.classList.toggle('visible', count > 0);

    document.querySelectorAll('.card-producto').forEach(card => {
        const slug = card.dataset.slug;
        const btn = card.querySelector('.card-fav-btn');
        if (!btn) return;
        const isFav = favoriteSlugs.has(slug);
        btn.classList.toggle('is-fav', isFav);
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
        }
    });

    syncModalFavButton();
}

function toggleFavoriteBySlug(slug, title) {
    if (!slug) return;
    if (favoriteSlugs.has(slug)) {
        favoriteSlugs.delete(slug);
        showToast(`Quitada de favoritas: ${title}`);
    } else {
        favoriteSlugs.add(slug);
        showToast(`Guardada en favoritas: ${title}`);
    }
    saveFavorites();
    if (activeCategory === 'favoritas') {
        filterAndSearchCatalog();
    }
}

function initProductCardsEnhancements() {
    document.querySelectorAll('.card-producto').forEach((card, idx) => {
        const title = card.querySelector('h3')?.textContent?.trim() || `Pieza ${idx + 1}`;
        const slug = `${slugify(title)}-${idx + 1}`;
        card.dataset.slug = slug;
        card.dataset.title = title;

        const imgBox = card.querySelector('.img-box');
        if (imgBox && !imgBox.querySelector('.card-fav-btn')) {
            const favBtn = document.createElement('button');
            favBtn.type = 'button';
            favBtn.className = 'card-fav-btn';
            favBtn.setAttribute('aria-label', `Guardar ${title} en favoritas`);
            favBtn.innerHTML = '<i class="far fa-heart"></i>';
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavoriteBySlug(slug, title);
            });
            imgBox.appendChild(favBtn);
        }
    });
    updateFavoritesUI();
}

function toggleFavoritesFilter() {
    const favBtn = document.getElementById('favFilterBtn');
    const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
    document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' });

    if (activeCategory === 'favoritas' && allBtn) {
        allBtn.click();
    } else if (favBtn) {
        favBtn.click();
    }
}

function orderFavoritesWhatsApp() {
    if (favoriteSlugs.size === 0) return;
    const selectedTitles = [];
    document.querySelectorAll('.card-producto').forEach(card => {
        if (favoriteSlugs.has(card.dataset.slug)) {
            selectedTitles.push(`• ${card.dataset.title}`);
        }
    });
    const text = `Hola SF Joyería! Me interesan estas piezas de mi lista de favoritas:\n\n${selectedTitles.join('\n')}\n\n¿Me das información y precios?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

// 8. FILTROS Y BUSCADOR
const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
const productCards = document.querySelectorAll('.card-producto');
const searchInput = document.getElementById('catalogSearch');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resultsCount = document.getElementById('resultsCount');
const emptyCatalog = document.getElementById('emptyCatalog');
const emptyCatalogMsg = document.getElementById('emptyCatalogMsg');

let activeCategory = 'all';

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function updateClearButton() {
    if (!clearSearchBtn || !searchInput) return;
    clearSearchBtn.classList.toggle('visible', searchInput.value.trim().length > 0);
}

function filterAndSearchCatalog() {
    const query = normalizeText(searchInput ? searchInput.value : '');
    let visibleCount = 0;

    updateClearButton();

    productCards.forEach(card => {
        const cardCategory = normalizeText(card.getAttribute('data-category'));
        const cardText = normalizeText(card.innerText);
        const isFav = favoriteSlugs.has(card.dataset.slug);

        const matchesCategory =
            activeCategory === 'all' ||
            (activeCategory === 'favoritas' ? isFav : cardCategory === activeCategory);
        const matchesQuery = !query || cardText.includes(query);

        if (matchesCategory && matchesQuery) {
            card.style.display = 'flex';
            card.classList.add('active');
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (resultsCount) {
        resultsCount.textContent = visibleCount === 1
            ? 'Mostrando 1 pieza'
            : `Mostrando ${visibleCount} piezas`;
    }

    if (emptyCatalog) {
        emptyCatalog.style.display = visibleCount === 0 ? 'block' : 'none';
        if (emptyCatalogMsg) {
            emptyCatalogMsg.textContent = activeCategory === 'favoritas'
                ? 'Aún no tienes piezas guardadas. Toca el corazón ♥ en cualquier manilla para armar tu lista.'
                : 'No encontramos piezas con ese filtro o palabra clave.';
        }
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = normalizeText(btn.getAttribute('data-filter'));
        filterAndSearchCatalog();
    });
});

if (searchInput) {
    searchInput.addEventListener('input', filterAndSearchCatalog);
}

if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterAndSearchCatalog();
        searchInput.focus();
    });
}

function resetCatalogFilters() {
    activeCategory = 'all';
    if (searchInput) searchInput.value = '';
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
    });
    filterAndSearchCatalog();
}

// 9. BOTÓN "ELEGIR AL AZAR"
function pickRandomPiece() {
    const visibleCards = Array.from(productCards).filter(c => c.style.display !== 'none');
    if (!visibleCards.length) return;

    productCards.forEach(c => c.classList.remove('spotlight-pulse'));
    const chosen = visibleCards[Math.floor(Math.random() * visibleCards.length)];
    chosen.classList.add('active', 'spotlight-pulse');
    chosen.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const title = chosen.querySelector('h3')?.textContent || 'Pieza seleccionada';
    showToast(`Destacada: ${title}`);

    setTimeout(() => {
        chosen.click();
    }, 550);
}

// 10. MODAL DETALLE + LUPA CIRCULAR INTERACTIVA + DEEP LINKING
let currentProductTitle = '';
let currentProductSlug = '';
let isLoupeEnabled = false;

const modalStage = document.getElementById('modalImgStage');
const modalImg = document.getElementById('modalImg');
const loupeLens = document.getElementById('loupeLens');
const loupeToggleBtn = document.getElementById('loupeToggleBtn');

function updateLoupeImageSource(src) {
    if (!loupeLens) return;
    loupeLens.style.backgroundImage = `url("${src}")`;
}

function positionLoupe(clientX, clientY) {
    if (!isLoupeEnabled || !modalStage || !modalImg || !loupeLens) return;

    const stageRect = modalStage.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - stageRect.left, stageRect.width));
    const y = Math.max(0, Math.min(clientY - stageRect.top, stageRect.height));

    loupeLens.style.left = `${x}px`;
    loupeLens.style.top = `${y}px`;

    const bgW = stageRect.width * loupeScale;
    const bgH = stageRect.height * loupeScale;
    const lensHalf = loupeLens.offsetWidth / 2;

    const bgX = -(x * loupeScale - lensHalf);
    const bgY = -(y * loupeScale - lensHalf);

    loupeLens.style.backgroundSize = `${bgW}px ${bgH}px`;
    loupeLens.style.backgroundPosition = `${bgX}px ${bgY}px`;
}

function setLoupeState(enabled) {
    isLoupeEnabled = enabled;
    if (modalStage) modalStage.classList.toggle('loupe-active', isLoupeEnabled);
    if (loupeToggleBtn) {
        const span = loupeToggleBtn.querySelector('span');
        if (span) span.textContent = isLoupeEnabled ? `Lupa ${loupeScale.toFixed(1)}x` : 'Activar Lupa';
    }
    if (isLoupeEnabled && modalStage) {
        const rect = modalStage.getBoundingClientRect();
        positionLoupe(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
    }
}

function toggleLoupe(e) {
    if (e) e.stopPropagation();
    loupeScale = 2.2;
    setLoupeState(!isLoupeEnabled);
}

if (modalStage) {
    modalStage.addEventListener('pointermove', (e) => {
        if (!isLoupeEnabled) return;
        positionLoupe(e.clientX, e.clientY);
    });

    modalStage.addEventListener('pointerdown', (e) => {
        if (e.target.closest('#loupeToggleBtn')) return;
        if (!isLoupeEnabled) {
            setLoupeState(true);
        }
        positionLoupe(e.clientX, e.clientY);
    });

    modalStage.addEventListener('wheel', (e) => {
        if (!isLoupeEnabled) return;
        e.preventDefault();
        loupeScale = Math.min(3.5, Math.max(1.6, loupeScale + (e.deltaY < 0 ? 0.25 : -0.25)));
        const span = loupeToggleBtn?.querySelector('span');
        if (span) span.textContent = `Lupa ${loupeScale.toFixed(1)}x`;
        positionLoupe(e.clientX, e.clientY);
    }, { passive: false });
}

function updateModalWhatsAppLink() {
    const waBtn = document.getElementById('modalWaBtn');
    if (!waBtn) return;
    const message = encodeURIComponent(
        `Hola SF Joyería! Me interesa: ${currentProductTitle}. ¿Me confirmas disponibilidad y precio?`
    );
    waBtn.href = `https://wa.me/${WA_NUMBER}?text=${message}`;
}

function syncModalFavButton() {
    const modalFavBtn = document.getElementById('modalFavBtn');
    if (!modalFavBtn) return;
    if (!currentProductSlug) {
        modalFavBtn.style.display = 'none';
        return;
    }
    modalFavBtn.style.display = 'inline-flex';
    const isFav = favoriteSlugs.has(currentProductSlug);
    modalFavBtn.classList.toggle('is-fav', isFav);
    modalFavBtn.innerHTML = isFav
        ? '<i class="fas fa-heart"></i> <span>Guardada</span>'
        : '<i class="far fa-heart"></i> <span>Guardar</span>';
}

function toggleModalFavorite() {
    if (!currentProductSlug) return;
    toggleFavoriteBySlug(currentProductSlug, currentProductTitle);
}

function openModal(title, desc, imgSrc, isLogoOnly = false) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    const feedback = document.getElementById('shareFeedback');
    if (!modal) return;

    closeMobileMenu();
    currentProductTitle = title;
    if (feedback) feedback.textContent = '';

    const matchedCard = Array.from(productCards).find(c => c.dataset.title === title);
    currentProductSlug = (!isLogoOnly && matchedCard) ? matchedCard.dataset.slug : '';

    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerText = desc;
    modalImg.src = imgSrc;
    updateLoupeImageSource(imgSrc);
    loupeScale = 2.2;
    setLoupeState(false);
    syncModalFavButton();
    updateModalWhatsAppLink();

    if (currentProductSlug && window.history?.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.set('pieza', currentProductSlug);
        window.history.replaceState({}, '', url.toString());
    }

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
    if (modalContent) modalContent.scrollTop = 0;
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    setLoupeState(false);

    if (window.history?.replaceState) {
        const url = new URL(window.location.href);
        if (url.searchParams.has('pieza')) {
            url.searchParams.delete('pieza');
            window.history.replaceState({}, '', url.toString());
        }
    }
}

function getShareablePieceUrl() {
    const url = new URL(window.location.href);
    if (currentProductSlug) {
        url.searchParams.set('pieza', currentProductSlug);
    }
    return url.toString();
}

async function triggerShare(title, text, shareUrl, feedbackId) {
    const feedback = feedbackId ? document.getElementById(feedbackId) : null;

    if (navigator.share) {
        try {
            await navigator.share({ title, text, url: shareUrl });
            if (feedback) feedback.textContent = '¡Enlace enviado!';
            showToast('¡Enlace compartido!');
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(`${text} ${shareUrl}`);
            if (feedback) feedback.textContent = 'Enlace directo copiado al portapapeles.';
            showToast('¡Enlace directo copiado!');
            return;
        } catch (_) {}
    }

    showToast('Copia el enlace desde el navegador');
}

async function shareCurrentProduct() {
    const pieceUrl = getShareablePieceUrl();
    const text = `Mira esta pieza de SF Joyería: ${currentProductTitle}`;
    await triggerShare(`${currentProductTitle} | SF Joyería`, text, pieceUrl, 'shareFeedback');
}

async function shareStore() {
    const baseUrl = window.location.origin + window.location.pathname;
    const text = 'Mira el catálogo de SF Joyería (manillas tejidas y oro laminado 18k):';
    await triggerShare('SF Joyería | Catálogo', text, baseUrl, null);
}

function checkDeepLinkOnLoad() {
    const params = new URLSearchParams(window.location.search);
    const requestedSlug = params.get('pieza');
    if (!requestedSlug) return;

    const targetCard = Array.from(productCards).find(c => c.dataset.slug === requestedSlug);
    if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => targetCard.click(), 300);
    }
}

window.addEventListener('click', function(e) {
    const modal = document.getElementById('productModal');
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeMobileMenu();
        document.getElementById('logoBadge')?.classList.remove('show');
    }
});

// 11. ANIMACIÓN REVEAL
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        if (reveals[i].style.display === 'none') continue;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < window.innerHeight - 60) {
            reveals[i].classList.add('active');
        }
    }
}

// 12. CINTA SUPERIOR AUTOMÁTICA UNO POR UNO
(function initPromoTicker() {
    const slides = Array.from(document.querySelectorAll('.ticker-slide'));
    if (slides.length <= 1) return;

    let currentIndex = 0;

    function goToSlide(nextIndex) {
        const prevIndex = currentIndex;
        currentIndex = (nextIndex + slides.length) % slides.length;
        if (prevIndex === currentIndex) return;

        slides.forEach((s, i) => {
            s.classList.remove('active', 'exit-up');
            if (i === prevIndex) s.classList.add('exit-up');
        });

        requestAnimationFrame(() => {
            slides[currentIndex].classList.add('active');
        });
    }

    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const action = slide.getAttribute('data-action');
            if (action === 'scroll-coleccion') {
                document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' });
            } else if (action === 'scroll-contacto') {
                document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
            } else if (action === 'open-wa') {
                window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola SF Joyería! Quisiera hacer un pedido.')}`, '_blank', 'noopener,noreferrer');
            }
        });
    });

    setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 3200);
})();

// 13. PRUEBA SOCIAL DISCRETA (IMPULSA CLICS EN EL CATÁLOGO)
function initSocialProof() {
    const toast = document.getElementById('socialProofToast');
    if (!toast || productCards.length === 0) return;

    const cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'];
    let lastCard = null;

    toast.addEventListener('click', () => {
        toast.classList.remove('show');
        if (lastCard) {
            lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => lastCard.click(), 350);
        }
    });

    setInterval(() => {
        const modal = document.getElementById('productModal');
        if (modal && modal.style.display === 'flex') return;

        const randomCard = productCards[Math.floor(Math.random() * productCards.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const pieceName = randomCard.dataset.title || 'una pieza';
        lastCard = randomCard;

        toast.innerHTML = `✨ Alguien en <strong>${city}</strong> está viendo <strong>${pieceName}</strong>`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4200);
    }, 18000);
}

window.addEventListener('scroll', revealOnScroll, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
    syncNavPosition();
    initProductCardsEnhancements();
    initVisitCounter();
    filterAndSearchCatalog();
    revealOnScroll();
    checkDeepLinkOnLoad();
    initSocialProof();
});