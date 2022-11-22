
const keyboardContainer = document.getElementById("keyboard-container");
const keyboard = $('#keyboard');
const angloContainer = document.getElementById("anglo-container");
const angloKeyboard = $('#anglo-keyboard');
const multiselect = document.getElementById("multiselect");
const chordBar = document.getElementById("chords");

const maj = document.getElementById("major");
const min = document.getElementById("minor");
const dim = document.getElementById("diminished");
const sev = document.getElementById("seventh");
const maj7 = document.getElementById("major7");
const min7 = document.getElementById("minor7");

const layout = document.getElementById("layout");

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let customFromURL = window.location.href.split('?')[1];

let opt_bellows = "";
let opt_coloroctave = document.getElementById("coloroctave");


// note frequencies in HZ
const notes = {
    "D2": 73.42, "D#2": 77.78, "E2": 82.41, "F2": 87.31, "F#2": 92.5, "G2": 98, "G#2": 103.83, "A2": 110, "A#2": 116.54, "B2": 123.47, "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185, "G3": 196, "G#3": 207.65, "A3": 220, "A#3": 233.08, "B3": 246.94, "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392, "G#4": 415.3, "A4": 440, "A#4": 466.16, "B4": 493.88, "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880, "A#5": 932.33, "B5": 987.77, "C6": 1046.5, "C#6": 1108.73, "D6": 1174.66, "D#6": 1244.51, "E6": 1318.51, "F6": 1396.91, "F#6": 1479.98, "G6": 1567.98, "G#6": 1661.22, "A6": 1760, "A#6": 1864.66, "B6": 1975.53, "C7": 2093, "C#7": 2217.46, "D7": 2349.32
};

const noteNames = {
    "A0": "A0", "A#0": "A#0", "B0": "B0", "C0": "C0", "C1": "C1", "C#1": "C#1", "D1": "D1", "D#1": "D#1", "E1": "E1", "F1": "F1", "F#1": "F#1", "G1": "G1", "G#1": "G#1", "A1": "A1", "A#1": "A#1", "B1": "B1", "C2": "C2", "C#2": "C#2", "D2": "D2", "D#2": "D#2", "E2": "E2", "F2": "F2", "F#2": "F#2", "G2": "G2", "G#2": "G#2", "A2": "A2", "A#2": "A#2", "B2": "B2", "C3": "C3", "C#3": "C#3", "D3": "D3", "D#3": "D#3", "E3": "E3", "F3": "F3", "F#3": "F#3", "G3": "G3", "G#3": "G#3", "A3": "A3", "A#3": "A#3", "B3": "B3", "C4": "C4", "C#4": "C#4", "D4": "D4", "D#4": "D#4", "E4": "E4", "F4": "F4", "F#4": "F#4", "G4": "G4", "G#4": "G#4", "A4": "A4", "A#4": "A#4", "B4": "B4", "C5": "C5", "C#5": "C#5", "D5": "D5", "D#5": "D#5", "E5": "E5", "F5": "F5", "F#5": "F#5", "G5": "G5", "G#5": "G#5", "A5": "A5", "A#5": "A#5", "B5": "B5", "C6": "C6", "C#6": "C#6", "D6": "D6", "D#6": "D#6", "E6": "E6", "F6": "F6", "F#6": "F#6", "G6": "G6", "G#6": "G#6", "A6": "A6", "A#6": "A#6", "B6": "B6", "C7": "C7", "C#7": "C#7", "D7": "D7", "D#7": "D#7", "E7": "E7", "F7": "F7", "F#7": "F#7", "G7": "G7", "G#7": "G#7", "A7": "A7", "A#7": "A#7", "B7": "B7", "C8": "C8", "Bb0": "A#0", "Db1": "C#1", "Eb1": "D#1", "Gb1": "F#1", "Ab1": "G#1", "Bb1": "A#1", "Db2": "C#2", "Eb2": "D#2", "Gb2": "F#2", "Ab2": "G#2", "Bb2": "A#2", "Db3": "C#3", "Eb3": "D#3", "Gb3": "F#3", "Ab3": "G#3", "Bb3": "A#3", "Db4": "C#4", "Eb4": "D#4", "Gb4": "F#4", "Ab4": "G#4", "Bb4": "A#4", "Db5": "C#5", "Eb5": "D#5", "Gb5": "F#5", "Ab5": "G#5", "Bb5": "A#5", "Db6": "C#6", "Eb6": "D#6", "Gb6": "F#6", "Ab6": "G#6", "Bb6": "A#6", "Db7": "C#7", "Eb7": "D#7", "Gb7": "F#7", "Ab7": "G#7", "Bb7": "A#7"
};

const noteCodes = {
    "6": "D2", "7": "D#2", "8": "E2", "9": "F2", "0": "F#2", "A": "G2", "a": "G#2", "B": "A2", "b": "Bb2", "C": "B2", "c": "C3", "D": "C#3", "d": "D3", "E": "D#3", "e": "E3", "F": "F3", "f": "F#3", "G": "G3", "g": "G#3", "H": "A3", "h": "Bb3", "I": "B3", "i": "C4", "J": "C#4", "j": "D4", "K": "D#4", "k": "E4", "L": "F4", "l": "F#4", "M": "G4", "m": "G#4", "N": "A4", "n": "Bb4", "O": "B4", "o": "C5", "P": "C#5", "p": "D5", "Q": "D#5", "q": "E5", "R": "F5", "r": "F#5", "S": "G5", "s": "G#5", "T": "A5", "t": "Bb5", "U": "B5", "u": "C6", "V": "C#6", "v": "D6", "W": "D#6", "w": "E6", "X": "F6", "x": "F#6", "Y": "G6", "y": "G#6", "Z": "A6", "z": "Bb6", "1": "B6", "2": "C7", "3": "C#7", "4": "D7"
};

const noteInfo = [{code: "6", defaultName: "D2", altName: "", index: 1},
{code: "7", defaultName: "D#2", altName: "Eb2", index: 2},
{code: "8", defaultName: "E2", altName: "", index: 3},
{code: "9", defaultName: "F2", altName: "", index: 4},
{code: "0", defaultName: "F#2", altName: "Gb2", index: 5},
{code: "A", defaultName: "G2", altName: "", index: 6},
{code: "a", defaultName: "G#2", altName: "Ab2", index: 7},
{code: "B", defaultName: "A2", altName: "", index: 8},
{code: "b", defaultName: "Bb2", altName: "A#2", index: 9},
{code: "C", defaultName: "B2", altName: "", index: 10},
{code: "c", defaultName: "C3", altName: "", index: 11},
{code: "D", defaultName: "C#3", altName: "Db3", index: 12},
{code: "d", defaultName: "D3", altName: "", index: 13},
{code: "E", defaultName: "D#3", altName: "Eb3", index: 14},
{code: "e", defaultName: "E3", altName: "", index: 15},
{code: "F", defaultName: "F3", altName: "", index: 16},
{code: "f", defaultName: "F#3", altName: "Gb3", index: 17},
{code: "G", defaultName: "G3", altName: "", index: 18},
{code: "g", defaultName: "G#3", altName: "Ab3", index: 19},
{code: "H", defaultName: "A3", altName: "", index: 20},
{code: "h", defaultName: "Bb3", altName: "A#3", index: 21},
{code: "I", defaultName: "B3", altName: "", index: 22},
{code: "i", defaultName: "C4", altName: "", index: 23},
{code: "J", defaultName: "C#4", altName: "Db4", index: 24},
{code: "j", defaultName: "D4", altName: "", index: 25},
{code: "K", defaultName: "D#4", altName: "Eb4", index: 26},
{code: "k", defaultName: "E4", altName: "", index: 27},
{code: "L", defaultName: "F4", altName: "", index: 28},
{code: "l", defaultName: "F#4", altName: "Gb4", index: 29},
{code: "M", defaultName: "G4", altName: "", index: 30},
{code: "m", defaultName: "G#4", altName: "Ab4", index: 31},
{code: "N", defaultName: "A4", altName: "", index: 32},
{code: "n", defaultName: "Bb4", altName: "A#4", index: 33},
{code: "O", defaultName: "B4", altName: "", index: 34},
{code: "o", defaultName: "C5", altName: "", index: 35},
{code: "P", defaultName: "C#5", altName: "Db5", index: 36},
{code: "p", defaultName: "D5", altName: "", index: 37},
{code: "Q", defaultName: "D#5", altName: "Eb5", index: 38},
{code: "q", defaultName: "E5", altName: "", index: 39},
{code: "R", defaultName: "F5", altName: "", index: 40},
{code: "r", defaultName: "F#5", altName: "Gb5", index: 41},
{code: "S", defaultName: "G5", altName: "", index: 42},
{code: "s", defaultName: "G#5", altName: "Ab5", index: 43},
{code: "T", defaultName: "A5", altName: "", index: 44},
{code: "t", defaultName: "Bb5", altName: "A#5", index: 45},
{code: "U", defaultName: "B5", altName: "", index: 46},
{code: "u", defaultName: "C6", altName: "", index: 47},
{code: "V", defaultName: "C#6", altName: "Db6", index: 48},
{code: "v", defaultName: "D6", altName: "", index: 49},
{code: "W", defaultName: "D#6", altName: "Eb6", index: 50},
{code: "w", defaultName: "E6", altName: "", index: 51},
{code: "X", defaultName: "F6", altName: "", index: 52},
{code: "x", defaultName: "F#6", altName: "Gb6", index: 53},
{code: "Y", defaultName: "G6", altName: "", index: 54},
{code: "y", defaultName: "G#6", altName: "Ab6", index: 55},
{code: "Z", defaultName: "A6", altName: "", index: 56},
{code: "z", defaultName: "Bb6", altName: "A#6", index: 57},
{code: "1", defaultName: "B6", altName: "", index: 58},
{code: "2", defaultName: "C7", altName: "", index: 59},
{code: "3", defaultName: "C#7", altName: "Db7", index: 60},
{code: "4", defaultName: "D7", altName: "", index: 61}];

// legacy url-encoded layouts
const cgWheatstone30 = "_30_eFHhJKNMmn...._50_PQTSstVWZX...._15_cGGIijkLMN...._80_oOqpSRuTwU....IHjlMNOopq...._110_SrUTvuYw1x...._270_ii";
const cgJeffries30 = "_30_eFHhJKNMmn...._50_QPPQsSVtZv...._15_cGGIijkLMN...._80_oOqpSRuTwU....IHjlMNOopq...._110_SrUTvuYw1x...._270_ii";
const cgWheatstone40 = "_30_eFHhJKNMmnlJ_50_rPPQTSstVWZX2v.._15_cGGIijkLMNnP_80_RMoOqpSRuTwU....IHjlMNOopqLm_110_tsSrUTvuYw1x...._330_ii_160_QN_55_pq";
const cgJeffries38 = "_30_eFHhJKNMmn.._170_QPPQsSVtWv......_15_cGGIijkLMNnh_80_rNoOqpSRuTwURq..IHjlMNOopqrs_110_poSrUTvuYw1x...._145_Kk_125_ii_220_xX";
const gdWheatstone30 = "_30_CceFghkjKL...._50_mnqpQRstwu...._15_AddfGHIijk...._80_MlONpoSqUr....feHJjklMNO...._110_pPrqTSvUxV...._270_GG";
const gdJeffries30 = "_30_CceFghkjKL...._50_nmmnQpsRtT...._15_AddfGHIijk...._80_MlONpoSqUr....feHJjklMNO...._110_pPrqTSvUxV...._270_GG";
const gdWheatstone40 = "_30_CceFghkjKLJg_50_PmmnqpQRstwuYT.._15_AddfGHIijkLm_80_ojMlONpoSqUr....feHJjklMNOiK_110_RQpPrqTSvUxV...._330_GG_160_nk_55_NO";
const gdJeffries38 = "_30_CceFghkjKL.._170_nmmnQpsRtT......_15_AddfGHIijkLF_80_PkMlONpoSqUroO..feHJjklMNOPQ_110_RKpPrqTSvURQ...._145_hI_125_GG_220_Vu";
const bbfWheatstone30 = "_30_dEGgIJMLlm...._50_OPSRrsUVYW...._15_bFFHhijKLM...._80_nNpoRQtSvT....HGikLMNnop...._110_RqTSutXvZw...._270_hh";
const bbfJeffries30 = "_30_dEGgIJMLlm...._50_POOPrRUsVu...._15_bFFHhijKLM...._80_nNpoRQtSvT....HGikLMNnop...._110_RqTSutXvZw...._270_hh";
const bbfWheatstone40 = "_30_dEGgIJMLlmkI_50_qOOPSRrsUVYWzu.._15_bFFHhijKLMmO_80_QLnNpoRQtSvT....HGikLMNnopKl_110_srRqTSutXvZw...._330_hh_160_PM_55_op";
const bbfJeffries38 = "_30_dEGgIJMLlm.._170_POOPrRUsVu......_15_bFFHhijKLMmg_80_qMnNpoRQtSvTQp..HGikLMNnopqr_110_onRqTSutXvZw...._145_Jj_125_hh_220_wW";
const jones = "_30_eFHHghJJKKmmnn_70_TSPPQQssttVVWvhicGGIijkLMNNM_70_rroOqpSRuTwU2X_30_IjjlMNOopqLkll_70_RRSrUTvuYw1xyZ";
const cg20 = "_20_cGGIijkLMN...._70_oOqpSRuTwU....GjjlMNOopq...._110_SrUTvuYw1x";
const gd20 = "_20_AddfGHIijk...._70_MlONpoSqUr....dHHJjklMNO...._110_pPrqTSvUxV";
const da20 = "_20_dHHJjklMNO...._70_pPrqTSvUxV....HkkmNOPpqr...._110_TsVUwvZx3y";
const squashbox = "_20_7bbdEFGghi...._70_jKLMmnoppS....FbHFihKjML...._110_nNpoRQtSvT";


const activeNotes = [];

// an array to hold the currently selected notes
const selection = [];

// the key that should be selected if the user starts using arrow keys to navigate the piano
let currentIndex = 1;

for (note in notes) {
    activeNotes.push(note);
    if (note.includes("#")) {
        keyboard.append(`<button id="${note}" data-note="${note}" class="sharp">${note}</button>`)
    } else {
        keyboard.append(`<button id="${note}" data-note="${note}" class="natural ${"o" + note.substr(-1)}">${note}</button>`)
    }
}

const buttons = [
    { push: 'E3', pull: 'F3', x: 30 },
    { push: 'A3', pull: 'Bb3', x: 0 },
    { push: 'C#4', pull: 'D#4', x: 0 },
    { push: 'A4', pull: 'G4', x: 0 },
    { push: 'G#4', pull: 'Bb4', x: 0 },
    { push: 'C#5', pull: 'D#5', x: 60 },
    { push: 'A5', pull: 'G5', x: 0 },
    { push: 'G#5', pull: 'Bb5', x: 0 },
    { push: 'C#6', pull: 'D#6', x: 0 },
    { push: 'A6', pull: 'F6', x: 0 },
    { push: 'C3', pull: 'G3', x: 15, newRow: true },
    { push: 'G3', pull: 'B3', x: 0 },
    { push: 'C4', pull: 'D4', x: 0 },
    { push: 'E4', pull: 'F4', x: 0 },
    { push: 'G4', pull: 'A4', x: 0 },
    { push: 'C5', pull: 'B4', x: 90 },
    { push: 'E5', pull: 'D5', x: 0 },
    { push: 'G5', pull: 'F5', x: 0 },
    { push: 'C6', pull: 'A5', x: 0 },
    { push: 'E6', pull: 'B5', x: 0 },
    { push: 'B3', pull: 'A3', x: 0, newRow: true },
    { push: 'D4', pull: 'F#4', x: 0 },
    { push: 'G4', pull: 'A4', x: 0 },
    { push: 'B4', pull: 'C5', x: 0 },
    { push: 'D5', pull: 'E5', x: 0 },
    { push: 'G5', pull: 'F#5', x: 120 },
    { push: 'B5', pull: 'A5', x: 0 },
    { push: 'D6', pull: 'C6', x: 0 },
    { push: 'G6', pull: 'E6', x: 0 },
    { push: 'B6', pull: 'F#6', x: 0 },
    { push: 'C4', pull: 'C4', x: 270, newRow: true, drone: true }
]

// function renderAngloKeyboard() {
//     for (button of buttons) {
//         if (!button.newRow) {
//             angloKeyboard.append(`<div class="button ${opt_bellows}" style="margin-left:${button.x}px"><div class="octave-top ${"o" + noteNames[button.push].substr(-1)}"></div><button class="top" data-note="${noteNames[button.push]}">${button.push}</button><div class="octave-bottom ${"o" + noteNames[button.pull].substr(-1)}"></div><button class="bottom" data-note="${noteNames[button.pull]}">${button.pull}</button></div>`)
//         } else {
//             angloKeyboard.append(`<br><div class="button ${opt_bellows}" style="margin-left:${button.x}px"><div class="octave-top ${"o" + noteNames[button.push].substr(-1)}"></div><button class="top" data-note="${noteNames[button.push]}">${button.push}</button><div class="octave-bottom ${"o" + noteNames[button.pull].substr(-1)}"></div><button class="bottom" data-note="${noteNames[button.pull]}">${button.pull}</button></div>`)
//         }
//     }
// }


function renderAngloKeyboard() {
    for (button of buttons) {
        if (!button.newRow) {
            angloKeyboard.append(`<div class="button ${opt_bellows}" style="margin-left:${button.x}px"><div class="top ${"o" + noteNames[button.push].substr(-1)}"><button data-note="${noteNames[button.push]}">${button.push}</button></div><div class="bottom ${"o" + noteNames[button.pull].substr(-1)}"><button data-note="${noteNames[button.pull]}">${button.pull}</button></div></div>`)
        } else {
            angloKeyboard.append(`<br><div class="button ${opt_bellows}" style="margin-left:${button.x}px"><div class="top ${"o" + noteNames[button.push].substr(-1)}"><button data-note="${noteNames[button.push]}">${button.push}</button></div><div class="bottom ${"o" + noteNames[button.pull].substr(-1)}"><button data-note="${noteNames[button.pull]}">${button.pull}</button></div></div>`)
        }
    }
}



if (customFromURL) {
    parseLegacyLayout(customFromURL);
} else {
    renderAngloKeyboard();
    bindAngloButtons();
}


function parseLegacyLayout(layout) {
    let newLayout = [];
    let buttonCount = 0;
    while (layout.length > 0) {
        let x;
        let push;
        let pull;
        let newRow = false;
        if (layout[0] == "_"){
            x = layout.substring(1, layout.indexOf('_', 1));
            push = noteCodes[layout.substr(layout.indexOf('_', 1) + 1, 1)];
            pull = noteCodes[layout.substr(layout.indexOf('_', 1) + 2, 1)];
            if (buttonCount % 14 === 0 && buttonCount != 0) {
                newRow = true;
            }
            newLayout.push({push, pull, x, newRow});
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
            newLayout.push({push, pull, x, newRow});
            buttonCount++;
            layout = layout.slice(2);
        }
    }
    buttons.length = 0;
    newLayout.forEach((button) => {buttons.push(button)});
    // angloKeyboard.html("");
    angloKeyboard.empty();
    renderAngloKeyboard();
    bindAngloButtons();
    selectConcertinaButtons();
}



function selectPianoKey() {
    for (key of keyboard.children()) {
            if (selection.includes(key.dataset.note)) {
                key.classList.add("selected");
                // console.log(key);
            } else {
                key.classList.remove("selected")
            }
    }
}


function selectConcertinaButtons() {
    for (button of angloKeyboard.children()) {
        for (div of button.children) {
            for (note of div.children) {
                if (selection.includes(note.dataset.note)) {
                    note.classList.add("selected");
                } else {
                    note.classList.remove("selected");
                }
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
    for (button of angloKeyboard.children()) {
        button.classList.remove("pull-only");
        button.classList.add("push-only");
    }
    opt_bellows = "push-only";
}

function togglePullView() {
    for (button of angloKeyboard.children()) {
        button.classList.remove("push-only");
        button.classList.add("pull-only");
    }
    opt_bellows = "pull-only";
}

function resetView() {
    for (button of angloKeyboard.children()) {
        button.classList.remove("push-only");
        button.classList.remove("pull-only");
    }
    opt_bellows = "";
}


function updateNoteSelection(note) {
    if (!selection.includes(note) && (multiselect.checked == true || selection.length == 0)) {
        selection.push(note);
    } else if(!selection.includes(note)) {
        selection.length = 0;
        selection.push(note);
    } else {
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

function deselectChordButtons() {
    for (let i = 0; i < chordBar.children.length; i++) {
        chordBar.children[i].classList.remove('selected');
    }
}

function playNote(note) {
    let oscillator;
    let gainNode = audioCtx.createGain(); // prerequisite for making the volume adjustable
    let freq = notes[note];
    let fullVolume = 0;
    if (selection.length) {
        fullVolume = -1 + 1/selection.length // avoid the utter cracklefest on webkit and mobile browsers
    }
    // console.debug(note + " (" + freq + " Hz)");
    oscillator = audioCtx.createOscillator(); // create Oscillator node
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
    oscillator.connect(audioCtx.destination);
    oscillator.connect(gainNode); // connect the volume control to the oscillator
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(-1, audioCtx.currentTime); // set the volume to zero when the note first starts playing
    gainNode.gain.linearRampToValueAtTime(fullVolume, audioCtx.currentTime + 0.01); // linearly increase to full volume in 0.1 seconds
    gainNode.gain.linearRampToValueAtTime(-1, audioCtx.currentTime + 0.5); // fade the volume all the way out in 0.5 seconds
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function playSelection() {
    selection.forEach((note) => {
        playNote(note);
    });
}

function moveLeft() {
    if (currentIndex > 0) {
        currentIndex--;
        selection.length = 0;
        updateNoteSelection(activeNotes[currentIndex]);
        playNote(activeNotes[currentIndex]);
    }
}

function moveRight() {
    if (currentIndex < activeNotes.length-1) {
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

$('#keyboard button').on('click', (e) => {
    if (!selection.includes(e.target.dataset.note)) {
        playNote(e.target.dataset.note);
    }
    currentIndex = activeNotes.indexOf(e.target.dataset.note)
    deselectChordButtons();
    updateNoteSelection(e.target.dataset.note);
});

function bindAngloButtons() {
    $('#anglo-keyboard button').on('click', (e) => {
        if (!selection.includes(e.target.dataset.note)) {
            playNote(e.target.dataset.note);
        }
        currentIndex = activeNotes.indexOf(e.target.dataset.note);
        deselectChordButtons();
        updateNoteSelection(e.target.dataset.note);
    });
}

layout.addEventListener("change", () => {
switch (layout.value) {
        case "cgWheatstone30":
            parseLegacyLayout(cgWheatstone30);
            break;
        case "cgJeffries30":
            parseLegacyLayout(cgJeffries30);
            break;
        case "cgWheatstone40":
            parseLegacyLayout(cgWheatstone40);
            break;
        case "cgJeffries38":
            parseLegacyLayout(cgJeffries38);
            break;
        case "gdWheatstone30":
            parseLegacyLayout(gdWheatstone30);
            break;
        case "gdJeffries30":
            parseLegacyLayout(gdJeffries30);
            break;
        case "gdWheatstone40":
            parseLegacyLayout(gdWheatstone40);
            break;
        case "gdJeffries38":
            parseLegacyLayout(gdJeffries38);
            break;
        case "bbfWheatstone30":
            parseLegacyLayout(bbfWheatstone30);
            break;
        case "bbfJeffries30":
            parseLegacyLayout(bbfJeffries30);
            break;
        case "bbfWheatstone40":
            parseLegacyLayout(bbfWheatstone40);
            break;
        case "bbfJeffries38":
            parseLegacyLayout(bbfJeffries38);
            break;
        case "jones":
            parseLegacyLayout(jones);
            break;
        case "cg20":
            parseLegacyLayout(cg20);
            break;
        case "gd20":
            parseLegacyLayout(gd20);
            break;
        case "da20":
            parseLegacyLayout(da20);
            break;
        case "squashbox":
            parseLegacyLayout(squashbox);
            break;
    }
});


const opt_pushpull = document.getElementById("pushpull");
const opt_push = document.getElementById("push");
const opt_pull = document.getElementById("pull");

opt_pushpull.addEventListener("change", ()=> {
    resetView();
});
opt_push.addEventListener("change", ()=> {
    togglePushView();
});
opt_pull.addEventListener("change", ()=> {
    togglePullView();
});

opt_coloroctave.addEventListener("change", () => {
    colorOctaves();
});

document.addEventListener('keydown', function(e) {
    console.log(e.code);
    if (e.code.indexOf('Shift') != -1) {
        multiselect.checked = true;
    } else if (e.code == "ArrowRight") {
        deselectChordButtons();
        moveRight();
    } else if (e.code == "ArrowLeft") {
        deselectChordButtons();
        moveLeft();
    }
  })

  document.addEventListener('keyup', function(e) {
    if (e.code.indexOf('Shift') != -1) {
        multiselect.checked = false;
    }
  })