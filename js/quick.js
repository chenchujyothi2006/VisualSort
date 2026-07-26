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
        
        if (index === pointers.pivot) bar.classList.add("pivot");
        wrapper.appendChild(bar);

        let pointerText = [];
        if (pointers.low === index) pointerText.push("L");
        if (pointers.high === index) pointerText.push("H");
        if (pointers.i === index) pointerText.push("i");
        if (pointers.j === index) pointerText.push("j");
        if (pointers.pivot === index) pointerText.push("pivot");

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
    highlightCode(6);
    await sleep(delay);

    let pivot = array[high];
    let i = low - 1;

    highlightCode(7);
    addLog(`Chosen pivot: ${pivot} at index ${high}`, "pass");
    renderArray(array, { low, high, i, pivot: high });
    await sleep(delay);

    for (let j = low; j < high; j++) {
        if (!isSorting) return i + 1;

        highlightCode(8);
        renderArray(array, { low, high, i, j, pivot: high });
        let bars = document.querySelectorAll(".bar");
        if (bars[j]) bars[j].classList.add("comparing");
        addLog(`Comparing element ${array[j]} at index ${j} with pivot ${pivot}`);
        await sleep(delay);

        if (array[j] < pivot) {
            i++;
            highlightCode(9);
            addLog(`Element ${array[j]} < pivot ${pivot}. Swapping to index ${i}`, "swap");

            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;

            renderArray(array, { low, high, i, j, pivot: high });
            bars = document.querySelectorAll(".bar");
            if (bars[i]) bars[i].classList.add("swapping");
            if (bars[j]) bars[j].classList.add("swapping");
            await sleep(delay);
        }
    }

    highlightCode(10);
    addLog(`Placing pivot ${pivot} into its correct sorted position at index ${i + 1}`, "highlight");
    let temp = array[i + 1];
    array[i + 1] = array[high];
    array[high] = temp;

    renderArray(array, { low, high, i: i + 1, pivot: i + 1 });
    bars = document.querySelectorAll(".bar");
    if (bars[i + 1]) bars[i + 1].classList.add("sorted");
    await sleep(delay);

    return i + 1;
}

async function quickSortHelper(low, high) {
    if (!isSorting) return;
    highlightCode(1);
    await sleep(delay);

    highlightCode(2);
    if (low < high) {
        highlightCode(3);
        let p = await partition(low, high);

        highlightCode(4);
        addLog(`QuickSort on left subarray [${low}...${p - 1}]`);
        await quickSortHelper(low, p - 1);

        highlightCode(5);
        addLog(`QuickSort on right subarray [${p + 1}...${high}]`);
        await quickSortHelper(p + 1, high);
    }
}

async function startSorting() {
    if (isSorting && isPaused) { isPaused = false; return; }
    if (!isSorting) {
        array = parseInput();
        if (array.length === 0) return;
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
}

function pauseSorting() { isPaused = true; }
function resumeSorting() { isPaused = false; }
function resetVisualizer() { isSorting = false; isPaused = false; array = parseInput(); renderArray(array); clearLogs(); highlightCode(0); }

function generateRandomArray() {
    if (isSorting) return;
    array = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
    if (inputField) inputField.value = array.join(" ");
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
