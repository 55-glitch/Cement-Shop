// Monthly report generation

const ReportManager = {
    // Initialize report page
    init() {
        this.setupMonthSelector();
        this.loadReport();
        this.setupEventListeners();
    },

    // Setup month selector dropdown
    setupMonthSelector() {
        const monthSelect = document.getElementById('monthSelect');
        if (!monthSelect) return;

        // Generate options for last 12 months
        const months = [];
        const currentDate = new Date();
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            const value = `${date.getFullYear()}-${date.getMonth()}`;
            months.push({ value, text: monthName });
        }

        monthSelect.innerHTML = months.map(month => 
            `<option value="${month.value}">${month.text}</option>`
        ).join('');

        // Set current month as default
        const currentValue = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        monthSelect.value = currentValue;

        monthSelect.addEventListener('change', () => this.loadReport());
    },

    // Setup event listeners
    setupEventListeners() {
        const printBtn = document.getElementById('printReportBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printReport());
        }
    },

    // Load and display report
    loadReport() {
        const monthSelect = document.getElementById('monthSelect');
        if (!monthSelect) return;

        const [year, month] = monthSelect.value.split('-').map(Number);
        const transactions = Storage.getTransactionsByMonth(year, month);

        this.displaySummary(transactions);
        this.displayCompanyBreakdown(transactions);
        this.displayTransactions(transactions);
    },

    // Display summary (total sales)
    displaySummary(transactions) {
        const totalSales = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
        const totalSalesElement = document.getElementById('totalSales');
        if (totalSalesElement) {
            totalSalesElement.textContent = totalSales.toFixed(2);
        }
    },

    // Display company breakdown
    displayCompanyBreakdown(transactions) {
        const breakdown = {};
        const companies = ['Ultratech', 'Coromandel', 'Priya', 'Maha', 'Ramco'];

        // Initialize breakdown
        companies.forEach(company => {
            breakdown[company] = 0;
        });

        // Calculate totals per company
        transactions.forEach(transaction => {
            if (transaction.companyBreakdown) {
                Object.keys(transaction.companyBreakdown).forEach(company => {
                    if (breakdown[company] !== undefined) {
                        breakdown[company] += transaction.companyBreakdown[company].total;
                    }
                });
            }
        });

        // Display breakdown
        const breakdownGrid = document.getElementById('companyBreakdown');
        if (!breakdownGrid) return;

        breakdownGrid.innerHTML = companies.map(company => `
            <div class="breakdown-item">
                <h4>${company}</h4>
                <p>₹${breakdown[company].toFixed(2)}</p>
            </div>
        `).join('');
    },

    // Display transactions list
    displayTransactions(transactions) {
        const tbody = document.getElementById('transactionsBody');
        const noTransactions = document.getElementById('noTransactions');

        if (!tbody) return;

        if (transactions.length === 0) {
            tbody.innerHTML = '';
            if (noTransactions) {
                noTransactions.style.display = 'block';
            }
            return;
        }

        if (noTransactions) {
            noTransactions.style.display = 'none';
        }

        tbody.innerHTML = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });

                const itemsList = transaction.items.map(item => 
                    `${item.company} (${item.quantity} x ₹${item.price.toFixed(2)})`
                ).join(', ');

                return `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${itemsList}</td>
                        <td>₹${transaction.total.toFixed(2)}</td>
                    </tr>
                `;
            }).join('');
    },

    // Print report
    printReport() {
        const monthSelect = document.getElementById('monthSelect');
        const [year, month] = monthSelect.value.split('-').map(Number);
        const transactions = Storage.getTransactionsByMonth(year, month);
        const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const totalSales = transactions.reduce((sum, transaction) => sum + transaction.total, 0);

        // Calculate company breakdown
        const breakdown = {};
        const companies = ['Ultratech', 'Coromandel', 'Priya', 'Maha', 'Ramco'];
        companies.forEach(company => {
            breakdown[company] = 0;
        });

        transactions.forEach(transaction => {
            if (transaction.companyBreakdown) {
                Object.keys(transaction.companyBreakdown).forEach(company => {
                    if (breakdown[company] !== undefined) {
                        breakdown[company] += transaction.companyBreakdown[company].total;
                    }
                });
            }
        });

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Monthly Report - ${monthName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .report-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    .report-header h1 {
                        margin: 0;
                        color: #667eea;
                    }
                    .summary {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .summary h2 {
                        margin: 0 0 10px 0;
                        color: #667eea;
                    }
                    .summary-value {
                        font-size: 2em;
                        font-weight: bold;
                        color: #333;
                    }
                    .breakdown {
                        margin: 20px 0;
                    }
                    .breakdown h3 {
                        color: #667eea;
                    }
                    .breakdown-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
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
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>M A Mujeeb Traders</h1>
                    <h2>Monthly Sales Report - ${monthName}</h2>
                </div>
                <div class="summary">
                    <h2>Total Sales</h2>
                    <div class="summary-value">₹${totalSales.toFixed(2)}</div>
                </div>
                <div class="breakdown">
                    <h3>Sales by Company</h3>
                    ${companies.map(company => `
                        <div class="breakdown-item">
                            <span><strong>${company}</strong></span>
                            <span>₹${breakdown[company].toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <h3>All Transactions</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Items</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map(transaction => {
                                const date = new Date(transaction.date);
                                const formattedDate = date.toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                });
                                const itemsList = transaction.items.map(item => 
                                    `${item.company} (${item.quantity} x ₹${item.price.toFixed(2)})`
                                ).join(', ');
                                return `
                                    <tr>
                                        <td>${formattedDate}</td>
                                        <td>${itemsList}</td>
                                        <td>₹${transaction.total.toFixed(2)}</td>
                                    </tr>
                                `;
                            }).join('')}
                    </tbody>
                </table>
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


