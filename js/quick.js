let array = [];
let isSorting = false;
let isPaused = false;
let delay = 400;

const arrayContainer = document.getElementById("array-container");
const inputField = document.getElementById("array-input");
const speedSelect = document.getElementById("speed");
const logBox = document.getElementById("execution-log");

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

function renderArray(arr = array, pointers = {}) {
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
        
        if (index === pointers.pivotIdx) bar.classList.add("pivot");
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
    let pivot = array[high];
    let i = low - 1;
    
    addLog(`Partitioning range [${low}..${high}] with Pivot = ${pivot}`, "pass");
    highlightCode(2);
    renderArray(array, { i: i, pivotIdx: high });
    await sleep(delay);

    for (let j = low; j < high; j++) {
        if (!isSorting) return i + 1;

        highlightCode(3);
        renderArray(array, { i: i, j: j, pivotIdx: high });
        let bars = document.querySelectorAll(".bar");
        bars[j].classList.add("comparing");
        addLog(`Comparing element ${array[j]} with Pivot ${pivot}`);
        await sleep(delay);

        highlightCode(4);
        if (array[j] < pivot) {
            i++;
            addLog(`Element ${array[j]} < ${pivot}. Incrementing i to ${i} and swapping`, "swap");
            highlightCode(5);
            
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;

            renderArray(array, { i: i, j: j, pivotIdx: high });
            await sleep(delay);
        }
    }

    highlightCode(6);
    addLog(`Placing Pivot ${pivot} in correct position ${i + 1}`, "sorted");
    let temp = array[i + 1];
    array[i + 1] = array[high];
    array[high] = temp;

    renderArray(array, { pivotIdx: i + 1 });
    await sleep(delay);

    return i + 1;
}

async function quickSortHelper(low, high) {
    if (low < high) {
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
    addLog("Starting Quick Sort...", "highlight");

    await quickSortHelper(0, array.length - 1);

    renderArray(array);
    document.querySelectorAll(".bar").forEach(b => b.classList.add("sorted"));
    addLog("Array sorted successfully!", "highlight");
    highlightCode(0);
    isSorting = false;
}

function startSorting() { if (!isSorting) { array = parseInput(); startQuickSort(); } }
function pauseSorting() { isPaused = true; }
function resumeSorting() { isPaused = false; }
function resetVisualizer() { isSorting = false; isPaused = false; array = parseInput(); renderArray(array); clearLogs(); highlightCode(0); }
function generateRandomArray() {
    array = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
    inputField.value = array.join(" ");
    renderArray(array);
    clearLogs();
}

if (speedSelect) {
    speedSelect.addEventListener("change", (e) => {
        const val = e.target.value.toLowerCase();
        delay = val === "slow" ? 800 : val === "fast" ? 150 : 400;
    });
}

document.addEventListener("DOMContentLoaded", () => { array = parseInput(); renderArray(array); });
