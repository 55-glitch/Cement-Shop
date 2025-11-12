// Cart management functions

const CartManager = {
    cart: [],

    // Initialize cart
    init() {
        this.cart = [];
        this.loadCart();
        this.setupEventListeners();
        this.renderCart();
    },

    // Load cart from localStorage (optional, for persistence)
    loadCart() {
        const savedCart = localStorage.getItem('currentCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    },

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('currentCart', JSON.stringify(this.cart));
    },

    // Setup event listeners
    setupEventListeners() {
        const printBtn = document.getElementById('printBillBtn');
        const resetBtn = document.getElementById('resetCartBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (printBtn) {
            printBtn.addEventListener('click', () => this.printBill());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCart());
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    },

    // Add item to cart
    addToCart(company, quantity, price) {
        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        const existingItem = this.cart.find(item => item.company === company);

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            this.cart.push({
                company: company,
                quantity: quantity,
                price: price,
                subtotal: quantity * price
            });
        }

        this.saveCart();
        this.renderCart();
    },

    // Remove item from cart
    removeFromCart(company) {
        this.cart = this.cart.filter(item => item.company !== company);
        this.saveCart();
        this.renderCart();
    },

    // Update cart prices when prices are edited
    updateCartPrices() {
        const prices = Storage.getPrices();
        this.cart.forEach(item => {
            const newPrice = prices[item.company];
            if (newPrice) {
                item.price = newPrice;
                item.subtotal = item.quantity * newPrice;
            }
        });
        this.saveCart();
        this.renderCart();
    },

    // Calculate total
    calculateTotal() {
        return this.cart.reduce((total, item) => total + item.subtotal, 0);
    },

    // Render cart
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div><strong>${item.company}</strong></div>
                    <div>Qty: ${item.quantity}</div>
                    <div>Price: ₹${item.price.toFixed(2)}</div>
                    <div>Subtotal: ₹${item.subtotal.toFixed(2)}</div>
                    <button class="remove-item-btn" data-company="${item.company}">Remove</button>
                </div>
            `).join('');

            // Add remove button event listeners
            cartItems.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const company = e.target.getAttribute('data-company');
                    this.removeFromCart(company);
                });
            });
        }

        if (cartTotal) {
            cartTotal.textContent = this.calculateTotal().toFixed(2);
        }
    },

    // Reset cart
    resetCart() {
        this.cart = [];
        this.saveCart();
        this.renderCart();
        
        // Reset quantity inputs
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.value = 1;
        });
    },

    // Checkout - save transaction
    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Calculate company breakdown
        const companyBreakdown = {};
        this.cart.forEach(item => {
            if (!companyBreakdown[item.company]) {
                companyBreakdown[item.company] = {
                    quantity: 0,
                    total: 0
                };
            }
            companyBreakdown[item.company].quantity += item.quantity;
            companyBreakdown[item.company].total += item.subtotal;
        });

        // Save transaction
        const transaction = {
            items: [...this.cart],
            total: this.calculateTotal(),
            companyBreakdown: companyBreakdown
        };

        Storage.addTransaction(transaction);
        
        alert('Order placed successfully!');
        this.resetCart();
    },

    // Print bill
    printBill() {
        if (this.cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        const total = this.calculateTotal();
        const date = new Date().toLocaleString('en-IN', {
            dateStyle: 'long',
            timeStyle: 'short'
        });

        // Create print window content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - M A Mujeeb Traders</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .bill-header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    .bill-header h1 {
                        margin: 0;
                        color: #667eea;
                    }
                    .bill-details {
                        margin-bottom: 20px;
                    }
                    .bill-details p {
                        margin: 5px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background-color: #667eea;
                        color: white;
                    }
                    .total-row {
                        font-weight: bold;
                        font-size: 1.2em;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #333;
                    }
                </style>
            </head>
            <body>
                <div class="bill-header">
                    <h1>M A Mujeeb Traders</h1>
                    <p>84, Manalurpet Rd, Thamarai Nagar, Tiruvannamalai, Tamil Nadu 606601</p>
                    <p>Email: mohamedariptvm@gmail.com | Phone: 9443098674</p>
                </div>
                <div class="bill-details">
                    <p><strong>Date:</strong> ${date}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.cart.map(item => `
                            <tr>
                                <td>${item.company}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price.toFixed(2)}</td>
                                <td>₹${item.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Total:</td>
                            <td>₹${total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    <p>Thank you for your business!</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};


