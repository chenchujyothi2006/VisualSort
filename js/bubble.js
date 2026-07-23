// State Management Variables
let array = [];
let isSorting = false;
let isPaused = false;
let passes = 0;
let comparisons = 0;
let swaps = 0;

// Speed Configuration (delays in milliseconds)
const SPEED_MAP = {
    slow: 800,
    medium: 400,
    fast: 150
};

// DOM References
const arrayContainer = document.getElementById("array-container");
const arrayInput = document.getElementById("array-input");
const arraySizeInput = document.getElementById("array-size");
const speedSelect = document.getElementById("speed");

const statPasses = document.getElementById("stat-passes");
const statComparisons = document.getElementById("stat-comparisons");
const statSwaps = document.getElementById("stat-swaps");
const executionLog = document.getElementById("execution-log");

const btnStart = document.getElementById("btn-start");
const btnPause = document.getElementById("btn-pause");
const btnResume = document.getElementById("btn-resume");
const btnRandom = document.getElementById("btn-random");

// Initialize Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Sync array input live on typing
    arrayInput.addEventListener("input", parseCustomInput);
    
    // Sync array size dynamically on number change
    arraySizeInput.addEventListener("change", handleSizeChange);
    arraySizeInput.addEventListener("input", handleSizeChange);

    // Initial load
    parseCustomInput();
});

// Helper Delay Function for Animations
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Pause Check Handler
async function checkPause() {
    while (isPaused && isSorting) {
        await sleep(100);
    }
}

// Render Bars in DOM
function renderArray(highlightIndices = {}, activeLine = null) {
    arrayContainer.innerHTML = "";
    
    const maxVal = Math.max(...array, 10);

    array.forEach((val, idx) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        
        // Calculate dynamic height ratio percentage
        const heightPercent = Math.max((val / maxVal) * 85, 10);
        bar.style.height = `${heightPercent}%`;
        
        // Add value label above or inside bar
        const label = document.createElement("span");
        label.classList.add("bar-value");
        label.textContent = val;
        bar.appendChild(label);

        // Apply state styling classes
        if (highlightIndices.comparing && highlightIndices.comparing.includes(idx)) {
            bar.classList.add("comparing");
        } else if (highlightIndices.swapping && highlightIndices.swapping.includes(idx)) {
            bar.classList.add("swapping");
        } else if (highlightIndices.sortedFrom <= idx) {
            bar.classList.add("sorted");
        } else if (highlightIndices.allSorted) {
            bar.classList.add("sorted");
        } else {
            bar.classList.add("unsorted");
        }

        arrayContainer.appendChild(bar);
    });

    // Pseudocode line highlight
    highlightPseudocode(activeLine);
}

// Highlight Pseudocode Line
function highlightPseudocode(lineId) {
    document.querySelectorAll(".pseudocode p").forEach(p => p.classList.remove("active-line"));
    if (lineId) {
        const target = document.getElementById(`line-${lineId}`);
        if (target) target.classList.add("active-line");
    }
}

// Append Log Entry
function addLog(message) {
    const p = document.createElement("p");
    p.classList.add("log-entry");
    p.textContent = message;
    executionLog.appendChild(p);
    executionLog.scrollTop = executionLog.scrollHeight;
}

// Reset Metrics Output
function resetMetrics() {
    passes = 0;
    comparisons = 0;
    swaps = 0;
    statPasses.textContent = "0";
    statComparisons.textContent = "0";
    statSwaps.textContent = "0";
    executionLog.innerHTML = '<p class="log-entry">Click "Start Sorting" to view execution steps...</p>';
    highlightPseudocode(null);
}

// Parse space/comma separated input string live
function parseCustomInput() {
    if (isSorting) return;

    const raw = arrayInput.value.trim();
    if (!raw) {
        array = [];
        arrayContainer.innerHTML = "";
        return;
    }

    const parsed = raw.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (parsed.length > 0) {
        array = parsed.slice(0, 20); // Cap max elements at 20 for UI cleanliness
        arraySizeInput.value = array.length;
        resetMetrics();
        renderArray();
    }
}

// Generate new array based on Array Size control change
function handleSizeChange() {
    if (isSorting) return;
    
    let size = parseInt(arraySizeInput.value) || 5;
    size = Math.min(Math.max(size, 2), 20);
    arraySizeInput.value = size;

    // Generate random values for new size
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    arrayInput.value = array.join(" ");
    resetMetrics();
    renderArray();
}

// Generate Random Array Button Handler
function generateRandomArray() {
    if (isSorting) return;
    const size = parseInt(arraySizeInput.value) || 5;
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    arrayInput.value = array.join(" ");
    resetMetrics();
    renderArray();
}

// Control State Toggling
function toggleInputs(disabled) {
    arrayInput.disabled = disabled;
    arraySizeInput.disabled = disabled;
    btnRandom.disabled = disabled;
    btnStart.disabled = disabled;
    btnPause.disabled = !disabled;
    btnResume.disabled = true;
}

// Start Sorting Execution
async function startSorting() {
    if (isSorting || array.length < 2) return;

    isSorting = true;
    isPaused = false;
    toggleInputs(true);
    resetMetrics();

    executionLog.innerHTML = "";
    addLog("Starting Bubble Sort...");

    const delay = () => SPEED_MAP[speedSelect.value] || 400;
    const n = array.length;

    highlightPseudocode(1);
    await sleep(delay());
    
    highlightPseudocode(2);
    await sleep(delay());

    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;
        
        passes++;
        statPasses.textContent = passes;
        addLog(`--- Pass ${passes} Started ---`);
        highlightPseudocode(3);
        await sleep(delay());

        for (let j = 0; j < n - i - 1; j++) {
            if (!isSorting) return;
            await checkPause();

            highlightPseudocode(4);
            
            // Highlight current pair comparison
            comparisons++;
            statComparisons.textContent = comparisons;
            renderArray({ comparing: [j, j + 1], sortedFrom: n - i }, 5);
            addLog(`Comparing index ${j} (${array[j]}) and index ${j + 1} (${array[j + 1]})`);
            await sleep(delay());

            if (array[j] > array[j + 1]) {
                // Swap values
                swaps++;
                statSwaps.textContent = swaps;
                
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                // Live sync text box during sorting
                arrayInput.value = array.join(" ");

                renderArray({ swapping: [j, j + 1], sortedFrom: n - i }, 6);
                addLog(`Swapped: ${array[j + 1]} > ${array[j]}`);
                await sleep(delay());
            }
        }

        renderArray({ sortedFrom: n - i - 1 }, 7);
        addLog(`Element ${array[n - i - 1]} locked into sorted position.`);
        await sleep(delay());
    }

    // Sorting Complete State
    isSorting = false;
    renderArray({ allSorted: true }, null);
    addLog("🎉 Array fully sorted!");
    
    btnPause.disabled = true;
    btnResume.disabled = true;
    btnStart.disabled = false;
    arrayInput.disabled = false;
    arraySizeInput.disabled = false;
    btnRandom.disabled = false;
}

// Pause Execution
function pauseSorting() {
    if (!isSorting || isPaused) return;
    isPaused = true;
    btnPause.disabled = true;
    btnResume.disabled = false;
    addLog("⏸ Visualization Paused.");
}

// Resume Execution
function resumeSorting() {
    if (!isSorting || !isPaused) return;
    isPaused = false;
    btnPause.disabled = false;
    btnResume.disabled = true;
    addLog("▶ Visualization Resumed.");
}

// Reset Visualizer State
function resetVisualizer() {
    isSorting = false;
    isPaused = false;
    toggleInputs(false);
    btnPause.disabled = true;
    btnResume.disabled = true;
    parseCustomInput();
}
