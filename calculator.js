document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');
    let memoryValue = null;
    let isResetting = false;

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
    window.resetCalculator = resetCalculator;
    window.memoryRead = memoryRead;
    window.memoryAdd = memoryAdd;
    window.memoryClear = memoryClear;
    window.memorySubtract = memorySubtract;
});
