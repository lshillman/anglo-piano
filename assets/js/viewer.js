// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// store a custom layout passed in via the URL
let customLayoutFromURL;
let customTitleFromURL;
let layoutShortcut;
let parsedLayoutFromURL = [];
let parsedWithErrors = false;

// are we on a mobile device?
let mobileDevice = false;
if (navigator.userAgent.toLowerCase().indexOf('mobile') > -1) {
    mobileDevice = true;
}

// keyboards
const keyboardContainer = document.getElementById("keyboard-container");
const keyboard = document.getElementById("keyboard");
const angloContainer = document.getElementById("anglo-container");
const angloKeyboard = document.getElementById("anglo-keyboard");

// chord bar
const chordBar = document.getElementById("chords");
const maj = document.getElementById("major");
const min = document.getElementById("minor");
const dim = document.getElementById("diminished");
const sev = document.getElementById("seventh");
const maj7 = document.getElementById("major7");
const min7 = document.getElementById("minor7");

// user-defined display options
const opt_layout = document.getElementById("layout");
// const opt_drone = document.getElementById("drone");
// const droneDiv = document.getElementById("drone-option");
const opt_pushpull = document.getElementById("pushpull");
const opt_push = document.getElementById("push");
const opt_pull = document.getElementById("pull");
let opt_bellows = ""; // stores the value of the selected bellows option from pushpull, push, or pull
const opt_sound = document.getElementById("sound");
const opt_matchoctave = document.getElementById("matchoctave");
const multiselect = document.getElementById("multiselect");
const opt_coloroctave = document.getElementById("coloroctave");
const opt_concertinaLabels = document.getElementById("concertina-labels");
const opt_pianoLabels = document.getElementById("piano-labels");
const opt_accidentals = document.getElementById("accidentals");
const opt_absentNotes = document.getElementById("absent-notes");


// modals
const aboutLink = document.getElementById("about");
var aboutModal = document.getElementById("about-modal");
var closeModalBtn = document.getElementsByClassName("close")[0];
const getLinkBtn = document.getElementById("getLinkBtn");
const keyboardShortcutsBtn = document.getElementById("keyboardShortcutsBtn");


const addToLayoutsBtn = document.getElementById("addToLayoutsBtn");
const removeFromLayoutsBtn = document.getElementById("removeFromLayoutsBtn");

// are we selecting notes or buttons? EXPERIMENTAL
let selectionMode = "notes"

// an array that contains all currently-displayed concertina buttons
let buttons = [];

// an array to keep track of all currently-displayed piano notes. Required for arrow key navigation.
const activeNotes = [];

// an array to hold the currently selected notes
const selection = [];

//an array to hold the selected buttons, if in button selection mode
const buttonSelection = [];

// the key that should be selected if the user starts using arrow keys to navigate the piano
let currentIndex = 1;

// are we viewing or editing?
let currentMode;

// anglo keyboard calculates min / max and must be rendered first
function renderPianoKeyboard(min, max, layoutnotes, pushnotes, pullnotes) {
    keyboard.innerHTML = "";
    activeNotes.length = 0;
    let allnotes = Object.keys(notes); // get an array of notes from the note object
    for (let i = min; i < max; i++) {
        let note = allnotes[i];
        let label = note;
        if (opt_accidentals.checked) {
            label = altNoteNames[note];
        }
        if (!opt_pianoLabels.checked) {
            label = "";
        }
        activeNotes.push(note);
        let noteclasses = "natural";
        if (note.includes("#") || note.includes("b")) {
            noteclasses = "sharp";
        }
        noteclasses += ` o${note.substr(-1)}`
        if (opt_absentNotes.checked) {
            if (opt_pushpull.checked && !layoutnotes.includes(note)) {
                noteclasses += " absent";
            } else if (opt_push.checked && !pushnotes.includes(note)) {
                noteclasses += " absent";
            } else if (opt_pull.checked && !pullnotes.includes(note)) {
                noteclasses += " absent";
            }
        }
        keyboard.innerHTML += `<button id="${note}" data-note="${note}" class="${noteclasses}">${label}</button>`;
    }
    currentMode = "view";
    bindPianoKeys();
    selectConcertinaButtons();
    selectPianoKey();
}


function renderAngloKeyboard() {
    let layoutnotes = [];
    let pushnotes = [];
    let pullnotes = [];
    let allnotes = Object.keys(notes);

    // droneDiv.style.display = 'none';
    angloKeyboard.innerHTML = "";
    for (button of buttons) {

        layoutnotes.push(button.push);
        layoutnotes.push(button.pull);
        // if (!(button.drone && !opt_drone.checked)) {
            pushnotes.push(button.push);
            pullnotes.push(button.pull);
        // }
        let pushLabel = button.push;
        let pullLabel = button.pull;
        if (opt_accidentals.checked) {
            pushLabel = altNoteNames[button.push];
            pullLabel = altNoteNames[button.pull];
        }
        if (!opt_concertinaLabels.checked) {
            pushLabel = "&nbsp;"; // for some reason, empty string results in layout issues on non-mac browsers
            pullLabel = "&nbsp;";
        }
        // if (button.drone) {
        //     droneDiv.style.display = 'block';
        //     droneclass = "drone";
        // }
        if (button.newRow) {
            angloKeyboard.innerHTML += `<br>`;
        }
        // if (!(button.drone && !opt_drone.checked)) {
            angloKeyboard.innerHTML += `<div class="button ${opt_bellows}" style="margin-left:${button.x}px"><div class="top ${"o" + noteNames[button.push].substr(-1)}"><button data-note="${noteNames[button.push]}">${pushLabel}</button></div><div class="bottom ${"o" + noteNames[button.pull].substr(-1)}"><button data-note="${noteNames[button.pull]}">${pullLabel}</button></div></div>`;
        // }
    }
    bindAngloButtons();

    // find the lowest and highest notes for the piano keyboard
    let min = allnotes.indexOf(layoutnotes[0]);
    let max = allnotes.indexOf(layoutnotes[0]);
    for (let i = 1; i < layoutnotes.length; i++) {
        if (allnotes.indexOf(noteNames[layoutnotes[i]]) < min) {
            min = allnotes.indexOf(noteNames[layoutnotes[i]]);
        } else if (allnotes.indexOf(noteNames[layoutnotes[i]]) > max) {
            max = allnotes.indexOf(noteNames[layoutnotes[i]]);
        }
    }
    
    // selectDrone();
    colorOctaves();
    renderPianoKeyboard(min, max + 1, layoutnotes, pushnotes, pullnotes);
}



function parseLayout(origin) {
    let layout;
    let title;
    if (origin == "url") {
        layout = customLayoutFromURL;
        title = customTitleFromURL;
    } else if (origin == "editor") {
        layout = customLayoutFromEditor;
        title = customTitleFromEditor;
    }
    let newLayout = [];
    while (layout.length > 0) {
        let x = 0;
        let push;
        let pull;
        let newRow = false;
        if (layout[0] == ".") {
            newRow = true;
            layout = layout.slice(1);
        }
        if (layout[0] == "_") {
            x = layout.substring(1, layout.indexOf('_', 1));
            layout = layout.slice(layout.indexOf('_', 1) + 1);
        }
        if (noteCodes[layout[0]] && noteCodes[layout[1]]) {
            push = noteCodes[layout[0]];
            pull = noteCodes[layout[1]];
            newLayout.push({ push, pull, x, newRow });
            layout = layout.slice(2);
        } else {
            layout = "";
            parsedWithErrors = true;
            document.getElementById("parse-error-modal").style.display = "block";
            console.error("Error while parsing layout!")
        }
    }
    if (origin == "editor") {
        addToDropdown("customFromEditor", customTitleFromEditor, "editor");
        opt_layout.value = "customFromEditor";
        parsedLayoutFromEditor = newLayout;
        buttons = parsedLayoutFromEditor;
    } else {
        if (newLayout.length > 0){
            parsedLayoutFromURL = newLayout;
            buttons = parsedLayoutFromURL;
        }
    }
    // angloKeyboard.innerHTML = "";
    // renderAngloKeyboard();
    // selectConcertinaButtons();
    return newLayout;
}


// to render layouts from the old Anglo Piano that assumed a 14-column grid
function parseLegacyLayout() {
    let layout = customLayoutFromURL;
    let newLayout = [];
    let buttonCount = 0;
    while (layout.length > 0) {
        let x;
        let push;
        let pull;
        let newRow = false;
        if (layout[0] == "_") {
            x = layout.substring(1, layout.indexOf('_', 1));
            push = noteCodes[layout.substr(layout.indexOf('_', 1) + 1, 1)];
            pull = noteCodes[layout.substr(layout.indexOf('_', 1) + 2, 1)];
            if (buttonCount % 14 === 0 && buttonCount != 0) {
                newRow = true;
            }
            newLayout.push({ push, pull, x, newRow });
            buttonCount++;
            layout = layout.slice(layout.indexOf('_', 1) + 3);
        } else if (layout[0] == ".") {
            buttonCount++;
            layout = layout.slice(2);
        } else {
            x = 0;
            push = noteCodes[layout[0]];
            pull = noteCodes[layout[1]];
            if (buttonCount % 14 === 0 && buttonCount != 0) {
                newRow = true;
            }
            newLayout.push({ push, pull, x, newRow });
            buttonCount++;
            layout = layout.slice(2);
        }
    }
    parsedLayoutFromURL = newLayout;
    buttons = parsedLayoutFromURL;
    angloKeyboard.innerHTML = "";
    renderAngloKeyboard();
    selectConcertinaButtons();
}


// This encodes the layout displayed in the viewer. Not currently used, but useful for testing
function encodeLayoutFromDOM() {
    let encodedLayout = "";
    for (element of angloKeyboard.children) {
        if (element.nodeName != "BR") {
            if (element.style.marginLeft != "0px") {
                encodedLayout += `_${element.style.marginLeft.replace("px", "")}_`
            }
            for (div of element.children) {
                for (button of div.children) {
                    encodedLayout += encoder[button.dataset.note]
                }
            }
        } else {
            encodedLayout += ".";
        }
    }
    return encodedLayout;
}

// this encodes a layout from the current buttons array
function encodeLayout() {
    let encodedLayout = "";
    for (button of buttons) {
        if (button.newRow) {
            encodedLayout += ".";
        }
        if (button.x > 0) {
            encodedLayout += `_${button.x}_`;
        }
        encodedLayout += encoder[button.push];
        encodedLayout += encoder[button.pull];
    }
    return encodedLayout;
}


function selectPianoKey() {
    for (key of keyboard.children) {
        if (selection.includes(key.dataset.note)) {
            key.classList.add("selected");
            // console.log(key);
        } else {
            key.classList.remove("selected")
        }
    }
}


function selectConcertinaButtons() {
    let noOctaveSelection = selection.map(note => note.slice(0, -1));
    if (selectionMode == "notes" || buttonSelection.length == 0) {
        for (button of angloKeyboard.children) {
            for (div of button.children) {
                for (note of div.children) {
                    if (opt_matchoctave.checked) {
                        if (selection.includes(note.dataset.note)) {
                            note.classList.add("selected");
                        } else {
                            note.classList.remove("selected");
                        }
                    } else {
                        if (noOctaveSelection.includes(note.dataset.note.slice(0, -1))) {
                            note.classList.add("selected");
                        } else {
                            note.classList.remove("selected");
                        }
                    }
                }
            }
        }
    } else if (selectionMode == "buttons") {
        let allbuttons = document.querySelectorAll("#anglo-keyboard button");
        for (let i = 0; i < allbuttons.length; i++) {
            if (buttonSelection.includes(i)) {
                allbuttons[i].classList.add("selected");
            } else {
                allbuttons[i].classList.remove("selected");
            } 
        }
    }
}

function colorOctaves() {
    if (opt_coloroctave.checked) {
        angloContainer.classList.add("pretty");
        keyboardContainer.classList.add("pretty");
    } else {
        angloContainer.classList.remove("pretty");
        keyboardContainer.classList.remove("pretty");
    }
}

function togglePushView() {
    renderAngloKeyboard();
    for (button of angloKeyboard.children) {
        button.classList.remove("pull-only");
        button.classList.add("push-only");
    }
    opt_bellows = "push-only";
}

function togglePullView() {
    renderAngloKeyboard();
    for (button of angloKeyboard.children) {
        button.classList.remove("push-only");
        button.classList.add("pull-only");
    }
    opt_bellows = "pull-only";
}

function resetView() {
    renderAngloKeyboard();
    for (button of angloKeyboard.children) {
        button.classList.remove("push-only");
        button.classList.remove("pull-only");
    }
    opt_bellows = "";
}

// function selectDrone() {
//     if (!opt_drone.checked && document.getElementsByClassName("drone")[0]) {
//         document.getElementsByClassName("drone")[0].style.display = 'none';
//     } else if (document.getElementsByClassName("drone")[0]) {
//         document.getElementsByClassName("drone")[0].style.display = 'block';
//     }
// }


function updateNoteSelection(note) {
    if (!selection.includes(note) && (multiselect.checked == true || selection.length == 0)) {
        // console.log("selecting single note");
        selection.push(note);
    } else if (!selection.includes(note)) {
        // console.log("case 2");
        selection.length = 0;
        selection.push(note);
    } else {
        // console.log("removing note");
        selection.splice(selection.indexOf(note), 1);
    }
    selectPianoKey();
    selectConcertinaButtons();
    if (selection.length > 0) {
        chordBar.style.visibility = "visible";
    } else {
        chordBar.style.visibility = "hidden";
    }
}

function updateButtonSelection(index) {
    // let allbuttons = document.querySelectorAll("#anglo-keyboard button");
    if (!buttonSelection.includes(index) && (multiselect.checked == true || buttonSelection.length == 0)) {
        buttonSelection.push(index);
    } else if (!buttonSelection.includes(index)) {
        buttonSelection.length = 0;
        buttonSelection.push(index);
    } else {
        buttonSelection.splice(buttonSelection.indexOf(index), 1);
    }
}

function deselectChordButtons() {
    for (let i = 0; i < chordBar.children.length; i++) {
        chordBar.children[i].classList.remove('selected');
    }
}

function playNote(note) {
    if (opt_sound.checked) {
        let oscillator;
        let gainNode = audioCtx.createGain(); // prerequisite for making the volume adjustable
        let freq = notes[note];
        let fullVolume = 0;
        if (selection.length) {
            fullVolume = -1 + 1 / selection.length // avoid the utter cracklefest on webkit and mobile browsers
        }
        // console.debug(note + " (" + freq + " Hz)");
        oscillator = audioCtx.createOscillator(); // create Oscillator node
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
        oscillator.connect(audioCtx.destination);
        oscillator.connect(gainNode); // connect the volume control to the oscillator
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(-1, audioCtx.currentTime); // set the volume to -1 when the note first starts playing
        gainNode.gain.linearRampToValueAtTime(fullVolume, audioCtx.currentTime + 0.01); // linearly increase to full volume in 0.1 seconds
        gainNode.gain.linearRampToValueAtTime(-1, audioCtx.currentTime + 0.5); // fade the volume all the way out in 0.5 seconds
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
}

function playSelection() {
    selection.forEach((note) => {
        playNote(note);
    });
}

function moveLeft() {
    if (currentIndex > 0 && currentMode == "view") {
        currentIndex--;
        selection.length = 0;
        updateNoteSelection(activeNotes[currentIndex]);
        playNote(activeNotes[currentIndex]);
    }
}

function moveRight() {
    if (currentIndex < activeNotes.length - 1 && currentMode == "view") {
        currentIndex++;
        selection.length = 0;
        updateNoteSelection(activeNotes[currentIndex]);
        playNote(activeNotes[currentIndex]);
    }
}

function findChord(chord) {
    selection.length = 1;
    let rootIndex;
    for (let i = 0; i < activeNotes.length; i++) {
        if (activeNotes[i] == selection[0]) {
            rootIndex = i;
            break;
        }
    }
    switch (chord) {
        case "maj":
            activeNotes[rootIndex + 4] && selection.push(activeNotes[rootIndex + 4]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            deselectChordButtons();
            maj.classList.add('selected');
            break;
        case "min":
            activeNotes[rootIndex + 3] && selection.push(activeNotes[rootIndex + 3]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            deselectChordButtons();
            min.classList.add('selected');
            break;
        case "dim":
            activeNotes[rootIndex + 3] && selection.push(activeNotes[rootIndex + 3]);
            activeNotes[rootIndex + 6] && selection.push(activeNotes[rootIndex + 6]);
            deselectChordButtons();
            dim.classList.add('selected');
            break;
        case "7":
            activeNotes[rootIndex + 4] && selection.push(activeNotes[rootIndex + 4]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            activeNotes[rootIndex + 10] && selection.push(activeNotes[rootIndex + 10]);
            deselectChordButtons();
            sev.classList.add('selected');
            break;
        case "maj7":
            activeNotes[rootIndex + 4] && selection.push(activeNotes[rootIndex + 4]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            activeNotes[rootIndex + 11] && selection.push(activeNotes[rootIndex + 11]);
            deselectChordButtons();
            maj7.classList.add('selected');
            break;
        case "min7":
            activeNotes[rootIndex + 3] && selection.push(activeNotes[rootIndex + 3]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            activeNotes[rootIndex + 10] && selection.push(activeNotes[rootIndex + 10]);
            deselectChordButtons();
            min7.classList.add('selected');
            break;
    }
    selectPianoKey();
    selectConcertinaButtons();
    playSelection();
}

function bindPianoKeys() {
    let touch = false; // helps detect long-presses
    let allkeys = document.querySelectorAll("#keyboard button");
    // allkeys.forEach((key) => key.addEventListener('click', (e) => {
    //     if (!selection.includes(e.target.dataset.note)) {
    //         playNote(e.target.dataset.note);
    //     }
    //     currentIndex = activeNotes.indexOf(e.target.dataset.note)
    //     deselectChordButtons();
    //     updateNoteSelection(e.target.dataset.note);
    // }));
    allkeys.forEach((key) => {
        key.addEventListener((mobileDevice ? 'touchstart' : 'mousedown'), (e) => {
            touch = true
            setTimeout(() => {
                if (touch) {
                    multiselect.checked = true;
                    if (!selection.includes(e.target.dataset.note)) {
                        playNote(e.target.dataset.note);
                    }
                    currentIndex = activeNotes.indexOf(e.target.dataset.note)
                    deselectChordButtons();
                    updateNoteSelection(e.target.dataset.note);
                    multiselect.checked = false;
                    touch = false;
                }
            }, "400");
        });
    });

    allkeys.forEach((key) => {
        key.addEventListener((mobileDevice ? 'touchend' : 'mouseup'), (e) => {
            if (touch) {
                touch = false;
                if (!selection.includes(e.target.dataset.note)) {
                    playNote(e.target.dataset.note);
                }
                currentIndex = activeNotes.indexOf(e.target.dataset.note)
                deselectChordButtons();
                updateNoteSelection(e.target.dataset.note);
            }
        });
    });

    allkeys.forEach((key) => {
        key.addEventListener((mobileDevice ? 'touchmove' : 'mouseout'), (e) => {
            touch = false;
        });
    });
}



function bindAngloButtons() {
    let touch = false; // helps detect long-presses
    let allbuttons = document.querySelectorAll("#anglo-keyboard button");
    // allbuttons.forEach((button) => button.addEventListener('click', (e) => {
    //     if (!selection.includes(e.target.dataset.note)) {
    //         playNote(e.target.dataset.note);
    //     }
    //     currentIndex = activeNotes.indexOf(e.target.dataset.note);
    //     deselectChordButtons();
    //     updateNoteSelection(e.target.dataset.note);
    // }));

        allbuttons.forEach((button) => button.addEventListener((mobileDevice ? 'touchstart' : 'mousedown'), (e) => {
            touch = true
            setTimeout(() => {
                if (touch) {
                    multiselect.checked = true;
                    if (!selection.includes(e.target.dataset.note)) {
                        playNote(e.target.dataset.note);
                    }
                    currentIndex = activeNotes.indexOf(e.target.dataset.note);
                    deselectChordButtons();
                    updateNoteSelection(e.target.dataset.note);
                    multiselect.checked = false;
                    touch = false
                }
            }, "400");
        }));

        allbuttons.forEach((button) => button.addEventListener((mobileDevice ? 'touchend' : 'mouseup'), (e) => {
            if (touch) {
                touch = false;
                if (!selection.includes(e.target.dataset.note)) {
                    playNote(e.target.dataset.note);
                }
                currentIndex = activeNotes.indexOf(e.target.dataset.note);
                deselectChordButtons();
                updateButtonSelection([...allbuttons].indexOf(e.target));
                updateNoteSelection(e.target.dataset.note);
            }
        }));

        allbuttons.forEach((button) => {
            button.addEventListener((mobileDevice ? 'touchmove' : 'mouseout'), (e) => {
                touch = false;
            });
        });

}


function selectLayout() {
    if (opt_layout.value == "customFromURL") {
        buttons = parsedLayoutFromURL;
        addToLayoutsBtn.style.display = "block";
        removeFromLayoutsBtn.style.display = "none";
    } else if (opt_layout.value == "customFromEditor") {
        buttons = parsedLayoutFromEditor;
    } else if (opt_layout.value.includes("USER_LAYOUT_")) {
        buttons = USER_LAYOUTS[opt_layout.value.slice(12)].layout;
        addToLayoutsBtn.style.display = "none";
        removeFromLayoutsBtn.style.display = "block";
    } else if (LAYOUTS[opt_layout.value]) {
        buttons = LAYOUTS[opt_layout.value].layout;
        addToLayoutsBtn.style.display = "none";
        removeFromLayoutsBtn.style.display = "none";
    }
    renderAngloKeyboard();
    opt_layout.blur();
}



function getUrlParams() {
    if (window.location.href.includes("#layout=")) {
        let legacyParam = window.location.href.split("#layout=")[1];
        if (legacyParam && LAYOUTS[legacyParam]) {
            layoutShortcut = legacyParam;
        } else if (legacyParam) {
            customLayoutFromURL = legacyParam;
            console.log("parsing custom legacy layout...");
            parseLegacyLayout();
            opt_layout.value = "customFromURL";
        }
    } else if (window.location.href.includes("?")) {
        let urlParam = window.location.href.split("?")[1];
        if (urlParam && LAYOUTS[urlParam]) {
            layoutShortcut = urlParam;
            console.log("selecting a hard-coded layout from new param: " + urlParam);
        } else if (urlParam && urlParam.includes("&title=")) {
            customLayoutFromURL = urlParam.split("&title=")[0];
            customTitleFromURL = decodeURI(urlParam.split("&title=")[1]);
            parseLayout("url")
            opt_layout.value = "customFromURL";
        } else if (urlParam) {
            customLayoutFromURL = urlParam;
            console.log("parsing custom new layout...");
            parseLayout("url");
            opt_layout.value = "customFromURL";
        } else {
            console.log("empty param; proceeding with default");
        }
    }
}

function addToDropdown(value, title, origin) {
        let newOption = document.createElement("option");
        // TODO logic to make sure title isn't a duplicate of a hard-coded title or one from localStorage
        newOption.value = value;
        newOption.text = title;
        if (origin == "LAYOUTS") {
            opt_layout.appendChild(newOption);
        } else if (origin == "url" || origin == "editor") {
            opt_layout.insertBefore(newOption, opt_layout.firstChild);
        }
}

function selectShareLink() {
    document.getElementById("shareLink").select();
}

opt_layout.addEventListener("change", () => {
    selectLayout();
});

getLinkBtn.onclick = function () {
    let linkField = document.getElementById("shareLink");
    if (opt_layout.value == "customFromURL") {
        let title = ""
        if (customTitleFromURL) {
            title = "&title=" + encodeURI(customTitleFromURL);
        }
        linkField.value = window.location.href.slice(0, window.location.href.lastIndexOf("/")) + "/?" + encodeLayout() + title;
    } else if (opt_layout.value.includes("USER_LAYOUT")) {
        linkField.value = USER_LAYOUTS[opt_layout.value.slice(12)].url;
    } else {
        linkField.value = window.location.href.slice(0, window.location.href.lastIndexOf("/")) + "/?" + opt_layout.value;
    }
    document.getElementById("share-modal").style.display = "block";
    linkField.focus();
    linkField.select();
}

opt_pushpull.addEventListener("change", () => {
    resetView();
});
opt_push.addEventListener("change", () => {
    togglePushView();
});
opt_pull.addEventListener("change", () => {
    togglePullView();
});

opt_matchoctave.addEventListener("change", () => {
    selectConcertinaButtons();
});

opt_coloroctave.addEventListener("change", () => {
    colorOctaves();
});

// opt_drone.addEventListener("change", () => {
//     renderAngloKeyboard();
// });

opt_concertinaLabels.addEventListener("change", () => {
    renderAngloKeyboard();
});

opt_pianoLabels.addEventListener("change", () => {
    renderAngloKeyboard();
});

opt_accidentals.addEventListener("change", () => {
    renderAngloKeyboard();
});

opt_absentNotes.addEventListener("change", () => {
    renderAngloKeyboard();
});


document.addEventListener('keydown', function (e) {
    // console.log(e.code);
    if (e.code.indexOf('Shift') != -1) {
        multiselect.checked = true;
    } else if (e.code == "ArrowRight") {
        deselectChordButtons();
        moveRight();
    } else if (e.code == "ArrowLeft") {
        deselectChordButtons();
        moveLeft();
    } else if (e.code == "Escape") {
        closeModal();
    } else if (e.code == "Digit1" && currentMode == "view") {
        findChord('maj');
    } else if (e.code == "Digit2" && currentMode == "view") {
        findChord('min');
    } else if (e.code == "Digit3" && currentMode == "view") {
        findChord('dim');
    } else if (e.code == "Digit4" && currentMode == "view") {
        findChord('7');
    } else if (e.code == "Digit5" && currentMode == "view") {
        findChord('maj7');
    } else if (e.code == "Digit6" && currentMode == "view") {
        findChord('min7');
    }
})

document.addEventListener('keyup', function (e) {
    if (e.code.indexOf('Shift') != -1) {
        multiselect.checked = false;
    }
});


addToLayoutsBtn.onclick = function () {
    let newLayoutName = document.getElementById("newLayoutName");
    newLayoutName.value = customTitleFromURL || "";
    document.getElementById("add-modal").style.display = "block";
    newLayoutName.focus();
    newLayoutName.select();
    
}

removeFromLayoutsBtn.onclick = function () {
    document.getElementById("confirmRemoveMsg").innerText = `Do you really want to remove "${opt_layout.value.slice(12)}" from your layouts?`
    document.getElementById("remove-modal").style.display = "block";
}

function copyToClipboard() {
    var shareLink = document.getElementById("shareLink");
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(shareLink.value);
    document.getElementById("copySuccessMsg").style.visibility = "visible";
  }


// about modal
about.onclick = function () {
    aboutModal.style.display = "block";
}

keyboardShortcutsBtn.onclick = function () {
    document.getElementById("keyboard-shortcuts-modal").style.display = "block";
}

function closeModal() {
    [...document.getElementsByClassName("modal")].forEach((element) => element.style.display = "none");
    [...document.querySelectorAll(".modal .error-text")].forEach((element) => element.style.visibility = "hidden");
    [...document.querySelectorAll(".modal .success-text")].forEach((element) => element.style.visibility = "hidden");
}

closeModalBtn.onclick = function () {
    aboutModal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target.className == "modal") {
        closeModal();
    }
}



// If we don't have layouts from URL params or localStorage, build a simple dropdown. If we have URL params or locally-stored layouts, create optgroups.
function buildLayoutDropdown() {
    opt_layout.innerHTML = "";
    if (!customLayoutFromURL && (!localStorage.getItem("USER_LAYOUTS") || Object.keys(JSON.parse(localStorage.getItem("USER_LAYOUTS"))).length == 0)) {
        for (layout of Object.keys(LAYOUTS)) {
            addToDropdown(layout, LAYOUTS[layout].title, "LAYOUTS");
        }
        if (layoutShortcut) {
            opt_layout.value = layoutShortcut;
        }
        selectLayout();
        return;
    }
    if (customLayoutFromURL) {
        // create optgroup "Shared via URL"
        if (!layoutShortcut) {
            let urlGroup = document.createElement("optgroup");
            urlGroup.label = "Shared via link";
            opt_layout.appendChild(urlGroup);

            let urlOption = document.createElement("option");
            urlOption.value = "customFromURL";
            urlOption.text = customTitleFromURL || "Untitled layout";
            urlGroup.appendChild(urlOption);
        }
    }
    if (localStorage.getItem("USER_LAYOUTS") && !!Object.keys(JSON.parse(localStorage.getItem("USER_LAYOUTS"))).length) {
        //create optgroup "Your layouts"
        USER_LAYOUTS = JSON.parse(localStorage.getItem("USER_LAYOUTS"));
        let userGroup = document.createElement("optgroup");
        userGroup.label = "Your layouts";
        opt_layout.appendChild(userGroup);
        for (layout of Object.keys(USER_LAYOUTS)) {
            let usrOption = document.createElement("option");
            usrOption.value = "USER_LAYOUT_" + layout;
            usrOption.text = layout;
            userGroup.insertBefore(usrOption, userGroup.firstChild);
            //addToDropdown(layout, LAYOUTS[layout].title, "LAYOUTS");
        }
        
    }
    let standardGroup = document.createElement("optgroup");
    standardGroup.label = "Standard layouts";
    opt_layout.appendChild(standardGroup);
    for (layout of Object.keys(LAYOUTS)) {
        let stdOption = document.createElement("option");
        stdOption.value = layout;
        stdOption.text = LAYOUTS[layout].title;
        standardGroup.appendChild(stdOption);
        //addToDropdown(layout, LAYOUTS[layout].title, "LAYOUTS");
    }
    if (layoutShortcut) {
        opt_layout.value = layoutShortcut;
    } else if (customLayoutFromURL) {
        opt_layout.value = "customFromURL";
    } else if (Object.keys(USER_LAYOUTS)[0]) {
        opt_layout.value = "USER_LAYOUT_" + Object.keys(USER_LAYOUTS)[Object.keys(USER_LAYOUTS).length-1];
    }
    selectLayout();
}

function removeUserLayout() {
    delete USER_LAYOUTS[opt_layout.value.slice(12)];
    localStorage.setItem("USER_LAYOUTS", JSON.stringify(USER_LAYOUTS));
    closeModal();
    buildLayoutDropdown();
}

// currently, this is only used to add a layout shared via a link to the user's locally-stored layouts. Layouts the user edits handle this a different way.
function addUserLayout() {
    let newName = document.getElementById("newLayoutName").value;
    if (newName.trim() && !USER_LAYOUTS[newName]) {
        let url = window.location.href.slice(0, window.location.href.lastIndexOf("/")) + "/?" + encodeLayout() + "&title=" + encodeURI(newName.trim());
        USER_LAYOUTS[newName] = {layout: buttons, url};
        localStorage.setItem("USER_LAYOUTS", JSON.stringify(USER_LAYOUTS));
        document.getElementById("addLayoutError").style.display = "visible";
        closeModal();
        buildLayoutDropdown();
        opt_layout.value = "USER_LAYOUT_" + newName;
        selectLayout();
    } else if (!newName.trim()) {
        let error = document.getElementById("addLayoutError");
        error.innerHTML = "Please enter a name for this layout";
        error.style.visibility = "visible";
    } else if (USER_LAYOUTS[newName.trim()]) {
        let error = document.getElementById("addLayoutError");
        error.innerHTML = "You already have a layout with this name.<br>Please choose another.";
        error.style.visibility = "visible";
    }
}


// stuff to do when the page is loaded
function init() {
    if (!mobileDevice) {
        keyboardShortcutsBtn.style.display = "block"
        document.querySelector('[for="multiselect"]').innerText = "Select multiple notes [shift]";
    }
    getUrlParams();
    buildLayoutDropdown();
}

init();
