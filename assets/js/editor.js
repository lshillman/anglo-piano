const viewerSection = document.getElementById("viewer");
const editorSection = document.getElementById("editor");
const editorContainer = document.getElementById("editor-anglo-container");
const editorKeyboard = document.getElementById("editor-anglo-keyboard");
const editLayoutBtn = document.getElementById("editLayoutBtn");

const noteUpBtn = document.getElementById("noteUp")
const noteDownBtn = document.getElementById("noteDown")

const layoutUpBtn = document.getElementById("layoutUp")
const layoutDownBtn = document.getElementById("layoutDown")

const moveRightBtn = document.getElementById("moveRightBtn");
const moveLeftBtn = document.getElementById("moveLeftBtn");
const deleteBtn = document.getElementById("deleteBtn");
const cancelBtn = document.getElementById("cancelBtn");
const finishedBtn = document.getElementById("finishedBtn");


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
    currentField = document.querySelectorAll("#editor-anglo-keyboard input")[0];
    currentButton = document.querySelectorAll("#editor-anglo-keyboard .editor-button")[0];
    currentButton.classList.add("selected");
    !mobileDevice && currentField.focus();
}


function encodeLayoutFromEditor () {

    //validate all notes
    let allInputs = document.querySelectorAll("#editor-anglo-keyboard input");
        let canEncode = true;
        for (let i = 0; i < allInputs.length; i++) {
            if (!noteNames[allInputs[i].value]) {
                canEncode = false;
                break;
            }
        }

    if(canEncode) {
        let encodedLayout = "";
        for (element of editorKeyboard.children) {
            if (element.nodeName != "BR") {
                if (element.style.marginLeft != "0px") {
                    encodedLayout += `_${element.style.marginLeft.replace("px", "")}_`
                }
                for (div of element.children) {
                    for (input of div.children) {
                        encodedLayout += encoder[input.value];
                    }
                }
            } else {
                encodedLayout += ".";
            }
        }
        console.log(encodedLayout);
        console.log (window.location.href.slice(0, window.location.href.lastIndexOf("/")) + "/?" + encodedLayout)
        return encodedLayout;
    } else {
        console.error("Can't encode the layout; please fix errors");
    }
}



function isValid(note) {
    if (validNotes.includes(note)) {
        return true;
    } else {
        return false;
    }
}


function deleteButton(button) {
    if (editorKeyboard.lastChild.nodeName == "BR") {
        editorKeyboard.lastChild.remove();
    }
    // if the currently active button is the one being deleted, send the focus somewhere useful before deleting (but not on mobile; the onscreen keyboard gets annoying)
    if (!mobileDevice) {
        if (button == currentButton && button.nextSibling && button.nextSibling.nodeName != "BR") {
            button.nextSibling.firstChild.firstChild.focus()
        } else if (button == currentButton && button.nextSibling && button.nextSibling.nodeName == "BR") {
            button.nextSibling.nextSibling.firstChild.firstChild.focus()
        } else if (button == currentButton && button.previousSibling && button.previousSibling.nodeName != "BR") {
            button.previousSibling.firstChild.firstChild.focus()
        } else if (button == currentButton && button.previousSibling && button.previousSibling.nodeName == "BR") {
            button.previousSibling.previousSibling.firstChild.firstChild.focus()
        }
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


function transposeNote(direction) {
    currentField.focus()
    if (direction == "up") {
        if (editorNotes[currentField.value].next) {
            currentField.value = editorNotes[currentField.value].next;
        }
        playNote(noteNames[currentField.value]);
    } else if (direction == "down") {
        if (editorNotes[currentField.value].prev) {
            currentField.value = editorNotes[currentField.value].prev;
        }
        playNote(noteNames[currentField.value]);
    }

}




function transposeLayout(direction) {
    let allInputs = document.querySelectorAll("#editor-anglo-keyboard input");
    if (direction == "up") {
        let canTranspose = true;
        for (let i = 0; i < allInputs.length; i++) {
            if (!editorNotes[noteNames[allInputs[i].value]].next) {
                canTranspose = false;
                break;
            }
        }
        if (canTranspose) {
            for (let i = 0; i < allInputs.length; i++) {
                allInputs[i].value = editorNotes[noteNames[allInputs[i].value]].next;
            }
        }
    } else if (direction == "down") {
        let canTranspose = true;
        for (let i = 0; i < allInputs.length; i++) {
            if (!editorNotes[noteNames[allInputs[i].value]].prev) {
                canTranspose = false;
                break;
            }
        }
        if (canTranspose) {
            for (let i = 0; i < allInputs.length; i++) {
                allInputs[i].value = editorNotes[noteNames[allInputs[i].value]].prev;
            }
        }
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
        // this removes a button with no push or pull values. Probably not needed now that we have an explicit 'delete' button.
        // if (!e.target.parentNode.parentNode.firstChild.firstChild.value && !e.target.parentNode.parentNode.lastChild.firstChild.value && !e.target.parentNode.parentNode.contains(e.relatedTarget)) {
        //     deleteButton(e.target.parentNode.parentNode);
        // }
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
    if (!mobileDevice) {
        currentField.focus();
    }
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



layoutUpBtn.addEventListener("click", () => {
    transposeLayout("up");
});

layoutDownBtn.addEventListener("click", () => {
    transposeLayout("down");
});

noteUpBtn.addEventListener("click", () => {
    transposeNote("up");
});

noteDownBtn.addEventListener("click", () => {
    transposeNote("down");
});

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
});

finishedBtn.addEventListener("click", () => {
    encodeLayoutFromEditor();
})