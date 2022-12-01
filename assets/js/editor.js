const viewerSection = document.getElementById("viewer");
const editorSection = document.getElementById("editor");
const editorContainer = document.getElementById("editor-anglo-container");
const editorKeyboard = document.getElementById("editor-anglo-keyboard");
const editLayoutBtn = document.getElementById("editLayoutBtn");
const moveRightBtn = document.getElementById("moveRightBtn");
const moveLeftBtn = document.getElementById("moveLeftBtn");
const deleteBtn = document.getElementById("deleteBtn");
const cancelBtn = document.getElementById("cancelBtn");

let validNotes = Object.keys(editorNotes);
let currentButton;
let currentField;







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
        editorKeyboard.innerHTML += `<div class="editor-button" style="margin-left:${button.x}px"><div class="top"><input type=text maxlength="3" placeholder="push" value="${pushLabel}"></div><div class="bottom"><input type=text maxlength="3"  placeholder="pull" value="${pullLabel}"></div></div>`;
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


function deleteButton(button) {
    // if the currently active button is the one being deleted, send the focus somewhere useful before deleting
    if (editorKeyboard.lastChild.nodeName == "BR") {
        editorKeyboard.lastChild.remove();
    }
    if (button == currentButton && button.nextSibling && button.nextSibling.nodeName != "BR") {
        button.nextSibling.firstChild.firstChild.focus()
    } else if (button == currentButton && button.nextSibling && button.nextSibling.nodeName == "BR") {
        button.nextSibling.nextSibling.firstChild.firstChild.focus()
    } else if (button == currentButton && button.previousSibling && button.previousSibling.nodeName != "BR") {
        button.previousSibling.firstChild.firstChild.focus()
    } else if (button == currentButton && button.previousSibling && button.previousSibling.nodeName == "BR") {
        button.previousSibling.previousSibling.firstChild.firstChild.focus()
    }
    // immediately start fading the button. After button faded, set the width and the left margin to 0. Finally, if the button is the last in its row, remove the next line break, and then remove the button.
    button.style.cssText += "transition:margin-left 0.2s ease 0.2s, width 0.2s ease 0.2s, opacity 0.2s;"
    button.style.marginLeft = 0;
    button.style.width = 0;
    button.style.opacity = 0;
    setTimeout(() => {
        if (button.nextSibling && button.nextSibling.nodeName == "BR" && button.parentNode.firstChild == button) {
            button.nextSibling.remove();
        } else if (button.nextSibling && button.previousSibling && button.nextSibling.nodeName == "BR" && button.previousSibling.nodeName == "BR") {
            button.nextSibling.remove();
        }
        button.remove();
      }, "400")      
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
    allfields.forEach((field) => field.addEventListener('focus', (e) => {
        currentField = e.target;
        currentButton = e.target.parentNode.parentNode;
        document.querySelectorAll(".editor-button").forEach((button) => {button.classList.remove("selected")});
        currentButton.classList.add("selected");
    }));
    allfields.forEach((field) => field.addEventListener('focusout', (e) => {
        e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase();
        if (!isValid(e.target.value)) {
            e.target.classList.add("invalid");
        }
        if (!e.target.parentNode.parentNode.firstChild.firstChild.value && !e.target.parentNode.parentNode.lastChild.firstChild.value && !e.target.parentNode.parentNode.contains(e.relatedTarget)) {
            deleteButton(e.target.parentNode.parentNode);
        }
    }));
    allfields.forEach((field) => field.addEventListener('keydown', (e) => {
        if (e.code.indexOf('Shift') != -1) {
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
        } else if (e.code == "ArrowRight" && e.shiftKey) {
            moveButton("right");
        } else if (e.code == "ArrowLeft" && e.shiftKey) {
            moveButton("left");
        } else if (e.code == "Backspace" && e.shiftKey) {
            deleteButton(currentButton);
        }
    }));
}


function moveButton(direction) {
    currentField.focus();
    let margin = currentButton.style.marginLeft.slice(0,-2)*1;
    if (direction == "left") {
        if (margin - 10 >= 0) {
            currentButton.style.marginLeft = `${margin - 10}px`;
        } else if (margin != 0) {
            currentButton.style.marginLeft = '0px';
        }
    } else if (direction == "right") {
        currentButton.style.marginLeft = `${margin + 10}px`;
    }
}





moveRightBtn.addEventListener("click", () => {
    moveButton("right");
});

moveLeftBtn.addEventListener("click", () => {
    moveButton("left");
});

deleteBtn.addEventListener("click", () => {
    deleteButton(currentButton);
})

editLayoutBtn.addEventListener("click", () => {
    renderEditor();
});

cancelBtn.addEventListener("click", () => {
    editorKeyboard.innerHTML = "";
    editorSection.style.display = "none";
    viewerSection.style.display = "block";
    currentMode = "view"
})