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
        wrapper.appendChild(bar);

        let pointerText = [];
        if (pointers.i === index) pointerText.push("i");
        if (pointers.j === index) pointerText.push("j");
        if (pointers.keyIdx === index) pointerText.push("key");

        if (pointerText.length > 0) {
            const label = document.createElement("div");
            label.classList.add("pointer-label");
            label.innerText = pointerText.join(",");
            wrapper.appendChild(label);
        }

        arrayContainer.appendChild(wrapper);
    });
}

async function insertionSort() {
    isSorting = true;
    isPaused = false;
    clearLogs();
    addLog("Starting Insertion Sort...", "highlight");

    let n = array.length;
    highlightCode(1);
    await sleep(delay);

    for (let i = 1; i < n; i++) {
        if (!isSorting) return;
        let key = array[i];
        let j = i - 1;

        addLog(`Pass ${i}: Key selected = ${key} at index ${i}`, "pass");
        highlightCode(2);
        await sleep(delay);

        highlightCode(3);
        renderArray(array, { i: i, j: j, keyIdx: i });
        await sleep(delay);

        while (j >= 0 && array[j] > key) {
            if (!isSorting) return;

            highlightCode(4);
            renderArray(array, { i: i, j: j, keyIdx: i });
            let bars = document.querySelectorAll(".bar");
            bars[j].classList.add("comparing");
            addLog(`Comparing index ${j} (${array[j]}) with key (${key})`);
            await sleep(delay);

            highlightCode(5);
            array[j + 1] = array[j];
            addLog(`Shifting ${array[j]} to position ${j + 1}`, "swap");
            renderArray(array, { i: i, j: j });
            bars = document.querySelectorAll(".bar");
            bars[j + 1].classList.add("swapping");
            await sleep(delay);

            highlightCode(6);
            j--;
        }

        highlightCode(7);
        array[j + 1] = key;
        addLog(`Placed key ${key} at position ${j + 1}`, "sorted");
        renderArray(array, { i: i });
        await sleep(delay);
    }

    renderArray(array);
    document.querySelectorAll(".bar").forEach(b => b.classList.add("sorted"));
    addLog("Array sorted successfully!", "highlight");
    highlightCode(0);
    isSorting = false;
}

function startSorting() { if (!isSorting) { array = parseInput(); insertionSort(); } }
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
