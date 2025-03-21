document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');

    function appendNumber(number) {
        display.value += number;
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
        display.value = display.value.slice(0, -1);
    }

    function calculate() {
        try {
            const result = eval(display.value.replace(/×/g, '*'));
            display.value = result.toString();
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
});
