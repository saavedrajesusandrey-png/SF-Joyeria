const WA_NUMBER = '573507098325';
const LOUPE_SCALE = 2.2;

let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('globalToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
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
        'logo.jpg'
    );
}

// 5. MENÚ MÓVIL
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navItems = document.querySelectorAll('.nav-item');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// 6. NAVBAR CON SCROLL
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    if (window.scrollY > 40) {
        navbar.style.padding = '9px 5%';
    } else {
        navbar.style.padding = '12px 5%';
    }
}, { passive: true });

// 7. FILTROS Y BUSCADOR
const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
const productCards = document.querySelectorAll('.card-producto');
const searchInput = document.getElementById('catalogSearch');
const resultsCount = document.getElementById('resultsCount');
const emptyCatalog = document.getElementById('emptyCatalog');

let activeCategory = 'all';

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function filterAndSearchCatalog() {
    const query = normalizeText(searchInput ? searchInput.value : '');
    let visibleCount = 0;

    productCards.forEach(card => {
        const cardCategory = normalizeText(card.getAttribute('data-category'));
        const cardText = normalizeText(card.innerText);

        const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
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

function resetCatalogFilters() {
    activeCategory = 'all';
    if (searchInput) searchInput.value = '';
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
    });
    filterAndSearchCatalog();
}

// 8. BOTÓN "ELEGIR AL AZAR"
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

// 9. MODAL DETALLE + LUPA CIRCULAR INTERACTIVA
let currentProductTitle = '';
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

    const bgW = stageRect.width * LOUPE_SCALE;
    const bgH = stageRect.height * LOUPE_SCALE;
    const lensHalf = loupeLens.offsetWidth / 2;

    const bgX = -(x * LOUPE_SCALE - lensHalf);
    const bgY = -(y * LOUPE_SCALE - lensHalf);

    loupeLens.style.backgroundSize = `${bgW}px ${bgH}px`;
    loupeLens.style.backgroundPosition = `${bgX}px ${bgY}px`;
}

function setLoupeState(enabled) {
    isLoupeEnabled = enabled;
    if (modalStage) modalStage.classList.toggle('loupe-active', isLoupeEnabled);
    if (loupeToggleBtn) {
        const span = loupeToggleBtn.querySelector('span');
        if (span) span.textContent = isLoupeEnabled ? 'Lupa Activa' : 'Activar Lupa';
    }
    if (isLoupeEnabled && modalStage) {
        const rect = modalStage.getBoundingClientRect();
        positionLoupe(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
    }
}

function toggleLoupe(e) {
    if (e) e.stopPropagation();
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
}

function openModal(title, desc, imgSrc) {
    const modal = document.getElementById('productModal');
    const feedback = document.getElementById('shareFeedback');
    if (!modal) return;

    currentProductTitle = title;
    if (feedback) feedback.textContent = '';

    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerText = desc;
    modalImg.src = imgSrc;
    updateLoupeImageSource(imgSrc);
    setLoupeState(false);

    const message = encodeURIComponent(`Hola SF Joyería! Quisiera información sobre: ${title}.`);
    document.getElementById('modalWaBtn').href = `https://wa.me/${WA_NUMBER}?text=${message}`;

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
    setLoupeState(false);
}

async function triggerShare(title, text, feedbackId) {
    const feedback = feedbackId ? document.getElementById(feedbackId) : null;

    if (navigator.share) {
        try {
            await navigator.share({ title, text, url: window.location.href });
            if (feedback) feedback.textContent = '¡Compartido!';
            showToast('¡Enlace compartido!');
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            if (feedback) feedback.textContent = 'Enlace copiado al portapapeles.';
            showToast('¡Enlace copiado!');
            return;
        } catch (_) {}
    }

    showToast('Copia el enlace desde el navegador');
}

async function shareCurrentProduct() {
    const text = `Mira esta pieza de SF Joyería: ${currentProductTitle} — ${window.location.href}`;
    await triggerShare(`${currentProductTitle} | SF Joyería`, text, 'shareFeedback');
}

async function shareStore() {
    const text = `Mira el catálogo de SF Joyería — ${window.location.href}`;
    await triggerShare('SF Joyería | Catálogo', text, null);
}

window.addEventListener('click', function(e) {
    const modal = document.getElementById('productModal');
    if (e.target === modal) closeModal();
});

// 10. ANIMACIÓN REVEAL
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

// 11. CINTA SUPERIOR AUTOMÁTICA UNO POR UNO
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

window.addEventListener('scroll', revealOnScroll, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
    initVisitCounter();
    filterAndSearchCatalog();
    revealOnScroll();
});