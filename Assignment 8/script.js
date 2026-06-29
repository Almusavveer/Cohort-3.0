// System variables & Storage Memory Structures
let transactions = [];
let budgets = {
  "Food & Dining": 0,
  Shopping: 0,
  "Recharge & Bills": 0,
  "Petrol & Auto": 0,
  Utilities: 0,
  Entertainment: 0,
};
let currentFilter = "all";
let searchQuery = "";
let currentSort = "date-desc";
let chartInstance = null;
let activeChartType = "flow"; // 'flow' (bar chart) or 'breakdown' (doughnut chart)

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

const categoryMeta = {
  Salary: { label: "Salary", emoji: "💼", color: "#10b981" },
  Freelance: { label: "Freelance", emoji: "💻", color: "#34d399" },
  Investments: { label: "Investments", emoji: "📈", color: "#059669" },
  "Food & Dining": {
    label: "Food & Dining",
    emoji: "🍔",
    color: "#f59e0b",
    id: "budget-food",
  },
  Shopping: {
    label: "Shopping",
    emoji: "🛍️",
    color: "#ec4899",
    id: "budget-shopping",
  },
  "Recharge & Bills": {
    label: "Recharge & Bills",
    emoji: "📱",
    color: "#8b5cf6",
    id: "budget-bills",
  },
  "Petrol & Auto": {
    label: "Petrol & Auto",
    emoji: "🚗",
    color: "#3b82f6",
    id: "budget-petrol",
  },
  Utilities: {
    label: "Utilities",
    emoji: "💡",
    color: "#06b6d4",
    id: "budget-utilities",
  },
  Entertainment: {
    label: "Entertainment",
    emoji: "🎬",
    color: "#f43f5e",
    id: "budget-entertainment",
  },
  Other: { label: "Other", emoji: "📦", color: "#64748b" },
};

const categories = {
  income: ["Salary", "Freelance", "Investments", "Other"],
  expense: [
    "Food & Dining",
    "Shopping",
    "Recharge & Bills",
    "Petrol & Auto",
    "Utilities",
    "Entertainment",
    "Other",
  ],
};

// Bootstrap App Engine
window.addEventListener("DOMContentLoaded", () => {
  initializeSystemMemory();
  initializeGlobalTheming();
  populateFormInputStates();
  updateDynamicCategoryMenu();
  masterRefreshUI();

  // Setup default date context to today
  document.getElementById("txDate").value = new Date()
    .toISOString()
    .split("T")[0];
});

// Custom DOM Alerts & Notifications
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let colorHex = "var(--primary)";
  if (type === "success") colorHex = "var(--income)";
  if (type === "error") colorHex = "var(--expense)";

  toast.innerHTML = `
                <div style="color: ${colorHex}; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="toast-content">${message}</div>
            `;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);

  // Toast garbage collection
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Custom Confirm overlay loop to bypass native popups
function showConfirm(title, description, onConfirm) {
  const overlay = document.getElementById("confirmOverlay");
  document.getElementById("confirmTitle").innerText = title;
  document.getElementById("confirmDesc").innerText = description;

  const okBtn = document.getElementById("confirmOkBtn");
  const cancelBtn = document.getElementById("confirmCancelBtn");

  const hideConfirm = () => {
    overlay.classList.remove("open");
  };

  const handleOk = () => {
    onConfirm();
    hideConfirm();
    okBtn.removeEventListener("click", handleOk);
    cancelBtn.removeEventListener("click", handleCancel);
  };

  const handleCancel = () => {
    hideConfirm();
    okBtn.removeEventListener("click", handleOk);
    cancelBtn.removeEventListener("click", handleCancel);
  };

  okBtn.addEventListener("click", handleOk);
  cancelBtn.addEventListener("click", handleCancel);

  overlay.classList.add("open");
}

// Persistent State Storage
function initializeSystemMemory() {
  const savedTx = localStorage.getItem("fintrack_transactions_v3");
  transactions = savedTx ? JSON.parse(savedTx) : [];

  const savedBudgets = localStorage.getItem("fintrack_budgets");
  if (savedBudgets) {
    budgets = JSON.parse(savedBudgets);
  }

  if (!localStorage.getItem("fintrack_currency"))
    localStorage.setItem("fintrack_currency", "USD");
  if (!localStorage.getItem("fintrack_name"))
    localStorage.setItem("fintrack_name", "Guest Ledger");
  if (!localStorage.getItem("fintrack_darkmode"))
    localStorage.setItem("fintrack_darkmode", "false");
}

function persistStorageMemory() {
  localStorage.setItem(
    "fintrack_transactions_v3",
    JSON.stringify(transactions),
  );
  localStorage.setItem("fintrack_budgets", JSON.stringify(budgets));
}

function initializeGlobalTheming() {
  const isDark = localStorage.getItem("fintrack_darkmode") === "true";
  document.getElementById("pref-darkmode").checked = isDark;
  applyThemeClasses(isDark);
}

function toggleThemeFromSwitch(chk) {
  localStorage.setItem("fintrack_darkmode", chk.checked);
  applyThemeClasses(chk.checked);
  showToast(`Theme switched dynamically`, "info");
}

function fastToggleTheme() {
  const isDark = document.body.classList.contains("dark");
  const targetMode = !isDark;
  localStorage.setItem("fintrack_darkmode", targetMode);
  document.getElementById("pref-darkmode").checked = targetMode;
  applyThemeClasses(targetMode);
  showToast(`Theme changed`, "info");
}

function applyThemeClasses(isDark) {
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");

  if (isDark) {
    document.body.classList.add("dark");
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  } else {
    document.body.classList.remove("dark");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
  if (chartInstance) renderChartInstance();
}

function populateFormInputStates() {
  document.getElementById("pref-name").value =
    localStorage.getItem("fintrack_name");
  document.getElementById("pref-currency").value =
    localStorage.getItem("fintrack_currency");

  // Map spending limit fields
  document.getElementById("budget-food").value = budgets["Food & Dining"] || "";
  document.getElementById("budget-shopping").value = budgets["Shopping"] || "";
  document.getElementById("budget-bills").value =
    budgets["Recharge & Bills"] || "";
  document.getElementById("budget-petrol").value =
    budgets["Petrol & Auto"] || "";
  document.getElementById("budget-utilities").value =
    budgets["Utilities"] || "";
  document.getElementById("budget-entertainment").value =
    budgets["Entertainment"] || "";

  syncNavbarLogoText();
}

function syncNavbarLogoText() {
  const name = localStorage.getItem("fintrack_name") || "Guest Ledger";
  document.getElementById("appLogo").innerText = `FinTrack Pro`;
  document.getElementById("welcomeUser").innerText = `Hello, ${name}`;
}

// Page Routing Navigation Switches
function showPage(pageId) {
  document
    .querySelectorAll(".app-section")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((el) => el.classList.remove("active"));

  document.getElementById(`${pageId}-page`).classList.add("active");
  document.getElementById(`nav-${pageId}`).classList.add("active");

  if (pageId === "dashboard") {
    setTimeout(renderChartInstance, 50);
  }
}

// Modal triggers
function openModal() {
  document.getElementById("txModal").classList.add("open");
}

function closeModal() {
  document.getElementById("txModal").classList.remove("open");
  document.getElementById("txForm").reset();
  document.getElementById("txDate").value = new Date()
    .toISOString()
    .split("T")[0];
  updateDynamicCategoryMenu();
}

function handleOverlayOuterClick(e) {
  if (e.target.classList.contains("modal-overlay")) {
    closeModal();
  }
}

function updateDynamicCategoryMenu() {
  const selectedType = document.querySelector(
    'input[name="txType"]:checked',
  ).value;
  const catSelect = document.getElementById("txCategory");
  catSelect.innerHTML = "";

  categories[selectedType].forEach((catName) => {
    const opt = document.createElement("option");
    opt.value = catName;
    const meta = categoryMeta[catName] || { emoji: "📦", label: catName };
    opt.innerText = `${meta.emoji} ${meta.label}`;
    catSelect.appendChild(opt);
  });

  // Adjust CTA button colors contextually
  const submitBtn = document.getElementById("txSubmitBtn");
  if (selectedType === "income") {
    submitBtn.style.backgroundColor = "var(--income)";
  } else {
    submitBtn.style.backgroundColor = "var(--primary)";
  }
}

// Main rendering orchestrator
function masterRefreshUI() {
  calculateAndDisplayTotalValues();
  renderTransactionTable();
  renderBudgetProgressBars();
  renderFinancialInsights();
  renderChartInstance();
  renderNavbarBadge();
}

function getActiveCurrencySymbol() {
  const currencyCode = localStorage.getItem("fintrack_currency") || "USD";
  return currencySymbols[currencyCode] || "$";
}

function formatValueCurrency(amount) {
  return `${getActiveCurrencySymbol()}${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calculateAndDisplayTotalValues() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") totalIncome += parseFloat(t.amount);
    else totalExpense += parseFloat(t.amount);
  });

  const currentBalance = totalIncome - totalExpense;

  // Balance card configuration
  const balanceElement = document.getElementById("val-balance");
  balanceElement.innerText = formatValueCurrency(currentBalance);
  balanceElement.style.color =
    currentBalance < 0 ? "var(--expense)" : "var(--text-color)";

  document.getElementById("val-income").innerText =
    formatValueCurrency(totalIncome);
  document.getElementById("val-expense").innerText =
    formatValueCurrency(totalExpense);

  // Calculate savings rate
  const savingsRateElement = document.getElementById("val-savings-rate");
  if (totalIncome > 0) {
    const savingsRate = Math.round(
      ((totalIncome - totalExpense) / totalIncome) * 100,
    );
    savingsRateElement.innerText = `${savingsRate}%`;
    savingsRateElement.style.color =
      savingsRate < 10 ? "var(--expense)" : "var(--income)";
  } else {
    savingsRateElement.innerText = "0%";
    savingsRateElement.style.color = "var(--text-color)";
  }
}

function renderNavbarBadge() {
  const count = transactions.length;
  const badgeId = "badge-count-id";
  let badge = document.getElementById(badgeId);

  if (!badge) {
    badge = document.createElement("span");
    badge.id = badgeId;
    badge.className = "badge-nav-count";
    document.getElementById("nav-dashboard").appendChild(badge);
  }
  badge.innerText = count;
  badge.style.display = count > 0 ? "inline-block" : "none";
}

// Render category spending limits progress bars
function renderBudgetProgressBars() {
  const container = document.getElementById("budget-widget-container");
  container.innerHTML = "";

  // Group transactions by category this month
  const monthExpenses = {};
  const currentYearMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"

  transactions.forEach((t) => {
    if (t.type === "expense" && t.date.substring(0, 7) === currentYearMonth) {
      monthExpenses[t.category] =
        (monthExpenses[t.category] || 0) + parseFloat(t.amount);
    }
  });

  let activeLimitsCount = 0;

  Object.keys(budgets).forEach((cat) => {
    const limit = parseFloat(budgets[cat]);
    if (limit > 0) {
      activeLimitsCount++;
      const spent = monthExpenses[cat] || 0;
      const percent = Math.min(Math.round((spent / limit) * 100), 100);
      const meta = categoryMeta[cat];

      // Choose visual fill colors based on depletion rate
      let barColor = "var(--primary)";
      if (percent >= 100) {
        barColor = "var(--expense)";
      } else if (percent >= 80) {
        barColor = "var(--warning)";
      } else {
        barColor = "var(--income)";
      }

      const itemDiv = document.createElement("div");
      itemDiv.className = "budget-item";
      itemDiv.innerHTML = `
                        <div class="budget-meta">
                            <span>${meta.emoji} ${meta.label}</span>
                            <span style="color: ${percent >= 100 ? "var(--expense)" : "var(--text-color)"}">
                                ${formatValueCurrency(spent)} of ${formatValueCurrency(limit)} (${percent}%)
                            </span>
                        </div>
                        <div class="budget-bar-bg">
                            <div class="budget-bar-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
                        </div>
                    `;
      container.appendChild(itemDiv);
    }
  });

  if (activeLimitsCount === 0) {
    container.innerHTML = `
                    <div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 10px 0;">
                        No budgets customized. Define spending limits in Settings.
                    </div>
                `;
  }
}

// Dynamic Heuristic Advisory engine
function renderFinancialInsights() {
  const container = document.getElementById("insights-text-container");

  if (transactions.length === 0) {
    container.innerHTML = `
                    <div style="display: flex; gap: 8px; align-items: center; color: var(--text-muted);">
                        <span>💡 Fill in some transaction entries to generate dynamic financial advice insights.</span>
                    </div>
                `;
    return;
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categorySums = {};

  transactions.forEach((t) => {
    const amt = parseFloat(t.amount);
    if (t.type === "income") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
      categorySums[t.category] = (categorySums[t.category] || 0) + amt;
    }
  });

  // Find top spending category
  let topSpendingCat = "";
  let maxSpendingVal = 0;
  Object.keys(categorySums).forEach((cat) => {
    if (categorySums[cat] > maxSpendingVal) {
      maxSpendingVal = categorySums[cat];
      topSpendingCat = cat;
    }
  });

  let adviceHTML = "";

  // Generate strategic rules based on calculations
  if (totalIncome === 0) {
    adviceHTML = `<span>⚠️ You have logged expense entries but no primary incomes. Log your salary or earnings to calculate a reliable savings rate.</span>`;
  } else {
    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;

    if (savingsRate < 0) {
      adviceHTML = `<span>🚨 <strong>Warning:</strong> Your cash flow balance is negative this session (Savings Rate: ${Math.round(savingsRate)}%). Reduce non-essential allocations like <strong>Shopping</strong> or <strong>Entertainment</strong>.</span>`;
    } else if (savingsRate < 15) {
      adviceHTML = `<span>💡 <strong>Advice:</strong> You save around ${Math.round(savingsRate)}% of earnings. The recommended safety margin is 20%. Consider setting category budget limits in your Profile.</span>`;
    } else {
      adviceHTML = `<span>🎉 <strong>Great job:</strong> Your savings net rate is ${Math.round(savingsRate)}%! You are successfully building a wealth buffer. Keep tracking your entries.</span>`;
    }

    if (topSpendingCat && maxSpendingVal > totalExpense * 0.35) {
      adviceHTML += `<br><span style="margin-top:8px; display:inline-block;">🎯 <strong>Insight:</strong> Over 35% of outflows are consumed by <strong>${topSpendingCat}</strong> (${formatValueCurrency(maxSpendingVal)}). Try adjusting this allocation to free up liquid funds.</span>`;
    }
  }

  container.innerHTML = `<div>${adviceHTML}</div>`;
}

// Table searching, filtering, and sorting
function setFilter(type, btn) {
  currentFilter = type;
  document
    .querySelectorAll(".btn-filter")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderTransactionTable();
}

function handleSearchFilter() {
  searchQuery = document
    .getElementById("ledger-search")
    .value.toLowerCase()
    .trim();
  renderTransactionTable();
}

function handleSortChange() {
  currentSort = document.getElementById("ledger-sorter").value;
  renderTransactionTable();
}

function renderTransactionTable() {
  const tbody = document.getElementById("ledgerTableBody");
  const emptyContainer = document.getElementById("empty-state-container");
  tbody.innerHTML = "";
  emptyContainer.innerHTML = "";

  // Perform combined dataset search
  let dataset = transactions.filter((t) => {
    const matchesType = currentFilter === "all" || t.type === currentFilter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery) ||
      t.category.toLowerCase().includes(searchQuery);
    return matchesType && matchesSearch;
  });

  // Apply interactive ordering configs
  if (currentSort === "date-desc") {
    dataset.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (currentSort === "date-asc") {
    dataset.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (currentSort === "amount-desc") {
    dataset.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  } else if (currentSort === "amount-asc") {
    dataset.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
  }

  if (dataset.length === 0) {
    emptyContainer.innerHTML = `
                    <div class="empty-state-card">
                        <div class="empty-state-icon">
                            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div class="empty-state-title">No Transactions Found</div>
                        <div class="empty-state-subtitle">Your current selections, filters, or search strings matched 0 logs.</div>
                    </div>
                `;
    return;
  }

  dataset.forEach((item) => {
    const tr = document.createElement("tr");
    const meta = categoryMeta[item.category] || {
      emoji: "📦",
      label: item.category,
    };
    const sign = item.type === "income" ? "+" : "-";
    const typeStyle = item.type === "income" ? "tx-income" : "tx-expense";

    tr.innerHTML = `
                    <td style="font-weight: 500; color: var(--text-muted); font-size: 13px;">${formatFriendlyDate(item.date)}</td>
                    <td style="font-weight: 600;">${escapeMarkupChars(item.description)}</td>
                    <td>
                        <span class="category-pill">
                            <span>${meta.emoji}</span>
                            <span>${meta.label}</span>
                        </span>
                    </td>
                    <td class="tx-amount ${typeStyle}">${sign} ${formatValueCurrency(item.amount)}</td>
                    <td style="text-align: right;">
                        <button class="btn-trash-action" onclick="deleteTransaction(${item.id})" title="Delete entry">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </td>
                `;
    tbody.appendChild(tr);
  });
}

function formatFriendlyDate(dStr) {
  const opt = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dStr).toLocaleDateString(undefined, opt);
}

function escapeMarkupChars(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        tag
      ] || tag,
  );
}

// Mutators and transaction additions
function handleTransactionSubmit(e) {
  e.preventDefault();

  const type = document.querySelector('input[name="txType"]:checked').value;
  const description = document.getElementById("txDesc").value.trim();
  const amount = parseFloat(document.getElementById("txAmount").value);
  const date = document.getElementById("txDate").value;
  const category = document.getElementById("txCategory").value;

  if (!description || isNaN(amount) || !date || !category) {
    showToast("Please verify and fill in all data parameters.", "error");
    return;
  }

  const item = {
    id: Date.now(),
    type,
    description,
    amount,
    date,
    category,
  };

  // Budget alert threshold pre-check
  if (type === "expense" && budgets[category] > 0) {
    const limit = parseFloat(budgets[category]);
    const currentYearMonth = new Date().toISOString().substring(0, 7);

    // Calculate spending before adding new one
    let spentSoFar = 0;
    transactions.forEach((t) => {
      if (
        t.category === category &&
        t.type === "expense" &&
        t.date.substring(0, 7) === currentYearMonth
      ) {
        spentSoFar += parseFloat(t.amount);
      }
    });

    if (spentSoFar + amount > limit) {
      showToast(
        `⚠️ Budget Alert: Adding this logs exceeds your target monthly limit for ${category}!`,
        "error",
      );
    }
  }

  transactions.push(item);
  persistStorageMemory();
  closeModal();
  masterRefreshUI();
  showToast("Transaction recorded successfully", "success");
}

function deleteTransaction(id) {
  showConfirm(
    "Delete Transaction?",
    "Are you sure you want to discard this record from your ledger?",
    () => {
      transactions = transactions.filter((t) => t.id !== id);
      persistStorageMemory();
      masterRefreshUI();
      showToast("Transaction deleted successfully", "error");
    },
  );
}

// Spreadsheet Downloader Engine
function exportTransactionsToCSV() {
  if (transactions.length === 0) {
    showToast("No logged transactions to export.", "error");
    return;
  }

  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.category,
    t.type,
    t.amount,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `FinTrack_Ledger_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("CSV document exported.", "success");
}

// SWITCH CHART METHOD
function switchChartType(type) {
  activeChartType = type;
  document
    .getElementById("btn-flow")
    .classList.toggle("active", type === "flow");
  document
    .getElementById("btn-breakdown")
    .classList.toggle("active", type === "breakdown");
  renderChartInstance();
}

// Render Chart using ChartJS
function renderChartInstance() {
  const canvas = document.getElementById("cashFlowChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isDark = document.body.classList.contains("dark");
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  if (activeChartType === "flow") {
    // Group flows chronologically
    const timeline = {};
    transactions.forEach((t) => {
      if (!timeline[t.date]) {
        timeline[t.date] = { income: 0, expense: 0 };
      }
      timeline[t.date][t.type] += parseFloat(t.amount);
    });

    const sortedDates = Object.keys(timeline).sort(
      (a, b) => new Date(a) - new Date(b),
    );
    const viewDates = sortedDates.slice(-7); // display trailing 7 days

    const incomeData = [];
    const expenseData = [];
    const labels = viewDates.map((d) => formatFriendlyDate(d));

    viewDates.forEach((d) => {
      incomeData.push(timeline[d].income);
      expenseData.push(timeline[d].expense);
    });

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Income",
            data: incomeData,
            backgroundColor: "#10b981",
            borderRadius: 5,
            barPercentage: 0.6,
            categoryPercentage: 0.5,
          },
          {
            label: "Expense",
            data: expenseData,
            backgroundColor: "#f43f5e",
            borderRadius: 5,
            barPercentage: 0.6,
            categoryPercentage: 0.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              font: { family: "Inter", weight: 600, size: 11 },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: "Inter", size: 10 } },
          },
          y: {
            grid: { color: gridColor, drawBorder: false },
            ticks: { color: textColor, font: { family: "Inter", size: 10 } },
            beginAtZero: true,
          },
        },
      },
    });
  } else {
    // Category breakdown doughnut chart logic
    const categoryTotals = {};
    transactions.forEach((t) => {
      if (t.type === "expense") {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + parseFloat(t.amount);
      }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map((lbl) => categoryMeta[lbl]?.color || "#cbd5e1");

    if (labels.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "13px Inter";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(
        "Log an expense entry to plot breakdown chart.",
        canvas.width / 2,
        canvas.height / 2,
      );
      return;
    }

    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? "#121826" : "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { color: textColor, font: { family: "Inter", size: 11 } },
          },
        },
      },
    });
  }
}

// Settings panel persistence logic
function saveSystemPreferences() {
  const nameInput = document.getElementById("pref-name").value.trim();
  const currencyVal = document.getElementById("pref-currency").value;

  if (!nameInput) {
    showToast("Display name is mandatory.", "error");
    return;
  }

  // Save budgets limits
  budgets["Food & Dining"] = Math.max(
    0,
    parseFloat(document.getElementById("budget-food").value) || 0,
  );
  budgets["Shopping"] = Math.max(
    0,
    parseFloat(document.getElementById("budget-shopping").value) || 0,
  );
  budgets["Recharge & Bills"] = Math.max(
    0,
    parseFloat(document.getElementById("budget-bills").value) || 0,
  );
  budgets["Petrol & Auto"] = Math.max(
    0,
    parseFloat(document.getElementById("budget-petrol").value) || 0,
  );
  budgets["Utilities"] = Math.max(
    0,
    parseFloat(document.getElementById("budget-utilities").value) || 0,
  );
  budgets["Entertainment"] = Math.max(
    0,
    parseFloat(document.getElementById("budget-entertainment").value) || 0,
  );

  localStorage.setItem("fintrack_name", nameInput);
  localStorage.setItem("fintrack_currency", currencyVal);

  persistStorageMemory();
  syncNavbarLogoText();
  masterRefreshUI();
  showToast("Preferences & spending limits updated", "success");
}

function triggerWipeRoutine() {
  showConfirm(
    "Wipe Databases Completely?",
    "Are you absolutely sure you want to delete all transactions and targeted spending limits?",
    () => {
      localStorage.clear();
      initializeSystemMemory();
      initializeGlobalTheming();
      populateFormInputStates();
      masterRefreshUI();
      showPage("dashboard");
      showToast("Database formatted successfully.", "error");
    },
  );
}
