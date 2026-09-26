// 1. EFECTO ONDA (RIPPLE) PARA TODOS LOS BOTONES INTERACTIVOS
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
        if (ripple) {
            ripple.remove();
        }

        this.appendChild(circle);
    });
});

// 2. CONTADOR REAL DE VISITAS CON LOCALSTORAGE & ANIMACIÓN
function initVisitCounter() {
    const BASE_VISITS = 1240; // Base inicial para reflejar alta popularidad
    let localVisits = localStorage.getItem('sf_jewelry_visits');

    if (!localVisits) {
        localVisits = 1;
    } else {
        localVisits = parseInt(localVisits) + 1;
    }
    
    localStorage.setItem('sf_jewelry_visits', localVisits);
    const totalVisits = BASE_VISITS + localVisits;

    // Animación de conteo gradual de números al llegar al footer
    const counterElement = document.getElementById('visitCount');
    let hasAnimated = false;

    function animateCount() {
        const rect = counterElement.getBoundingClientRect();
        if (rect.top <= window.innerHeight && !hasAnimated) {
            hasAnimated = true;
            let current = 0;
            const increment = Math.ceil(totalVisits / 40);
            const timer = setInterval(() => {
                current += increment;
                if (current >= totalVisits) {
                    counterElement.innerText = totalVisits.toLocaleString();
                    clearInterval(timer);
                } else {
                    counterElement.innerText = current.toLocaleString();
                }
            }, 30);
        }
    }

    window.addEventListener('scroll', animateCount);
    animateCount();
}

document.addEventListener('DOMContentLoaded', initVisitCounter);

// 3. LOGO INTERACTIVO Y TOOLTIP
function toggleLogoTooltip() {
    const badge = document.getElementById('logoBadge');
    badge.classList.toggle('show');

    if (badge.classList.contains('show')) {
        setTimeout(() => {
            badge.classList.remove('show');
        }, 3500);
    }
}

// 4. CONTROL MENÚ MÓVIL
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navItems = document.querySelectorAll('.nav-item');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    });
});

// 5. NAVBAR CON SCROLL
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 40) {
        navbar.style.padding = '8px 5%';
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.padding = '12px 5%';
        navbar.style.backgroundColor = 'rgba(15, 15, 16, 0.95)';
    }
});

// 6. FILTROS DE PRODUCTOS
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.card-producto');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        productCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                setTimeout(() => { card.style.opacity = '1'; }, 50);
            } else {
                card.style.opacity = '0';
                setTimeout(() => { card.style.display = 'none'; }, 200);
            }
        });
    });
});

// 7. MODAL DETALLE DE PRODUCTO
function openModal(title, desc, imgSrc) {
    const modal = document.getElementById('productModal');
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerText = desc;
    document.getElementById('modalImg').src = imgSrc;
    
    const message = encodeURIComponent(`Hola SF Joyería! Quisiera información sobre: ${title}.`);
    document.getElementById('modalWaBtn').href = `https://wa.me/573507098325?text=${message}`;

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

window.addEventListener('click', function(e) {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeModal();
    }
});

// 8. ANIMACIÓN AL SCROLL (REVEAL)
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 80;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();