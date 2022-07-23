console.log("I'm a JavaScript file linked to this page!");

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


// note frequencies in HZ
const notes = {
    c4: 261.626,
    d4: 293.665,
    e4: 329.628,
    f4: 349.228,
    g4: 391.995,
    a4: 440,
    b4: 493.883,
    c5: 523.251
};


let oscillator;

$('#keyboard button').on('mousedown', (e) => {
    let freq = notes[e.target.dataset.note];
    console.log(freq);
    oscillator = audioCtx.createOscillator(); // create Oscillator node
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
    oscillator.connect(audioCtx.destination);
    oscillator.start()});
$('#keyboard button').on('mouseup', () => oscillator.stop());