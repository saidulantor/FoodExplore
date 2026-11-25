/**
 * Bistro Bliss - Order Confirmation Page Logic & Animations
 */

(function () {
    'use strict';

    // Default order structure (fields empty by default for customer entry)
    const DEFAULT_ORDER = {
        orderId: 'BB-' + Math.floor(10000 + Math.random() * 90000),
        placedAt: new Date(),
        customer: {
            name: '',
            phone: '',
            email: '',
            address: '',
            notes: '',
            paymentMethod: ''
        },
        items: [
            {
                name: 'Kacchi Biryani',
                category: 'Rice & Biryani',
                price: 320,
                qty: 1,
                image: 'assets/images/biryani/kacchi-biryani.jpg',
                note: 'Tender mutton with fragrant saffron rice'
            }
        ]
    };

    // Format currency in Bangladeshi Taka (৳)
    function formatTaka(amount) {
        return '৳' + Number(amount).toLocaleString('en-US');
    }

    // Format date nicely
    function formatDate(dateObj) {
        const d = new Date(dateObj);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' at ' + d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Calculate Estimated Arrival (30-40 min from order time)
    function formatETA(dateObj) {
        const d = new Date(dateObj);
        d.setMinutes(d.getMinutes() + 35);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Retrieve active order from localStorage or fallback
    function getActiveOrder() {
        try {
            const saved = localStorage.getItem('bistro_confirmed_order');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed) {
                    if (!parsed.customer) {
                        parsed.customer = { name: '', phone: '', email: '', address: '', notes: '', paymentMethod: '' };
                    }
                    if (!Array.isArray(parsed.items)) {
                        parsed.items = [];
                    }
                    return parsed;
                }
            }
            // Check if cart has items that can form an order
            const cartSaved = localStorage.getItem('bistro_cart');
            if (cartSaved) {
                const cart = JSON.parse(cartSaved);
                if (Array.isArray(cart) && cart.length > 0) {
                    return {
                        ...DEFAULT_ORDER,
                        items: cart
                    };
                }
            }
        } catch (e) {
            console.error('Error reading order storage:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_ORDER));
    }

    // Save order changes
    function saveOrder(order) {
        try {
            localStorage.setItem('bistro_confirmed_order', JSON.stringify(order));
            localStorage.setItem('bistro_cart', JSON.stringify(order.items));
        } catch (e) {
            console.error('Error saving order:', e);
        }
    }

    // Render Order Items with Staggered Entrance Animations & Dynamic Quantity Controls
    function renderOrderItems(order) {
        const listContainer = document.getElementById('ordered-products-list');
        const countBadge = document.getElementById('items-count-badge');
        const subtotalEl = document.getElementById('bill-subtotal');
        const deliveryEl = document.getElementById('bill-delivery');
        const vatEl = document.getElementById('bill-vat');
        const discountEl = document.getElementById('bill-discount');
        const totalEl = document.getElementById('bill-total');

        if (!listContainer) return;

        listContainer.innerHTML = '';

        let subtotal = 0;
        let totalCount = 0;

        if (!order.items || order.items.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 32px 16px; color: var(--muted);">
                    <div style="font-size: 40px; margin-bottom: 10px;" aria-hidden="true">🛒</div>
                    <p style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">No products in your order</p>
                    <a href="menu.html" style="color: var(--orange-deep); font-weight: 600; text-decoration: underline;">Browse Menu to Add Dishes</a>
                </div>
            `;
            if (countBadge) countBadge.textContent = '0 items';
            if (subtotalEl) subtotalEl.textContent = formatTaka(0);
            if (deliveryEl) deliveryEl.textContent = formatTaka(0);
            if (vatEl) vatEl.textContent = formatTaka(0);
            if (discountEl) discountEl.textContent = '-৳0';
            if (totalEl) totalEl.textContent = formatTaka(0);
            return;
        }

        order.items.forEach((item, index) => {
            const itemQty = Number(item.qty) || 1;
            const itemPrice = Number(item.price) || 0;
            const lineTotal = itemPrice * itemQty;
            subtotal += lineTotal;
            totalCount += itemQty;

            const card = document.createElement('article');
            card.className = 'order-product-card';
            card.style.setProperty('--item-index', index);

            // Safe image path fallback (also normalizes legacy 'images/' paths)
            let imgPath = item.image || 'assets/images/biryani/kacchi-biryani.jpg';
            if (imgPath.startsWith('images/')) imgPath = 'assets/' + imgPath;
            const catName = item.category || 'Special Dish';
            const itemNote = item.note || 'Cooked fresh with authentic spices';

            card.innerHTML = `
                <div class="product-thumb-wrap">
                    <img src="${imgPath}" alt="${item.name}" class="product-thumb-img" loading="lazy" onerror="this.onerror=null; this.src='assets/images/hero/2.image.jpeg';">
                </div>
                <div class="product-info-content">
                    <span class="product-tag-chip">${catName}</span>
                    <h3>${item.name}</h3>
                    <div class="product-spec-note">
                        <div class="product-qty-control-box">
                            <button type="button" class="confirm-qty-btn minus" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">−</button>
                            <span class="product-qty-badge">${itemQty}x</span>
                            <button type="button" class="confirm-qty-btn plus" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button>
                            <button type="button" class="confirm-remove-btn" data-action="remove" data-index="${index}" title="Remove product" aria-label="Remove product">✕</button>
                        </div>
                        <span>${itemNote}</span>
                    </div>
                </div>
                <div class="product-price-box">
                    <span class="product-unit-price">${formatTaka(itemPrice)} each</span>
                    <span class="product-total-price">${formatTaka(lineTotal)}</span>
                </div>
            `;

            listContainer.appendChild(card);
        });

        if (countBadge) {
            countBadge.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
        }

        // Financial calculations
        const deliveryFee = subtotal > 0 ? 40 : 0;
        const vat = subtotal > 0 ? Math.round(subtotal * 0.05) : 0; // 5% VAT
        const discount = subtotal >= 500 ? 50 : 0; // ৳50 Welcome coupon on orders >= ৳500
        const grandTotal = subtotal + deliveryFee + vat - discount;

        if (subtotalEl) subtotalEl.textContent = formatTaka(subtotal);
        if (deliveryEl) deliveryEl.textContent = formatTaka(deliveryFee);
        if (vatEl) vatEl.textContent = formatTaka(vat);
        if (discountEl) discountEl.textContent = '-' + formatTaka(discount);
        if (totalEl) {
            totalEl.textContent = formatTaka(grandTotal);
            totalEl.style.transform = 'scale(1.08)';
            setTimeout(() => {
                totalEl.style.transform = 'scale(1)';
            }, 250);
        }
    }

    // Setup interactive quantity adjustment delegation
    function setupQuantityListeners(order) {
        const listContainer = document.getElementById('ordered-products-list');
        if (!listContainer) return;

        listContainer.addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const index = parseInt(btn.dataset.index, 10);
            if (isNaN(index) || !order.items[index]) return;

            if (action === 'increase') {
                order.items[index].qty = (Number(order.items[index].qty) || 1) + 1;
            } else if (action === 'decrease') {
                if (order.items[index].qty > 1) {
                    order.items[index].qty -= 1;
                } else {
                    order.items.splice(index, 1);
                }
            } else if (action === 'remove') {
                order.items.splice(index, 1);
            }

            saveOrder(order);
            renderOrderItems(order);
        });
    }

    // Update payment badge UI
    function updatePaymentBadge(selectedMethod) {
        const badge = document.getElementById('payment-badge-status');
        if (!badge) return;

        badge.className = 'payment-method-badge';
        if (!selectedMethod) {
            badge.classList.add('unselected');
            badge.textContent = 'No payment method selected';
        } else if (selectedMethod.toLowerCase().includes('bkash')) {
            badge.classList.add('bkash');
            badge.textContent = '✓ bKash Payment Selected';
        } else if (selectedMethod.toLowerCase().includes('nagad')) {
            badge.classList.add('nagad');
            badge.textContent = '✓ Nagad Payment Selected';
        } else if (selectedMethod.toLowerCase().includes('rocket')) {
            badge.classList.add('rocket');
            badge.textContent = '✓ Rocket Payment Selected';
        } else {
            badge.classList.add('card');
            badge.textContent = `✓ ${selectedMethod} Selected`;
        }
    }

    // Render Customer Information & Setup Input Listeners
    function renderCustomerDetails(order) {
        const cust = order.customer || {};

        const nameInput = document.getElementById('cust-name-input');
        const phoneInput = document.getElementById('cust-phone-input');
        const emailInput = document.getElementById('cust-email-input');
        const addressInput = document.getElementById('cust-address-input');
        const notesInput = document.getElementById('cust-notes-input');
        const paymentSelect = document.getElementById('cust-payment-select');

        const orderIdPill = document.getElementById('order-id-pill');
        const orderTimeEl = document.getElementById('order-time-display');
        const orderEtaEl = document.getElementById('order-eta-display');

        // Fields remain empty by default unless customer entered them
        if (nameInput) nameInput.value = cust.name || '';
        if (phoneInput) phoneInput.value = cust.phone || '';
        if (emailInput) emailInput.value = cust.email || '';
        if (addressInput) addressInput.value = cust.address || '';
        if (notesInput) notesInput.value = cust.notes || '';
        if (paymentSelect) paymentSelect.value = cust.paymentMethod || '';

        updatePaymentBadge(cust.paymentMethod || '');

        // Order Meta
        const orderId = order.orderId || DEFAULT_ORDER.orderId;
        if (orderIdPill) orderIdPill.textContent = '#' + orderId;

        const placedTime = order.placedAt ? new Date(order.placedAt) : new Date();
        if (orderTimeEl) orderTimeEl.textContent = formatDate(placedTime);
        if (orderEtaEl) orderEtaEl.textContent = formatETA(placedTime);

        // Auto-save customer details on input
        function handleCustomerInput() {
            if (!order.customer) order.customer = {};
            order.customer.name = nameInput ? nameInput.value.trim() : '';
            order.customer.phone = phoneInput ? phoneInput.value.trim() : '';
            order.customer.email = emailInput ? emailInput.value.trim() : '';
            order.customer.address = addressInput ? addressInput.value.trim() : '';
            order.customer.notes = notesInput ? notesInput.value.trim() : '';
            order.customer.paymentMethod = paymentSelect ? paymentSelect.value : '';

            updatePaymentBadge(order.customer.paymentMethod);
            saveOrder(order);
        }

        if (nameInput) nameInput.addEventListener('input', handleCustomerInput);
        if (phoneInput) phoneInput.addEventListener('input', handleCustomerInput);
        if (emailInput) emailInput.addEventListener('input', handleCustomerInput);
        if (addressInput) addressInput.addEventListener('input', handleCustomerInput);
        if (notesInput) notesInput.addEventListener('input', handleCustomerInput);
        if (paymentSelect) paymentSelect.addEventListener('change', handleCustomerInput);
    }

    // Copy Order ID with animated toast
    function setupCopyOrderId(orderId) {
        const copyBtns = document.querySelectorAll('.copy-order-btn');
        const toast = document.getElementById('copy-toast');

        copyBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const textToCopy = orderId || 'BB-84920';
                navigator.clipboard.writeText(textToCopy).then(() => {
                    if (toast) {
                        toast.classList.add('show');
                        setTimeout(() => {
                            toast.classList.remove('show');
                        }, 2200);
                    }
                }).catch(() => {
                    const input = document.createElement('input');
                    input.value = textToCopy;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    if (toast) {
                        toast.classList.add('show');
                        setTimeout(() => {
                            toast.classList.remove('show');
                        }, 2200);
                    }
                });
            });
        });
    }

    // Setup Print Button
    function setupPrintReceipt() {
        const printBtn = document.getElementById('print-receipt-btn');
        if (printBtn) {
            printBtn.addEventListener('click', function (e) {
                e.preventDefault();
                window.print();
            });
        }
    }

    // Live Delivery Countdown Timer
    function startLiveCountdown() {
        const timerEl = document.getElementById('live-countdown-timer');
        if (!timerEl) return;

        let totalSeconds = 28 * 60; // 28 minutes countdown

        function updateTimer() {
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            timerEl.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`;

            if (totalSeconds > 0) {
                totalSeconds--;
            } else {
                timerEl.textContent = 'Arriving any moment!';
            }
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // Interactive bKash Payment Box Handling
    function setupBkashBox(order) {
        const paymentSelect = document.getElementById('cust-payment-select');
        const bkashBox = document.getElementById('bkash-details-box');
        const copyMerchantBtn = document.getElementById('btn-copy-merchant');
        const merchantNum = document.getElementById('bkash-merchant-num');
        const senderPhoneInput = document.getElementById('bkash-customer-phone');
        const trxIdInput = document.getElementById('bkash-trxid');
        const verifyStatusText = document.getElementById('bkash-verify-text');
        const toast = document.getElementById('copy-toast');

        if (!paymentSelect || !bkashBox) return;

        // Restore previous values
        if (order.bKashData) {
            if (senderPhoneInput) senderPhoneInput.value = order.bKashData.phone || '';
            if (trxIdInput) trxIdInput.value = order.bKashData.trxId || '';
        }

        function checkBkashVisibility() {
            const val = paymentSelect.value;
            if (val && val.toLowerCase().includes('bkash')) {
                bkashBox.style.display = 'block';
            } else {
                bkashBox.style.display = 'none';
            }
            updateVerification();
        }

        function updateVerification() {
            const trxVal = trxIdInput ? trxIdInput.value.trim() : '';
            if (trxVal.length >= 4) {
                if (verifyStatusText) {
                    verifyStatusText.textContent = 'TrxID Received (Verification in Progress)';
                    verifyStatusText.style.color = '#2e7d32';
                }
            } else {
                if (verifyStatusText) {
                    verifyStatusText.textContent = 'Awaiting TrxID';
                    verifyStatusText.style.color = '';
                }
            }

            if (!order.bKashData) order.bKashData = {};
            order.bKashData.phone = senderPhoneInput ? senderPhoneInput.value.trim() : '';
            order.bKashData.trxId = trxVal;
            saveOrder(order);
        }

        paymentSelect.addEventListener('change', checkBkashVisibility);
        if (senderPhoneInput) senderPhoneInput.addEventListener('input', updateVerification);
        if (trxIdInput) trxIdInput.addEventListener('input', updateVerification);

        if (copyMerchantBtn && merchantNum) {
            copyMerchantBtn.addEventListener('click', function () {
                const num = merchantNum.textContent.trim();
                navigator.clipboard.writeText(num).then(() => {
                    copyMerchantBtn.textContent = 'Copied! ✓';
                    if (toast) {
                        toast.textContent = '✓ bKash Merchant Number copied to clipboard!';
                        toast.classList.add('show');
                        setTimeout(() => {
                            toast.classList.remove('show');
                        }, 2200);
                    }
                    setTimeout(() => {
                        copyMerchantBtn.textContent = 'Copy';
                    }, 2200);
                }).catch(() => {
                    copyMerchantBtn.textContent = 'Copied! ✓';
                    setTimeout(() => {
                        copyMerchantBtn.textContent = 'Copy';
                    }, 2200);
                });
            });
        }

        checkBkashVisibility();
    }

    // Init on DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        const activeOrder = getActiveOrder();
        renderOrderItems(activeOrder);
        setupQuantityListeners(activeOrder);
        renderCustomerDetails(activeOrder);
        setupBkashBox(activeOrder);
        startLiveCountdown();
        setupCopyOrderId(activeOrder.orderId);
        setupPrintReceipt();
    });

})();
