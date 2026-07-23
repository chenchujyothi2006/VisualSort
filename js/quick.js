let array = [];
let isSorting = false;
let isPaused = false;
let delay = 400;

let totalPartitions = 0;
let totalComparisons = 0;
let totalSwaps = 0;
let sortedIndices = new Set();

const arrayContainer = document.getElementById("array-container");
const inputField = document.getElementById("array-input");
const speedSelect = document.getElementById("speed");
const logBox = document.getElementById("execution-log");

function updateMetricsUI() {
    if (document.getElementById("stat-passes")) document.getElementById("stat-passes").innerText = totalPartitions;
    if (document.getElementById("stat-comparisons")) document.getElementById("stat-comparisons").innerText = totalComparisons;
    if (document.getElementById("stat-swaps")) document.getElementById("stat-swaps").innerText = totalSwaps;
}

function resetMetrics() {
    totalPartitions = 0;
    totalComparisons = 0;
    totalSwaps = 0;
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
        else if (index === pointers.pivotIdx) bar.classList.add("pivot");

        wrapper.appendChild(bar);

        let pointerText = [];
        if (pointers.i === index) pointerText.push("i");
        if (pointers.j === index) pointerText.push("j");
        if (pointers.pivotIdx === index) pointerText.push("pivot");

        if (pointerText.length > 0) {
            const label = document.createElement("div");
            label.classList.add("pointer-label");
            label.innerText = pointerText.join(",");
            wrapper.appendChild(label);
        }

        arrayContainer.appendChild(wrapper);
    });
}

async function partition(low, high) {
    totalPartitions++;
    updateMetricsUI();

    let pivot = array[high];
    let i = low - 1;

    addLog(`Partition ${totalPartitions}: Range [${low}..${high}], Pivot = ${pivot}`, "pass");
    highlightCode(2);
    renderArray(array, sortedIndices, { i: i, pivotIdx: high });
    await sleep(delay);

    for (let j = low; j < high; j++) {
        if (!isSorting) return i + 1;

        totalComparisons++;
        updateMetricsUI();
        highlightCode(3);
        renderArray(array, sortedIndices, { i: i, j: j, pivotIdx: high });
        let bars = document.querySelectorAll(".bar");
        if (bars[j]) bars[j].classList.add("comparing");
        addLog(`Comparing element ${array[j]} with Pivot ${pivot}`);
        await sleep(delay);

        highlightCode(4);
        if (array[j] < pivot) {
            i++;
            totalSwaps++;
            updateMetricsUI();
            addLog(`Element ${array[j]} < ${pivot}. Swapping to index ${i}`, "swap");
            highlightCode(5);

            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;

            renderArray(array, sortedIndices, { i: i, j: j, pivotIdx: high });
            await sleep(delay);
        }
    }

    highlightCode(6);
    totalSwaps++;
    updateMetricsUI();
    addLog(`Placing Pivot ${pivot} into its correct index ${i + 1}`, "sorted");

    let temp = array[i + 1];
    array[i + 1] = array[high];
    array[high] = temp;

    // Pivot is now in its permanently sorted position
    sortedIndices.add(i + 1);
    renderArray(array, sortedIndices, { pivotIdx: i + 1 });
    await sleep(delay);

    return i + 1;
}

async function quickSortHelper(low, high) {
    if (low <= high) {
        if (low === high) {
            sortedIndices.add(low);
            renderArray(array, sortedIndices);
            return;
        }
        highlightCode(1);
        let pi = await partition(low, high);
        highlightCode(7);
        await quickSortHelper(low, pi - 1);
        await quickSortHelper(pi + 1, high);
    }
}

async function startQuickSort() {
    isSorting = true;
    isPaused = false;
    clearLogs();
    resetMetrics();
    addLog("Starting Quick Sort...", "highlight");

    await quickSortHelper(0, array.length - 1);

    for (let i = 0; i < array.length; i++) sortedIndices.add(i);
    renderArray(array, sortedIndices);

    addLog("----------------------------------", "highlight");
    addLog("🎉 SORTING COMPLETED!", "highlight");
    addLog(`Total Partitions: ${totalPartitions} | Comparisons: ${totalComparisons} | Swaps: ${totalSwaps}`);
    addLog(`Time Complexity: O(N log N) | Space Complexity: O(log N)`);
    addLog("----------------------------------", "highlight");

    highlightCode(0);
    isSorting = false;
}

function startSorting() { if (!isSorting) { array = parseInput(); startQuickSort(); } }
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
