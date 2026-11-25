/**
 * Bistro Bliss - Menu Page Product Animations & Interactive Cart
 */

(function () {
    'use strict';

    // State
    let cart = [];

    // Helper: format currency
    function formatTaka(num) {
        return '৳' + Number(num).toLocaleString('en-US');
    }

    // Load initial cart from localStorage
    function loadCart() {
        try {
            const saved = localStorage.getItem('bistro_cart');
            if (saved) {
                cart = JSON.parse(saved) || [];
            }
        } catch (e) {
            cart = [];
        }
        updateCartUI();
    }

    // Save cart to localStorage
    function saveCart() {
        try {
            localStorage.setItem('bistro_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Could not save cart:', e);
        }
        updateCartUI();
    }

    // Update Floating Cart Pill & Drawer
    function updateCartUI() {
        const badge = document.getElementById('cart-pill-count');
        const price = document.getElementById('cart-pill-price');
        const drawerBody = document.getElementById('cart-drawer-items');
        const drawerSubtotal = document.getElementById('cart-drawer-subtotal');
        const floatingPill = document.getElementById('floating-cart-pill');

        let totalItems = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            totalItems += (item.qty || 1);
            totalPrice += (item.price * (item.qty || 1));
        });

        if (badge) {
            badge.textContent = totalItems;
            badge.classList.remove('bounce');
            void badge.offsetWidth; // trigger reflow
            badge.classList.add('bounce');
        }

        if (price) {
            price.textContent = formatTaka(totalPrice);
        }

        // Show / hide floating cart
        if (floatingPill) {
            floatingPill.style.display = totalItems > 0 ? 'flex' : 'flex';
        }

        // Render items inside drawer
        if (drawerBody) {
            if (cart.length === 0) {
                drawerBody.innerHTML = `
                    <div class="cart-empty-message">
                        <div class="cart-empty-icon" aria-hidden="true">🛒</div>
                        <p style="font-weight: 500; font-size: 16px; margin-bottom: 6px;">Your cart is empty</p>
                        <p style="font-size: 14px; color: var(--muted); margin: 0;">Explore our delicious dishes and add your favorites!</p>
                    </div>
                `;
            } else {
                drawerBody.innerHTML = cart.map((item, idx) => {
                    let thumb = item.image || 'assets/images/biryani/kacchi-biryani.jpg';
                    if (thumb.startsWith('images/')) thumb = 'assets/' + thumb;
                    return `
                    <div class="cart-item-row" data-index="${idx}">
                        <img src="${thumb}" alt="${item.name}" class="cart-item-thumb" onerror="this.onerror=null; this.src='assets/images/hero/2.image.jpeg';">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.name}</h4>
                            <div class="cart-item-price">${formatTaka(item.price * item.qty)}</div>
                        </div>
                        <div class="cart-item-qty-controls">
                            <button type="button" class="qty-btn" data-action="decrease" data-index="${idx}" aria-label="Decrease quantity">−</button>
                            <span class="qty-number">${item.qty}</span>
                            <button type="button" class="qty-btn" data-action="increase" data-index="${idx}" aria-label="Increase quantity">+</button>
                            <button type="button" class="item-remove-btn" data-action="remove" data-index="${idx}" title="Remove item" aria-label="Remove item">✕</button>
                        </div>
                    </div>
                `;
                }).join('');
            }
        }

        if (drawerSubtotal) {
            drawerSubtotal.textContent = formatTaka(totalPrice);
        }
    }

    // Spawn Flying Particle from Button to Cart Pill
    function triggerFlyingParticle(startBtn, emoji) {
        const cartPill = document.getElementById('floating-cart-pill');
        if (!startBtn || !cartPill) return;

        const btnRect = startBtn.getBoundingClientRect();
        const cartRect = cartPill.getBoundingClientRect();

        const particle = document.createElement('div');
        particle.className = 'flying-particle';
        particle.textContent = emoji || '🍛';
        particle.style.left = (btnRect.left + btnRect.width / 2 - 18) + 'px';
        particle.style.top = (btnRect.top + btnRect.height / 2 - 18) + 'px';

        const destX = (cartRect.left + cartRect.width / 2) - (btnRect.left + btnRect.width / 2);
        const destY = (cartRect.top + cartRect.height / 2) - (btnRect.top + btnRect.height / 2);

        particle.style.setProperty('--dest-x', destX + 'px');
        particle.style.setProperty('--dest-y', destY + 'px');

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 800);
    }

    // Show Toast Notification
    function showToast(productName, price) {
        const toast = document.getElementById('menu-toast');
        const toastText = document.getElementById('toast-text');
        if (!toast || !toastText) return;

        toastText.textContent = `Added ${productName} (${formatTaka(price)}) to your cart!`;
        toast.classList.add('show');

        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Setup Product Scroll Reveal Animations
    function setupScrollReveal() {
        const cards = document.querySelectorAll('.food-card');
        if (!cards.length) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('reveal-visible');
                        }, (i % 3) * 80);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px'
            });

            cards.forEach(card => {
                card.classList.add('reveal-init');
                observer.observe(card);
            });
        } else {
            cards.forEach(card => card.classList.add('reveal-visible'));
        }
    }

    // Setup Add to Cart Click Handlers
    function setupAddToCartButtons() {
        document.querySelectorAll('.food-card').forEach(card => {
            const btn = card.querySelector('.add-btn');
            if (!btn) return;

            btn.addEventListener('click', function (e) {
                e.preventDefault();

                // Extract product info
                const titleEl = card.querySelector('h3');
                const priceEl = card.querySelector('.price');
                const photoEl = card.querySelector('.food-photo');
                const sectionEl = card.closest('.menu-section');

                const name = titleEl ? titleEl.textContent.trim() : 'Delicious Dish';
                const priceText = priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : '200';
                const price = Number(priceText) || 200;

                // Extract image url
                let image = 'assets/images/biryani/kacchi-biryani.jpg';
                if (photoEl && photoEl.style.backgroundImage) {
                    const bg = photoEl.style.backgroundImage;
                    const match = bg.match(/url\(["']?([^"']*)["']?\)/);
                    if (match && match[1]) {
                        image = match[1];
                    }
                }

                // Extract category
                let category = 'Bistro Favorites';
                if (sectionEl) {
                    const h2 = sectionEl.querySelector('h2');
                    if (h2) category = h2.textContent.trim();
                }

                // Emoji
                const emoji = sectionEl ? sectionEl.style.getPropertyValue('--emoji').replace(/['"]/g, '') : '🍛';

                // Check if already in cart
                const existingIndex = cart.findIndex(item => item.name === name);
                if (existingIndex > -1) {
                    cart[existingIndex].qty += 1;
                } else {
                    cart.push({
                        name: name,
                        price: price,
                        qty: 1,
                        image: image,
                        category: category
                    });
                }

                saveCart();

                // Button micro-interaction: Added state
                const originalText = btn.textContent;
                btn.classList.add('is-added');
                btn.textContent = '✓ Added';

                // Flying particle
                triggerFlyingParticle(btn, emoji);

                // Show toast
                showToast(name, price);

                // Revert button after delay
                setTimeout(() => {
                    btn.classList.remove('is-added');
                    btn.textContent = originalText;
                }, 1300);
            });
        });
    }

    // Setup Drawer Controls & Checkout Flow
    function setupDrawer() {
        const overlay = document.getElementById('cart-drawer-overlay');
        const openBtn = document.getElementById('floating-cart-pill');
        const closeBtn = document.getElementById('cart-drawer-close');
        const viewCartToastBtn = document.getElementById('toast-view-btn');
        const itemsContainer = document.getElementById('cart-drawer-items');
        const checkoutBtn = document.getElementById('btn-checkout-confirm');

        function openDrawer() {
            if (overlay) overlay.classList.add('active');
        }

        function closeDrawer() {
            if (overlay) overlay.classList.remove('active');
        }

        if (openBtn) openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (viewCartToastBtn) viewCartToastBtn.addEventListener('click', openDrawer);

        if (overlay) {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) {
                    closeDrawer();
                }
            });
        }

        // Quantity controls delegation
        if (itemsContainer) {
            itemsContainer.addEventListener('click', function (e) {
                const btn = e.target.closest('button');
                if (!btn) return;

                const action = btn.dataset.action;
                const index = parseInt(btn.dataset.index, 10);
                if (isNaN(index) || !cart[index]) return;

                if (action === 'increase') {
                    cart[index].qty += 1;
                    saveCart();
                } else if (action === 'decrease') {
                    if (cart[index].qty > 1) {
                        cart[index].qty -= 1;
                    } else {
                        cart.splice(index, 1);
                    }
                    saveCart();
                } else if (action === 'remove') {
                    cart.splice(index, 1);
                    saveCart();
                }
            });
        }

        // Checkout Button - Saves order & navigates to order-confirmation.html
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function () {
                if (cart.length === 0) {
                    alert('Please add at least one dish to your order first!');
                    return;
                }

                // Customer form values (empty by default for user entry)
                const custName = document.getElementById('drawer-cust-name')?.value.trim() || '';
                const custPhone = document.getElementById('drawer-cust-phone')?.value.trim() || '';
                const custEmail = document.getElementById('drawer-cust-email')?.value.trim() || '';
                const custAddress = document.getElementById('drawer-cust-address')?.value.trim() || '';
                const custPayment = document.getElementById('drawer-cust-payment')?.value || '';
                const custNotes = document.getElementById('drawer-cust-notes')?.value.trim() || '';

                const orderData = {
                    orderId: 'BB-' + Math.floor(10000 + Math.random() * 90000),
                    placedAt: new Date(),
                    customer: {
                        name: custName,
                        phone: custPhone,
                        email: custEmail,
                        address: custAddress,
                        notes: custNotes,
                        paymentMethod: custPayment
                    },
                    items: cart
                };

                // Save confirmed order for confirmation page
                localStorage.setItem('bistro_confirmed_order', JSON.stringify(orderData));

                // Button loading animation
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'Placing Order...';

                setTimeout(() => {
                    window.location.href = 'order-confirmation.html';
                }, 400);
            });
        }
    }

    // Setup Instant Live Search
    function setupLiveSearch() {
        const searchInput = document.getElementById('menu-search-input');
        const clearBtn = document.getElementById('menu-search-clear');
        const sections = document.querySelectorAll('.menu-section');

        if (!searchInput) return;

        function performSearch() {
            const query = searchInput.value.trim().toLowerCase();
            if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

            sections.forEach(sec => {
                let sectionVisibleCount = 0;
                const secCards = sec.querySelectorAll('.food-card');

                secCards.forEach(card => {
                    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                    const desc = card.querySelector('.food-body p')?.textContent.toLowerCase() || '';
                    const price = card.querySelector('.price')?.textContent.toLowerCase() || '';

                    if (!query || title.includes(query) || desc.includes(query) || price.includes(query)) {
                        card.classList.remove('search-hidden');
                        card.classList.add('search-match');
                        sectionVisibleCount++;
                    } else {
                        card.classList.add('search-hidden');
                        card.classList.remove('search-match');
                    }
                });

                // Hide section if no dishes match
                sec.style.display = sectionVisibleCount > 0 ? '' : 'none';
            });
        }

        searchInput.addEventListener('input', performSearch);

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                searchInput.value = '';
                performSearch();
                searchInput.focus();
            });
        }
    }

    // Active Category Chip Sync on Scroll
    function setupActiveCategorySync() {
        const chips = document.querySelectorAll('.category-chips .chip');
        const sections = document.querySelectorAll('.menu-section');
        if (!chips.length || !sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    chips.forEach(chip => {
                        const href = chip.getAttribute('href');
                        if (href === '#' + id) {
                            chip.classList.add('active');
                        } else {
                            chip.classList.remove('active');
                        }
                    });
                }
            });
        }, {
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(sec => observer.observe(sec));
    }

    // 3D Card Hover Tilt Effect
    function setupCardTilt() {
        const cards = document.querySelectorAll('.food-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        loadCart();
        setupScrollReveal();
        setupAddToCartButtons();
        setupDrawer();
        setupLiveSearch();
        setupActiveCategorySync();
        setupCardTilt();
    });

})();
