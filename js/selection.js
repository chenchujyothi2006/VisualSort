// State Management Variables
let array = [];
let isSorting = false;
let isPaused = false;
let passes = 0;
let comparisons = 0;
let swaps = 0;

const SPEED_MAP = { slow: 800, medium: 400, fast: 150 };

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

document.addEventListener("DOMContentLoaded", () => {
    arrayInput.addEventListener("input", parseCustomInput);
    arraySizeInput.addEventListener("change", handleSizeChange);
    arraySizeInput.addEventListener("input", handleSizeChange);
    parseCustomInput();
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkPause() {
    while (isPaused && isSorting) {
        await sleep(100);
    }
}

function renderArray(highlightIndices = {}, activeLine = null) {
    arrayContainer.innerHTML = "";
    const maxVal = Math.max(...array, 10);

    array.forEach((val, idx) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        const heightPercent = Math.max((val / maxVal) * 85, 10);
        bar.style.height = `${heightPercent}%`;
        
        const label = document.createElement("span");
        label.classList.add("bar-value");
        label.textContent = val;
        bar.appendChild(label);

        if (highlightIndices.minIdx === idx) {
            bar.classList.add("pivot"); // Current Min
        } else if (highlightIndices.comparing && highlightIndices.comparing.includes(idx)) {
            bar.classList.add("comparing");
        } else if (highlightIndices.swapping && highlightIndices.swapping.includes(idx)) {
            bar.classList.add("swapping");
        } else if (idx < highlightIndices.sortedCount || highlightIndices.allSorted) {
            bar.classList.add("sorted");
        } else {
            bar.classList.add("unsorted");
        }

        arrayContainer.appendChild(bar);
    });

    highlightPseudocode(activeLine);
}

function highlightPseudocode(lineId) {
    document.querySelectorAll(".pseudocode p").forEach(p => p.classList.remove("active-line"));
    if (lineId) {
        const target = document.getElementById(`line-${lineId}`);
        if (target) target.classList.add("active-line");
    }
}

function addLog(message) {
    const p = document.createElement("p");
    p.classList.add("log-entry");
    p.textContent = message;
    executionLog.appendChild(p);
    executionLog.scrollTop = executionLog.scrollHeight;
}

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
        array = parsed.slice(0, 20);
        arraySizeInput.value = array.length;
        resetMetrics();
        renderArray();
    }
}

function handleSizeChange() {
    if (isSorting) return;
    let size = parseInt(arraySizeInput.value) || 5;
    size = Math.min(Math.max(size, 2), 20);
    arraySizeInput.value = size;

    array = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    arrayInput.value = array.join(" ");
    resetMetrics();
    renderArray();
}

function generateRandomArray() {
    if (isSorting) return;
    const size = parseInt(arraySizeInput.value) || 5;
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    arrayInput.value = array.join(" ");
    resetMetrics();
    renderArray();
}

function toggleInputs(disabled) {
    arrayInput.disabled = disabled;
    arraySizeInput.disabled = disabled;
    btnRandom.disabled = disabled;
    btnStart.disabled = disabled;
    btnPause.disabled = !disabled;
    btnResume.disabled = true;
}

async function startSorting() {
    if (isSorting || array.length < 2) return;

    isSorting = true;
    isPaused = false;
    toggleInputs(true);
    resetMetrics();

    executionLog.innerHTML = "";
    addLog("Starting Selection Sort...");

    const delay = () => SPEED_MAP[speedSelect.value] || 400;
    const n = array.length;

    highlightPseudocode(1);
    await sleep(delay());

    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;

        passes++;
        statPasses.textContent = passes;
        let minIdx = i;

        addLog(`--- Pass ${passes}: Finding minimum from index ${i} ---`);
        highlightPseudocode(2);
        await sleep(delay());

        highlightPseudocode(3);
        renderArray({ minIdx, sortedCount: i }, 3);
        await sleep(delay());

        for (let j = i + 1; j < n; j++) {
            if (!isSorting) return;
            await checkPause();

            highlightPseudocode(4);
            comparisons++;
            statComparisons.textContent = comparisons;

            renderArray({ minIdx, comparing: [j], sortedCount: i }, 5);
            addLog(`Comparing index ${j} (${array[j]}) with current min (${array[minIdx]})`);
            await sleep(delay());

            if (array[j] < array[minIdx]) {
                minIdx = j;
                addLog(`New minimum found at index ${minIdx} (${array[minIdx]})`);
                renderArray({ minIdx, sortedCount: i }, 5);
                await sleep(delay());
            }
        }

        if (minIdx !== i) {
            swaps++;
            statSwaps.textContent = swaps;

            let temp = array[i];
            array[i] = array[minIdx];
            array[minIdx] = temp;

            arrayInput.value = array.join(" ");
            renderArray({ swapping: [i, minIdx], sortedCount: i }, 6);
            addLog(`Swapped index ${i} (${array[i]}) with minimum at index ${minIdx} (${array[minIdx]})`);
            await sleep(delay());
        } else {
            addLog(`Index ${i} (${array[i]}) is already in correct position.`);
        }

        renderArray({ sortedCount: i + 1 });
    }

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

function pauseSorting() {
    if (!isSorting || isPaused) return;
    isPaused = true;
    btnPause.disabled = true;
    btnResume.disabled = false;
    addLog("⏸ Visualization Paused.");
}

function resumeSorting() {
    if (!isSorting || !isPaused) return;
    isPaused = false;
    btnPause.disabled = false;
    btnResume.disabled = true;
    addLog("▶ Visualization Resumed.");
}

function resetVisualizer() {
    isSorting = false;
    isPaused = false;
    toggleInputs(false);
    btnPause.disabled = true;
    btnResume.disabled = true;
    parseCustomInput();
}
