document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');
    const body = document.body;

    // Theme management
    const themes = [
        { id: 'light', name: 'Light', color: '#f4f4f4' },
        { id: 'dark', name: 'Dark', color: '#1a1a1a' },
        { id: 'material', name: 'Material', color: '#f5f5f5' },
        { id: 'monokai', name: 'Monokai', color: '#272822' },
        { id: 'solarized', name: 'Solarized', color: '#fdf6e3' },
        { id: 'nightowl', name: 'Night Owl', color: '#011627' }
    ];

    function setTheme(themeId) {
        // Remove all theme classes
        themes.forEach(theme => body.classList.remove(`${theme.id}-theme`));
        
        // Apply selected theme
        body.classList.add(`${themeId}-theme`);
        
        // Save to localStorage
        localStorage.setItem('calculatorTheme', themeId);
        
        // Update theme selector display
        updateThemeSelector(themeId);
    }

    function updateThemeSelector(themeId) {
        const themeBtn = document.querySelector('.theme-btn');
        const currentTheme = themes.find(t => t.id === themeId);
        const themeEmojis = {
            'light': '☀️',
            'dark': '🌙',
            'material': '🎨',
            'monokai': '💻',
            'solarized': '🌞',
            'nightowl': '🦉'
        };
        themeBtn.innerHTML = `
            <span class="theme-icon" style="background:${currentTheme.color}"></span>
            ${themeEmojis[currentTheme.id]} ${currentTheme.name}
            <i class="fas fa-caret-down"></i>
        `;
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme') || 'light';
        setTheme(savedTheme);
    }

    // Initialize theme on load
    initTheme();
    let memoryValue = null;
    let calculationHistory = [];
    let isResetting = false;
    let justCalculated = false;

    // Reset calculator completely
    function resetCalculator() {
        display.value = '';
        memoryValue = null;
        isResetting = true;
    }

    // Store current value in memory
    function memoryAdd() {
        const currentValue = parseFloat(display.value);
        if (!isNaN(currentValue)) {
            memoryValue = (memoryValue || 0) + currentValue;
        }
    }

    // Subtract from memory
    function memorySubtract() {
        const currentValue = parseFloat(display.value);
        if (!isNaN(currentValue)) {
            memoryValue = (memoryValue || 0) - currentValue;
        }
    }


    // Retrieve memory value
    function memoryRead() {
        if (memoryValue !== null) {
            display.value = memoryValue.toString();
        }
    }

    // Clear memory
    function memoryClear() {
        memoryValue = null;
    }

    function appendNumber(number) {
        if (justCalculated || display.value === 'Error') {
            display.value = number;
            justCalculated = false;
        } else {
            display.value += number;
        }
    }

    function appendOperator(operator) {
        if (display.value !== '') {
            display.value += operator;
        }
    }

    function clearDisplay() {
        display.value = '';
    }

    function deleteLast() {
        if (justCalculated || display.value === 'Error') {
            display.value = '';
            justCalculated = false;
        } else {
            display.value = display.value.slice(0, -1);
        }
    }

    function calculate() {
        try {
            // Replace percentage symbol with /100 and handle multiplication
            let expression = display.value.replace(/×/g, '*');
            expression = expression.replace(/([\d.]+)%/g, '($1/100)');
        
            const result = eval(expression);
            display.value = result.toString();
            justCalculated = true;
            addToHistory(expression.replace(/\*/g, '×'), result); // Show × instead of * for multiplication
        } catch (error) {
            display.value = 'Error';
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
        calculationHistory.push({
            operation: expression,  // Store the full operation
            result: result,
            timestamp: new Date().toLocaleTimeString()
        });
        if (document.querySelector('.history-panel').classList.contains('visible')) {
            updateHistoryDisplay();
        }
    }

    function toggleHistory() {
        const historyPanel = document.querySelector('.history-panel');
        historyPanel.classList.toggle('visible');
        if (historyPanel.classList.contains('visible')) {
            updateHistoryDisplay();
        }
    }

    function updateHistoryDisplay() {
        const historyEntries = document.getElementById('history-entries');
        historyEntries.innerHTML = calculationHistory.map(entry => 
            `<div class="history-entry">
                <div class="history-operation">${entry.operation}</div>
                <div class="history-result">= ${entry.result}</div>
                <small class="history-time">${entry.timestamp}</small>
            </div>`
        ).reverse().join('');
    }

    window.setTheme = setTheme;
    function clearHistory() {
        calculationHistory = [];
        updateHistoryDisplay();
    }

    window.toggleHistory = toggleHistory;
    window.clearHistory = clearHistory;
});
