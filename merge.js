const barsContainer = document.getElementById("bars");
const pointersContainer = document.getElementById("pointers-container");
const tutor = document.getElementById("tutorText");
const log = document.getElementById("log");
const pseudocodeBox = document.getElementById("pseudocode");

let arr = [];
let animationSpeed = 500;
let isPaused = false;

let comparisons = 0;
let merges = 0;
let passes = 0;
let startTime = 0;

const MERGE_PSEUDOCODE = [
    "function mergeSort(left, right):",
    "  if left >= right return",
    "  mid = (left + right) / 2",
    "  mergeSort(left, mid)",
    "  mergeSort(mid + 1, right)",
    "  merge(left, mid, right)"
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
    loadPseudocode(MERGE_PSEUDOCODE);

    comparisons = 0;
    merges = 0;
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
    merges = 0;
    passes = 0;

    document.getElementById("arraySize").innerText = 0;
    document.getElementById("comparisons").innerText = 0;
    document.getElementById("swaps").innerText = 0;
    document.getElementById("passes").innerText = 0;
    document.getElementById("executionTime").innerText = "0 ms";

    document.getElementById("startBtn").disabled = false;
    isPaused = false;
}

async function merge(left, mid, right) {
    await checkPause();
    highlightLine(5);

    let leftArray = arr.slice(left, mid + 1);
    let rightArray = arr.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;
    let bars = document.querySelectorAll(".bar");

    tutor.innerHTML = `
    <b>Merging Subarrays [${left} - ${right}]</b><br><br>
    Left Part: ${leftArray.join(", ")} | Right Part: ${rightArray.join(", ")}
    `;

    log.innerHTML += `<b>Merging Index ${left} to ${right}</b><br>`;

    while (i < leftArray.length && j < rightArray.length) {
        await checkPause();

        comparisons++;
        document.getElementById("comparisons").innerText = comparisons;

        renderPointers({ [k]: { label: "k", type: "pivot-tag" }, [left + i]: { label: "L" }, [mid + 1 + j]: { label: "R" } });
        bars[k].classList.add("comparing");
        await sleep(animationSpeed);

        if (leftArray[i] <= rightArray[j]) {
            arr[k] = leftArray[i];
            i++;
        } else {
            arr[k] = rightArray[j];
            j++;
        }

        bars[k].style.height = arr[k] * 15 + "px";
        bars[k].innerHTML = `<span>${arr[k]}</span>`;
        bars[k].classList.remove("comparing");
        bars[k].classList.add("sorted");

        k++;
        await sleep(animationSpeed);
    }

    while (i < leftArray.length) {
        await checkPause();
        arr[k] = leftArray[i];
        bars[k].style.height = arr[k] * 15 + "px";
        bars[k].innerHTML = `<span>${arr[k]}</span>`;
        bars[k].classList.add("sorted");
        i++; k++;
        await sleep(animationSpeed);
    }

    while (j < rightArray.length) {
        await checkPause();
        arr[k] = rightArray[j];
        bars[k].style.height = arr[k] * 15 + "px";
        bars[k].innerHTML = `<span>${arr[k]}</span>`;
        bars[k].classList.add("sorted");
        j++; k++;
        await sleep(animationSpeed);
    }

    merges++;
    document.getElementById("swaps").innerText = merges;
    passes++;
    document.getElementById("passes").innerText = passes;
}

async function mergeSort(left, right) {
    highlightLine(0);
    if (left >= right) {
        highlightLine(1);
        return;
    }

    await checkPause();
    let mid = Math.floor((left + right) / 2);
    highlightLine(2);

    renderPointers({ [left]: { label: "L" }, [mid]: { label: "M", type: "pivot-tag" }, [right]: { label: "R" } });

    tutor.innerHTML = `<b>Divide Phase</b><br><br>Dividing index ${left} to ${right} at Mid ${mid}`;
    await sleep(animationSpeed);

    highlightLine(3);
    await mergeSort(left, mid);

    highlightLine(4);
    await mergeSort(mid + 1, right);

    await merge(left, mid, right);
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
    merges = 0;
    passes = 0;
    startTime = performance.now();
    log.innerHTML = "";

    await mergeSort(0, arr.length - 1);

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
    <h3>🎉 Merge Sort Completed</h3><br>
    <b>Total Comparisons :</b> ${comparisons}<br>
    <b>Total Merge Operations :</b> ${merges}<br>
    <b>Total Merge Passes :</b> ${passes}<br>
    <b>Execution Time :</b> ${execTime} ms
    `;

    log.innerHTML += `<hr><b>Merge Sort Completed Successfully.</b>`;
    document.getElementById("startBtn").disabled = false;
}