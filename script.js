// Logic for the Seasonal Passphrase Generator

// How long the copy button shows its "Copied!" feedback
const COPY_FEEDBACK_MS = 2000;

const seasonSelect = document.getElementById("season");
const wordCountInput = document.getElementById("word-count");
const wordCountValue = document.getElementById("word-count-value");
const separatorSelect = document.getElementById("separator");
const capitalizeCheckbox = document.getElementById("capitalize");
const generateBtn = document.getElementById("generate-btn");
const resultBox = document.getElementById("result");
const output = document.getElementById("passphrase");
const copyBtn = document.getElementById("copy-btn");

let wordBank = {};
let copyFeedbackTimer;

// Show a status message (not a passphrase) in the result box
function showMessage(message) {
  output.textContent = message;
  copyBtn.hidden = true;
  resultBox.hidden = false;
}

// Load the seasonal word lists
fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    wordBank = data;
  })
  .catch(() => {
    showMessage("Could not load words.json");
  });

// Pick a random index using the browser's secure random number generator
function randomIndex(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Combine all sub-theme lists for a season into one list of unique words
function getWordPool(season) {
  return [...new Set(Object.values(wordBank[season]).flat())];
}

function generatePassphrase(words, wordCount, separator, shouldCapitalize) {
  // Shuffle just enough of the list to pick wordCount distinct words
  for (let i = 0; i < wordCount; i++) {
    const j = i + randomIndex(words.length - i);
    [words[i], words[j]] = [words[j], words[i]];
  }

  let chosen = words.slice(0, wordCount);

  if (shouldCapitalize) {
    chosen = chosen.map(capitalize);
  }

  return chosen.join(separator);
}

// Put the copy button back to its normal state
function resetCopyButton() {
  clearTimeout(copyFeedbackTimer);
  copyBtn.textContent = "Copy";
}

// Remove the generated passphrase
function clearResult() {
  output.textContent = "";
  resultBox.hidden = true;
  resetCopyButton();
}

copyBtn.addEventListener("click", () => {
  navigator.clipboard
    .writeText(output.textContent)
    .then(() => {
      copyBtn.textContent = "✓ Copied!";
    })
    .catch(() => {
      copyBtn.textContent = "Copy failed";
    })
    .finally(() => {
      clearTimeout(copyFeedbackTimer);
      copyFeedbackTimer = setTimeout(resetCopyButton, COPY_FEEDBACK_MS);
    });
});

// Switch the page's color palette to match the selected season
function applySeasonTheme() {
  document.body.dataset.season = seasonSelect.value;
}

seasonSelect.addEventListener("change", () => {
  applySeasonTheme();
  clearResult();
});
applySeasonTheme();

// Show the current word count next to the slider
function updateWordCountDisplay() {
  wordCountValue.textContent = wordCountInput.value;
}

wordCountInput.addEventListener("input", updateWordCountDisplay);
updateWordCountDisplay();

generateBtn.addEventListener("click", () => {
  const season = seasonSelect.value;

  if (!wordBank[season]) {
    showMessage("Word lists are still loading...");
    return;
  }

  output.textContent = generatePassphrase(
    getWordPool(season),
    Number(wordCountInput.value),
    separatorSelect.value,
    capitalizeCheckbox.checked
  );

  resetCopyButton();
  copyBtn.hidden = false;
  resultBox.hidden = false;
});
