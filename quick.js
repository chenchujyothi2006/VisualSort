const barsContainer = document.getElementById("bars");
const pointersContainer = document.getElementById("pointers-container");
const tutor = document.getElementById("tutorText");
const log = document.getElementById("log");
const pseudocodeBox = document.getElementById("pseudocode");

let arr = [];
let animationSpeed = 500;
let isPaused = false;

let comparisons = 0;
let swaps = 0;
let passes = 0;
let startTime = 0;

const QUICK_PSEUDOCODE = [
    "function partition(low, high):",
    "  pivot = arr[high]",
    "  i = low - 1",
    "  for j = low to high - 1 do",
    "    if arr[j] < pivot then",
    "      i++ ; swap(arr[i], arr[j])",
    "  swap(arr[i + 1], arr[high])"
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkPause() {
    while (isPaused) {
        await sleep(100);
    }
}

function pauseSorting() { isPaused = true; }
function resumeSorting() { isPaused = false; }

function loadPseudocode(lines) {
    if (!pseudocodeBox) return;
    pseudocodeBox.innerHTML = lines
        .map((line, idx) => `<div class="code-line" id="line-${idx}">${line}</div>`)
        .join("");
}

function highlightLine(lineIndex) {
    if (!pseudocodeBox) return;
    document.querySelectorAll(".code-line").forEach(el => el.classList.remove("active-line"));
    const target = document.getElementById(`line-${lineIndex}`);
    if (target) target.classList.add("active-line");
}

function renderPointers(pointersMap = {}) {
    if (!pointersContainer) return;
    pointersContainer.innerHTML = "";
    arr.forEach((_, idx) => {
        const slot = document.createElement("div");
        slot.className = "pointer-slot";
        if (pointersMap[idx]) {
            const tag = document.createElement("span");
            tag.className = `pointer-tag ${pointersMap[idx].type || ""}`;
            tag.innerText = pointersMap[idx].label;
            slot.appendChild(tag);
        }
        pointersContainer.appendChild(slot);
    });
}

function renderBars() {
    barsContainer.innerHTML = "";
    arr.forEach(value => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = value * 15 + "px";
        bar.innerHTML = `<span>${value}</span>`;
        barsContainer.appendChild(bar);
    });

    renderPointers();
    loadPseudocode(QUICK_PSEUDOCODE);

    comparisons = 0;
    swaps = 0;
    passes = 0;

    document.getElementById("arraySize").innerText = arr.length;
    document.getElementById("comparisons").innerText = 0;
    document.getElementById("swaps").innerText = 0;
    document.getElementById("passes").innerText = 0;
    document.getElementById("executionTime").innerText = "0 ms";
}

function randomArray() {
    let size = Number(document.getElementById("size").value) || 8;
    arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * 20) + 1);
    }
    document.getElementById("arrayInput").value = arr.join(" ");
    renderBars();
    tutor.innerHTML = "Random array generated.<br><br>Click <b>Start Sorting</b>.";
    log.innerHTML = "Array Loaded Successfully.<br>";
}

function resetArray() {
    barsContainer.innerHTML = "";
    if (pointersContainer) pointersContainer.innerHTML = "";
    if (pseudocodeBox) pseudocodeBox.innerHTML = "";
    arr = [];

    document.getElementById("arrayInput").value = "";
    tutor.innerHTML = "Enter elements or click <b>Random Array</b>, then click <b>Start Sorting</b>.";
    log.innerHTML = "No iterations yet.";

    comparisons = 0;
    swaps = 0;
    passes = 0;

    document.getElementById("arraySize").innerText = 0;
    document.getElementById("comparisons").innerText = 0;
    document.getElementById("swaps").innerText = 0;
    document.getElementById("passes").innerText = 0;
    document.getElementById("executionTime").innerText = "0 ms";

    document.getElementById("startBtn").disabled = false;
    isPaused = false;
}

async function partition(low, high) {
    await checkPause();
    highlightLine(0);

    let bars = document.querySelectorAll(".bar");
    let pivot = arr[high];
    highlightLine(1);

    bars[high].classList.add("swapping");
    let i = low - 1;
    highlightLine(2);

    renderPointers({ [high]: { label: "pivot", type: "pivot-tag" } });

    tutor.innerHTML = `<b>Choosing Pivot: ${pivot}</b><br><br>Partitioning indices ${low} to ${high}.`;
    log.innerHTML += `<b>Partition (${low} - ${high})</b><br>Pivot = ${pivot}<br>`;

    for (let j = low; j < high; j++) {
        await checkPause();
        highlightLine(3);

        comparisons++;
        document.getElementById("comparisons").innerText = comparisons;

        bars[j].classList.add("comparing");
        renderPointers({
            [high]: { label: "pivot", type: "pivot-tag" },
            [j]: { label: "j" },
            ...(i >= 0 ? { [i]: { label: "i" } } : {})
        });

        tutor.innerHTML = `Comparing <b>${arr[j]}</b> with Pivot <b>${pivot}</b>`;
        log.innerHTML += `Compare ${arr[j]} with Pivot ${pivot}<br>`;
        await sleep(animationSpeed);

        highlightLine(4);
        if (arr[j] < pivot) {
            i++;
            highlightLine(5);

            swaps++;
            document.getElementById("swaps").innerText = swaps;

            tutor.innerHTML = `${arr[j]} < ${pivot}. Swapping with index ${i}.`;
            [arr[i], arr[j]] = [arr[j], arr[i]];

            bars[i].style.height = arr[i] * 15 + "px";
            bars[i].innerHTML = `<span>${arr[i]}</span>`;
            bars[j].style.height = arr[j] * 15 + "px";
            bars[j].innerHTML = `<span>${arr[j]}</span>`;

            log.innerHTML += `Swap ${arr[i]} and ${arr[j]}<br>`;
            await sleep(animationSpeed);
        }

        bars[j].classList.remove("comparing");
    }

    highlightLine(6);
    swaps++;
    document.getElementById("swaps").innerText = swaps;

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

    bars[i + 1].style.height = arr[i + 1] * 15 + "px";
    bars[i + 1].innerHTML = `<span>${arr[i + 1]}</span>`;
    bars[high].style.height = arr[high] * 15 + "px";
    bars[high].innerHTML = `<span>${arr[high]}</span>`;

    bars[high].classList.remove("swapping");
    bars[i + 1].classList.add("sorted");

    log.innerHTML += `Pivot ${pivot} placed at index ${i + 1}<hr>`;
    await sleep(animationSpeed);

    return i + 1;
}

async function quickSort(low, high) {
    if (low < high) {
        passes++;
        document.getElementById("passes").innerText = passes;

        let pivotIndex = await partition(low, high);

        await quickSort(low, pivotIndex - 1);
        await quickSort(pivotIndex + 1, high);
    } else if (low >= 0 && low < arr.length) {
        let bars = document.querySelectorAll(".bar");
        if (bars[low]) bars[low].classList.add("sorted");
    }
}

async function startSorting() {
    const inputVal = document.getElementById("arrayInput").value.trim();
    if (inputVal.length > 0) {
        arr = inputVal.split(/\s+/).map(Number);
    }

    if (arr.length === 0 || arr.some(isNaN)) {
        tutor.innerHTML = "<b style='color: #ff6b6b;'>Please enter valid numbers or click Random Array.</b>";
        return;
    }

    renderBars();
    document.getElementById("startBtn").disabled = true;
    animationSpeed = Number(document.getElementById("speed").value);

    comparisons = 0;
    swaps = 0;
    passes = 0;
    startTime = performance.now();
    log.innerHTML = "";

    await quickSort(0, arr.length - 1);

    let bars = document.querySelectorAll(".bar");
    bars.forEach(bar => {
        bar.classList.remove("comparing", "swapping");
        bar.classList.add("sorted");
    });

    renderPointers();
    highlightLine(-1);

    let endTime = performance.now();
    let execTime = Math.round(endTime - startTime);
    document.getElementById("executionTime").innerText = execTime + " ms";

    tutor.innerHTML = `
    <h3>🎉 Quick Sort Completed</h3><br>
    <b>Total Comparisons :</b> ${comparisons}<br>
    <b>Total Swaps :</b> ${swaps}<br>
    <b>Total Partitions :</b> ${passes}<br>
    <b>Execution Time :</b> ${execTime} ms
    `;

    log.innerHTML += `<hr><b>Quick Sort Completed Successfully.</b>`;
    document.getElementById("startBtn").disabled = false;
}