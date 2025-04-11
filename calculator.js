// Constants
const ERROR_MSG = "Error";
const DEFAULT_THEME = "light";

// DOM Elements
const display = document.getElementById("display");
const body = document.body;

// Calculator State
let memoryValue = null;
let calculationHistory = [];
let currentValue = null;
let pendingOperator = null;
let shouldClearDisplay = false;
let justCalculated = false;

// User Management
let currentUser = null;

/**
 * Initializes the calculator when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize calculator
  initTheme();
  initHistoryPanel();

  // Check if user is already logged in
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showCalculator();
  }
});

/**
 * Initializes the history panel with saved calculations if any
 */
function initHistoryPanel() {
  // Load saved history from localStorage if available
  if (currentUser) {
    loadUserHistory();
  }

  // Ensure the history panel is properly initialized
  const historyPanel = document.querySelector(".history-panel");
  if (!historyPanel.classList.contains("visible")) {
    historyPanel.classList.remove("visible");
  }
}

// ======================
// Keyboard Support
// ======================

/**
 * Keyboard event mappings
 * @type {Object.<string, function>}
 */
const keyMap = {
  0: () => appendNumber(0),
  1: () => appendNumber(1),
  2: () => appendNumber(2),
  3: () => appendNumber(3),
  4: () => appendNumber(4),
  5: () => appendNumber(5),
  6: () => appendNumber(6),
  7: () => appendNumber(7),
  8: () => appendNumber(8),
  9: () => appendNumber(9),
  ".": () => appendNumber("."),
  "+": () => appendOperator("+"),
  "-": () => appendOperator("-"),
  "*": () => appendOperator("×"),
  "/": () => appendOperator("/"),
  "%": () => appendOperator("%"),
  Enter: calculate,
  "=": calculate,
  Escape: clearDisplay,
  Backspace: deleteLast,
  m: memoryAdd,
  M: memoryAdd,
  r: memoryRead,
  R: memoryRead,
  c: memoryClear,
  C: memoryClear,
  s: memorySubtract,
  S: memorySubtract,
  h: toggleHistory,
  H: toggleHistory,
};

// Add keyboard event listener
document.addEventListener("keydown", (e) => {
  // Don't intercept keyboard events when focus is on input fields
  if (e.target.tagName === "INPUT") {
    return;
  }

  // Convert key to lowercase for case-insensitive comparison
  const key = e.key.toLowerCase();
  const normalizedKeyMap = {};

  // Create case-insensitive key mappings
  for (let k in keyMap) {
    normalizedKeyMap[k.toLowerCase()] = keyMap[k];
  }

  if (normalizedKeyMap[key]) {
    e.preventDefault();
    normalizedKeyMap[key]();
  }
});

// ======================
// Theme Management
// ======================

/**
 * Available calculator themes
 * @type {Array.<{id: string, name: string, color: string}>}
 */
const themes = [
  { id: "light", name: "Light", color: "#f4f4f4" },
  { id: "dark", name: "Dark", color: "#1a1a1a" },
  { id: "material", name: "Material", color: "#f5f5f5" },
  { id: "monokai", name: "Monokai", color: "#272822" },
  { id: "solarized", name: "Solarized", color: "#fdf6e3" },
  { id: "nightowl", name: "Night Owl", color: "#011627" },
  { id: "holographic", name: "Holographic", color: "#0a0a1a" },
  { id: "cyberpunk", name: "Cyberpunk", color: "#ff2a6d" },
];

/**
 * Sets the active theme
 * @param {string} themeId - ID of the theme to activate
 */
function setTheme(themeId) {
  // Remove all theme classes
  themes.forEach((theme) => body.classList.remove(`${theme.id}-theme`));

  // Apply selected theme
  body.classList.add(`${themeId}-theme`);

  // Save to localStorage
  localStorage.setItem("calculatorTheme", themeId);

  // Update theme selector display
  updateThemeSelector(themeId);
}

/**
 * Updates the theme selector UI
 * @param {string} themeId - ID of the current theme
 */
function updateThemeSelector(themeId) {
  const themeBtn = document.querySelector(".theme-btn");
  const currentTheme = themes.find((t) => t.id === themeId);
  const themeEmojis = {
    light: "☀️",
    dark: "🌙",
    material: "🎨",
    monokai: "💻",
    solarized: "🌞",
    nightowl: "🦉",
    holographic: "👽",
    cyberpunk: "🤖",
  };
  themeBtn.innerHTML = `
            <span class="theme-icon" style="background:${
              currentTheme.color
            }"></span>
            ${themeEmojis[currentTheme.id]} ${currentTheme.name}
            <i class="fas fa-caret-down"></i>
        `;
}

/**
 * Initializes the theme from localStorage or defaults
 */
function initTheme() {
  const savedTheme = localStorage.getItem("calculatorTheme") || "light";
  setTheme(savedTheme);
}

// Initialize theme on load
initTheme();

// ======================
// Memory Operations
// ======================

/**
 * Resets calculator to initial state
 */
function resetCalculator() {
  display.value = "";
  memoryValue = null;
  isResetting = true;
}

/**
 * Adds current display value to memory
 */
function memoryAdd() {
  const currentValue = parseFloat(display.value);
  if (!isNaN(currentValue)) {
    memoryValue = (memoryValue || 0) + currentValue;
  }
}

/**
 * Subtracts current display value from memory
 */
function memorySubtract() {
  const currentValue = parseFloat(display.value);
  if (!isNaN(currentValue)) {
    memoryValue = (memoryValue || 0) - currentValue;
  }
}

/**
 * Recalls memory value to display
 */
function memoryRead() {
  if (memoryValue !== null) {
    display.value = memoryValue.toString();
  }
}

/**
 * Clears the memory value
 */
function memoryClear() {
  memoryValue = null;
}

function appendNumber(number) {
  if (display.value === "Error") {
    display.value = "";
  }

  if (justCalculated || shouldClearDisplay || display.value === "0") {
    display.value = number;
    justCalculated = false;
    shouldClearDisplay = false;
  } else {
    display.value += number;
  }
}

function appendOperator(operator) {
  const inputValue = parseFloat(display.value);

  if (currentValue === null) {
    currentValue = inputValue;
  } else if (pendingOperator) {
    // Calculate intermediate result
    const result = calculateResult(currentValue, inputValue, pendingOperator);
    addToHistory(`${currentValue} ${pendingOperator} ${inputValue}`, result);
    currentValue = result;
    display.value = result;
  }

  pendingOperator = operator;
  shouldClearDisplay = true;
}

function calculateResult(firstOperand, secondOperand, operator) {
  switch (operator) {
    case "+":
      return firstOperand + secondOperand;
    case "-":
      return firstOperand - secondOperand;
    case "×":
    case "*":  // Handle both × and * operators
      return firstOperand * secondOperand;
    case "/":
      return firstOperand / secondOperand;
    case "%":
      return firstOperand % secondOperand;
    default:
      return secondOperand;
  }
}

function clearDisplay() {
  display.value = "0";
  currentValue = null;
  pendingOperator = null;
  shouldClearDisplay = false;
}

function deleteLast() {
  if (justCalculated || display.value === "Error") {
    display.value = "";
    justCalculated = false;
  } else {
    display.value = display.value.slice(0, -1);
  }
}

function calculate() {
  const inputValue = parseFloat(display.value);

  if (pendingOperator && currentValue !== null) {
    const result = calculateResult(currentValue, inputValue, pendingOperator);
    display.value = result;
    addToHistory(`${currentValue} ${pendingOperator} ${inputValue}`, result);

    currentValue = result;
    pendingOperator = null;
    justCalculated = true;
  } else if (currentValue !== null) {
    // If no operator but we have a current value, show it
    display.value = currentValue;
  }
}

// Attach methods to window object for onclick handlers
window.appendNumber = appendNumber;
window.appendOperator = appendOperator;
window.clearDisplay = clearDisplay;
window.deleteLast = deleteLast;
window.calculate = calculate;
window.resetCalculator = resetCalculator;
window.memoryRead = memoryRead;
window.memoryAdd = memoryAdd;
window.memoryClear = memoryClear;
window.memorySubtract = memorySubtract;
function addToHistory(expression, result) {
  if (!currentUser) return;

  calculationHistory.push({
    operation: expression,
    result: result,
    timestamp: new Date().toLocaleTimeString(),
  });

  // Save to user-specific storage
  const key = `calculatorHistory_${currentUser.email}`;
  localStorage.setItem(key, JSON.stringify(calculationHistory));

  if (document.querySelector(".history-panel").classList.contains("visible")) {
    updateHistoryDisplay();
  }
}

function toggleHistory() {
  const historyPanel = document.querySelector(".history-panel");
  historyPanel.classList.toggle("visible");
  updateHistoryDisplay();
}

// Initialize history panel as visible
document.querySelector(".history-panel").classList.add("visible");
updateHistoryDisplay();

function updateHistoryDisplay() {
  const historyEntries = document.getElementById("history-entries");
  historyEntries.innerHTML = calculationHistory
    .map(
      (entry) =>
        `<div class="history-entry">
                <div class="history-operation">${entry.operation}</div>
                <div class="history-result">= ${entry.result}</div>
                <small class="history-time">${entry.timestamp}</small>
            </div>`
    )
    .reverse()
    .join("");
}

window.setTheme = setTheme;
function clearHistory() {
  calculationHistory = [];
  if (currentUser) {
    const key = `calculatorHistory_${currentUser.email}`;
    localStorage.removeItem(key);
  }
  updateHistoryDisplay();
}

window.toggleHistory = toggleHistory;
function toggleSign() {
  if (display.value !== "" && display.value !== "Error") {
    if (display.value.startsWith("-")) {
      display.value = display.value.substring(1);
    } else {
      display.value = "-" + display.value;
    }
  }
}

window.clearHistory = clearHistory;
window.toggleSign = toggleSign;

// User Authentication Functions
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Get stored users
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = { email: user.email };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showCalculator();
  } else {
    alert("Invalid email or password");
  }
}

function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  // Get stored users
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    alert("User already exists");
    return;
  }

  // Add new user
  users.push({ email, password });
  localStorage.setItem("users", JSON.stringify(users));

  // Auto login after signup
  currentUser = { email };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showCalculator();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showLoginForm();
}

function showCalculator() {
  document.getElementById("authContainer").style.display = "none";
  document.getElementById("appContainer").style.display = "flex";

  // Add logout button to calculator header
  const calculatorHeader = document.querySelector(".calculator-header");
  if (!document.querySelector(".logout-btn")) {
    const logoutBtn = document.createElement("button");
    logoutBtn.className = "logout-btn";
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.onclick = logout;
    calculatorHeader.appendChild(logoutBtn);
  }

  // Load user-specific data
  loadUserHistory();
}

function showLoginForm() {
  document.getElementById("authContainer").style.display = "flex";
  document.getElementById("appContainer").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
}

function toggleAuthForm() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  loginForm.style.display =
    loginForm.style.display === "none" ? "block" : "none";
  signupForm.style.display =
    signupForm.style.display === "none" ? "block" : "none";
}

function loadUserHistory() {
  if (!currentUser) return;

  const key = `calculatorHistory_${currentUser.email}`;
  const savedHistory = localStorage.getItem(key);
  if (savedHistory) {
    try {
      calculationHistory = JSON.parse(savedHistory);
      updateHistoryDisplay();
    } catch (e) {
      console.error("Failed to parse saved history", e);
    }
  }
}
