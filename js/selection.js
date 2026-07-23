let array = [];
let isSorting = false;
let isPaused = false;
let delay = 400;

let totalPasses = 0;
let totalComparisons = 0;
let totalSwaps = 0;

const arrayContainer = document.getElementById("array-container");
const inputField = document.getElementById("array-input");
const speedSelect = document.getElementById("speed");
const logBox = document.getElementById("execution-log");

function updateMetricsUI() {
    if (document.getElementById("stat-passes")) document.getElementById("stat-passes").innerText = totalPasses;
    if (document.getElementById("stat-comparisons")) document.getElementById("stat-comparisons").innerText = totalComparisons;
    if (document.getElementById("stat-swaps")) document.getElementById("stat-swaps").innerText = totalSwaps;
}

function resetMetrics() {
    totalPasses = 0;
    totalComparisons = 0;
    totalSwaps = 0;
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

function renderArray(arr = array, sortedIndices = new Set(), pointers = {}) {
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

        if (sortedIndices.has(index)) bar.classList.add("sorted");
        else if (index === pointers.minIdx) bar.classList.add("pivot");

        wrapper.appendChild(bar);

        let pointerText = [];
        if (pointers.i === index) pointerText.push("i");
        if (pointers.j === index) pointerText.push("j");
        if (pointers.minIdx === index) pointerText.push("min");

        if (pointerText.length > 0) {
            const label = document.createElement("div");
            label.classList.add("pointer-label");
            label.innerText = pointerText.join(",");
            wrapper.appendChild(label);
        }

        arrayContainer.appendChild(wrapper);
    });
}

async function selectionSort() {
    isSorting = true;
    isPaused = false;
    clearLogs();
    resetMetrics();
    addLog("Starting Selection Sort...", "highlight");

    let n = array.length;
    let sortedIndices = new Set();

    highlightCode(1);
    await sleep(delay);

    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;

        totalPasses++;
        updateMetricsUI();
        addLog(`Pass ${totalPasses}: Finding minimum element from index ${i}`, "pass");
        highlightCode(2);
        await sleep(delay);

        let minIdx = i;
        highlightCode(3);
        renderArray(array, sortedIndices, { i: i, minIdx: minIdx });
        await sleep(delay);

        for (let j = i + 1; j < n; j++) {
            if (!isSorting) return;

            highlightCode(4);
            renderArray(array, sortedIndices, { i: i, j: j, minIdx: minIdx });
            let bars = document.querySelectorAll(".bar");
            if (bars[j]) bars[j].classList.add("comparing");

            totalComparisons++;
            updateMetricsUI();
            addLog(`Comparing index ${j} (${array[j]}) with min (${array[minIdx]})`);
            await sleep(delay);

            highlightCode(5);
            if (array[j] < array[minIdx]) {
                minIdx = j;
                addLog(`Found smaller value! New min_idx = ${minIdx} (${array[minIdx]})`, "swap");
                renderArray(array, sortedIndices, { i: i, j: j, minIdx: minIdx });
                await sleep(delay);
            }
        }

        highlightCode(6);
        if (minIdx !== i) {
            totalSwaps++;
            updateMetricsUI();
            addLog(`Swapping index ${i} (${array[i]}) with min at index ${minIdx} (${array[minIdx]})`, "swap");
            let temp = array[i];
            array[i] = array[minIdx];
            array[minIdx] = temp;

            renderArray(array, sortedIndices, { i: i, minIdx: minIdx });
            let bars = document.querySelectorAll(".bar");
            if (bars[i]) bars[i].classList.add("swapping");
            if (bars[minIdx]) bars[minIdx].classList.add("swapping");
            await sleep(delay);
        }

        sortedIndices.add(i);
        renderArray(array, sortedIndices);
        addLog(`Index ${i} (${array[i]}) is now permanently sorted!`, "sorted");
        await sleep(delay);
    }

    sortedIndices.add(n - 1);
    renderArray(array, sortedIndices);

    addLog("----------------------------------", "highlight");
    addLog("🎉 SORTING COMPLETED!", "highlight");
    addLog(`Total Passes: ${totalPasses} | Comparisons: ${totalComparisons} | Swaps: ${totalSwaps}`);
    addLog(`Time Complexity: O(N²) | Space Complexity: O(1)`);
    addLog("----------------------------------", "highlight");

    highlightCode(0);
    isSorting = false;
}

function startSorting() { if (!isSorting) { array = parseInput(); selectionSort(); } }
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
