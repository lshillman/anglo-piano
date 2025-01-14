// composer elements
const comp_dropdown = document.getElementById("composition");
const comp_new = document.getElementById("comp-new"); // shows the create modal
const comp_createBtn = document.getElementById("createCompBtn"); // inside the create modal
const comp_delete = document.getElementById("comp-delete");
const frame_save = document.getElementById("frame-save");
const frame_update = document.getElementById("frame-update");
const frame_delete = document.getElementById("frame-delete");
const frame_next = document.getElementById("frame-next");
const frame_prev = document.getElementById("frame-prev");
const timeline = document.getElementById("timeline");


let compositions = {};

function loadCompositions() {
    if (localStorage.getItem("COMPOSITIONS") && Object.keys(JSON.parse(localStorage.getItem("COMPOSITIONS"))).length != 0) {
        compositions = JSON.parse(localStorage.getItem("COMPOSITIONS"));
        comp_dropdown.innerHTML = "";
        for (let i = Object.keys(compositions).length - 1; i > -1; i--) {
            console.log(Object.keys(compositions)[i]);
            comp_dropdown.innerHTML += `<option value="${Object.keys(compositions)[i]}">${Object.keys(compositions)[i]}</option>`;
        }
        populateTimeline(compositions[comp_dropdown.value].frames);
    } else {
        console.log("no compositions in localStorage")
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

function createComposition() {
    let title = document.getElementById("newCompTitle").value;
    if (!compositions[title] && title != "") {
        document.getElementById("newCompTitle").value = "";
        closeModal();
        console.log("Creating new composition...");
        compositions[title] = {
            layout: opt_layout.value,
            frames: []
        };
        writeCompositions();
        loadCompositions();
    } else if (compositions[title]) {
        document.getElementById("newCompError").innerHTML = "You already have a composition with this name.<br />Please choose another.";
        document.getElementById("newCompError").style.visibility = "visible";
    } else {
        document.getElementById("newCompError").innerText = "Please type a name for your composition";
        document.getElementById("newCompError").style.visibility = "visible";
    }
}

let currentFrame = -1;

function saveFrame(position = compositions[comp_dropdown.value].frames.length) {
    let frames = compositions[comp_dropdown.value].frames;
    // frames.push({bellows: opt_bellows, mode: selectionMode, selection: [...selection]});
    frames.splice(currentFrame, 0, {bellows: opt_bellows, mode: selectionMode, selection: [...selection]});
    writeCompositions();
    timeline.innerHTML += `<button class="composer-frame" data-position="${frames.length - 1}">${frames.length}</button>`
    currentFrame = position;
    selectFrames();
}

function updateFrame() {
    let frames = compositions[comp_dropdown.value].frames;
    frames[currentFrame] = {bellows: opt_bellows, mode: selectionMode, selection: [...selection]};
    writeCompositions();
}

function deleteFrame() {
    let frames = compositions[comp_dropdown.value].frames;
    let frame = document.querySelector(".composer-frame.selected");
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
            selectFrames();
          }, "300");
    }
    // frame.nextSibling && frame.nextSibling.classList.add("selected");

    writeCompositions();
}

function loadFrame (index) {
    let frames = compositions[comp_dropdown.value].frames;
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
    if (opt_layout.value == compositions[comp_dropdown.value].layout) {
        selectionMode = frames[index].mode;
    }
    selection.push(...frames[index].selection)
    deselectChordButtons();
    selectConcertinaButtons();
    selectPianoKey();
    selectFrames();
    playSelection();
}

function loadNextFrame() {
    let frames = compositions[comp_dropdown.value].frames;
    if (frames[currentFrame + 1]) {
        currentFrame++;
    } else {
        currentFrame = 0;
    }
    loadFrame(currentFrame);
    scrollToCurrentFrame();
}

function loadPrevFrame() {
    let frames = compositions[comp_dropdown.value].frames;
    if (frames[currentFrame - 1]) {
        currentFrame--;
    } else {
        currentFrame = frames.length - 1;
    }
    loadFrame(currentFrame);
    scrollToCurrentFrame();
}

function populateTimeline() {
    if (comp_dropdown.value) {
        let frames = compositions[comp_dropdown.value].frames;
        timeline.innerHTML = "";
        if (frames && frames.length != 0) {
            for (let i = 0; i < frames.length; i++) {
                timeline.innerHTML += `<button class="composer-frame" data-position="${i}">${i + 1}</button>`
            }
        }
        opt_layout.value = compositions[comp_dropdown.value].layout;
        selectLayout();
    } else {
        timeline.innerHTML = "";
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
    populateTimeline();
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
    currentFrame = -1;
    timeline.scrollLeft = 0;
});
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
frame_delete.addEventListener("click", () => deleteFrame());
frame_next.addEventListener("click", () => loadNextFrame());
frame_prev.addEventListener("click", () => loadPrevFrame());
timeline.addEventListener("click", (e) => {
    if(e.target && e.target.className.includes("composer-frame")) {
        if (!e.shiftKey) {
            currentFrame = parseInt(e.target.dataset.position);
            loadFrame(currentFrame);
            // console.log(currentFrame);
            selectFrames();
        } else {
            
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
}

function scrollToCurrentFrame () {
    if (currentFrame != -1) {
        let el = timeline.children[currentFrame];
        const elLeft = el.offsetLeft + el.offsetWidth;
        const elParentLeft = el.parentNode.offsetLeft + el.parentNode.offsetWidth;
    
        // check if element not in view
        if (elLeft >= elParentLeft + el.parentNode.scrollLeft) {
        el.parentNode.scrollLeft = elLeft - elParentLeft;
        } else if (elLeft <= el.parentNode.offsetLeft + el.parentNode.scrollLeft) {
        el.parentNode.scrollLeft = el.offsetLeft - el.parentNode.offsetLeft;
        }
    } else {
        timeline.scrollLeft = 0;
    }
}

// hastily-improvised feature flag.
function showComposer() {
    document.getElementById("composer-container").style.display = "block";
    document.getElementById("default-view-container").style.paddingBottom = "8rem";
    console.warn("The composer is actively being developed. Use at your own risk!")
}

if (window.location.href.includes("#comp=1")) {
    showComposer();
}