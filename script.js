// script.js

// Hashing function (simple for demo, not secure for production)
function hashPassword(pwd) {
  let hash = 0, i, chr;
  if (pwd.length === 0) return hash;
  for (i = 0; i < pwd.length; i++) {
    chr = pwd.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString();
}

// Show/hide forms
function showLogin() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('dashboard').style.display = 'none';
  clearErrors();
}
function showSignup() {
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('dashboard').style.display = 'none';
  clearErrors();
}

// Clear error messages
function clearErrors() {
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('login-error').textContent = '';
  document.getElementById('signup-error').style.display = 'none';
  document.getElementById('signup-error').textContent = '';
}

// Validation helpers
function validatePhone(phone) {
  return /^\d{7,15}$/.test(phone);
}
function validatePassword(pwd) {
  return pwd.length >= 6;
}

// Generate large transaction history for 5 years (~10 tx/week)
function generateTransactions(startDate, weeks = 260, txPerWeek = 10) {
  const transactions = [];
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const coinPairs = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'MEXC/USDT', 'ADA/USDT', 'LTC/USDT'];
  const types = ['Buy', 'Sell'];
  const statuses = ['Completed', 'Pending', 'Cancelled'];

  let idCounter = 10000;

  for (let w = 0; w < weeks; w++) {
    const weekStart = new Date(startDate.getTime() + w * msPerWeek);
    for (let i = 0; i < txPerWeek; i++) {
      // Random day/time in the week
      const txTime = new Date(weekStart.getTime() + Math.random() * msPerWeek);
      // Random coin pair
      const coin = coinPairs[Math.floor(Math.random() * coinPairs.length)];
      // Random type
      const type = types[Math.floor(Math.random() * types.length)];
      // Random amount and price ensuring tx value ≥ $15,000
      const price = (Math.random() * (65000 - 15000) + 15000).toFixed(2); // price between $15k and $65k
      const amount = (Math.random() * 5 + 1).toFixed(4); // between 1 and 6 coins approx
      // Status weighted more to Completed
      const statusChance = Math.random();
      const status = statusChance < 0.85 ? 'Completed' : (statusChance < 0.95 ? 'Pending' : 'Cancelled');

      transactions.push({
        id: 'OID' + idCounter++,
        coin,
        date: txTime.toISOString().slice(0, 16).replace('T', ' '),
        type,
        amount: parseFloat(amount),
        price: parseFloat(price),
        status
      });
    }
  }
  // Sort transactions by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  return transactions;
}

// Store user to localStorage (simulate DB)
function saveUser(user) {
  localStorage.setItem('mexcUser_' + user.phone, JSON.stringify(user));
}
// Load user from localStorage
function loadUser(phone) {
  const userStr = localStorage.getItem('mexcUser_' + phone);
  return userStr ? JSON.parse(userStr) : null;
}

// Clear all inputs
function clearInputs() {
  document.getElementById('phone').value = '';
  document.getElementById('password').value = '';
  document.getElementById('signup-phone').value = '';
  document.getElementById('signup-password').value = '';
}

// Format currency
function formatUSD(num) {
  return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Show dashboard with user data
function showDashboard(user) {
  clearErrors();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'none';
  const dashboard = document.getElementById('dashboard');
  dashboard.style.display = 'block';

  // Welcome text update
  const welcomeText = dashboard.querySelector('.welcome-text h2');
  welcomeText.textContent = `Welcome back, ${user.username || user.phone}!`;

  // Balance summary: Sum BTC value of assets (for demo)
  let totalBTCValue = 0;
  for (const asset of Object.values(user.assets)) {
    totalBTCValue += asset.btcValue || 0;
  }
  // Assume BTC price $30,000 for USD conversion (demo)
  const totalUSD = totalBTCValue * 30000;
  dashboard.querySelector('.balance-section h3').textContent = formatUSD(totalUSD);

  // Account info list update
  const accountInfoUl = dashboard.querySelector('.account-settings ul');
  accountInfoUl.innerHTML = `
    <li><strong>Account Status:</strong> ${user.verified ? 'Verified' : 'Unverified'}</li>
    <li><strong>Account Created:</strong> ${new Date(user.createdAt).getFullYear()}</li>
    <li><strong>Security:</strong> ${user.twoFA ? '2FA Enabled' : '2FA Disabled'}</li>
    <li><strong>Tier:</strong> ${user.tier || 'Standard'}</li>
    <li><strong>Password Last Changed:</strong> ${new Date(user.passwordLastChanged).toLocaleDateString()}</li>
  `;

  // Referral section (create or update)
  let referralSection = document.getElementById('referral-section');
  if (!referralSection) {
    referralSection = document.createElement('div');
    referralSection.id = 'referral-section';
    referralSection.className = 'referral-section';
    referralSection.innerHTML = `
      <h4>Referral Program</h4>
      <p><strong>Your Referral Code:</strong> <span id="referral-code"></span></p>
      <p><strong>Total Bonuses Earned:</strong> <span id="referral-bonuses"></span></p>
      <p><strong>Total Referrals:</strong> <span id="referral-count"></span></p>
    `;
    dashboard.appendChild(referralSection);
  }
  document.getElementById('referral-code').textContent = user.referral.code;
  document.getElementById('referral-bonuses').textContent = formatUSD(user.referral.bonuses);
  document.getElementById('referral-count').textContent = user.referral.referralsCount;

  // Transaction history table render
  renderTransactionHistory(user.orders);

  // Clear inputs on dashboard load
  clearInputs();
}

// Render transaction history table with pagination (show latest 50)
function renderTransactionHistory(transactions) {
  let tableWrapper = document.querySelector('.transaction-history');
  if (!tableWrapper) {
    tableWrapper = document.createElement('div');
    tableWrapper.className = 'transaction-history';
    const dashboard = document.getElementById('dashboard');
    dashboard.appendChild(tableWrapper);
  }

  // Show latest 50 transactions
  const latestTxs = transactions.slice(0, 50);

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Coin Pair</th>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Price (USD)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${latestTxs.map(tx => `
          <tr>
            <td>${tx.id}</td>
            <td>${tx.coin}</td>
            <td>${tx.date}</td>
            <td>${tx.type}</td>
            <td>${tx.amount.toFixed(4)}</td>
            <td>${formatUSD(tx.price)}</td>
            <td class="status-${tx.status}">${tx.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  tableWrapper.innerHTML = tableHTML;
}

// Signup function
function signup() {
  clearErrors();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  if (!validatePhone(phone)) {
    showSignupError('Phone number must be 7 to 15 digits only.');
    return;
  }
  if (!validatePassword(password)) {
    showSignupError('Password must be at least 6 characters.');
    return;
  }
  if (loadUser(phone)) {
    showSignupError('An account with this phone number already exists.');
    return;
  }

  // Create user with old-style mature account data
  const user = {
    phone,
    passwordHash: hashPassword(password),
    username: 'veteranUser' + phone.slice(-4),
    email: phone + '@mexc.com',
    verified: true,
    tier: 'VIP',
    twoFA: true,
    passwordLastChanged: new Date('2024-06-15').toISOString(),
    createdAt: new Date('2018-01-15').toISOString(),
    assets: {
      BTC: { available: 1.23456789, inOrders: 0.05, btcValue: 1.28456789 },
      ETH: { available: 12.34, inOrders: 1.5, btcValue: 0.35 },
      USDT: { available: 100000, inOrders: 5000, btcValue: 3.5 },
      XRP: { available: 5000, inOrders: 100, btcValue: 0.02 },
      MEXC: { available: 10000, inOrders: 0, btcValue: 0.04 }
    },
    orders: generateTransactions(new Date('2018-01-15'), 260, 10),
    referral: {
      code: 'REF' + phone.slice(-6),
      bonuses: 4520.75,
      referralsCount: 83
    }
  };

  saveUser(user);
  showDashboard(user);
}

// Login function
function login() {
  clearErrors();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!validatePhone(phone)) {
    showLoginError('Invalid phone number format.');
    return;
  }
  if (!validatePassword(password)) {
    showLoginError('Password must be at least 6 characters.');
    return;
  }

  const user = loadUser(phone);
  if (!user) {
    showLoginError('Account not found.');
    return;
  }
  if (hashPassword(password) !== user.passwordHash) {
    showLoginError('Incorrect password.');
    return;
  }

  showDashboard(user);
}

// Show login error message
function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.style.display = 'block';
  el.textContent = msg;
}
// Show signup error message
function showSignupError(msg) {
  const el = document.getElementById('signup-error');
  el.style.display = 'block';
  el.textContent = msg;
}

// Logout function
function logout() {
  clearErrors();
  clearInputs();
  showLogin();
}

// Event listeners
document.getElementById('login-btn').addEventListener('click', (e) => {
  e.preventDefault();
  login();
});
document.getElementById('signup-btn').addEventListener('click', (e) => {
  e.preventDefault();
  signup();
});
document.getElementById('to-signup').addEventListener('click', (e) => {
  e.preventDefault();
  showSignup();
});
document.getElementById('to-login').addEventListener('click', (e) => {
  e.preventDefault();
  showLogin();
});
document.getElementById('logout-btn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

// Initial load
showLogin();
