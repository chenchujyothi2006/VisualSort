/**
 * VisualSort - Bubble Sort Engine (with Pointer Movements & Logs)
 */

let array = [];
let isSorting = false;
let isPaused = false;
let delay = 400;

const arrayContainer = document.getElementById("array-container");
const inputField = document.getElementById("array-input");
const sizeInput = document.getElementById("array-size");
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

function addLog(message, type = "info") {
    if (!logBox) return;
    const entry = document.createElement("p");
    entry.className = `log-entry ${type}`;
    entry.innerText = `> ${message}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
}

function clearLogs() {
    if (logBox) logBox.innerHTML = "";
}

function highlightCode(lineNum) {
    const lines = document.querySelectorAll(".pseudocode p");
    lines.forEach((line) => line.classList.remove("active"));
    if (lineNum > 0) {
        const activeLine = document.getElementById(`line-${lineNum}`);
        if (activeLine) activeLine.classList.add("active");
    }
}

function parseInput() {
    if (!inputField) return [];
    const rawVal = inputField.value.trim();
    if (!rawVal) return [];
    return rawVal.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
}

// Render Bars with Pointer Badge Indicators
function renderArray(arr = array, pointers = {}) {
    if (!arrayContainer) return;
    arrayContainer.innerHTML = "";

    const maxVal = Math.max(...arr, 1);

    arr.forEach((value, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("bar-wrapper");

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.setAttribute("data-index", index);

        const heightPercent = Math.min((value / maxVal) * 75 + 15, 95);
        bar.style.height = `${heightPercent}%`;
        bar.innerText = value;

        wrapper.appendChild(bar);

        // Pointer indicators (Feature #5)
        let pointerText = [];
        if (pointers.i === index) pointerText.push("i");
        if (pointers.j === index) pointerText.push("j");
        if (pointers.jNext === index) pointerText.push("j+1");

        if (pointerText.length > 0) {
            const label = document.createElement("div");
            label.classList.add("pointer-label");
            label.innerText = pointerText.join(",");
            wrapper.appendChild(label);
        }

        arrayContainer.appendChild(wrapper);
    });
}

function generateRandomArray() {
    if (isSorting) return;
    const randomArr = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
    inputField.value = randomArr.join(" ");
    array = randomArr;
    if (sizeInput) sizeInput.value = array.length;
    renderArray(array);
    clearLogs();
    addLog("Generated random array: [" + array.join(", ") + "]");
}

async function bubbleSort() {
    isSorting = true;
    isPaused = false;
    clearLogs();
    addLog("Starting Bubble Sort...", "highlight");

    let n = array.length;
    highlightCode(1);
    await sleep(delay);

    highlightCode(2);
    await sleep(delay);

    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;
        addLog(`Pass ${i + 1}: Outer loop (i = ${i})`, "pass");
        highlightCode(3);
        await sleep(delay);

        for (let j = 0; j < n - i - 1; j++) {
            if (!isSorting) return;

            renderArray(array, { i: i, j: j, jNext: j + 1 });
            let bars = document.querySelectorAll(".bar");

            highlightCode(4);
            bars[j].classList.add("comparing");
            bars[j + 1].classList.add("comparing");
            addLog(`Comparing index ${j} (${array[j]}) & ${j + 1} (${array[j + 1]})`);
            await sleep(delay);

            highlightCode(5);
            await sleep(delay);

            if (array[j] > array[j + 1]) {
                highlightCode(6);
                bars[j].classList.remove("comparing");
                bars[j + 1].classList.remove("comparing");
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");
                addLog(`Swapping ${array[j]} and ${array[j + 1]}`, "swap");
                await sleep(delay);

                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                renderArray(array, { i: i, j: j, jNext: j + 1 });
                bars = document.querySelectorAll(".bar");
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");
                await sleep(delay);
            }
        }

        highlightCode(7);
        renderArray(array, { i: i });
        let bars = document.querySelectorAll(".bar");
        bars[n - i - 1].classList.add("sorted");
        addLog(`Element ${array[n - i - 1]} is now sorted!`, "sorted");
    }

    renderArray(array);
    document.querySelectorAll(".bar").forEach(b => b.classList.add("sorted"));
    addLog("Array sorted successfully!", "highlight");
    highlightCode(0);
    isSorting = false;
}

if (speedSelect) {
    speedSelect.addEventListener("change", (e) => {
        const val = e.target.value.toLowerCase();
        if (val === "slow") delay = 800;
        else if (val === "medium") delay = 400;
        else if (val === "fast") delay = 150;
    });
}

if (inputField) {
    inputField.addEventListener("input", () => {
        if (!isSorting) {
            array = parseInput();
            if (sizeInput) sizeInput.value = array.length;
            renderArray(array);
            clearLogs();
        }
    });
}

function startSorting() {
    if (isSorting && isPaused) { isPaused = false; return; }
    if (!isSorting) {
        array = parseInput();
        if (array.length === 0) return;
        bubbleSort();
    }
}

function pauseSorting() { if (isSorting) isPaused = true; }
function resumeSorting() { if (isSorting && isPaused) isPaused = false; }
function resetVisualizer() {
    isSorting = false;
    isPaused = false;
    array = parseInput();
    renderArray(array);
    highlightCode(0);
    clearLogs();
}

document.addEventListener("DOMContentLoaded", () => {
    array = parseInput();
    renderArray(array);
});
