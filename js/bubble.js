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
        wrapper.appendChild(bar);

        let pointerText = [];
        if (pointers.i === index) pointerText.push("i");
        if (pointers.j === index) pointerText.push("j");

        if (pointerText.length > 0) {
            const label = document.createElement("div");
            label.classList.add("pointer-label");
            label.innerText = pointerText.join(",");
            wrapper.appendChild(label);
        }

        arrayContainer.appendChild(wrapper);
    });
}

async function bubbleSort() {
    isSorting = true;
    isPaused = false;
    clearLogs();
    resetMetrics();
    addLog("Starting Bubble Sort...", "highlight");

    let n = array.length;
    let sortedIndices = new Set();

    highlightCode(1);
    await sleep(delay);

    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;

        totalPasses++;
        updateMetricsUI();
        addLog(`Pass ${totalPasses}: Starting pass`, "pass");
        highlightCode(3);
        await sleep(delay);

        for (let j = 0; j < n - i - 1; j++) {
            if (!isSorting) return;

            renderArray(array, sortedIndices, { i: i, j: j });
            let bars = document.querySelectorAll(".bar");

            highlightCode(4);
            bars[j].classList.add("comparing");
            bars[j + 1].classList.add("comparing");

            totalComparisons++;
            updateMetricsUI();
            addLog(`Comparing index ${j} (${array[j]}) & ${j + 1} (${array[j + 1]})`);
            await sleep(delay);

            if (array[j] > array[j + 1]) {
                highlightCode(6);
                bars[j].classList.remove("comparing");
                bars[j + 1].classList.remove("comparing");
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");

                totalSwaps++;
                updateMetricsUI();
                addLog(`Swapping ${array[j]} and ${array[j + 1]}`, "swap");
                await sleep(delay);

                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                renderArray(array, sortedIndices, { i: i, j: j });
                bars = document.querySelectorAll(".bar");
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");
                await sleep(delay);
            }
        }

        sortedIndices.add(n - i - 1);
        renderArray(array, sortedIndices);
        addLog(`Element ${array[n - i - 1]} is now sorted!`, "sorted");
        highlightCode(7);
        await sleep(delay);
    }

    sortedIndices.add(0);
    renderArray(array, sortedIndices);

    addLog("----------------------------------", "highlight");
    addLog("🎉 SORTING COMPLETED!", "highlight");
    addLog(`Total Passes: ${totalPasses} | Comparisons: ${totalComparisons} | Swaps: ${totalSwaps}`);
    addLog(`Time Complexity: O(N²) | Space Complexity: O(1)`);
    addLog("----------------------------------", "highlight");

    highlightCode(0);
    isSorting = false;
}

function startSorting() { if (!isSorting) { array = parseInput(); bubbleSort(); } }
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
