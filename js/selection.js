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

const SELECTION_PSEUDOCODE = [
    "for i = 0 to N - 2 do",
    "  min_idx = i",
    "  for j = i + 1 to N - 1 do",
    "    if arr[j] < arr[min_idx] then",
    "      min_idx = j",
    "  if min_idx != i then",
    "    swap(arr[i], arr[min_idx])"
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
    loadPseudocode(SELECTION_PSEUDOCODE);

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

    let bars = document.querySelectorAll(".bar");

    for (let i = 0; i < arr.length - 1; i++) {
        await checkPause();
        highlightLine(0);

        let min = i;
        highlightLine(1);

        log.innerHTML += `<b>PASS ${i + 1}</b><br><br>`;
        bars[min].classList.add("comparing");

        renderPointers({ [i]: { label: "i" }, [min]: { label: "min", type: "pivot-tag" } });

        tutor.innerHTML = `
        <b>Pass ${i + 1}</b><br><br>
        Current Minimum: <b>${arr[min]}</b><br><br>
        Scanning for smaller elements.
        `;

        for (let j = i + 1; j < arr.length; j++) {
            await checkPause();
            highlightLine(2);

            comparisons++;
            document.getElementById("comparisons").innerText = comparisons;

            bars[j].classList.add("comparing");
            renderPointers({ [i]: { label: "i" }, [min]: { label: "min", type: "pivot-tag" }, [j]: { label: "j" } });

            tutor.innerHTML = `
            <b>Comparing</b><br><br>
            Current Minimum: <b>${arr[min]}</b><br><br>
            Checking element <b>${arr[j]}</b>.
            `;

            log.innerHTML += `Compare ${arr[j]} and ${arr[min]}<br>`;
            await sleep(animationSpeed);

            highlightLine(3);
            if (arr[j] < arr[min]) {
                bars[min].classList.remove("comparing", "swapping");
                min = j;
                highlightLine(4);

                bars[min].classList.add("comparing", "swapping");
                renderPointers({ [i]: { label: "i" }, [min]: { label: "min", type: "pivot-tag" } });

                tutor.innerHTML = `<b>New Minimum Found: ${arr[min]}</b>`;
                await sleep(animationSpeed);
            }

            if (j !== min) {
                bars[j].classList.remove("comparing");
            }
        }

        highlightLine(5);
        if (min !== i) {
            highlightLine(6);
            tutor.innerHTML = `<b>Swapping:</b> ${arr[i]} with minimum ${arr[min]}.`;

            bars[i].classList.add("swapping");
            bars[min].classList.add("swapping");

            await sleep(animationSpeed);

            [arr[i], arr[min]] = [arr[min], arr[i]];
            swaps++;
            document.getElementById("swaps").innerText = swaps;

            bars[i].style.height = arr[i] * 15 + "px";
            bars[i].innerHTML = `<span>${arr[i]}</span>`;
            bars[min].style.height = arr[min] * 15 + "px";
            bars[min].innerHTML = `<span>${arr[min]}</span>`;

            log.innerHTML += `Swap ${arr[min]} and ${arr[i]}<br>`;
            await sleep(animationSpeed);

            bars[min].classList.remove("swapping");
        }

        passes++;
        document.getElementById("passes").innerText = passes;

        bars[i].classList.remove("comparing", "swapping");
        bars[i].classList.add("sorted");
        log.innerHTML += `Minimum element placed at index ${i}.<br><hr>`;
    }

    bars[arr.length - 1].classList.add("sorted");
    renderPointers();
    highlightLine(-1);

    let endTime = performance.now();
    let execTime = Math.round(endTime - startTime);
    document.getElementById("executionTime").innerText = execTime + " ms";

    tutor.innerHTML = `
    <h3>🎉 Selection Sort Completed</h3><br>
    <b>Total Comparisons :</b> ${comparisons}<br>
    <b>Total Swaps :</b> ${swaps}<br>
    <b>Total Passes :</b> ${passes}<br>
    <b>Execution Time :</b> ${execTime} ms
    `;

    log.innerHTML += `<br><b>Sorting Completed Successfully.</b>`;
    document.getElementById("startBtn").disabled = false;
}
