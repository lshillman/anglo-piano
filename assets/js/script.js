console.log("I'm a JavaScript file linked to this page!");

const wavetypeEl = $('#wavetype');
const keyboard = $('#keyboard');
const angloKeyboard = $('#anglo-keyboard');
const multiselect = document.getElementById("multiselect");
const chordBar = document.getElementById("chords");

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


// note frequencies in HZ
const notes = {
    D2: 73.42, Ds2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.5, G2: 98, Gs2: 103.83, A2: 110, As2: 116.54, B2: 123.47, C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185, G3: 196, Gs3: 207.65, A3: 220, As3: 233.08, B3: 246.94, C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392, Gs4: 415.3, A4: 440, As4: 466.16, B4: 493.88, C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880, As5: 932.33, B5: 987.77, C6: 1046.5, Cs6: 1108.73, D6: 1174.66, Ds6: 1244.51, E6: 1318.51, F6: 1396.91, Fs6: 1479.98, G6: 1567.98, Gs6: 1661.22, A6: 1760, As6: 1864.66, B6: 1975.53, C7: 2093, Cs7: 2217.46, D7: 2349.32
};

const noteNames = {
    "A0": "A0", "A#0": "As0", "B0": "B0", "C0": "C0", "C1": "C1", "C#1": "Cs1", "D1": "D1", "D#1": "Ds1", "E1": "E1", "F1": "F1", "F#1": "Fs1", "G1": "G1", "G#1": "Gs1", "A1": "A1", "A#1": "As1", "B1": "B1", "C2": "C2", "C#2": "Cs2", "D2": "D2", "D#2": "Ds2", "E2": "E2", "F2": "F2", "F#2": "Fs2", "G2": "G2", "G#2": "Gs2", "A2": "A2", "A#2": "As2", "B2": "B2", "C3": "C3", "C#3": "Cs3", "D3": "D3", "D#3": "Ds3", "E3": "E3", "F3": "F3", "F#3": "Fs3", "G3": "G3", "G#3": "Gs3", "A3": "A3", "A#3": "As3", "B3": "B3", "C4": "C4", "C#4": "Cs4", "D4": "D4", "D#4": "Ds4", "E4": "E4", "F4": "F4", "F#4": "Fs4", "G4": "G4", "G#4": "Gs4", "A4": "A4", "A#4": "As4", "B4": "B4", "C5": "C5", "C#5": "Cs5", "D5": "D5", "D#5": "Ds5", "E5": "E5", "F5": "F5", "F#5": "Fs5", "G5": "G5", "G#5": "Gs5", "A5": "A5", "A#5": "As5", "B5": "B5", "C6": "C6", "C#6": "Cs6", "D6": "D6", "D#6": "Ds6", "E6": "E6", "F6": "F6", "F#6": "Fs6", "G6": "G6", "G#6": "Gs6", "A6": "A6", "A#6": "As6", "B6": "B6", "C7": "C7", "C#7": "Cs7", "D7": "D7", "D#7": "Ds7", "E7": "E7", "F7": "F7", "F#7": "Fs7", "G7": "G7", "G#7": "Gs7", "A7": "A7", "A#7": "As7", "B7": "B7", "C8": "C8", "Bb0": "As0", "Db1": "Cs1", "Eb1": "Ds1", "Gb1": "Fs1", "Ab1": "Gs1", "Bb1": "As1", "Db2": "Cs2", "Eb2": "Ds2", "Gb2": "Fs2", "Ab2": "Gs2", "Bb2": "As2", "Db3": "Cs3", "Eb3": "Ds3", "Gb3": "Fs3", "Ab3": "Gs3", "Bb3": "As3", "Db4": "Cs4", "Eb4": "Ds4", "Gb4": "Fs4", "Ab4": "Gs4", "Bb4": "As4", "Db5": "Cs5", "Eb5": "Ds5", "Gb5": "Fs5", "Ab5": "Gs5", "Bb5": "As5", "Db6": "Cs6", "Eb6": "Ds6", "Gb6": "Fs6", "Ab6": "Gs6", "Bb6": "As6", "Db7": "Cs7", "Eb7": "Ds7", "Gb7": "Fs7", "Ab7": "Gs7", "Bb7": "As7"
};

const activeNotes = [];

// an array to hold the currently selected notes
const selection = [];

// the key that should be selected if the user starts using arrow keys to navigate the piano
let currentIndex = 1;

for (note in notes) {
    activeNotes.push(note);
    if (note.includes("s")) {
        keyboard.append(`<button id="${note}" data-note="${note}" class="sharp"></button>`)
    } else {
        keyboard.append(`<button id="${note}" data-note="${note}" class="natural"></button>`)
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
]

for (button of buttons) {
    if (!button.newRow) {
        angloKeyboard.append(`<div class="button" style="margin-left:${button.x}px"><button class="top" data-note="${noteNames[button.push]}">${button.push}</button><button class="bottom" data-note="${noteNames[button.pull]}">${button.pull}</button></div>`)
    } else {
        angloKeyboard.append(`<br><div class="button" style="margin-left:${button.x}px"><button class="top" data-note="${noteNames[button.push]}">${button.push}</button><button class="bottom" data-note="${noteNames[button.pull]}">${button.pull}</button></div>`)
    }
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
        for (note of button.children) {
            if (selection.includes(note.dataset.note)) {
                note.classList.add("selected");
            } else {
                note.classList.remove("selected");
            }
        }
    }
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

function playNote(note) {
    let oscillator;
    let freq = notes[note];
    console.debug(note + " (" + freq + " Hz)");
    oscillator = audioCtx.createOscillator(); // create Oscillator node
    oscillator.type = wavetypeEl.val(); // triangle wave by default
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function playSelection() {
    selection.forEach((note) => {
        let oscillator;
        let freq = notes[note];
        console.log(note + " (" + freq + " Hz)");
        oscillator = audioCtx.createOscillator(); // create Oscillator node
        oscillator.type = wavetypeEl.val();
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
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
            break;
        case "min":
            activeNotes[rootIndex + 3] && selection.push(activeNotes[rootIndex + 3]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            break;
        case "dim":
            activeNotes[rootIndex + 3] && selection.push(activeNotes[rootIndex + 3]);
            activeNotes[rootIndex + 6] && selection.push(activeNotes[rootIndex + 6]);
            break;
        case "7":
            activeNotes[rootIndex + 4] && selection.push(activeNotes[rootIndex + 4]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            activeNotes[rootIndex + 10] && selection.push(activeNotes[rootIndex + 10]);
            break;
        case "maj7":
            activeNotes[rootIndex + 4] && selection.push(activeNotes[rootIndex + 4]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            activeNotes[rootIndex + 11] && selection.push(activeNotes[rootIndex + 11]);
            break;
        case "min7":
            activeNotes[rootIndex + 3] && selection.push(activeNotes[rootIndex + 3]);
            activeNotes[rootIndex + 7] && selection.push(activeNotes[rootIndex + 7]);
            activeNotes[rootIndex + 10] && selection.push(activeNotes[rootIndex + 10]);
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
    updateNoteSelection(e.target.dataset.note);
});
// $('#keyboard button').on('mouseup', () => oscillator.stop());

$('#anglo-keyboard button').on('click', (e) => {
    unlock();
    if (!selection.includes(e.target.dataset.note)) {
        playNote(e.target.dataset.note);
    }
    currentIndex = activeNotes.indexOf(e.target.dataset.note)
    updateNoteSelection(e.target.dataset.note)
});

document.addEventListener('keydown', function(e) {
    // if(e.code == 'KeyZ' && (e.ctrlKey || e.metaKey)) {
    //   alert('Undo!')
    // }
    console.log(e.code);
    if (e.code.indexOf('Shift') != -1) {
        multiselect.checked = true;
    } else if (e.code == "ArrowRight") {
        moveRight();
    } else if (e.code == "ArrowLeft") {
        moveLeft();
    }
  })

  document.addEventListener('keyup', function(e) {
    if (e.code.indexOf('Shift') != -1) {
        multiselect.checked = false;
    }
  })


  function unlock() {

    // play empty buffer to unmute audio
    
    var buffer = audioCtx.createBuffer(1, 1, 22050);
    
    var source = audioCtx.createBufferSource();
    
    source.audioCtx = buffer;
    
    source.connect(audioCtx.destination);
    
    source.start(0);
    
    console.log("unlocked")
    
    }