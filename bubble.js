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

const BUBBLE_PSEUDOCODE = [
    "do",
    "  swapped = false",
    "  for j = 0 to N - i - 1 do",
    "    if arr[j] > arr[j+1] then",
    "      swap(arr[j], arr[j+1])",
    "      swapped = true",
    "while swapped"
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
    loadPseudocode(BUBBLE_PSEUDOCODE);

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
    tutor.innerHTML = "Random array generated.<br>Click <b>Start Sorting</b>.";
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
        highlightLine(0);
        log.innerHTML += `<b>PASS ${i + 1}</b><br><br>`;
        let swapped = false;
        highlightLine(1);

        for (let j = 0; j < arr.length - i - 1; j++) {
            await checkPause();
            highlightLine(2);
            renderPointers({ [j]: { label: "j" }, [j + 1]: { label: "j+1" } });

            bars[j].classList.add("comparing");
            bars[j + 1].classList.add("comparing");

            comparisons++;
            document.getElementById("comparisons").innerText = comparisons;

            tutor.innerHTML = `
            <b>Current Step</b><br><br>
            Comparing <b>${arr[j]}</b> and <b>${arr[j + 1]}</b>
            <br><br>
            Bubble Sort compares adjacent elements.
            `;

            log.innerHTML += `Compare ${arr[j]} and ${arr[j + 1]}<br>`;
            await sleep(animationSpeed);

            highlightLine(3);
            if (arr[j] > arr[j + 1]) {
                swapped = true;
                highlightLine(4);

                tutor.innerHTML = `
                <b>Swap Required</b><br><br>
                ${arr[j]} is greater than ${arr[j + 1]}. Swapping adjacent elements.
                `;

                bars[j].classList.remove("comparing");
                bars[j + 1].classList.remove("comparing");
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");

                await sleep(animationSpeed);

                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swaps++;
                document.getElementById("swaps").innerText = swaps;

                log.innerHTML += `Swap ${arr[j + 1]} and ${arr[j]}<br>`;

                bars[j].style.height = arr[j] * 15 + "px";
                bars[j].innerHTML = `<span>${arr[j]}</span>`;
                bars[j + 1].style.height = arr[j + 1] * 15 + "px";
                bars[j + 1].innerHTML = `<span>${arr[j + 1]}</span>`;

                highlightLine(5);
                await sleep(animationSpeed);
            }

            bars[j].classList.remove("comparing", "swapping");
            bars[j + 1].classList.remove("comparing", "swapping");
        }

        passes++;
        document.getElementById("passes").innerText = passes;
        bars[arr.length - i - 1].classList.add("sorted");
        log.innerHTML += "Largest element fixed.<br><hr>";

        highlightLine(6);
        if (!swapped) {
            tutor.innerHTML = `<b>No Swaps in this Pass</b><br><br>Array is sorted early.`;
            break;
        }
    }

    for (let k = 0; k < bars.length; k++) {
        bars[k].classList.add("sorted");
    }

    renderPointers();
    highlightLine(-1);

    let endTime = performance.now();
    let execTime = Math.round(endTime - startTime);
    document.getElementById("executionTime").innerText = execTime + " ms";

    tutor.innerHTML = `
    <h3>🎉 Sorting Completed</h3>
    Total Comparisons : ${comparisons}<br>
    Total Swaps : ${swaps}<br>
    Total Passes : ${passes}<br>
    Execution Time : ${execTime} ms
    `;

    log.innerHTML += "<br><b>Sorting Completed Successfully.</b>";
    document.getElementById("startBtn").disabled = false;
}