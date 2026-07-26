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
        if (pointers.left === index) pointerText.push("L");
        if (pointers.mid === index) pointerText.push("mid");
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

async function merge(left, mid, right) {
    highlightCode(7);
    await sleep(delay);

    let n1 = mid - left + 1;
    let n2 = right - mid;

    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = array[left + i];
    for (let j = 0; j < n2; j++) R[j] = array[mid + 1 + j];

    addLog(`Merging subarrays [${left}...${mid}] and [${mid + 1}...${right}]`, "pass");

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
        if (!isSorting) return;

        highlightCode(8);
        renderArray(array, { left, mid, right, k });
        let bars = document.querySelectorAll(".bar");
        if (bars[left + i]) bars[left + i].classList.add("comparing");
        if (bars[mid + 1 + j]) bars[mid + 1 + j].classList.add("comparing");

        addLog(`Comparing L[${i}] (${L[i]}) and R[${j}] (${R[j]})`);
        await sleep(delay);

        highlightCode(9);
        if (L[i] <= R[j]) {
            array[k] = L[i];
            addLog(`Placing ${L[i]} at index ${k}`, "swap");
            i++;
        } else {
            array[k] = R[j];
            addLog(`Placing ${R[j]} at index ${k}`, "swap");
            j++;
        }

        renderArray(array, { left, mid, right, k });
        bars = document.querySelectorAll(".bar");
        if (bars[k]) bars[k].classList.add("swapping");
        await sleep(delay);
        k++;
    }

    while (i < n1) {
        if (!isSorting) return;
        array[k] = L[i];
        addLog(`Copying remaining L[${i}] (${L[i]}) to index ${k}`, "swap");
        renderArray(array, { left, mid, right, k });
        i++;
        k++;
        await sleep(delay);
    }

    while (j < n2) {
        if (!isSorting) return;
        array[k] = R[j];
        addLog(`Copying remaining R[${j}] (${R[j]}) to index ${k}`, "swap");
        renderArray(array, { left, mid, right, k });
        j++;
        k++;
        await sleep(delay);
    }
}

async function mergeSortHelper(left, right) {
    if (!isSorting) return;
    highlightCode(1);

    if (left >= right) {
        highlightCode(2);
        return;
    }

    let mid = Math.floor((left + right) / 2);
    highlightCode(3);
    addLog(`Dividing at mid index ${mid}`);
    renderArray(array, { left, mid, right });
    await sleep(delay);

    highlightCode(4);
    await mergeSortHelper(left, mid);

    highlightCode(5);
    await mergeSortHelper(mid + 1, right);

    highlightCode(6);
    await merge(left, mid, right);
}

async function startSorting() {
    if (isSorting && isPaused) { isPaused = false; return; }
    if (!isSorting) {
        array = parseInput();
        if (array.length === 0) return;
        isSorting = true;
        isPaused = false;
        clearLogs();
        addLog("Starting Merge Sort...", "highlight");

        await mergeSortHelper(0, array.length - 1);

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
