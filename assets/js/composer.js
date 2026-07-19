// composer elements
const comp_dropdown = document.getElementById("composition");
const comp_new = document.getElementById("comp-new"); // shows the create modal
const comp_createBtn = document.getElementById("createCompBtn"); // inside the create modal
const comp_delete = document.getElementById("comp-delete");
const frame_save = document.getElementById("frame-save");
const frame_update = document.getElementById("frame-update");
const add_marker = document.getElementById("add-marker");
const frame_delete = document.getElementById("frame-delete");
const frame_next = document.getElementById("frame-next");
const frame_prev = document.getElementById("frame-prev");
const timeline = document.getElementById("timeline");
const pasteFramesBtn = document.getElementById("paste-frames");
const copyFramesBtn = document.getElementById("copy-frames");
const playbackControls = document.getElementById("playback-controls");
let currentFrame = -1;
let timelineTouch = false;
let clipboard = [];


let compositions = {};

function loadCompositions() {
    if (localStorage.getItem("COMPOSITIONS") && Object.keys(JSON.parse(localStorage.getItem("COMPOSITIONS"))).length != 0) {
        compositions = JSON.parse(localStorage.getItem("COMPOSITIONS"));
        comp_dropdown.innerHTML = "";
        for (let i = Object.keys(compositions).length - 1; i > -1; i--) {
            // console.log(Object.keys(compositions)[i]);
            comp_dropdown.innerHTML += `<option value="${Object.keys(compositions)[i]}">${Object.keys(compositions)[i]}</option>`;
        }
        comp_dropdown.style.display = "inline-block";
        comp_delete.style.display = "block";
        document.getElementById("comp-export").style.display = "inline-block";
        document.getElementById("frame-actions").style.display = "block";
        playbackControls.style.display = "block";
        populateTimeline(compositions[comp_dropdown.value].frames);
    } else {
        console.log("no compositions in localStorage")
        comp_dropdown.style.display = "none";
        comp_delete.style.display = "none";
        document.getElementById("comp-export").style.display = "none";
        document.getElementById("frame-actions").style.display = "none";
        playbackControls.style.display = "none";
        timeline.innerHTML = `<div id="new-composition-message"><p>Create a new composition, or <a href=#>see an example composition</a> to get a sense of how the composer works.</p></div>`
        // prompt user to enter a name for the new composition
    }
}

loadCompositions();

function writeCompositions() {
    localStorage.setItem("COMPOSITIONS", JSON.stringify(compositions));
}

function promptForTitle() {
    document.getElementById("new-composition-modal").style.display = "block";
}

function showMarkerModal() {
    let markerName = document.getElementById("markerName");
    document.getElementById("marker-modal").style.display = "block";
    if (compositions[comp_dropdown.value].frames[currentFrame].marker) {
        markerName.value = compositions[comp_dropdown.value].frames[currentFrame].marker;
        document.getElementById("addMarkerBtn").innerText = "Update marker";
        document.querySelector("#marker-modal h2").innerText = "Edit marker";
        document.getElementById("deleteMarkerBtn").style.visibility = "visible";
    } else {
        markerName.value = "";
        document.getElementById("addMarkerBtn").innerText = "Add marker";
        document.querySelector("#marker-modal h2").innerText = "Add marker";
        document.getElementById("deleteMarkerBtn").style.visibility = "hidden";
    }
    markerName.focus();
    markerName.select();
}

function editMarker(action) {
    let markerText = document.getElementById("markerName").value;
    if (action == "delete") {
        delete compositions[comp_dropdown.value].frames[currentFrame].marker;
    } else if (!markerText) {
        document.getElementById("addMarkerError").style.visibility = "visible";
    } else {
        compositions[comp_dropdown.value].frames[currentFrame].marker = markerText;
    }
    closeModal();
    writeCompositions();
    populateTimeline(); // TODO find a lighter-weight way of doing this. populateTimeline() also selects a layout -_-
    selectFrames();
    updateFrameActionsUI();
}

function createComposition() {
    let title = document.getElementById("newCompTitle").value;
    if (!compositions[title] && title != "") {
        document.getElementById("newCompTitle").value = "";
        closeModal();
        console.log("Creating new composition...");
        compositions[title] = {
            frames: []
        };
        writeCompositions();
        loadCompositions();
        currentFrame = -1;
    } else if (compositions[title]) {
        document.getElementById("newCompError").innerHTML = "You already have a composition with this name.<br />Please choose another.";
        document.getElementById("newCompError").style.visibility = "visible";
    } else {
        document.getElementById("newCompError").innerText = "Please type a name for your composition";
        document.getElementById("newCompError").style.visibility = "visible";
    }
}

function saveFrame(position = compositions[comp_dropdown.value].frames.length) {
    let frames = compositions[comp_dropdown.value].frames;
    if (frames.length == 0) {
        compositions[comp_dropdown.value].layout = encodeLayout();
        compositions[comp_dropdown.value].layoutTitle = opt_layout.value;
    }
    if (opt_bellows == "pullpush") { // make sure the correct notes are saved, using push/pull as the default source of truth
        selection.forEach(note => {
            if (note.button % 2 == 0) {
                note.button++;
            } else {
                note.button--;
            }
        });
    }
    frames.splice(currentFrame + 1, 0, {mode: selectionMode, bellows: getSelectionBellowsInfo(), selection: [...selection]});
    writeCompositions();
    timeline.innerHTML += `<div class="composer-frame" data-position="${frames.length - 1}" data-bellows="${getSelectionBellowsInfo()}"><button>${frames.length}</button>`;
    currentFrame++; // TODO: figure out when to set currentFrame to currentFrame++ or to position arg
    selectFrames();
    scrollToCurrentFrame();
}

function updateFrame() {
    let frames = compositions[comp_dropdown.value].frames;
    frames[currentFrame].mode = selectionMode;
    frames[currentFrame].bellows = getSelectionBellowsInfo();
    frames[currentFrame].selection = [...selection];
    document.querySelector(".composer-frame.selected").dataset.bellows = getSelectionBellowsInfo();
    writeCompositions();
}

function getSelectionBellowsInfo() {
    let push = 0;
    let pull = 0;
    if (opt_bellows == "pullpush") {
        push += angloKeyboard.querySelectorAll(".bottom .selected").length;
        pull += angloKeyboard.querySelectorAll(".top .selected").length;
    } else {
        push += angloKeyboard.querySelectorAll(".top .selected").length;
        pull += angloKeyboard.querySelectorAll(".bottom .selected").length;
    }
    if (push && pull) {
        return "pushpull";
    } else if (push) {
        return "push-only";
    } else {
        return "pull-only";
    }
}

// TODO store the selected layout with the copied frames to help avoid pasting to a different layout
function copyFrames() {
    let frames = compositions[comp_dropdown.value].frames;
    let start = parseInt(timeline.querySelector(".selected").dataset.position);
    let end = parseInt(timeline.querySelector(":nth-last-child(1 of .selected)").dataset.position) + 1;
    clipboard = JSON.parse(JSON.stringify(frames.slice(start, end))); // create a deep copy of an array with objects. Avoids pasted frames getting erroneously edited
    console.log(clipboard);
    pasteFramesBtn.innerText = `Paste frames (${clipboard.length})`
    pasteFramesBtn.style.display = "inline-block";
}

function pasteFrames() {
    let position = parseInt(timeline.querySelector(".selected").dataset.position);
    let number = timeline.querySelectorAll(".selected").length > 1 ? timeline.querySelectorAll(".selected").length : 0;
    if (!number) {
        position++;
    }
    let frames = compositions[comp_dropdown.value].frames;
    console.log("splicing at position " + position + ", deleting " + number);
    let cleanFrames = JSON.parse(JSON.stringify(clipboard)); // gotta do this again in case the same frames get pasted multiple times
    frames.splice(position, number, ...cleanFrames);
    writeCompositions();
    populateTimeline();
    currentFrame = position + clipboard.length - 1;
    selectFrames();
}

function deleteFrames(confirmation) {
    console.log("In deleteFrames() ...");
    let selectedFrames = timeline.querySelectorAll(".selected");
    let frames = compositions[comp_dropdown.value].frames;
    if (selectedFrames.length > 4 && !confirmation) {
        console.log("asking for confirmation...")
        document.getElementById("delete-frames-modal").style.display = "block";
        document.querySelector("#delete-frames-modal h2").innerText = `Delete ${selectedFrames.length} frames?`;
        return;
    } else if ((selectedFrames.length > 1 && selectedFrames.length <=4) || confirmation) {
        console.log("deleting a range of frames...");
        document.getElementById("delete-frames-modal").style.display = "none";
        let position = parseInt(selectedFrames[0].dataset.position);
        console.log(`Deleting ${selectedFrames.length} frames starting at position ${position}`);
        frames.splice(position, selectedFrames.length);
        if (!frames[position + 1]) {
            currentFrame--;
        }
        populateTimeline();
        selectFrames();
    } else if (selectedFrames.length == 1) { // Handle single-frame deletes with nice animation
        let frame = selectedFrames[0];
        frame.style.cssText += "transition:width 0.2s ease 0.2s, margin-right 0.2s ease 0.2s, opacity 0.2s;";
        frame.classList.remove("selected");

        frame.style.padding = 0;
        frame.style.width = 0;
        frame.style.opacity = 0;

        if (frame.nextSibling) {
            frame.nextSibling.classList.add("selected");
            setTimeout(() => {
                frame.remove();
                frames.splice(currentFrame, 1);
                populateTimeline();
                selectFrames();
            }, "300");
        } else if (frame.previousSibling) {
            frame.previousSibling.classList.add("selected");
            currentFrame--;
            setTimeout(() => {
                frame.remove();
                frames.splice(currentFrame+1, 1);
                populateTimeline();
                selectFrames();
            }, "300");
        } else {
            setTimeout(() => {
                frame.remove();
                frames.length = 0;
                populateTimeline();
            }, "300");
        }
    }
    writeCompositions();
}

function loadFrame (index) {
    let frames = compositions[comp_dropdown.value].frames;
    selection.length = 0;
    // if (opt_layout.value == compositions[comp_dropdown.value].layout) {
    //     selectionMode = frames[index].mode;
    // }
    // setSelectionMode(); // do this instead of above 3 lines?
    if (opt_bellows == "pullpush") {
        let pullpushSelection = [];
        frames[index].selection.forEach(noteobj => {
            if (noteobj.button % 2 == 0) {
                pullpushSelection.push({"note": noteobj.note, "button": noteobj.button + 1});
            } else {
                pullpushSelection.push({"note": noteobj.note, "button": noteobj.button - 1});
            }
        });
        selection.push(...pullpushSelection);
    } else {
        selection.push(...frames[index].selection);
    }
    deselectChordButtons();
    selectConcertinaButtons();
    selectPianoKey();
    selectFrames();
    updateFrameActionsUI();
    playSelection();
}

function updateFrameActionsUI() {
    let selectedFrames = timeline.querySelectorAll(".selected");
    if (compositions[comp_dropdown.value].frames.length == 0) {
        frame_save.innerText = "Create new frame";
        timeline.innerHTML = `<div id="new-composition-message"><p>Select some concertina buttons and click "Create new frame" to get started!</p></div>`;
        playbackControls.style.display = "none";
    } else {
        playbackControls.style.display = "block";
        if (document.getElementById("new-composition-message")) {
            document.getElementById("new-composition-message").remove();
        }
    }
    if (selectedFrames.length == 0 && compositions[comp_dropdown.value].frames.length > 0) {
        frame_save.style.display = "none";
    }
    if (selectedFrames.length == 0) {
        frame_update.style.display = "none";
        add_marker.style.display = "none";
        copyFramesBtn.style.display = "none";
        frame_delete.style.display = "none";
    } else if (selectedFrames.length == 1) {
        copyFramesBtn.innerText = `Copy frame`;
        frame_delete.innerText = `Delete frame`;
        frame_save.style.display = "inline-block";
        frame_update.style.display = "inline-block";
        add_marker.style.display = "inline-block";
        copyFramesBtn.style.display = "inline-block";
        frame_delete.style.display = "inline-block";
        if (compositions[comp_dropdown.value].frames[currentFrame].marker) {
            add_marker.innerText = "Edit marker";
        } else {
            add_marker.innerText = "Add marker";
        }
        if (compositions[comp_dropdown.value].frames.length == currentFrame + 1) {
            frame_save.innerText = "Create new frame";
        } else {
            frame_save.innerText = "Insert new frame";
        }
    } else {
        copyFramesBtn.innerText = `Copy frames (${selectedFrames.length})`;
        frame_delete.innerText = `Delete frames (${selectedFrames.length})`;
        frame_delete.style.display = "inline-block";
        frame_save.style.display = "none";
        frame_update.style.display = "none";
        add_marker.style.display = "none";
    }
}
    

function loadNextFrame(select) {
    let selectionStart = currentFrame;
    if (select) {
        let selectedFrames = timeline.querySelectorAll(".composer-frame.selected");
        if (currentFrame < parseInt(selectedFrames[selectedFrames.length - 1].dataset.position)) {
            selectionStart = parseInt(selectedFrames[selectedFrames.length - 1].dataset.position);
        } else {
            selectionStart = parseInt(selectedFrames[0].dataset.position);
        }
    }
    let frames = compositions[comp_dropdown.value].frames;
    if (frames[currentFrame + 1]) {
        currentFrame++;
    } else {
        currentFrame = 0;
    }
    loadFrame(currentFrame);
    scrollToCurrentFrame();
    if (select && frames[currentFrame]) {
        selectFrameRange(selectionStart, currentFrame);
    }
    updateFrameActionsUI();
}

function loadPrevFrame(select) {
    let selectionStart = currentFrame;
    if (select) {
        let selectedFrames = timeline.querySelectorAll(".composer-frame.selected");
        if (currentFrame > parseInt(selectedFrames[0].dataset.position)) {
            selectionStart = parseInt(selectedFrames[0].dataset.position);
        } else {
            selectionStart = parseInt(selectedFrames[selectedFrames.length - 1].dataset.position);
        }
    }
    let frames = compositions[comp_dropdown.value].frames;
    if (frames[currentFrame - 1]) {
        currentFrame--;
    } else {
        currentFrame = frames.length - 1;
    }
    loadFrame(currentFrame);
    scrollToCurrentFrame();
    if (select && frames[currentFrame]) {
        selectFrameRange(selectionStart, currentFrame);
    }
    updateFrameActionsUI();
}

//TODO invoke this only when composer is shown. For now, requiring feature flag
function populateTimeline() {
    if (urlParams.composer && comp_dropdown.value) {
        let frames = compositions[comp_dropdown.value].frames;
        timeline.innerHTML = "";
        if (frames && frames.length != 0) {
            for (let i = 0; i < frames.length; i++) {
                let newFrame = `<div class="composer-frame" data-position="${i}" data-bellows="${frames[i].bellows}"><button>${i + 1}</button>`;
                if (frames[i].marker) {
                    newFrame += `<span class="marker">${frames[i].marker}</span>`;
                }
                newFrame += `</div>`;
                timeline.innerHTML += newFrame;
            }
        }
        updateFrameActionsUI();
        // opt_layout.value = compositions[comp_dropdown.value].layoutTitle;
        // selectLayout();
    } else {
        timeline.innerHTML = "";
    }
    // setSelectionMode();
}

function setSelectionMode() {
    if (composer_container.style.display == "none") {
        selectionMode = "notes";
        document.getElementById("frame-actions").style.display = "block";
        document.getElementById("layout-mismatch").style.display = "none";
    } else if (compositions[comp_dropdown.value].frames.length == 0) {
        selectionMode = "buttons";
        document.getElementById("frame-actions").style.display = "block";
        document.getElementById("layout-mismatch").style.display = "none";
    } else if (compareLayouts()) {
        selectionMode = "buttons";
        document.getElementById("frame-actions").style.display = "block";
        document.getElementById("layout-mismatch").style.display = "none";
    } else if (!compareLayouts()) {
        selectionMode = "notes";
        document.getElementById("frame-actions").style.display = "none";
        document.getElementById("layout-mismatch").style.display = "block";
    }
}

function compareLayouts() {
    // checks to see if a composition's layout matches the currently selected layout, disregarding margins
    console.log("comparing layouts...");
    if (!compositions[comp_dropdown.value].layoutTitle.includes("USER_LAYOUT_")) {
        if (compositions[comp_dropdown.value].layoutTitle == opt_layout.value) {
            console.log("Matches built-in layout");
            return true;
        } else {
            console.log("does not match built-in layout");
            return false;
        }
    } else {
        if (encodeLayout().replaceAll(/_[0-9]*_/g, "") == compositions[comp_dropdown.value].layout.replaceAll(/_[0-9]*_/g, "")) {
            console.log("matches user layout");
            return true;
        } else {
            console.log("does not match user layout");
            return false;
        }
    }
}

function confirmDelete() {
    document.getElementById("confirmDeleteCompMsg").innerText = `Do you really want to delete "${comp_dropdown.value}"?`
    document.getElementById("delete-composition-modal").style.display = "block";
}

function deleteComposition() {
    delete compositions[comp_dropdown.value];
    comp_dropdown.remove(comp_dropdown.selectedIndex);
    writeCompositions();
    closeModal();
    loadCompositions();
    if (compositions[comp_dropdown.value].layoutTitle) {
        opt_layout.value = compositions[comp_dropdown.value].layoutTitle;
        selectLayout();
    }
    setSelectionMode();
    currentFrame = -1;
    timeline.scrollLeft = 0;
}

function exportComposition() {
    let data = {};
    let fileName = "compositions.txt";
    if (document.getElementById("currentComp").checked) {
        data[comp_dropdown.value] = compositions[comp_dropdown.value];
        fileName = `${comp_dropdown.value}.txt`;
    } else {
        data = compositions;
    }
    let downloadLink = document.createElement("a");
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    let json = JSON.stringify(data);
    let blob = new Blob([json], {type: "octet/stream"});
    let url = window.URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
    downloadLink.remove();
    closeModal();
}

// TODO validate compositions when importing. Allow user to rename if duplicate exists.
function importCompositionFromFile(e) {
    e.preventDefault();
    let newComp = document.getElementById("file").files[0];
    let fileReader = new FileReader();
    fileReader.readAsText(newComp);
    fileReader.onload = () => {
        // console.log(fileReader.result);
        let compToImport = JSON.parse(fileReader.result);
        // console.log(compToImport);
        let importCount = 0;
        Object.keys(compToImport).forEach((key) => {
            if (!compositions[key]) {
                console.log("adding a composition");
                compositions[key] = compToImport[key]
                importCount++;
            } else {
                console.log("skipping import of existing composition");
            }
        });
        if (importCount) {
            writeCompositions();
            loadCompositions();
        }
        document.getElementById("file").value = "";
        closeModal();
    }
    fileReader.onerror = () => console.error(fileReader.error);
}


comp_dropdown.addEventListener("change", () => {
    populateTimeline(compositions[comp_dropdown.value].frames);
    if (compositions[comp_dropdown.value].layoutTitle) {
        opt_layout.value = compositions[comp_dropdown.value].layoutTitle;
        selectLayout();
    }
    setSelectionMode();
    currentFrame = -1;
    timeline.scrollLeft = 0;
});
document.getElementById("comp-layout-button").addEventListener("click", (e) => switchToCompLayout());
comp_createBtn.addEventListener("click", () => createComposition());
document.getElementById("comp-import").addEventListener("click", () => document.getElementById("import-compositions-modal").style.display = "block");
document.getElementById("comp-export").addEventListener("click", () => {
    document.querySelector("label[for=currentComp]").innerText = comp_dropdown.value;
    document.getElementById("export-compositions-modal").style.display = "block"
});
document.getElementById("importCompFileBtn").addEventListener("click", (e) => importCompositionFromFile(e));
document.getElementById("cancelImportCompBtn").addEventListener("click", (e) => closeModal(e));
document.getElementById("exportCompBtn").addEventListener("click", () => exportComposition());
comp_new.addEventListener("click", () => promptForTitle());
comp_delete.addEventListener("click", () => confirmDelete());
frame_save.addEventListener("click", () => saveFrame());
frame_update.addEventListener("click", () => updateFrame());
add_marker.addEventListener("click", () => showMarkerModal());
copyFramesBtn.addEventListener("click", () => copyFrames());
pasteFramesBtn.addEventListener("click", () => pasteFrames());
frame_delete.addEventListener("click", () => deleteFrames());
frame_next.addEventListener("click", () => loadNextFrame());
frame_prev.addEventListener("click", () => loadPrevFrame());

timeline.addEventListener((mobileDevice ? 'touchstart' : 'mousedown'), (e) => {
    timelineTouch = true;
    if(e.target && (e.target.nodeName == "BUTTON" || e.target.nodeName == "SPAN")) {
        setTimeout(() => {
            if (timelineTouch) {
                selectFrameRange(currentFrame, parseInt(e.target.parentNode.dataset.position));
                timelineTouch = false;
            }
        }, "400");
    }
});

timeline.addEventListener((mobileDevice ? 'touchend' : 'mouseup'), (e) => {
    if (timelineTouch) {
        timelineTouch = false;
        if(e.target && (e.target.nodeName == "BUTTON" || e.target.nodeName == "SPAN")) {
            if (!e.shiftKey) {
                currentFrame = parseInt(e.target.parentNode.dataset.position);
                loadFrame(currentFrame);
                // console.log(currentFrame);
                selectFrames();
            } else {
                selectFrameRange(currentFrame, parseInt(e.target.parentNode.dataset.position));
            }
        }
    }
});

function selectFrames() {
    [...timeline.children].forEach((frame) => {
        if (frame.dataset.position == currentFrame) {
            frame.classList.add("selected");
        } else {
            frame.classList.remove("selected");
        }
    });
    updateFrameActionsUI();
}

function selectFrameRange(start, end) {
    [...timeline.children].forEach((frame) => {
        if (start < end) {
            if (parseInt(frame.dataset.position) >= start && parseInt(frame.dataset.position) <= end) {
                frame.classList.add("selected");
            } else {
                frame.classList.remove("selected");
            }
        } else {
                if (parseInt(frame.dataset.position) <= start && parseInt(frame.dataset.position) >= end) {
                    frame.classList.add("selected");
                } else {
                    frame.classList.remove("selected");
                }
        }
    });
    updateFrameActionsUI();
}

function scrollToCurrentFrame () {
    if (currentFrame > 1) {
        let frame = timeline.children[currentFrame];
        const frameLeft = frame.offsetLeft + frame.offsetWidth;
        const frameParentLeft = frame.parentNode.offsetLeft + frame.parentNode.offsetWidth;
    
        // check if element not in view
        if (frameLeft >= frameParentLeft + frame.parentNode.scrollLeft) {
        frame.parentNode.scrollLeft = frameLeft - frameParentLeft;
        } else if (frameLeft <= frame.parentNode.offsetLeft + frame.parentNode.scrollLeft) {
        frame.parentNode.scrollLeft = frame.offsetLeft - frame.parentNode.offsetLeft;
        }
    } else {
        timeline.scrollLeft = 0;
    }
}

function switchToCompLayout() {
    console.log("switching layout");
    opt_layout.value = compositions[comp_dropdown.value].layoutTitle;
    selectLayout();
    setSelectionMode();
    if (timeline.querySelector(".selected")) {
        loadFrame(currentFrame);
    } else {
        selection.length = 0;
        updateSelection();
    }
}

// hastily-improvised feature flag.
function showComposer() {
    document.getElementById("composer-container").style.display = "block";
    document.getElementById("default-view-container").style.paddingBottom = "8rem";
    console.warn("The composer is actively being developed. Use at your own risk!")
    setSelectionMode();
}

if (urlParams.composer) {
    showComposer();
}