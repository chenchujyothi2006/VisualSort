// State Management Variables
let array = [];
let isSorting = false;
let isPaused = false;
let passes = 0;
let comparisons = 0;
let swaps = 0; // Tracks shifts for insertion sort

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

        if (highlightIndices.keyIdx === idx) {
            bar.classList.add("pivot"); // Selected key
        } else if (highlightIndices.comparing && highlightIndices.comparing.includes(idx)) {
            bar.classList.add("comparing");
        } else if (highlightIndices.shifting && highlightIndices.shifting.includes(idx)) {
            bar.classList.add("swapping");
        } else if (idx <= highlightIndices.sortedUntil || highlightIndices.allSorted) {
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
    addLog("Starting Insertion Sort...");

    const delay = () => SPEED_MAP[speedSelect.value] || 400;
    const n = array.length;

    highlightPseudocode(1);
    await sleep(delay());

    for (let i = 1; i < n; i++) {
        if (!isSorting) return;

        passes++;
        statPasses.textContent = passes;
        let key = array[i];
        let j = i - 1;

        addLog(`--- Pass ${passes}: Inserting key = ${key} ---`);
        highlightPseudocode(2);
        await sleep(delay());

        highlightPseudocode(3);
        renderArray({ keyIdx: i, sortedUntil: i - 1 }, 3);
        await sleep(delay());

        while (j >= 0 && array[j] > key) {
            if (!isSorting) return;
            await checkPause();

            comparisons++;
            statComparisons.textContent = comparisons;

            highlightPseudocode(4);
            renderArray({ keyIdx: j + 1, comparing: [j], sortedUntil: i - 1 }, 4);
            addLog(`Comparing A[${j}] (${array[j]}) > key (${key}) — shifting...`);
            await sleep(delay());

            swaps++;
            statSwaps.textContent = swaps;
            array[j + 1] = array[j];

            arrayInput.value = array.join(" ");
            highlightPseudocode(5);
            renderArray({ shifting: [j + 1], sortedUntil: i - 1 }, 5);
            await sleep(delay());

            j = j - 1;
            highlightPseudocode(6);
        }

        if (j >= 0) {
            comparisons++;
            statComparisons.textContent = comparisons;
        }

        array[j + 1] = key;
        arrayInput.value = array.join(" ");

        highlightPseudocode(7);
        renderArray({ sortedUntil: i }, 7);
        addLog(`Inserted key ${key} at position ${j + 1}`);
        await sleep(delay());
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
