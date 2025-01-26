// note frequencies in HZ
const notes = {
    "D2": 73.42, "D#2": 77.78, "E2": 82.41, "F2": 87.31, "F#2": 92.5, "G2": 98, "G#2": 103.83, "A2": 110, "Bb2": 116.54, "B2": 123.47, "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185, "G3": 196, "G#3": 207.65, "A3": 220, "Bb3": 233.08, "B3": 246.94, "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392, "G#4": 415.3, "A4": 440, "Bb4": 466.16, "B4": 493.88, "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880, "Bb5": 932.33, "B5": 987.77, "C6": 1046.5, "C#6": 1108.73, "D6": 1174.66, "D#6": 1244.51, "E6": 1318.51, "F6": 1396.91, "F#6": 1479.98, "G6": 1567.98, "G#6": 1661.22, "A6": 1760, "Bb6": 1864.66, "B6": 1975.53, "C7": 2093, "C#7": 2217.46, "D7": 2349.32
};

const noteNames = {
    "D2": "D2", "D#2": "D#2", "E2": "E2", "F2": "F2", "F#2": "F#2", "G2": "G2", "G#2": "G#2", "A2": "A2", "Bb2": "Bb2", "B2": "B2", "C3": "C3", "C#3": "C#3", "D3": "D3", "D#3": "D#3", "E3": "E3", "F3": "F3", "F#3": "F#3", "G3": "G3", "G#3": "G#3", "A3": "A3", "Bb3": "Bb3", "B3": "B3", "C4": "C4", "C#4": "C#4", "D4": "D4", "D#4": "D#4", "E4": "E4", "F4": "F4", "F#4": "F#4", "G4": "G4", "G#4": "G#4", "A4": "A4", "Bb4": "Bb4", "B4": "B4", "C5": "C5", "C#5": "C#5", "D5": "D5", "D#5": "D#5", "E5": "E5", "F5": "F5", "F#5": "F#5", "G5": "G5", "G#5": "G#5", "A5": "A5", "Bb5": "Bb5", "B5": "B5", "C6": "C6", "C#6": "C#6", "D6": "D6", "D#6": "D#6", "E6": "E6", "F6": "F6", "F#6": "F#6", "G6": "G6", "G#6": "G#6", "A6": "A6", "Bb6": "Bb6", "B6": "B6", "C7": "C7", "C#7": "C#7", "D7": "D7", "Eb2": "D#2", "Gb2": "F#2", "Ab2": "G#2", "A#2": "Bb2", "Db3": "C#3", "Eb3": "D#3", "Gb3": "F#3", "Ab3": "G#3", "A#3": "Bb3", "Db4": "C#4", "Eb4": "D#4", "Gb4": "F#4", "Ab4": "G#4", "A#4": "Bb4", "Db5": "C#5", "Eb5": "D#5", "Gb5": "F#5", "Ab5": "G#5", "A#5": "Bb5", "Db6": "C#6", "Eb6": "D#6", "Gb6": "F#6", "Ab6": "G#6", "A#6": "Bb6", "Db7": "C#7", "~": "~"
};

const altNoteNames = {
    "D2": "D2", "D#2": "Eb2", "E2": "E2", "F2": "F2", "F#2": "Gb2", "G2": "G2", "G#2": "Ab2", "A2": "A2", "Bb2": "A#2", "B2": "B2", "C3": "C3", "C#3": "Db3", "D3": "D3", "D#3": "Eb3", "E3": "E3", "F3": "F3", "F#3": "Gb3", "G3": "G3", "G#3": "Ab3", "A3": "A3", "Bb3": "A#3", "B3": "B3", "C4": "C4", "C#4": "Db4", "D4": "D4", "D#4": "Eb4", "E4": "E4", "F4": "F4", "F#4": "Gb4", "G4": "G4", "G#4": "Ab4", "A4": "A4", "Bb4": "A#4", "B4": "B4", "C5": "C5", "C#5": "Db5", "D5": "D5", "D#5": "Eb5", "E5": "E5", "F5": "F5", "F#5": "Gb5", "G5": "G5", "G#5": "Ab5", "A5": "A5", "Bb5": "A#5", "B5": "B5", "C6": "C6", "C#6": "Db6", "D6": "D6", "D#6": "Eb6", "E6": "E6", "F6": "F6", "F#6": "Gb6", "G6": "G6", "G#6": "Ab6", "A6": "A6", "Bb6": "A#6", "B6": "B6", "C7": "C7", "C#7": "Db7", "D7": "D7"
};

const noteCodes = {
    "6": "D2", "7": "D#2", "8": "E2", "9": "F2", "0": "F#2", "A": "G2", "a": "G#2", "B": "A2", "b": "Bb2", "C": "B2", "c": "C3", "D": "C#3", "d": "D3", "E": "D#3", "e": "E3", "F": "F3", "f": "F#3", "G": "G3", "g": "G#3", "H": "A3", "h": "Bb3", "I": "B3", "i": "C4", "J": "C#4", "j": "D4", "K": "D#4", "k": "E4", "L": "F4", "l": "F#4", "M": "G4", "m": "G#4", "N": "A4", "n": "Bb4", "O": "B4", "o": "C5", "P": "C#5", "p": "D5", "Q": "D#5", "q": "E5", "R": "F5", "r": "F#5", "S": "G5", "s": "G#5", "T": "A5", "t": "Bb5", "U": "B5", "u": "C6", "V": "C#6", "v": "D6", "W": "D#6", "w": "E6", "X": "F6", "x": "F#6", "Y": "G6", "y": "G#6", "Z": "A6", "z": "Bb6", "1": "B6", "2": "C7", "3": "C#7", "4": "D7", "5": "~"
};

const encoder = {
    "D2": "6", "D#2": "7", "E2": "8", "F2": "9", "F#2": "0", "G2": "A", "G#2": "a", "A2": "B", "Bb2": "b", "B2": "C", "C3": "c", "C#3": "D", "D3": "d", "D#3": "E", "E3": "e", "F3": "F", "F#3": "f", "G3": "G", "G#3": "g", "A3": "H", "Bb3": "h", "B3": "I", "C4": "i", "C#4": "J", "D4": "j", "D#4": "K", "E4": "k", "F4": "L", "F#4": "l", "G4": "M", "G#4": "m", "A4": "N", "Bb4": "n", "B4": "O", "C5": "o", "C#5": "P", "D5": "p", "D#5": "Q", "E5": "q", "F5": "R", "F#5": "r", "G5": "S", "G#5": "s", "A5": "T", "Bb5": "t", "B5": "U", "C6": "u", "C#6": "V", "D6": "v", "D#6": "W", "E6": "w", "F6": "X", "F#6": "x", "G6": "Y", "G#6": "y", "A6": "Z", "Bb6": "z", "B6": "1", "C7": "2", "C#7": "3", "D7": "4", "Eb2": "7", "Gb2": "0", "Ab2": "a", "A#2": "b", "Db3": "D", "Eb3": "E", "Gb3": "f", "Ab3": "g", "A#3": "h", "Db4": "J", "Eb4": "K", "Gb4": "l", "Ab4": "m", "A#4": "n", "Db5": "P", "Eb5": "Q", "Gb5": "r", "Ab5": "s", "A#5": "t", "Db6": "V", "Eb6": "W", "Gb6": "x", "Ab6": "y", "A#6": "z", "Db7": "3", "~": "5"
};

const editorNotes = {
    "D2": {next: "D#2"}, "D#2": {next: "E2", prev: "D2"}, "E2": {next: "F2", prev: "Eb2"}, "F2": {next: "F#2", prev: "E2"}, "F#2": {next: "G2", prev: "F2"}, "G2": {next: "G#2", prev: "Gb2"}, "G#2": {next: "A2", prev: "G2"}, "A2": {next: "A#2", prev: "Ab2"}, "A#2": {next: "B2", prev: "A2"}, "B2": {next: "C3", prev: "Bb2"}, "C3": {next: "C#3", prev: "B2"}, "C#3": {next: "D3", prev: "C3"}, "D3": {next: "D#3", prev: "Db3"}, "D#3": {next: "E3", prev: "D3"}, "E3": {next: "F3", prev: "Eb3"}, "F3": {next: "F#3", prev: "E3"}, "F#3": {next: "G3", prev: "F3"}, "G3": {next: "G#3", prev: "Gb3"}, "G#3": {next: "A3", prev: "G3"}, "A3": {next: "A#3", prev: "Ab3"}, "A#3": {next: "B3", prev: "A3"}, "B3": {next: "C4", prev: "Bb3"}, "C4": {next: "C#4", prev: "B3"}, "C#4": {next: "D4", prev: "C4"}, "D4": {next: "D#4", prev: "Db4"}, "D#4": {next: "E4", prev: "D4"}, "E4": {next: "F4", prev: "Eb4"}, "F4": {next: "F#4", prev: "E4"}, "F#4": {next: "G4", prev: "F4"}, "G4": {next: "G#4", prev: "Gb4"}, "G#4": {next: "A4", prev: "G4"}, "A4": {next: "A#4", prev: "Ab4"}, "A#4": {next: "B4", prev: "A4"}, "B4": {next: "C5", prev: "Bb4"}, "C5": {next: "C#5", prev: "B4"}, "C#5": {next: "D5", prev: "C5"}, "D5": {next: "D#5", prev: "Db5"}, "D#5": {next: "E5", prev: "D5"}, "E5": {next: "F5", prev: "Eb5"}, "F5": {next: "F#5", prev: "E5"}, "F#5": {next: "G5", prev: "F5"}, "G5": {next: "G#5", prev: "Gb5"}, "G#5": {next: "A5", prev: "G5"}, "A5": {next: "A#5", prev: "Ab5"}, "A#5": {next: "B5", prev: "A5"}, "B5": {next: "C6", prev: "Bb5"}, "C6": {next: "C#6", prev: "B5"}, "C#6": {next: "D6", prev: "C6"}, "D6": {next: "D#6", prev: "Db6"}, "D#6": {next: "E6", prev: "D6"}, "E6": {next: "F6", prev: "Eb6"}, "F6": {next: "F#6", prev: "E6"}, "F#6": {next: "G6", prev: "F6"}, "G6": {next: "G#6", prev: "Gb6"}, "G#6": {next: "A6", prev: "G6"}, "A6": {next: "A#6", prev: "Ab6"}, "A#6": {next: "B6", prev: "A6"}, "B6": {next: "C7", prev: "Bb6"}, "C7": {next: "C#7", prev: "B6"}, "C#7": {next: "D7", prev: "C7"}, "D7": {prev: "Db7"}, "Eb2": {next: "E2", prev: "D2"}, "Gb2": {next: "G2", prev: "F2"}, "Ab2": {next: "A2", prev: "G2"}, "Bb2": {next: "B2", prev: "A2"}, "Db3": {next: "D3", prev: "C3"}, "Eb3": {next: "E3", prev: "D3"}, "Gb3": {next: "G3", prev: "F3"}, "Ab3": {next: "A3", prev: "G3"}, "Bb3": {next: "B3", prev: "A3"}, "Db4": {next: "D4", prev: "C4"}, "Eb4": {next: "E4", prev: "D4"}, "Gb4": {next: "G4", prev: "F4"}, "Ab4": {next: "A4", prev: "G4"}, "Bb4": {next: "B4", prev: "A4"}, "Db5": {next: "D5", prev: "C5"}, "Eb5": {next: "E5", prev: "D5"}, "Gb5": {next: "G5", prev: "F5"}, "Ab5": {next: "A5", prev: "G5"}, "Bb5": {next: "B5", prev: "A5"}, "Db6": {next: "D6", prev: "C6"}, "Eb6": {next: "E6", prev: "D6"}, "Gb6": {next: "G6", prev: "F6"}, "Ab6": {next: "A6", prev: "G6"}, "Bb6": {next: "B6", prev: "A6"}, "Db7": {next: "D7", prev: "C7"}, "~": {next: "~", prev: "~"}
}


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