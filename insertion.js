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

const INSERTION_PSEUDOCODE = [
    "for i = 1 to N - 1 do",
    "  key = arr[i]",
    "  j = i - 1",
    "  while j >= 0 and arr[j] > key do",
    "    arr[j + 1] = arr[j]",
    "    j = j - 1",
    "  arr[j + 1] = key"
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
    loadPseudocode(INSERTION_PSEUDOCODE);

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
    bars[0].classList.add("sorted");

    for (let i = 1; i < arr.length; i++) {
        await checkPause();
        highlightLine(0);

        let key = arr[i];
        highlightLine(1);

        let j = i - 1;
        highlightLine(2);

        passes++;
        document.getElementById("passes").innerText = passes;

        renderPointers({ [i]: { label: "key", type: "pivot-tag" }, [j]: { label: "j" } });
        bars[i].classList.add("swapping");

        tutor.innerHTML = `
        <b>Pass ${passes}</b><br><br>
        Key Element: <b>${key}</b><br><br>
        Inserting into sorted portion.
        `;

        log.innerHTML += `<b>PASS ${passes}</b><br>Key = ${key}<br>`;
        await sleep(animationSpeed);

        while (j >= 0 && arr[j] > key) {
            await checkPause();
            highlightLine(3);

            comparisons++;
            document.getElementById("comparisons").innerText = comparisons;

            renderPointers({ [i]: { label: "key", type: "pivot-tag" }, [j]: { label: "j" } });
            bars[j].classList.add("comparing");

            tutor.innerHTML = `
            <b>Comparing</b><br><br>
            ${arr[j]} > ${key}. Shifting ${arr[j]} to index ${j + 1}.
            `;

            log.innerHTML += `Compare ${arr[j]} and ${key}<br>`;
            await sleep(animationSpeed);

            highlightLine(4);
            arr[j + 1] = arr[j];
            swaps++;
            document.getElementById("swaps").innerText = swaps;

            bars[j + 1].style.height = arr[j + 1] * 15 + "px";
            bars[j + 1].innerHTML = `<span>${arr[j + 1]}</span>`;

            log.innerHTML += `Shift ${arr[j]} to index ${j + 1}<br>`;
            bars[j].classList.remove("comparing");

            highlightLine(5);
            j--;
            await sleep(animationSpeed);
        }

        highlightLine(6);
        arr[j + 1] = key;
        bars[j + 1].style.height = key * 15 + "px";
        bars[j + 1].innerHTML = `<span>${key}</span>`;

        tutor.innerHTML = `<b>Insert Key</b><br><br>${key} inserted at index <b>${j + 1}</b>.`;
        log.innerHTML += `Insert ${key} at index ${j + 1}<br><hr>`;

        bars.forEach((bar, index) => {
            if (index <= i) {
                bar.classList.remove("comparing", "swapping");
                bar.classList.add("sorted");
            }
        });

        await sleep(animationSpeed);
    }

    renderPointers();
    highlightLine(-1);

    let endTime = performance.now();
    let execTime = Math.round(endTime - startTime);
    document.getElementById("executionTime").innerText = execTime + " ms";

    tutor.innerHTML = `
    <h3>🎉 Insertion Sort Completed</h3><br>
    <b>Total Comparisons :</b> ${comparisons}<br>
    <b>Total Shifts :</b> ${swaps}<br>
    <b>Total Passes :</b> ${passes}<br>
    <b>Execution Time :</b> ${execTime} ms
    `;

    log.innerHTML += `<br><b>Sorting Completed Successfully.</b>`;
    document.getElementById("startBtn").disabled = false;
}