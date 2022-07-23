console.log("I'm a JavaScript file linked to this page!");

const wavetypeEl = $('#wavetype');
const keyboard = $('#keyboard');

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


// note frequencies in HZ
const notes = {
    D2: 73.42, Ds2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.5, G2: 98, Gs2: 103.83, A2: 110, As2: 116.54, B2: 123.47, C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185, G3: 196, Gs3: 207.65, A3: 220, As3: 233.08, B3: 246.94, C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392, Gs4: 415.3, A4: 440, As4: 466.16, B4: 493.88, C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880, As5: 932.33, B5: 987.77, C6: 1046.5, Cs6: 1108.73, D6: 1174.66, Ds6: 1244.51, E6: 1318.51, F6: 1396.91, Fs6: 1479.98, G6: 1567.98, Gs6: 1661.22, A6: 1760, As6: 1864.66, B6: 1975.53, C7: 2093, Cs7: 2217.46, D7: 2349.32
};

for (note in notes) {
    if (note.includes("s")) {
        keyboard.append(`<button id="${note}" data-note="${note}" class="sharp"></button>`)
    } else {
        keyboard.append(`<button id="${note}" data-note="${note}" class="natural"></button>`)
    }
}


let oscillator;

$('#keyboard button').on('mousedown', (e) => {
    let freq = notes[e.target.dataset.note];
    console.log(e.target.dataset.note + " (" + freq + " Hz)");
    oscillator = audioCtx.createOscillator(); // create Oscillator node
    oscillator.type = wavetypeEl.val();
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
    oscillator.connect(audioCtx.destination);
    oscillator.start()});
$('#keyboard button').on('mouseup', () => oscillator.stop());