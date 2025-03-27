document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');
    const body = document.body;
    
    // Keyboard support mapping
    const keyMap = {
        '0': () => appendNumber(0),
        '1': () => appendNumber(1),
        '2': () => appendNumber(2),
        '3': () => appendNumber(3),
        '4': () => appendNumber(4),
        '5': () => appendNumber(5),
        '6': () => appendNumber(6),
        '7': () => appendNumber(7),
        '8': () => appendNumber(8),
        '9': () => appendNumber(9),
        '.': () => appendNumber('.'),
        '+': () => appendOperator('+'),
        '-': () => appendOperator('-'),
        '*': () => appendOperator('×'),
        '/': () => appendOperator('/'),
        '%': () => appendOperator('%'),
        'Enter': calculate,
        '=': calculate,
        'Escape': clearDisplay,
        'Backspace': deleteLast,
        'm': memoryAdd,
        'M': memoryAdd,
        'r': memoryRead,
        'R': memoryRead,
        'c': memoryClear,
        'C': memoryClear,
        's': memorySubtract,
        'S': memorySubtract,
        'h': toggleHistory,
        'H': toggleHistory
    };

    // Add keyboard event listener
    document.addEventListener('keydown', (e) => {
        if (keyMap[e.key]) {
            e.preventDefault();
            keyMap[e.key]();
        }
    });

    // Theme management
    const themes = [
        { id: 'light', name: 'Light', color: '#f4f4f4' },
        { id: 'dark', name: 'Dark', color: '#1a1a1a' },
        { id: 'material', name: 'Material', color: '#f5f5f5' },
        { id: 'monokai', name: 'Monokai', color: '#272822' },
        { id: 'solarized', name: 'Solarized', color: '#fdf6e3' },
        { id: 'nightowl', name: 'Night Owl', color: '#011627' },
        { id: 'holographic', name: 'Holographic', color: '#0a0a1a' }
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
            'nightowl': '🦉',
            'holographic': '👽'
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
        if (display.value === 'Error') {
            display.value = '';
        }
        
        if (justCalculated || shouldClearDisplay || display.value === '0') {
            display.value = number;
            justCalculated = false;
            shouldClearDisplay = false;
        } else {
            display.value += number;
        }
    }

    let currentValue = null;
    let pendingOperator = null;
    let shouldClearDisplay = false;

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
        switch(operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '×':
                return firstOperand * secondOperand;
            case '/':
                return firstOperand / secondOperand;
            case '%':
                return firstOperand % secondOperand;
            default:
                return secondOperand;
        }
    }

    function clearDisplay() {
        display.value = '0';
        currentValue = null;
        pendingOperator = null;
        shouldClearDisplay = false;
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
        updateHistoryDisplay();
    }

    // Initialize history panel as visible
    document.querySelector('.history-panel').classList.add('visible');
    updateHistoryDisplay();

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
    function toggleSign() {
        if (display.value !== '' && display.value !== 'Error') {
            if (display.value.startsWith('-')) {
                display.value = display.value.substring(1);
            } else {
                display.value = '-' + display.value;
            }
        }
    }

    window.clearHistory = clearHistory;
    window.toggleSign = toggleSign;
});
