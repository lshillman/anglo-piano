const viewerSection = document.getElementById("viewer");
const editorSection = document.getElementById("editor");
const editorContainer = document.getElementById("editor-anglo-container");
const editorKeyboard = document.getElementById("editor-anglo-keyboard");
const editLayoutBtn = document.getElementById("editLayoutBtn");

const cancelBtn = document.getElementById("cancelBtn");

let validNotes = Object.keys(editorNotes);







function renderEditor() {
    currentMode = "edit"
    editorSection.style.display = "block";
    viewerSection.style.display = "none";
    editorKeyboard.innerHTML = "";
    for (button of buttons) {
        let pushLabel = button.push;
        let pullLabel = button.pull;
        if (button.newRow) {
            editorKeyboard.innerHTML += `<br>`;
        }
        editorKeyboard.innerHTML += `<div class="editor-button" style="margin-left:${button.x}px"><div class="top"><input type=text maxlength="3" value="${pushLabel}"></div><div class="bottom"><input type=text maxlength="3" value="${pullLabel}"></div></div>`;
    }
    bindInputs();

}


function isValid(note) {
    if (validNotes.includes(note)) {
        return true;
    } else {
        return false;
    }
}









function bindInputs() {
    let allfields = document.querySelectorAll(".editor-button input");
    allfields.forEach((field) => field.addEventListener('input', (e) => {
        if (isValid(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase())) {
            e.target.classList.remove("invalid");
            playNote(noteNames[e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase()]);
        }
    }
    ));
    allfields.forEach((field) => field.addEventListener('blur', (e) => {
        console.log("Now validating " + e.target.value);
        e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase();
        if (!isValid(e.target.value)) {
            e.target.classList.add("invalid");
        }
    }));
    allfields.forEach((field) => field.addEventListener('keydown', (e) => {
        if (e.code.indexOf('Shift') != -1) {
            console.log("shift")
        } else if (e.code == "ArrowUp") {
            if (editorNotes[e.target.value].next) {
                e.target.value = editorNotes[e.target.value].next;
            }
            playNote(noteNames[e.target.value]);
            // console.log(`Target value: ${e.target.value}. This value: ${this.value}.`);
        } else if (e.code == "ArrowDown") {
            if (editorNotes[e.target.value].prev) {
                e.target.value = editorNotes[e.target.value].prev;
            }
            playNote(noteNames[e.target.value]);
        } else if (e.code == "Escape") {
            console.log("Esc");
        }
    }));
}









editLayoutBtn.addEventListener("click", () => {
    renderEditor();
});

cancelBtn.addEventListener("click", () => {
    editorKeyboard.innerHTML = "";
    editorSection.style.display = "none";
    viewerSection.style.display = "block";
})