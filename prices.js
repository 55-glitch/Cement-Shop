// Price CRUD operations

const PriceManager = {
    currentEditingCompany: null,

    // Initialize price display
    init() {
        this.loadPrices();
        this.setupModal();
    },

    // Load and display prices
    loadPrices() {
        const prices = Storage.getPrices();
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) return;

        productsGrid.innerHTML = '';

        const companies = ['Ultratech', 'Coromandel', 'Priya', 'Maha', 'Ramco'];

        companies.forEach(company => {
            const price = prices[company] || 0;
            const productCard = this.createProductCard(company, price);
            productsGrid.appendChild(productCard);
        });
    },

    // Create product card element
    createProductCard(company, price) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Prepare candidate image sources for the company
        const imageCandidates = this.getCompanyImageCandidates(company);
        
        card.innerHTML = `
            <div class="product-image-container">
                <img alt="${company} Cement Logo" class="product-image" loading="lazy">
                <div class="company-logo-overlay">${company}</div>
            </div>
            <div class="product-header">
                <div class="product-name">${company}</div>
                <button class="edit-price-btn" data-company="${company}">Edit Price</button>
            </div>
            <div class="product-price">₹${price.toFixed(2)}</div>
            <div class="product-controls">
                <input type="number" class="quantity-input" id="qty-${company}" min="1" value="1" placeholder="Quantity">
                <button class="add-to-cart-btn" data-company="${company}">Add to Cart</button>
            </div>
        `;

        // Add event listeners
        const editBtn = card.querySelector('.edit-price-btn');
        editBtn.addEventListener('click', () => this.openEditModal(company, price));

        const addBtn = card.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', () => {
            const quantity = parseInt(card.querySelector('.quantity-input').value) || 1;
            // Get current price from storage to ensure it's up to date
            const currentPrice = Storage.getPrice(company);
            CartManager.addToCart(company, quantity, currentPrice);
        });

        // Progressive image fallback: try multiple filenames/extensions before placeholder
        const imgEl = card.querySelector('.product-image');
        let candidateIndex = 0;
        const placeholder = `https://via.placeholder.com/400x300/eeeeee/333333?text=${encodeURIComponent(company + ' Cement')}`;
        const tryNext = () => {
            if (candidateIndex < imageCandidates.length) {
                imgEl.src = imageCandidates[candidateIndex++];
            } else {
                imgEl.src = placeholder;
                imgEl.onerror = null;
            }
        };
        imgEl.onerror = tryNext;
        tryNext(); // load first candidate

        return card;
    },

    // Open edit price modal
    openEditModal(company, currentPrice) {
        this.currentEditingCompany = company;
        const modal = document.getElementById('priceModal');
        const companyInput = document.getElementById('companyName');
        const priceInput = document.getElementById('newPrice');

        // Get current price from storage to ensure it's up to date
        const price = Storage.getPrice(company) || currentPrice;

        companyInput.value = company;
        priceInput.value = price;
        modal.style.display = 'block';
    },

    // Setup modal event listeners
    setupModal() {
        const modal = document.getElementById('priceModal');
        const closeBtn = document.getElementById('closeModal');
        const form = document.getElementById('priceEditForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePrice();
            });
        }
    },

    // Save updated price
    savePrice() {
        const newPrice = parseFloat(document.getElementById('newPrice').value);
        const company = this.currentEditingCompany;

        if (isNaN(newPrice) || newPrice < 0) {
            alert('Please enter a valid price');
            return;
        }

        Storage.updatePrice(company, newPrice);
        this.loadPrices(); // Reload to show updated price
        document.getElementById('priceModal').style.display = 'none';
        
        // Update cart if items exist
        CartManager.updateCartPrices();
    },

    // Build a list of candidate image URLs for a company (tries multiple extensions)
    getCompanyImageCandidates(company) {
        // Allow user overrides via localStorage: cementImages = { CompanyName: 'images/custom-file.ext' }
        const overrides = JSON.parse(localStorage.getItem('cementImages') || '{}');
        if (overrides[company]) {
            return [overrides[company]];
        }

        const base = company.toLowerCase();
        const files = [
            `images/${base}.jpg`,
            `images/${base}.jpeg`,
            `images/${base}.png`,
            `images/${base}.webp`
        ];
        // Backward compatibility with earlier suggested names
        const aliasMap = {
            'ultratech': ['Ultra.webp'],
            'coromandel': ['Coromandel.webp'],
            'priya': ['Priya.webp'],
            'maha': ['Maha.webp'],
            'ramco': ['RAmco.webp']
        };
        const aliases = aliasMap[base] || [];
        return [...aliases, ...files];
    }
};

