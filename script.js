// Sign-Up Page Logic
if (
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/"
) {
  if (localStorage.getItem("isSignedUp")) {
    window.location.href = "tracker.html";
  }

  document
    .getElementById("signupForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      localStorage.setItem("isSignedUp", "true");
      alert("Sign-up successful! Redirecting to tracker...");
      window.location.href = "tracker.html";
    });
}

// Tracker Page Logic
if (window.location.pathname.includes("tracker.html")) {
  document.addEventListener("DOMContentLoaded", loadExpenses);

  document
    .getElementById("expenseForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const description = document.getElementById("description").value;
      const category = document.getElementById("category").value;
      const amount = parseFloat(document.getElementById("amount").value);
      const currency = document.getElementById("currency").value;
      const date = document.getElementById("date").value;

      const expense = {
        description,
        category,
        amount,
        currency,
        date,
        id: Date.now(),
      };
      addExpense(expense);
      showSuccessMessage("Expense added successfully!");
      this.reset();
    });

  function addExpense(expense) {
    let expenses = getExpensesFromStorage();
    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    applyFilter();
  }

  function getExpensesFromStorage() {
    return localStorage.getItem("expenses")
      ? JSON.parse(localStorage.getItem("expenses"))
      : [];
  }

  function displayExpenses(expenses) {
    const expenseList = document.getElementById("expenseList");
    const totalElement = document.getElementById("total");
    const totalCurrency = document.getElementById("totalCurrency");
    expenseList.innerHTML = "";
    let total = 0;
    let lastCurrency = "INR";

    expenses.forEach((expense) => {
      const row = document.createElement("tr");
      const symbol = expense.currency === "INR" ? "" : "$";
      row.innerHTML = `
        <td>${expense.description}</td>
        <td>${expense.category}</td>
        <td>${symbol}${expense.amount.toFixed(2)}</td>
        <td>${expense.date}</td>
        <td><button class="delete-btn" onclick="deleteExpense(${
          expense.id
        })">Delete</button></td>
      `;
      expenseList.appendChild(row);
      total += expense.amount;
      lastCurrency = expense.currency;
    });

    totalCurrency.textContent = lastCurrency === "INR" ? "₹" : "$";
    totalElement.textContent = total.toFixed(2);
  }

  function applyFilter() {
    const timeFilter = document.getElementById("timeFilter").value;
    const categoryFilter = document.getElementById("categoryFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;
    let expenses = getExpensesFromStorage();
    const now = new Date();

    if (timeFilter !== "all") {
      expenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        if (timeFilter === "daily") {
          return expenseDate.toDateString() === now.toDateString();
        } else if (timeFilter === "weekly") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return expenseDate >= startOfWeek && expenseDate <= now;
        } else if (timeFilter === "monthly") {
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        } else if (timeFilter === "quarterly") {
          const quarter = Math.floor(now.getMonth() / 3);
          const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
          return (
            expenseQuarter === quarter &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        } else if (timeFilter === "yearly") {
          return expenseDate.getFullYear() === now.getFullYear();
        }
      });
    }

    if (categoryFilter !== "all") {
      expenses = expenses.filter(
        (expense) => expense.category === categoryFilter
      );
    }

    if (dateFilter) {
      expenses = expenses.filter((expense) => expense.date === dateFilter);
    }

    displayExpenses(expenses);
  }

  function deleteExpense(id) {
    let expenses = getExpensesFromStorage();
    expenses = expenses.filter((expense) => expense.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    applyFilter();
  }

  function showSuccessMessage(message) {
    const successMessage = document.getElementById("successMessage");
    successMessage.textContent = message;
    successMessage.style.display = "block";
    setTimeout(() => (successMessage.style.display = "none"), 2000);
  }

  document.getElementById("clearData").addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all expenses?")) {
      localStorage.removeItem("expenses");
      applyFilter();
    }
  });

  document.getElementById("exportData").addEventListener("click", function () {
    const expenses = getExpensesFromStorage();
    if (expenses.length === 0) {
      alert("No expenses to export!");
      return;
    }

    const csv = ["Description,Category,Amount,Currency,Date"];
    expenses.forEach((expense) => {
      csv.push(
        `${expense.description},${expense.category},${expense.amount},${expense.currency},${expense.date}`
      );
    });

    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  });

  document.getElementById("logout").addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("isSignedUp");
      window.location.href = "index.html";
    }
  });

  document.getElementById("viewSummary").addEventListener("click", function () {
    window.location.href = "summary.html";
  });

  function loadExpenses() {
    applyFilter();
  }
}

// Summary Page Logic
if (window.location.pathname.includes("summary.html")) {
  document.addEventListener("DOMContentLoaded", displaySummary);

  function getExpensesFromStorage() {
    return localStorage.getItem("expenses")
      ? JSON.parse(localStorage.getItem("expenses"))
      : [];
  }

  function calculateTotals(expenses) {
    const now = new Date();
    let dailyTotal = 0,
      weeklyTotal = 0,
      monthlyTotal = 0,
      quarterlyTotal = 0,
      yearlyTotal = 0;
    let lastCurrency = "INR";

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      lastCurrency = expense.currency;

      // Daily
      if (expenseDate.toDateString() === now.toDateString()) {
        dailyTotal += expense.amount;
      }

      // Weekly
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      if (expenseDate >= startOfWeek && expenseDate <= now) {
        weeklyTotal += expense.amount;
      }

      // Monthly
      if (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      ) {
        monthlyTotal += expense.amount;
      }

      // Quarterly
      const quarter = Math.floor(now.getMonth() / 3);
      const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
      if (
        expenseQuarter === quarter &&
        expenseDate.getFullYear() === now.getFullYear()
      ) {
        quarterlyTotal += expense.amount;
      }

      // Yearly
      if (expenseDate.getFullYear() === now.getFullYear()) {
        yearlyTotal += expense.amount;
      }
    });

    return {
      dailyTotal,
      weeklyTotal,
      monthlyTotal,
      quarterlyTotal,
      yearlyTotal,
      lastCurrency,
    };
  }

  function displaySummary() {
    const expenses = getExpensesFromStorage();
    const totals = calculateTotals(expenses);
    const symbol = totals.lastCurrency === "INR" ? "₹" : "$";

    document.getElementById("dailyTotalCurrency").textContent = symbol;
    document.getElementById("dailyTotal").textContent =
      totals.dailyTotal.toFixed(2);
    document.getElementById("weeklyTotalCurrency").textContent = symbol;
    document.getElementById("weeklyTotal").textContent =
      totals.weeklyTotal.toFixed(2);
    document.getElementById("monthlyTotalCurrency").textContent = symbol;
    document.getElementById("monthlyTotal").textContent =
      totals.monthlyTotal.toFixed(2);
    document.getElementById("quarterlyTotalCurrency").textContent = symbol;
    document.getElementById("quarterlyTotal").textContent =
      totals.quarterlyTotal.toFixed(2);
    document.getElementById("yearlyTotalCurrency").textContent = symbol;
    document.getElementById("yearlyTotal").textContent =
      totals.yearlyTotal.toFixed(2);
  }
}
