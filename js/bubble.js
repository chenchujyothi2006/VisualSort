/**
 * VisualSort - Bubble Sort Engine
 */

// State tracking variables
let array = [];
let isSorting = false;
let isPaused = false;
let delay = 400; // Default medium speed in milliseconds

// DOM Elements
const arrayContainer = document.getElementById("array-container");
const inputField = document.getElementById("array-input");
const sizeInput = document.getElementById("array-size");
const speedSelect = document.getElementById("speed");

// Helper delay timer supporting dynamic Pause & Resume operations
function sleep(ms) {
    return new Promise((resolve) => {
        const check = () => {
            if (!isPaused) {
                setTimeout(resolve, ms);
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// 1. Pseudocode Line Highlighting Helper
function highlightCode(lineNum) {
    const lines = document.querySelectorAll(".pseudocode p");
    lines.forEach((line) => line.classList.remove("active"));

    if (lineNum > 0) {
        const activeLine = document.getElementById(`line-${lineNum}`);
        if (activeLine) activeLine.classList.add("active");
    }
}

// 2. Parse Space/Comma Separated Input Array
function parseInput() {
    if (!inputField) return [];
    const rawVal = inputField.value.trim();
    if (!rawVal) return [];

    return rawVal
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));
}

// 3. Render Array Bars dynamically inside the Visualization Box
function renderArray(arr = array) {
    if (!arrayContainer) return;
    arrayContainer.innerHTML = "";

    const maxVal = Math.max(...arr, 1);

    arr.forEach((value) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");

        // Scale bar height dynamically between 15% and 90%
        const heightPercent = Math.min((value / maxVal) * 75 + 15, 95);
        bar.style.height = `${heightPercent}%`;
        bar.innerText = value;

        arrayContainer.appendChild(bar);
    });
}

// 4. Generate Random Array
function generateRandomArray() {
    if (isSorting) return;
    const size = 5;
    const randomArr = Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1);
    
    inputField.value = randomArr.join(" ");
    array = randomArr;
    if (sizeInput) sizeInput.value = array.length;
    renderArray(array);
}

// 5. Bubble Sort Core Visualization
async function bubbleSort() {
    isSorting = true;
    isPaused = false;

    let bars = document.querySelectorAll(".bar");
    let n = array.length;

    highlightCode(1);
    await sleep(delay);

    highlightCode(2);
    await sleep(delay);

    for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;

        highlightCode(3);
        await sleep(delay);

        for (let j = 0; j < n - i - 1; j++) {
            if (!isSorting) return;

            highlightCode(4);

            // Set state to Comparing (Yellow)
            bars[j].classList.add("comparing");
            bars[j + 1].classList.add("comparing");
            await sleep(delay);

            highlightCode(5);
            await sleep(delay);

            if (array[j] > array[j + 1]) {
                highlightCode(6);

                // Set state to Swapping (Red)
                bars[j].classList.remove("comparing");
                bars[j + 1].classList.remove("comparing");
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");
                await sleep(delay);

                // Swap in-memory state
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                // Re-render DOM elements & maintain colors
                renderArray(array);
                bars = document.querySelectorAll(".bar");
                bars[j].classList.add("swapping");
                bars[j + 1].classList.add("swapping");
                await sleep(delay);
            }

            // Clear operational colors back to default
            bars[j].classList.remove("comparing", "swapping");
            bars[j + 1].classList.remove("comparing", "swapping");
        }

        highlightCode(7);
        // Mark current element as Sorted (Green)
        bars[n - i - 1].classList.add("sorted");
    }

    // Mark remaining first element as sorted
    if (bars[0]) bars[0].classList.add("sorted");
    highlightCode(0);
    isSorting = false;
}

// 6. Interactive Controls Listener Attachments
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
        }
    });
}

function startSorting() {
    if (isSorting && isPaused) {
        isPaused = false;
        return;
    }
    if (!isSorting) {
        array = parseInput();
        if (array.length === 0) return;
        bubbleSort();
    }
}

function pauseSorting() {
    if (isSorting) isPaused = true;
}

function resumeSorting() {
    if (isSorting && isPaused) isPaused = false;
}

function resetVisualizer() {
    isSorting = false;
    isPaused = false;
    array = parseInput();
    renderArray(array);
    highlightCode(0);
}

// Initial rendering on page launch
document.addEventListener("DOMContentLoaded", () => {
    array = parseInput();
    renderArray(array);
});
