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
    const rawVal = inputField ? inputField.value.trim() : "";
    return rawVal ? rawVal.split(/[\s,]+/).map(Number).filter(n => !isNaN(n)) : [];
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
    addLog("Starting Selection Sort...", "highlight");

    let n = array.length;
    highlightCode(1);
    await sleep(delay);

    for (let i = 0; i < n; i++) {
        if (!isSorting) return;
        let minIdx = i;
        addLog(`Pass ${i + 1}: Setting min pointer to index ${i} (${array[i]})`, "pass");
        highlightCode(2);
        await sleep(delay);

        highlightCode(3);
        renderArray(array, { i: i, minIdx: minIdx });
        await sleep(delay);

        for (let j = i + 1; j < n; j++) {
            if (!isSorting) return;

            renderArray(array, { i: i, j: j, minIdx: minIdx });
            let bars = document.querySelectorAll(".bar");
            if (bars[j]) bars[j].classList.add("comparing");
            if (bars[minIdx]) bars[minIdx].classList.add("pivot");

            highlightCode(4);
            addLog(`Comparing index ${j} (${array[j]}) with min index ${minIdx} (${array[minIdx]})`);
            await sleep(delay);

            highlightCode(5);
            if (array[j] < array[minIdx]) {
                minIdx = j;
                addLog(`New minimum found: ${array[j]} at index ${j}`, "highlight");
                await sleep(delay);
            }
        }

        highlightCode(6);
        if (minIdx !== i) {
            addLog(`Swapping index ${i} (${array[i]}) with min index ${minIdx} (${array[minIdx]})`, "swap");
            let temp = array[i];
            array[i] = array[minIdx];
            array[minIdx] = temp;
        }

        renderArray(array, { i: i });
        let bars = document.querySelectorAll(".bar");
        if (bars[i]) bars[i].classList.add("sorted");
    }

    renderArray(array);
    document.querySelectorAll(".bar").forEach(b => b.classList.add("sorted"));
    addLog("Array sorted successfully!", "highlight");
    highlightCode(0);
    isSorting = false;
}

function startSorting() {
    if (isSorting && isPaused) { isPaused = false; return; }
    if (!isSorting) {
        array = parseInput();
        if (array.length === 0) return;
        selectionSort();
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
