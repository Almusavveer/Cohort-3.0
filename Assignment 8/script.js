// app state

let appState = {
  user: {
    name: '',
    currency: 'INR',
    theme: 'dark',
  },
  transactions: [],
  budgets: {
    'Food & Dining': 0,
    Shopping: 0,
    'Recharge & Bills': 0,
    'Petrol & Auto': 0,
    Utilities: 0,
    Salary: 0,
    Entertainment: 0,
    Other: 0,
  },
  settings: {
    lastProcessedRecurringDate: '',
  },
};

// chart instances
let charts = {
  incomeExpense: null,
  category: null,
  monthlySpending: null,
  expenseTrend: null,
  healthScore: null,
};

// currency config
const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

// category icons
const CATEGORY_ICONS = {
  'Food & Dining': 'fa-utensils',
  Shopping: 'fa-bag-shopping',
  'Recharge & Bills': 'fa-file-invoice-dollar',
  'Petrol & Auto': 'fa-car-side',
  Utilities: 'fa-bolt',
  Salary: 'fa-wallet',
  Entertainment: 'fa-gamepad',
  Other: 'fa-circle-notch',
};

// category colors
const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b', // Amber
  Shopping: '#ec4899', // Pink
  'Recharge & Bills': '#3b82f6', // Blue
  'Petrol & Auto': '#06b6d4', // Cyan
  Utilities: '#8b5cf6', // Purple
  Salary: '#10b981', // Emerald
  Entertainment: '#f43f5e', // Rose
  Other: '#64748b', // Slate
};

// init

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

function initApp() {
  const activeUser = localStorage.getItem('fintrack_pro_active_user');
  const users = JSON.parse(localStorage.getItem('fintrack_pro_users') || '{}');

  if (activeUser && users[activeUser]) {
    // logged in
    appState = users[activeUser];

    document.getElementById('loginOverlay').style.display = 'none';
    applyTheme(appState.user.theme || 'dark');
    syncUserProfile();

    // check recurring
    processRecurringTransactions();

    // render everything
    refreshUI();
  } else {
    // show login page
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('loginOverlay').style.opacity = 1;
    toggleAuthTab('signin');
  }
}

function getSampleData(username, currency) {
  const today = new Date();
  const formatOffsetDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const sampleState = {
    user: {
      name: username,
      currency: currency,
      theme: 'dark',
    },
    transactions: [],
    budgets: {
      'Food & Dining': 15000,
      Shopping: 10000,
      'Recharge & Bills': 5000,
      'Petrol & Auto': 12000,
      Utilities: 8000,
      Salary: 0,
      Entertainment: 15000,
      Other: 6000,
    },
    settings: {
      lastProcessedRecurringDate: formatOffsetDate(0),
    },
  };

  // scale amounts for currency
  let multiplier = 1;
  if (currency === 'USD') multiplier = 0.012;
  else if (currency === 'EUR') multiplier = 0.011;
  else if (currency === 'GBP') multiplier = 0.0094;
  else if (currency === 'JPY') multiplier = 1.9;

  const rawTx = [
    {
      id: 'tx_sample_1',
      description: 'Monthly Salary Credit',
      amount: 75000,
      type: 'income',
      category: 'Salary',
      date: formatOffsetDate(55),
      recurring: 'monthly',
    },
    {
      id: 'tx_sample_2',
      description: 'Premium Supermarket Shopping',
      amount: 4500,
      type: 'expense',
      category: 'Food & Dining',
      date: formatOffsetDate(52),
      recurring: 'none',
    },
    {
      id: 'tx_sample_3',
      description: 'Electricity & Gas Bill',
      amount: 2800,
      type: 'expense',
      category: 'Utilities',
      date: formatOffsetDate(50),
      recurring: 'monthly',
    },
    {
      id: 'tx_sample_4',
      description: 'Zara Outfit Purchase',
      amount: 5500,
      type: 'expense',
      category: 'Shopping',
      date: formatOffsetDate(48),
      recurring: 'none',
    },
    {
      id: 'tx_sample_5',
      description: 'Weekly Petrol Refuel',
      amount: 3000,
      type: 'expense',
      category: 'Petrol & Auto',
      date: formatOffsetDate(45),
      recurring: 'weekly',
    },
    {
      id: 'tx_sample_6',
      description: 'Weekend Movie & Dinner',
      amount: 3800,
      type: 'expense',
      category: 'Entertainment',
      date: formatOffsetDate(42),
      recurring: 'none',
    },
    {
      id: 'tx_sample_7',
      description: 'Monthly Salary Credit',
      amount: 75000,
      type: 'income',
      category: 'Salary',
      date: formatOffsetDate(26),
      recurring: 'monthly',
    },
    {
      id: 'tx_sample_8',
      description: 'Gourmet Dining Out',
      amount: 3200,
      type: 'expense',
      category: 'Food & Dining',
      date: formatOffsetDate(23),
      recurring: 'none',
    },
    {
      id: 'tx_sample_9',
      description: 'Broadband Wifi Bill',
      amount: 1200,
      type: 'expense',
      category: 'Recharge & Bills',
      date: formatOffsetDate(20),
      recurring: 'monthly',
    },
    {
      id: 'tx_sample_10',
      description: 'Amazon Gadgets & Decors',
      amount: 8500,
      type: 'expense',
      category: 'Shopping',
      date: formatOffsetDate(18),
      recurring: 'none',
    },
    {
      id: 'tx_sample_11',
      description: 'Weekly Petrol Refuel',
      amount: 3000,
      type: 'expense',
      category: 'Petrol & Auto',
      date: formatOffsetDate(17),
      recurring: 'weekly',
    },
    {
      id: 'tx_sample_12',
      description: 'Gym Subscription Renewal',
      amount: 2500,
      type: 'expense',
      category: 'Other',
      date: formatOffsetDate(14),
      recurring: 'monthly',
    },
    {
      id: 'tx_sample_13',
      description: 'Freelance Consulting Fee',
      amount: 15000,
      type: 'income',
      category: 'Other',
      date: formatOffsetDate(8),
      recurring: 'none',
    },
    {
      id: 'tx_sample_14',
      description: 'Weekly Petrol Refuel',
      amount: 3200,
      type: 'expense',
      category: 'Petrol & Auto',
      date: formatOffsetDate(4),
      recurring: 'weekly',
    },
    {
      id: 'tx_sample_15',
      description: 'Organic Groceries',
      amount: 4800,
      type: 'expense',
      category: 'Food & Dining',
      date: formatOffsetDate(2),
      recurring: 'none',
    },
  ];

  sampleState.transactions = rawTx.map((tx) => ({
    ...tx,
    amount: Math.round(tx.amount * multiplier * 100) / 100,
  }));

  // update budgets
  Object.keys(sampleState.budgets).forEach((k) => {
    sampleState.budgets[k] = Math.round(sampleState.budgets[k] * multiplier);
  });

  return sampleState;
}

function saveState() {
  const activeUser = localStorage.getItem('fintrack_pro_active_user');
  if (activeUser) {
    const users = JSON.parse(
      localStorage.getItem('fintrack_pro_users') || '{}',
    );
    users[activeUser] = appState;
    localStorage.setItem('fintrack_pro_users', JSON.stringify(users));
  }
}

function refreshUI() {
  calculateTotals();
  updateCards();
  populateMonthFilter();
  renderTable();
  renderCharts();
  calculateBudgetWarnings();
  renderBudgetsView();

  // update counter
  document.getElementById('txCounterVal').innerText =
    appState.transactions.length;
}

// auth

function toggleAuthTab(tab) {
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const formSignIn = document.getElementById('signInForm');
  const formSignUp = document.getElementById('signUpForm');

  if (tab === 'signin') {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    formSignIn.style.display = 'block';
    formSignUp.style.display = 'none';
  } else {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    formSignUp.style.display = 'block';
    formSignIn.style.display = 'none';
  }
}

function handleSignIn(e) {
  e.preventDefault();
  const usernameVal = document.getElementById('signInUser').value.trim();
  const passwordVal = document.getElementById('signInPass').value;

  if (!usernameVal || !passwordVal) {
    showToast('Please fill in all credentials', 'warning');
    return;
  }

  const users = JSON.parse(localStorage.getItem('fintrack_pro_users') || '{}');
  const userKey = usernameVal.toLowerCase();

  if (users[userKey]) {
    if (users[userKey].password === passwordVal) {
      localStorage.setItem('fintrack_pro_active_user', userKey);
      appState = users[userKey];

      const overlay = document.getElementById('loginOverlay');
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.style.display = 'none';
        refreshUI();
      }, 300);

      applyTheme(appState.user.theme || 'dark');
      syncUserProfile();
      processRecurringTransactions();

      showToast(`Welcome back, ${appState.user.name}!`, 'success');

      document.getElementById('signInUser').value = '';
      document.getElementById('signInPass').value = '';
    } else {
      showToast('Invalid password. Please try again.', 'warning');
    }
  } else {
    showToast('Username not found. Please Sign Up first.', 'warning');
  }
}

function handleSignUp(e) {
  e.preventDefault();
  const usernameVal = document.getElementById('signUpUser').value.trim();
  const passwordVal = document.getElementById('signUpPass').value;
  const currencyVal = document.getElementById('signUpCurrency').value;
  const useSampleData = document.getElementById('signUpSampleData').checked;

  if (!usernameVal || !passwordVal) {
    showToast('Please fill in all sign-up fields', 'warning');
    return;
  }

  const users = JSON.parse(localStorage.getItem('fintrack_pro_users') || '{}');
  const userKey = usernameVal.toLowerCase();

  if (users[userKey]) {
    showToast('Username already exists. Choose another.', 'warning');
    return;
  }

  let newUserState;
  if (useSampleData) {
    newUserState = getSampleData(usernameVal, currencyVal);
  } else {
    newUserState = {
      user: {
        name: usernameVal,
        currency: currencyVal,
        theme: 'dark',
      },
      transactions: [],
      budgets: {
        'Food & Dining': 0,
        Shopping: 0,
        'Recharge & Bills': 0,
        'Petrol & Auto': 0,
        Utilities: 0,
        Salary: 0,
        Entertainment: 0,
        Other: 0,
      },
      settings: {
        lastProcessedRecurringDate: new Date().toISOString().split('T')[0],
      },
    };
  }

  newUserState.password = passwordVal;
  users[userKey] = newUserState;
  localStorage.setItem('fintrack_pro_users', JSON.stringify(users));

  localStorage.setItem('fintrack_pro_active_user', userKey);
  appState = newUserState;

  const overlay = document.getElementById('loginOverlay');
  overlay.style.opacity = 0;
  setTimeout(() => {
    overlay.style.display = 'none';
    refreshUI();
  }, 300);

  applyTheme(appState.user.theme || 'dark');
  syncUserProfile();

  showToast(`Account created! Welcome, ${usernameVal}!`, 'success');

  document.getElementById('signUpUser').value = '';
  document.getElementById('signUpPass').value = '';
}

function handleLogout() {
  if (
    confirm(
      'Are you sure you want to log out? Your transaction history will be preserved locally.',
    )
  ) {
    localStorage.removeItem('fintrack_pro_active_user');

    Object.keys(charts).forEach((key) => {
      if (charts[key]) {
        charts[key].destroy();
        charts[key] = null;
      }
    });

    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('loginOverlay').style.opacity = 1;
    toggleAuthTab('signin');
  }
}

function syncUserProfile() {
  document.getElementById('profileName').innerText = appState.user.name;

  // Set avatar character
  const initial = appState.user.name.trim().charAt(0).toUpperCase();
  document.getElementById('userAvatar').innerText = initial || 'U';

  // Set symbols across inputs
  const symbol = CURRENCY_SYMBOLS[appState.user.currency] || '$';
  document.querySelectorAll('.currency-symbol').forEach((el) => {
    el.innerText = symbol;
  });
}

// page navigation

function switchPage(pageId, navElement) {
  // close mobile sidebar
  document.querySelector('.sidebar').classList.remove('active');

  // change active tab style
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active');
  });
  if (navElement) {
    navElement.classList.add('active');
  }

  // hide other pages and show selected
  document.querySelectorAll('.page-container').forEach((container) => {
    container.classList.remove('active');
  });
  const targetPage = document.getElementById(`${pageId}Page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // update page title
  const titles = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budget Limits',
    settings: 'Settings',
  };
  document.getElementById('pageTitle').innerText =
    titles[pageId] || 'FinTrack Pro';

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.remove('active');
  }
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('active');
}

// form options and helpers

// filter categories based on transaction type
function syncModalCategories(type) {
  const categorySelect = document.getElementById('txCategory');
  categorySelect.innerHTML = '';

  let list = [];
  if (type === 'income') {
    list = ['Salary', 'Other'];
  } else {
    list = [
      'Food & Dining',
      'Shopping',
      'Recharge & Bills',
      'Petrol & Auto',
      'Utilities',
      'Entertainment',
      'Other',
    ];
  }

  list.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.innerText = cat;
    categorySelect.appendChild(opt);
  });

  // style active button
  const incomeLabel = document.getElementById('typeIncomeLabel');
  const expenseLabel = document.getElementById('typeExpenseLabel');

  if (type === 'income') {
    incomeLabel.style.backgroundColor = 'var(--color-income-light)';
    incomeLabel.style.borderColor = 'var(--color-income)';
    incomeLabel.style.color = 'var(--color-income)';
    expenseLabel.style.backgroundColor = 'transparent';
    expenseLabel.style.borderColor = 'var(--border-color)';
    expenseLabel.style.color = 'var(--text-secondary)';
  } else {
    expenseLabel.style.backgroundColor = 'var(--color-expense-light)';
    expenseLabel.style.borderColor = 'var(--color-expense)';
    expenseLabel.style.color = 'var(--color-expense)';
    incomeLabel.style.backgroundColor = 'transparent';
    incomeLabel.style.borderColor = 'var(--border-color)';
    incomeLabel.style.color = 'var(--text-secondary)';
  }
}

// calculations

let computedMetrics = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  monthlySavings: 0,
  totalTxCount: 0,
};

function calculateTotals() {
  let income = 0;
  let expense = 0;

  appState.transactions.forEach((tx) => {
    const amt = parseFloat(tx.amount) || 0;
    if (tx.type === 'income') {
      income += amt;
    } else {
      expense += amt;
    }
  });

  // current month savings
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  let thisMonthIncome = 0;
  let thisMonthExpense = 0;

  appState.transactions.forEach((tx) => {
    if (tx.date.startsWith(currentYearMonth)) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'income') {
        thisMonthIncome += amt;
      } else {
        thisMonthExpense += amt;
      }
    }
  });

  computedMetrics.totalIncome = income;
  computedMetrics.totalExpense = expense;
  computedMetrics.balance = income - expense;
  computedMetrics.monthlySavings = thisMonthIncome - thisMonthExpense;
  computedMetrics.totalTxCount = appState.transactions.length;
}

function formatCurrency(val) {
  const symbol = CURRENCY_SYMBOLS[appState.user.currency] || '₹';
  return `${symbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateCards() {
  document.getElementById('cardBalance').innerText = formatCurrency(
    computedMetrics.balance,
  );
  document.getElementById('cardIncome').innerText = formatCurrency(
    computedMetrics.totalIncome,
  );
  document.getElementById('cardExpense').innerText = formatCurrency(
    computedMetrics.totalExpense,
  );

  const savingsEl = document.getElementById('cardSavings');
  savingsEl.innerText = formatCurrency(computedMetrics.monthlySavings);

  // change color if negative savings
  if (computedMetrics.monthlySavings < 0) {
    savingsEl.style.color = 'var(--color-expense)';
  } else {
    savingsEl.style.color = 'var(--color-teal)';
  }
}

// table display

function populateMonthFilter() {
  const select = document.getElementById('filterMonth');
  const previousValue = select.value;
  select.innerHTML = '<option value="all">All Months</option>';

  // get unique months
  const months = new Set();
  appState.transactions.forEach((tx) => {
    if (tx.date && tx.date.length >= 7) {
      months.add(tx.date.substring(0, 7));
    }
  });

  // sort newest first
  const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));

  sortedMonths.forEach((m) => {
    const [year, month] = m.split('-');
    const dateObj = new Date(year, parseInt(month) - 1, 1);
    const monthLabel = dateObj.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    const opt = document.createElement('option');
    opt.value = m;
    opt.innerText = monthLabel;
    select.appendChild(opt);
  });

  // keep old selection if possible
  if (Array.from(months).includes(previousValue)) {
    select.value = previousValue;
  }
}

function handleFilterChange() {
  renderTable();
}

function getCategoryIconHTML(cat) {
  const icon = CATEGORY_ICONS[cat] || 'fa-question-circle';
  const color = CATEGORY_COLORS[cat] || 'var(--text-muted)';
  return `<span class="category-badge" style="background-color: ${color}20; color: ${color};"><i class="fa-solid ${icon}"></i> ${cat}</span>`;
}

function renderTable() {
  const bodyMain = document.getElementById('transactionsMasterTableBody');
  const bodyRecent = document.getElementById('recentTransactionsTableBody');

  // Get search and filter values
  const searchVal = document
    .getElementById('txSearch')
    .value.toLowerCase()
    .trim();
  const typeVal = document.getElementById('filterType').value;
  const categoryVal = document.getElementById('filterCategory').value;
  const monthVal = document.getElementById('filterMonth').value;
  const sortVal = document.getElementById('sortField').value;

  // search/filter logic
  let filtered = appState.transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchVal);
    const matchesType = typeVal === 'all' || tx.type === typeVal;
    const matchesCategory =
      categoryVal === 'all' || tx.category === categoryVal;
    const matchesMonth = monthVal === 'all' || tx.date.startsWith(monthVal);

    return matchesSearch && matchesType && matchesCategory && matchesMonth;
  });

  // sort logic
  filtered.sort((a, b) => {
    if (sortVal === 'date-desc') return b.date.localeCompare(a.date);
    if (sortVal === 'date-asc') return a.date.localeCompare(b.date);
    if (sortVal === 'amount-desc')
      return parseFloat(b.amount) - parseFloat(a.amount);
    if (sortVal === 'amount-asc')
      return parseFloat(a.amount) - parseFloat(b.amount);
    if (sortVal === 'category-asc') return a.category.localeCompare(b.category);
    return 0;
  });

  // render table
  bodyMain.innerHTML = '';
  if (filtered.length === 0) {
    document.getElementById('txEmptyState').style.display = 'flex';
    document.getElementById('transactionsMasterTable').style.display = 'none';
  } else {
    document.getElementById('txEmptyState').style.display = 'none';
    document.getElementById('transactionsMasterTable').style.display = 'table';

    filtered.forEach((tx) => {
      const tr = document.createElement('tr');

      const formattedDate = new Date(tx.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const recurringPill =
        tx.recurring !== 'none' ?
          `<span class="type-pill" style="background-color: var(--indigo-light); color: var(--indigo-primary); font-size: 0.7rem;"><i class="fa-solid fa-arrows-spin"></i> ${tx.recurring}</span>`
        : `<span style="color: var(--text-muted); font-size: 0.75rem;">One-time</span>`;

      tr.innerHTML = `
        <td style="font-weight: 600;">${formattedDate}</td>
        <td style="font-weight: 700; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(tx.description)}</td>
        <td>${getCategoryIconHTML(tx.category)}</td>
        <td>
          <span class="type-pill ${tx.type}">${tx.type}</span>
        </td>
        <td class="amount-val ${tx.type}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount).substring(1)}
        </td>
        <td>${recurringPill}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon edit" onclick="openEditTransactionModal('${tx.id}')" title="Edit Entry">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="btn-icon delete" onclick="deleteTransaction('${tx.id}')" title="Delete Entry">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;
      bodyMain.appendChild(tr);
    });
  }

  // render recent 5 items on dashboard
  bodyRecent.innerHTML = '';
  const recentList = [...appState.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recentList.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" class="empty-state" style="padding: 2rem;">No entries log yet. Click "+ New Transaction" to begin.</td>`;
    bodyRecent.appendChild(tr);
  } else {
    recentList.forEach((tx) => {
      const tr = document.createElement('tr');
      const formattedDate = new Date(tx.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      tr.innerHTML = `
        <td style="font-weight: 600;">${formattedDate}</td>
        <td style="font-weight: 700;">${escapeHTML(tx.description)}</td>
        <td>${getCategoryIconHTML(tx.category)}</td>
        <td><span class="type-pill ${tx.type}">${tx.type}</span></td>
        <td class="amount-val ${tx.type}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount).substring(1)}
        </td>
      `;
      bodyRecent.appendChild(tr);
    });
  }
}

function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[tag] || tag,
  );
}

// transactions management

function openTransactionModal() {
  document.getElementById('txModalTitle').innerText = 'New Transaction';
  document.getElementById('txId').value = '';
  document.getElementById('txDescription').value = '';
  document.getElementById('txAmount').value = '';
  document.getElementById('txDate').value = new Date()
    .toISOString()
    .split('T')[0];
  document.getElementById('txRecurring').value = 'none';

  // default to expense type
  document.querySelector("input[name='txType'][value='expense']").checked =
    true;
  syncModalCategories('expense');

  document.getElementById('txModal').classList.add('active');
}

function openEditTransactionModal(id) {
  const tx = appState.transactions.find((t) => t.id === id);
  if (!tx) return;

  document.getElementById('txModalTitle').innerText = 'Edit Transaction';
  document.getElementById('txId').value = tx.id;
  document.getElementById('txDescription').value = tx.description;
  document.getElementById('txAmount').value = tx.amount;
  document.getElementById('txDate').value = tx.date;
  document.getElementById('txRecurring').value = tx.recurring || 'none';

  // check correct radio button
  document.querySelector(`input[name="txType"][value="${tx.type}"]`).checked =
    true;
  syncModalCategories(tx.type);

  // set category select value
  document.getElementById('txCategory').value = tx.category;

  document.getElementById('txModal').classList.add('active');
}

function closeTransactionModal(e) {
  document.getElementById('txModal').classList.remove('active');
}

function handleTransactionSubmit(e) {
  e.preventDefault();

  const idVal = document.getElementById('txId').value;
  const typeVal = document.querySelector("input[name='txType']:checked").value;
  const descVal = document.getElementById('txDescription').value.trim();
  const amtVal = parseFloat(document.getElementById('txAmount').value);
  const catVal = document.getElementById('txCategory').value;
  const dateVal = document.getElementById('txDate').value;
  const recurringVal = document.getElementById('txRecurring').value;

  if (!descVal || isNaN(amtVal) || amtVal <= 0 || !catVal || !dateVal) {
    showToast(
      'Invalid transaction input variables. Please verify form details.',
      'warning',
    );
    return;
  }

  if (idVal) {
    // edit existing
    const index = appState.transactions.findIndex((t) => t.id === idVal);
    if (index !== -1) {
      const originalDate = appState.transactions[index].date;
      appState.transactions[index] = {
        ...appState.transactions[index],
        description: descVal,
        amount: amtVal,
        type: typeVal,
        category: catVal,
        date: dateVal,
        recurring: recurringVal,
      };

      // reset lastProcessed if date changed
      if (recurringVal !== 'none' && originalDate !== dateVal) {
        appState.transactions[index].lastProcessed = dateVal;
      }

      showToast('Transaction updated successfully', 'success');
    }
  } else {
    // create new
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      description: descVal,
      amount: amtVal,
      type: typeVal,
      category: catVal,
      date: dateVal,
      recurring: recurringVal,
    };

    // start tracking recurring from transaction date
    if (recurringVal !== 'none') {
      newTx.lastProcessed = dateVal;
    }

    appState.transactions.push(newTx);
    showToast('Transaction added successfully', 'success');
  }

  saveState();
  closeTransactionModal();
  refreshUI();
}

function deleteTransaction(id) {
  if (confirm('Delete this transaction entry permanently?')) {
    appState.transactions = appState.transactions.filter((t) => t.id !== id);
    saveState();
    refreshUI();
    showToast('Transaction deleted successfully', 'success');
  }
}

// budget management

function renderBudgetsView() {
  const grid = document.getElementById('budgetsGrid');
  grid.innerHTML = '';

  // calculate total spent per category this month
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const spendSummary = {};
  Object.keys(CATEGORY_COLORS).forEach((c) => {
    if (c !== 'Salary') spendSummary[c] = 0;
  });

  appState.transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.date.startsWith(currentYearMonth)) {
      spendSummary[tx.category] =
        (spendSummary[tx.category] || 0) + parseFloat(tx.amount);
    }
  });

  // Render cards for expense categories
  Object.keys(spendSummary).forEach((cat) => {
    const limit = appState.budgets[cat] || 0;
    const spent = spendSummary[cat];

    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

    let progressClass = '';
    if (percentage >= 100) progressClass = 'danger';
    else if (percentage >= 80) progressClass = 'warning';

    const card = document.createElement('div');
    card.className = 'glass-card budget-card';

    const icon = CATEGORY_ICONS[cat] || 'fa-question-circle';
    const color = CATEGORY_COLORS[cat] || 'var(--text-muted)';
    const limitLabel = limit > 0 ? formatCurrency(limit) : 'No Limit';

    card.innerHTML = `
      <div class="budget-info">
        <span class="budget-category" style="color: ${color};">
          <i class="fa-solid ${icon}"></i> ${cat}
        </span>
        <span class="budget-amounts">
          <span style="font-weight: 800; color: ${percentage >= 100 ? 'var(--color-expense)' : 'var(--text-primary)'};">${formatCurrency(spent)}</span>
          <span style="color: var(--text-muted);">/ ${limitLabel}</span>
        </span>
      </div>
      
      <div class="budget-progress-bg">
        <div class="budget-progress-bar ${progressClass}" style="width: ${limit > 0 ? percentage : 0}%; background-color: ${progressClass ? '' : color};"></div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
        <span style="color: var(--text-muted); font-weight: 600;">
          ${limit > 0 ? Math.round(percentage) + '% consumed' : 'Track limits by setting a budget cap'}
        </span>
        <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 8px;" onclick="openBudgetModal('${cat}')">
          <i class="fa-solid fa-pen-clip"></i> Edit Limit
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function openBudgetModal(category) {
  document.getElementById('budgetCategoryName').value = category;

  const icon = CATEGORY_ICONS[category] || 'fa-question-circle';
  const color = CATEGORY_COLORS[category] || 'var(--text-muted)';
  document.getElementById('budgetCategoryDisplay').innerHTML = `
    <span style="color: ${color};"><i class="fa-solid ${icon}"></i> ${category}</span>
  `;

  const currentLimit = appState.budgets[category] || 0;
  document.getElementById('budgetLimitInput').value = currentLimit || '';

  document.getElementById('budgetModal').classList.add('active');
}

function closeBudgetModal() {
  document.getElementById('budgetModal').classList.remove('active');
}

function handleBudgetSubmit(e) {
  e.preventDefault();
  const cat = document.getElementById('budgetCategoryName').value;
  const limitVal =
    parseFloat(document.getElementById('budgetLimitInput').value) || 0;

  appState.budgets[cat] = limitVal;
  saveState();
  closeBudgetModal();
  refreshUI();
  showToast(`Updated budget limit for ${cat}`, 'success');
}

function calculateBudgetWarnings() {
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const spendSummary = {};
  appState.transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.date.startsWith(currentYearMonth)) {
      spendSummary[tx.category] =
        (spendSummary[tx.category] || 0) + parseFloat(tx.amount);
    }
  });

  let exceededCategories = [];

  Object.keys(appState.budgets).forEach((cat) => {
    const limit = appState.budgets[cat] || 0;
    const spent = spendSummary[cat] || 0;

    if (limit > 0 && spent > limit) {
      exceededCategories.push(
        `${cat} (Over by ${formatCurrency(spent - limit)})`,
      );
    }
  });

  const warningBanner = document.getElementById('budgetWarningsBanner');
  if (exceededCategories.length > 0) {
    warningBanner.style.display = 'flex';
    document.getElementById('budgetWarningText').innerHTML = `
      <strong>Budget Alert:</strong> You have exceeded limits in categories: ${exceededCategories.join(', ')}. Please review your spending.
    `;
  } else {
    warningBanner.style.display = 'none';
  }
}

// recurring transactions engine

function processRecurringTransactions() {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastProcessedStr = appState.settings.lastProcessedRecurringDate;

  if (!lastProcessedStr) {
    appState.settings.lastProcessedRecurringDate = todayStr;
    saveState();
    return;
  }

  const lastDate = new Date(lastProcessedStr);
  const today = new Date(todayStr);

  // skip if already processed
  if (lastDate >= today) return;

  let createdCount = 0;
  let notifications = [];

  // check each recurring transaction
  appState.transactions.forEach((tx) => {
    if (tx.recurring && tx.recurring !== 'none') {
      let txLastDate =
        tx.lastProcessed ? new Date(tx.lastProcessed) : new Date(tx.date);

      // find missing cycles
      let currentCycleDate = new Date(txLastDate);

      while (true) {
        // step date forward
        if (tx.recurring === 'daily') {
          currentCycleDate.setDate(currentCycleDate.getDate() + 1);
        } else if (tx.recurring === 'weekly') {
          currentCycleDate.setDate(currentCycleDate.getDate() + 7);
        } else if (tx.recurring === 'monthly') {
          currentCycleDate.setMonth(currentCycleDate.getMonth() + 1);
        }

        // stop if we reached today
        if (currentCycleDate > today) break;

        // add transaction copy
        const cycleDateStr = currentCycleDate.toISOString().split('T')[0];
        const newInstance = {
          id:
            'tx_recur_' +
            Date.now() +
            '_' +
            Math.random().toString(36).substr(2, 5),
          description: `${tx.description} (Auto-recurring)`,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: cycleDateStr,
          recurring: 'none', // Generated instances are one-time logs
          recurringParentId: tx.id,
        };

        appState.transactions.push(newInstance);
        createdCount++;
        notifications.push(
          `${tx.description} (${formatCurrency(tx.amount)}) logged on ${cycleDateStr}`,
        );
        txLastDate = new Date(currentCycleDate);
      }

      // save progress
      tx.lastProcessed = txLastDate.toISOString().split('T')[0];
    }
  });

  // update global date tracker
  appState.settings.lastProcessedRecurringDate = todayStr;
  saveState();

  if (createdCount > 0) {
    notifications.forEach((note) => {
      console.log('[Recurring Engine] ' + note);
    });

    // trigger push notification
    sendSystemPushNotification(
      'FinTrack Pro - Recurring Payments',
      `Logged ${createdCount} automated transactions.`,
    );
  }
}

function sendSystemPushNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: './assets/icon-192x192.png',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

// chart renderer

function renderCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor =
    isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // destroy old charts
  Object.keys(charts).forEach((key) => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });

  // group data by month
  const today = new Date();
  const monthsData = {};

  // prefill last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthsData[key] = {
      name: d.toLocaleString('default', { month: 'short' }),
      income: 0,
      expense: 0,
    };
  }

  appState.transactions.forEach((tx) => {
    const key = tx.date.substring(0, 7);
    if (monthsData[key]) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'income') {
        monthsData[key].income += amt;
      } else {
        monthsData[key].expense += amt;
      }
    }
  });

  const monthLabels = Object.values(monthsData).map((m) => m.name);
  const incomeSeries = Object.values(monthsData).map((m) => m.income);
  const expenseSeries = Object.values(monthsData).map((m) => m.expense);

  // income vs expense chart
  const ctxIE = document.getElementById('incomeExpenseChart').getContext('2d');
  charts.incomeExpense = new Chart(ctxIE, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'Income',
          data: incomeSeries,
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 6,
          barPercentage: 0.8,
          categoryPercentage: 0.7,
        },
        {
          label: 'Expense',
          data: expenseSeries,
          backgroundColor: 'rgba(239, 68, 68, 0.85)',
          borderRadius: 6,
          barPercentage: 0.8,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { family: 'Plus Jakarta Sans', weight: 600 },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } },
      },
    },
  });

  // category breakdown chart
  // current month category spending
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const categorySpends = {};

  appState.transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.date.startsWith(currentMonthStr)) {
      categorySpends[tx.category] =
        (categorySpends[tx.category] || 0) + parseFloat(tx.amount);
    }
  });

  const catLabels = Object.keys(categorySpends);
  const catData = Object.values(categorySpends);
  const catBgColors = catLabels.map((l) => CATEGORY_COLORS[l] || '#94a3b8');

  const ctxCat = document.getElementById('categoryChart').getContext('2d');
  charts.category = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: catLabels.length > 0 ? catLabels : ['No Expenses'],
      datasets: [
        {
          data: catData.length > 0 ? catData : [1],
          backgroundColor:
            catData.length > 0 ? catBgColors : ['var(--border-color)'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: { family: 'Plus Jakarta Sans', weight: 600 },
          },
        },
      },
      cutout: '70%',
    },
  });

  // monthly spending line chart
  const ctxMS = document
    .getElementById('monthlySpendingChart')
    .getContext('2d');
  charts.monthlySpending = new Chart(ctxMS, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'Monthly Expenditure',
          data: expenseSeries,
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } },
      },
    },
  });

  // daily cumulative spending line chart
  // prefill all calendar days
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1),
  );
  const dailySpendSums = Array(daysInMonth).fill(0);

  appState.transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.date.startsWith(currentMonthStr)) {
      const day = parseInt(tx.date.split('-')[2]);
      if (day >= 1 && day <= daysInMonth) {
        dailySpendSums[day - 1] += parseFloat(tx.amount) || 0;
      }
    }
  });

  // calculate cumulative sums
  let cumulative = 0;
  const cumulativeSeries = dailySpendSums.map((daily) => {
    cumulative += daily;
    return cumulative;
  });

  const ctxET = document.getElementById('expenseTrendChart').getContext('2d');
  charts.expenseTrend = new Chart(ctxET, {
    type: 'line',
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: 'Cumulative Spending Today',
          data: cumulativeSeries,
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderWidth: 2,
          tension: 0.1,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, maxTicksLimit: 10 },
        },
        y: { grid: { color: gridColor }, ticks: { color: textColor } },
      },
    },
  });
}

// theme settings

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  applyTheme(next);

  appState.user.theme = next;
  saveState();

  // redraw charts with theme colors
  renderCharts();

  showToast(`Switched to ${next} theme mode`, 'info');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  // update header and settings icons
  const moonIcon = '<i class="fa-solid fa-moon"></i>';
  const sunIcon = '<i class="fa-solid fa-sun"></i>';
  const icon = theme === 'dark' ? sunIcon : moonIcon;

  document.getElementById('themeToggleBtn').innerHTML = icon;

  const settingsToggle = document.getElementById('settingsThemeToggle');
  if (settingsToggle) {
    settingsToggle.innerHTML = icon;
  }
}

// settings save/reset

function saveSettings(e) {
  e.preventDefault();
  const nameVal = document.getElementById('settingsName').value.trim();
  const currencyVal = document.getElementById('settingsCurrency').value;

  if (nameVal) {
    appState.user.name = nameVal;
    appState.user.currency = currencyVal;
    saveState();

    syncUserProfile();
    refreshUI();
    showToast('Application settings updated successfully', 'success');
  }
}

function resetApplicationData() {
  if (
    confirm(
      'WARNING: This will permanently wipe all local user accounts and transaction histories. Proceed?',
    )
  ) {
    localStorage.removeItem('fintrack_pro_users');
    localStorage.removeItem('fintrack_pro_active_user');
    showToast('All application database files wiped clean.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

// backup / exports

// download ledger csv
function exportCSV() {
  if (appState.transactions.length === 0) {
    showToast('No transaction records available to export.', 'warning');
    return;
  }

  let csv = 'ID,Date,Description,Category,Type,Amount,Recurring\n';
  appState.transactions.forEach((tx) => {
    csv += `"${tx.id}","${tx.date}","${tx.description.replace(/"/g, '""')}","${tx.category}","${tx.type}",${tx.amount},"${tx.recurring}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `FinTrack_Ledger_${new Date().toISOString().split('T')[0]}.csv`,
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('CSV ledger downloaded successfully', 'success');
}

// download JSON backup
function exportJSON() {
  const jsonString = JSON.stringify(appState, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `FinTrack_Backup_${new Date().toISOString().split('T')[0]}.json`,
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('JSON configurations exported successfully', 'success');
}

// upload JSON backup
function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const imported = JSON.parse(evt.target.result);

      // validate schema
      if (
        imported.user &&
        Array.isArray(imported.transactions) &&
        imported.budgets
      ) {
        // keep current password
        const activeUser = localStorage.getItem('fintrack_pro_active_user');
        const users = JSON.parse(
          localStorage.getItem('fintrack_pro_users') || '{}',
        );
        let activePass = '';

        if (activeUser && users[activeUser]) {
          activePass = users[activeUser].password;
        }

        appState = {
          ...imported,
          password: activePass || imported.password || 'pass123',
        };

        saveState();
        showToast('Backup configurations restored successfully!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast(
          'Invalid JSON schema. Backup restoration aborted.',
          'warning',
        );
      }
    } catch (err) {
      showToast('Corrupted JSON backup file. Import aborted.', 'warning');
    }
  };
  reader.readAsText(file);
}

// generate pdf statement
function generatePDF() {
  if (appState.transactions.length === 0) {
    showToast('No transaction records available to build PDF.', 'warning');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const currencySymbol = CURRENCY_SYMBOLS[appState.user.currency] || '₹';

  // Title Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('FINTRACK PRO REPORT', 14, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Pro Edition Financial Statement', 14, 32);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 25);
  doc.text(`Account User: ${appState.user.name}`, 150, 32);

  // Metrics Grid
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FINANCIAL POSITION OVERVIEW', 14, 55);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 58, 196, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Net Cumulative Balance:', 14, 68);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${currencySymbol} ${computedMetrics.balance.toLocaleString()}`,
    70,
    68,
  );

  doc.setFont('helvetica', 'normal');
  doc.text('Total Income Recieved:', 14, 76);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(
    `${currencySymbol} ${computedMetrics.totalIncome.toLocaleString()}`,
    70,
    76,
  );

  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Expenses Logged:', 14, 84);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(239, 68, 68); // expense color
  doc.text(
    `${currencySymbol} ${computedMetrics.totalExpense.toLocaleString()}`,
    70,
    84,
  );

  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Savings Margin:', 14, 92);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${currencySymbol} ${computedMetrics.monthlySavings.toLocaleString()}`,
    70,
    92,
  );

  // Ledger Records Header
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.setFontSize(12);
  doc.text('RECENT LEDGER LOGS', 14, 110);
  doc.line(14, 113, 196, 113);

  // Draw table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 118, 182, 8, 'F');

  doc.setFontSize(9);
  doc.setTextColor(...slateGray);
  doc.text('Date', 16, 123);
  doc.text('Description', 45, 123);
  doc.text('Category', 110, 123);
  doc.text('Type', 150, 123);
  doc.text('Amount', 175, 123);

  // Loop transactions
  let y = 132;
  const list = [...appState.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15); // Print top 15 entries

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkNavy);

  list.forEach((tx) => {
    // handle pagination
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.text(tx.date, 16, y);
    doc.text(tx.description.substring(0, 30), 45, y);
    doc.text(tx.category, 110, y);
    doc.text(tx.type.toUpperCase(), 150, y);
    doc.text(`${currencySymbol}${parseFloat(tx.amount).toFixed(2)}`, 175, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 2, 196, y + 2);

    y += 9;
  });

  // save pdf
  doc.save(`FinTrack_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
  showToast('PDF report generated successfully', 'success');
}

// toast notifications

function showToast(msg, type = 'info') {
  // create wrapper if missing
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.style.position = 'fixed';
    wrap.style.top = '2rem';
    wrap.style.right = '2rem';
    wrap.style.zIndex = '2000';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '0.5rem';
    wrap.style.pointerEvents = 'none';
    document.body.appendChild(wrap);
  }

  const toast = document.createElement('div');
  toast.style.pointerEvents = 'auto';
  toast.style.background = 'var(--bg-sidebar)';
  toast.style.color = 'var(--text-primary)';
  toast.style.padding = '0.85rem 1.25rem';
  toast.style.borderRadius = '14px';
  toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.25)';
  toast.style.borderLeft = '4px solid var(--indigo-primary)';
  toast.style.fontSize = '0.85rem';
  toast.style.fontWeight = '700';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.style.transform = 'translateX(50px)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

  let icon =
    '<i class="fa-solid fa-circle-info" style="color: var(--indigo-primary);"></i>';
  if (type === 'success') {
    toast.style.borderLeftColor = 'var(--color-income)';
    icon =
      '<i class="fa-solid fa-circle-check" style="color: var(--color-income);"></i>';
  } else if (type === 'warning') {
    toast.style.borderLeftColor = 'var(--color-warning)';
    icon =
      '<i class="fa-solid fa-triangle-exclamation" style="color: var(--color-warning);"></i>';
  }

  toast.innerHTML = `${icon} <span>${msg}</span>`;
  wrap.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    toast.style.transform = 'translateX(50px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      wrap.removeChild(toast);
    }, 300);
  }, 4000);
}

// event listeners

function setupEventListeners() {
  // fill preferences form values
  const prefForm = document.getElementById('settingsForm');
  if (prefForm) {
    document.getElementById('settingsName').value = appState.user.name || '';
    document.getElementById('settingsCurrency').value =
      appState.user.currency || 'INR';
  }

  // close modals on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTransactionModal();
      closeBudgetModal();
    }
  });

  // click outside closes mobile sidebar
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    if (
      sidebar &&
      sidebar.classList.contains('active') &&
      !sidebar.contains(e.target) &&
      mobileToggle &&
      !mobileToggle.contains(e.target)
    ) {
      sidebar.classList.remove('active');
    }
  });
}
