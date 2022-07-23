console.log("I'm a JavaScript file linked to this page!");

const wavetypeEl = $('#wavetype')

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


// note frequencies in HZ
const notes = {
    c4: 261.626,
    cs4: 277.183,
    d4: 293.665,
    ds4: 311.127,
    e4: 329.628,
    f4: 349.228,
    fs4: 369.994,
    g4: 391.995,
    gs4: 415.305,
    a4: 440,
    as4:466.164,
    b4: 493.883,
    c5: 523.251
};


let oscillator;

$('#keyboard button').on('mousedown', (e) => {
    let freq = notes[e.target.dataset.note];
    console.log(freq + " HZ");
    oscillator = audioCtx.createOscillator(); // create Oscillator node
    oscillator.type = wavetypeEl.val();
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
    oscillator.connect(audioCtx.destination);
    oscillator.start()});
$('#keyboard button').on('mouseup', () => oscillator.stop());