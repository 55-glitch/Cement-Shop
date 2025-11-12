// localStorage utility functions

const Storage = {
    // Initialize default prices if not exists
    initPrices() {
        if (!localStorage.getItem('cementPrices')) {
            const defaultPrices = {
                'Ultratech': 350.00,
                'Coromandel': 340.00,
                'Priya': 330.00,
                'Maha': 320.00,
                'Ramco': 310.00
            };
            localStorage.setItem('cementPrices', JSON.stringify(defaultPrices));
        }
    },

    // Get all prices
    getPrices() {
        const prices = localStorage.getItem('cementPrices');
        return prices ? JSON.parse(prices) : {};
    },

    // Update price for a company
    updatePrice(company, price) {
        const prices = this.getPrices();
        prices[company] = parseFloat(price);
        localStorage.setItem('cementPrices', JSON.stringify(prices));
    },

    // Get price for a specific company
    getPrice(company) {
        const prices = this.getPrices();
        return prices[company] || 0;
    },

    // Get all transactions
    getTransactions() {
        const transactions = localStorage.getItem('transactions');
        return transactions ? JSON.parse(transactions) : [];
    },

    // Add a new transaction
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.push({
            id: Date.now(),
            date: new Date().toISOString(),
            items: transaction.items,
            total: transaction.total,
            companyBreakdown: transaction.companyBreakdown
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));
    },

    // Get transactions for a specific month
    getTransactionsByMonth(year, month) {
        const transactions = this.getTransactions();
        return transactions.filter(transaction => {
            const date = new Date(transaction.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });
    },

    // Clear all transactions (if needed)
    clearTransactions() {
        localStorage.removeItem('transactions');
    }
};


