/**
 * @param {string} algorithm
 */
function openPage(algorithm) {
    if (!algorithm) return;
    window.location.href = `${algorithm}.html`;
}