// are we selecting notes or buttons? EXPERIMENTAL
let selectionMode = "notes"

// sequencer
const seq_save = document.getElementById("seq-save");
const seq_update = document.getElementById("seq-update");
const seq_delete = document.getElementById("seq-delete");
const seq_next = document.getElementById("seq-next");
const seq_prev = document.getElementById("seq-prev");
const timeline = document.getElementById("timeline");



// save selections (experimental)

const selectedSequence = document.getElementById("sequence");
let sequences = {};
function loadSequences() {
    if (localStorage.getItem("SEQUENCES")) {
        sequences = JSON.parse(localStorage.getItem("SEQUENCES"));
    }
}

function writeSequences() {
    localStorage.setItem("SEQUENCES", JSON.stringify(sequences));
}

function createSequence(title) {
    if (!sequences[title]) {
        console.log("Creating new sequence...");
        sequences[title] = {layout: opt_layout.value};
        writeSequences();
    }
}

let savedSelections = []; // to be replaced by sequences[title].frames
let currentSelection = -1;

function saveSelection(position = savedSelections.length) {
    savedSelections.push({bellows: opt_bellows, mode: selectionMode, notes: [...selection], buttons: [...buttonSelection]});
    timeline.innerHTML += `<div class="sequencer-frame" data-position="${savedSelections.length - 1}">${savedSelections.length}</div>`
    currentSelection = position;
    updateSelectedFrames();
}

function updateSelection() {
    savedSelections[currentSelection] = {bellows: opt_bellows, mode: selectionMode, notes: [...selection], buttons: [...buttonSelection]};
}

function loadSelection (index) {
    if (savedSelections[index].bellows == "pushpull") {
        opt_pushpull.checked = true;
        resetView();
    } else if (savedSelections[index].bellows == "push-only") {
        opt_push.checked = true;
        togglePushView();
    } else if (savedSelections[index].bellows == "pull-only") {
        opt_pull.checked = true;
        togglePullView();
    }
    selection.length = 0;
    buttonSelection.length = 0;
    selectionMode = savedSelections[index].mode;
    buttonSelection.push(...savedSelections[index].buttons)
    selection.push(...savedSelections[index].notes);
    deselectChordButtons();
    selectConcertinaButtons();
    selectPianoKey();
    updateSelectedFrames();
    playSelection();
}

function loadNextSelection() {
    if (savedSelections[currentSelection + 1]) {
        currentSelection++;
        loadSelection(currentSelection);
    } else {
        currentSelection = -1;
    }
    scrollToCurrentSelection();
}

function loadPrevSelection() {
    if (savedSelections[currentSelection - 1]) {
        currentSelection--;
        loadSelection(currentSelection);
    } else {
        currentSelection = -1;
    }
    scrollToCurrentSelection();
}

function loadSequence() {
    timeline.innerHTML = "";
    for (let i = 0; i < savedSelections.length; i++) {
        timeline.innerHTML += `<div class="sequencer-frame" data-position="${i}">${i + 1}</div>`
    }
}


seq_save.addEventListener("click", () => saveSelection());
seq_update.addEventListener("click", () => updateSelection());
seq_delete.addEventListener("click", () => deleteSelection());
seq_next.addEventListener("click", () => loadNextSelection());
seq_prev.addEventListener("click", () => loadPrevSelection());
timeline.addEventListener("click", (e) => {
    if(e.target && e.target.className.includes("sequencer-frame")) {
        currentSelection = parseInt(e.target.dataset.position);
        loadSelection(currentSelection);
        console.log(currentSelection);
        updateSelectedFrames();
    }
});

function updateSelectedFrames() {
    [...timeline.children].forEach((frame) => {
        if (frame.dataset.position == currentSelection) {
            frame.classList.add("selected");
        } else {
            frame.classList.remove("selected");
        }
    });
}

function scrollToCurrentSelection () {
    let el = timeline.children[currentSelection];
    const elLeft = el.offsetLeft + el.offsetWidth;
    const elParentLeft = el.parentNode.offsetLeft + el.parentNode.offsetWidth;
  
    // check if element not in view
    if (elLeft >= elParentLeft + el.parentNode.scrollLeft) {
      el.parentNode.scrollLeft = elLeft - elParentLeft;
    } else if (elLeft <= el.parentNode.offsetLeft + el.parentNode.scrollLeft) {
      el.parentNode.scrollLeft = el.offsetLeft - el.parentNode.offsetLeft;
    }
  }