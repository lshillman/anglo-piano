// are we selecting notes or buttons? EXPERIMENTAL
let selectionMode = "notes"

// sequencer elements
const seq_dropdown = document.getElementById("sequence");
const seq_new = document.getElementById("seq-new"); // shows the create modal
const seq_createBtn = document.getElementById("createSequenceBtn"); // inside the create modal
const seq_delete = document.getElementById("seq-delete");
const frame_save = document.getElementById("frame-save");
const frame_update = document.getElementById("frame-update");
const frame_delete = document.getElementById("frame-delete");
const frame_next = document.getElementById("frame-next");
const frame_prev = document.getElementById("frame-prev");
const timeline = document.getElementById("timeline");


let sequences = {};

function loadSequences() {
    if (localStorage.getItem("SEQUENCES") && Object.keys(JSON.parse(localStorage.getItem("SEQUENCES"))).length != 0) {
        sequences = JSON.parse(localStorage.getItem("SEQUENCES"));
        seq_dropdown.innerHTML = "";
        Object.keys(sequences).forEach((key) => {
            console.log(key);
            seq_dropdown.innerHTML += `<option value="${key}">${key}</option>`;
        });
        populateTimeline(sequences[seq_dropdown.value].frames);
    } else {
        console.log("localStorage is empty")
        // prompt user to enter a name for the new sequence
    }
}

loadSequences();

function writeSequences() {
    localStorage.setItem("SEQUENCES", JSON.stringify(sequences));
}

function promptForTitle() {
    document.getElementById("new-sequence-modal").style.display = "block";
}

function createSequence() {
    let title = document.getElementById("newSequenceTitle").value;
    if (!sequences[title]) {
        document.getElementById("new-sequence-modal").style.display = "none";
        console.log("Creating new sequence...");
        sequences[title] = {
            layout: opt_layout.value,
            frames: []
        };
        writeSequences();
        loadSequences();
    }
}

let currentSelection = -1;

function saveSelection(position = sequences[seq_dropdown.value].frames.length) {
    let frames = sequences[seq_dropdown.value].frames;
    frames.push({bellows: opt_bellows, mode: selectionMode, notes: [...selection], buttons: [...buttonSelection]});
    writeSequences();
    timeline.innerHTML += `<div class="sequencer-frame" data-position="${frames.length - 1}">${frames.length}</div>`
    currentSelection = position;
    updateSelectedFrames();
}

function updateSelection() {
    let frames = sequences[seq_dropdown.value].frames;
    frames[currentSelection] = {bellows: opt_bellows, mode: selectionMode, notes: [...selection], buttons: [...buttonSelection]};
}

function loadSelection (index) {
    let frames = sequences[seq_dropdown.value].frames;
    if (frames[index].bellows == "pushpull") {
        opt_pushpull.checked = true;
        resetView();
    } else if (frames[index].bellows == "push-only") {
        opt_push.checked = true;
        togglePushView();
    } else if (frames[index].bellows == "pull-only") {
        opt_pull.checked = true;
        togglePullView();
    }
    selection.length = 0;
    buttonSelection.length = 0;
    selectionMode = frames[index].mode;
    buttonSelection.push(...frames[index].buttons)
    selection.push(...frames[index].notes);
    deselectChordButtons();
    selectConcertinaButtons();
    selectPianoKey();
    updateSelectedFrames();
    playSelection();
}

function loadNextSelection() {
    let frames = sequences[seq_dropdown.value].frames;
    if (frames[currentSelection + 1]) {
        currentSelection++;
        loadSelection(currentSelection);
    } else {
        currentSelection = -1;
    }
    scrollToCurrentSelection();
}

function loadPrevSelection() {
    let frames = sequences[seq_dropdown.value].frames;
    if (frames[currentSelection - 1]) {
        currentSelection--;
        loadSelection(currentSelection);
    } else {
        currentSelection = -1;
    }
    scrollToCurrentSelection();
}

function populateTimeline() {
    if (seq_dropdown.value) {
        let frames = sequences[seq_dropdown.value].frames;
        timeline.innerHTML = "";
        if (frames && frames.length != 0) {
            for (let i = 0; i < frames.length; i++) {
                timeline.innerHTML += `<div class="sequencer-frame" data-position="${i}">${i + 1}</div>`
            }
        }
    } else {
        timeline.innerHTML = "";
    }
}

function confirmDelete() {
    document.getElementById("confirmDeleteSequenceMsg").innerText = `Do you really want to delete "${seq_dropdown.value}"?`
    document.getElementById("delete-sequence-modal").style.display = "block";
}

function deleteSequence() {
    delete sequences[seq_dropdown.value];
    seq_dropdown.remove(seq_dropdown.selectedIndex);
    writeSequences();
    closeModal();
    populateTimeline();
}


seq_dropdown.addEventListener("change", () => {
    populateTimeline(sequences[seq_dropdown.value].frames);
});
seq_createBtn.addEventListener("click", () => createSequence());
seq_new.addEventListener("click", () => promptForTitle());
seq_delete.addEventListener("click", () => confirmDelete());
frame_save.addEventListener("click", () => saveSelection());
frame_update.addEventListener("click", () => updateSelection());
frame_delete.addEventListener("click", () => deleteSelection());
frame_next.addEventListener("click", () => loadNextSelection());
frame_prev.addEventListener("click", () => loadPrevSelection());
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