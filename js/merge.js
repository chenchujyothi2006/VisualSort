let array = [];
let isSorting = false;
let isPaused = false;
let delay = 400;

let totalMerges = 0;
let totalComparisons = 0;
let totalWrites = 0;
let sortedIndices = new Set();

const arrayContainer = document.getElementById("array-container");
const inputField = document.getElementById("array-input");
const speedSelect = document.getElementById("speed");
const logBox = document.getElementById("execution-log");

function updateMetricsUI() {
    if (document.getElementById("stat-passes")) document.getElementById("stat-passes").innerText = totalMerges;
    if (document.getElementById("stat-comparisons")) document.getElementById("stat-comparisons").innerText = totalComparisons;
    if (document.getElementById("stat-swaps")) document.getElementById("stat-swaps").innerText = totalWrites;
}

function resetMetrics() {
    totalMerges = 0;
    totalComparisons = 0;
    totalWrites = 0;
    sortedIndices.clear();
    updateMetricsUI();
}

function sleep(ms) {
    return new Promise((resolve) => {
        const check = () => {
            if (!isPaused) setTimeout(resolve, ms);
            else setTimeout(check, 100);
        };
        check();
    });
}

function addLog(msg, type = "info") {
    if (!logBox) return;
    const entry = document.createElement("p");
    entry.className = `log-entry ${type}`;
    entry.innerText = `> ${msg}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
}

function clearLogs() { if (logBox) logBox.innerHTML = ""; }

function highlightCode(lineNum) {
    document.querySelectorAll(".pseudocode p").forEach(p => p.classList.remove("active"));
    const line = document.getElementById(`line-${lineNum}`);
    if (line) line.classList.add("active");
}

function parseInput() {
    const val = inputField ? inputField.value.trim() : "";
    return val ? val.split(/[\s,]+/).map(Number).filter(n => !isNaN(n)) : [];
}

function renderArray(arr = array, sortedSet = sortedIndices, pointers = {}) {
    if (!arrayContainer) return;
    arrayContainer.innerHTML = "";
    const maxVal = Math.max(...arr, 1);

    arr.forEach((value, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("bar-wrapper");

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${Math.min((value / maxVal) * 75 + 15, 95)}%`;
        bar.innerText = value;

        if (sortedSet.has(index)) bar.classList.add("sorted");

        wrapper.appendChild(bar);

        let pointerText = [];
        if (pointers.left === index) pointerText.push("L");
        if (pointers.mid === index) pointerText.push("M");
        if (pointers.right === index) pointerText.push("R");
        if (pointers.k === index) pointerText.push("k");

        if (pointerText.length > 0) {
            const label = document.createElement("div");
            label.classList.add("pointer-label");
            label.innerText = pointerText.join(",");
            wrapper.appendChild(label);
        }

        arrayContainer.appendChild(wrapper);
    });
}

async function merge(l, m, r) {
    totalMerges++;
    updateMetricsUI();

    highlightCode(5);
    addLog(`Merge ${totalMerges}: Merging sub-arrays [${l}..${m}] & [${m + 1}..${r}]`, "pass");

    let n1 = m - l + 1;
    let n2 = r - m;

    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = array[l + i];
    for (let j = 0; j < n2; j++) R[j] = array[m + 1 + j];

    let i = 0, j = 0, k = l;

    while (i < n1 && j < n2) {
        if (!isSorting) return;

        totalComparisons++;
        updateMetricsUI();

        highlightCode(6);
        renderArray(array, sortedIndices, { left: l, mid: m, right: r, k: k });
        let bars = document.querySelectorAll(".bar");
        if (bars[k]) bars[k].classList.add("comparing");
        addLog(`Comparing L[${i}] (${L[i]}) and R[${j}] (${R[j]})`);
        await sleep(delay);

        highlightCode(7);
        if (L[i] <= R[j]) {
            array[k] = L[i];
            i++;
        } else {
            array[k] = R[j];
            j++;
        }

        totalWrites++;
        updateMetricsUI();

        renderArray(array, sortedIndices, { left: l, right: r, k: k });
        bars = document.querySelectorAll(".bar");
        if (bars[k]) bars[k].classList.add("swapping");
        await sleep(delay);
        k++;
    }

    while (i < n1) {
        if (!isSorting) return;
        array[k] = L[i];
        totalWrites++;
        updateMetricsUI();
        renderArray(array, sortedIndices, { k: k });
        i++;
        k++;
        await sleep(delay);
    }

    while (j < n2) {
        if (!isSorting) return;
        array[k] = R[j];
        totalWrites++;
        updateMetricsUI();
        renderArray(array, sortedIndices, { k: k });
        j++;
        k++;
        await sleep(delay);
    }
}

async function mergeSortHelper(l, r) {
    if (l >= r) return;

    highlightCode(1);
    let m = l + Math.floor((r - l) / 2);

    highlightCode(2);
    addLog(`Splitting range [${l}..${r}] at mid = ${m}`, "highlight");
    renderArray(array, sortedIndices, { left: l, mid: m, right: r });
    await sleep(delay);

    highlightCode(3);
    await mergeSortHelper(l, m);

    highlightCode(4);
    await mergeSortHelper(m + 1, r);

    await merge(l, m, r);
}

async function startMergeSort() {
    isSorting = true;
    isPaused = false;
    clearLogs();
    resetMetrics();
    addLog("Starting Merge Sort...", "highlight");

    await mergeSortHelper(0, array.length - 1);

    for (let i = 0; i < array.length; i++) sortedIndices.add(i);
    renderArray(array, sortedIndices);

    addLog("----------------------------------", "highlight");
    addLog("🎉 SORTING COMPLETED!", "highlight");
    addLog(`Total Merges: ${totalMerges} | Comparisons: ${totalComparisons} | Array Writes: ${totalWrites}`);
    addLog(`Time Complexity: O(N log N) | Space Complexity: O(N)`);
    addLog("----------------------------------", "highlight");

    highlightCode(0);
    isSorting = false;
}

function startSorting() { if (!isSorting) { array = parseInput(); startMergeSort(); } }
function pauseSorting() { isPaused = true; }
function resumeSorting() { isPaused = false; }
function resetVisualizer() { isSorting = false; isPaused = false; array = parseInput(); renderArray(array); clearLogs(); resetMetrics(); highlightCode(0); }
function generateRandomArray() {
    array = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
    inputField.value = array.join(" ");
    renderArray(array);
    clearLogs();
    resetMetrics();
}

if (speedSelect) {
    speedSelect.addEventListener("change", (e) => {
        const val = e.target.value.toLowerCase();
        delay = val === "slow" ? 800 : val === "fast" ? 150 : 400;
    });
}

document.addEventListener("DOMContentLoaded", () => { array = parseInput(); renderArray(array); });
