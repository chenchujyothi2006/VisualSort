// State Management Variables
let array = [];
let isSorting = false;
let isPaused = false;
let passes = 0; // Merge steps
let comparisons = 0;
let swaps = 0; // Array writes for merge sort

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

        if (highlightIndices.comparing && highlightIndices.comparing.includes(idx)) {
            bar.classList.add("comparing");
        } else if (highlightIndices.writing === idx) {
            bar.classList.add("swapping");
        } else if (highlightIndices.mergedRange && idx >= highlightIndices.mergedRange[0] && idx <= highlightIndices.mergedRange[1]) {
            bar.classList.add("sorted");
        } else if (highlightIndices.allSorted) {
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

async function merge(left, mid, right) {
    const delay = () => SPEED_MAP[speedSelect.value] || 400;
    passes++;
    statPasses.textContent = passes;

    addLog(`--- Merging range [${left}...${mid}] and [${mid + 1}...${right}] ---`);
    highlightPseudocode(6);

    let leftSub = array.slice(left, mid + 1);
    let rightSub = array.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < leftSub.length && j < rightSub.length) {
        if (!isSorting) return;
        await checkPause();

        comparisons++;
        statComparisons.textContent = comparisons;

        renderArray({ comparing: [left + i, mid + 1 + j] }, 6);
        addLog(`Comparing ${leftSub[i]} (left) and ${rightSub[j]} (right)`);
        await sleep(delay());

        if (leftSub[i] <= rightSub[j]) {
            array[k] = leftSub[i];
            i++;
        } else {
            array[k] = rightSub[j];
            j++;
        }

        swaps++;
        statSwaps.textContent = swaps;
        arrayInput.value = array.join(" ");

        renderArray({ writing: k }, 6);
        addLog(`Wrote ${array[k]} into index ${k}`);
        await sleep(delay());
        k++;
    }

    while (i < leftSub.length) {
        if (!isSorting) return;
        await checkPause();

        array[k] = leftSub[i];
        swaps++;
        statSwaps.textContent = swaps;
        arrayInput.value = array.join(" ");

        renderArray({ writing: k }, 6);
        addLog(`Copied remaining left element ${array[k]} into index ${k}`);
        await sleep(delay());
        i++;
        k++;
    }

    while (j < rightSub.length) {
        if (!isSorting) return;
        await checkPause();

        array[k] = rightSub[j];
        swaps++;
        statSwaps.textContent = swaps;
        arrayInput.value = array.join(" ");

        renderArray({ writing: k }, 6);
        addLog(`Copied remaining right element ${array[k]} into index ${k}`);
        await sleep(delay());
        j++;
        k++;
    }

    renderArray({ mergedRange: [left, right] }, 6);
    await sleep(delay());
}

async function mergeSortRecursive(left, right) {
    if (!isSorting) return;
    const delay = () => SPEED_MAP[speedSelect.value] || 400;

    highlightPseudocode(1);
    await sleep(delay());

    if (left >= right) {
        highlightPseudocode(2);
        return;
    }

    let mid = Math.floor(left + (right - left) / 2);

    highlightPseudocode(3);
    await sleep(delay());

    highlightPseudocode(4);
    await mergeSortRecursive(left, mid);

    highlightPseudocode(5);
    await mergeSortRecursive(mid + 1, right);

    await merge(left, mid, right);
}

async function startSorting() {
    if (isSorting || array.length < 2) return;

    isSorting = true;
    isPaused = false;
    toggleInputs(true);
    resetMetrics();

    executionLog.innerHTML = "";
    addLog("Starting Merge Sort...");

    await mergeSortRecursive(0, array.length - 1);

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
