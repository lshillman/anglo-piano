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
const insertLeftBtn = document.getElementById("insertLeftBtn");
const insertRightBtn = document.getElementById("insertRightBtn");
const newRowBtn = document.getElementById("newRowBtn");


const deleteBtn = document.getElementById("deleteBtn");
const cancelBtn = document.getElementById("cancelBtn");
const finishedBtn = document.getElementById("finishedBtn");
const layoutTitle = document.getElementById("layoutTitle");

const notePicker = document.getElementById("mobile-note-picker");


let validNotes = Object.keys(editorNotes);
let currentButton;
let currentField;

let customLayoutFromEditor;
let parsedLayoutFromEditor;
let customTitleFromEditor;


function renderEditor() {
    currentMode = "edit"
    editorSection.style.display = "block";
    viewerSection.style.display = "none";
    if (opt_layout.value == "customFromURL" && urlParams.title) {
        layoutTitle.value = urlParams.title;
    } else if (opt_layout.value.includes("USER_LAYOUT")) {
        layoutTitle.value = opt_layout.value.slice(12);
    }
    editorKeyboard.innerHTML = "";
    let readonly = "";
    if(mobileDevice) {
        readonly = " readonly";
    } else {
        notePicker.style.display = "none";
    }
    for (button of buttons) {
        let pushLabel = button.push;
        let pullLabel = button.pull;
        if (button.newRow) {
            editorKeyboard.innerHTML += `<br>`;
        }
        editorKeyboard.innerHTML += `<div class="editor-button" style="margin-left:${button.x}px"><div class="top"><input type=text maxlength="3" placeholder="push"${readonly} value="${pushLabel}"></div><div class="bottom"><input type=text maxlength="3"  placeholder="pull"${readonly} value="${pullLabel}"></div></div>`;
    }
    bindInputs("all");
    currentField = document.querySelectorAll("#editor-anglo-keyboard input")[0];
    currentButton = document.querySelectorAll("#editor-anglo-keyboard .editor-button")[0];
    currentButton.classList.add("selected");
    currentField.focus();
}


function encodeLayoutFromEditor () {
    let errors = "";

    if (!layoutTitle.value.trim()) {
        layoutTitle.classList.add("invalid");
        errors += `<span class="error-text">Please give the layout a title.</span>`
    } else if (opt_layout.value.slice(12) != layoutTitle.value && USER_LAYOUTS[layoutTitle.value]) {
        layoutTitle.classList.add("invalid");
        errors += `<span class="error-text">You already have a layout with this title. Please choose a different one.</span>`
    } else {
        layoutTitle.classList.remove("invalid");
    }

    //validate all notes
    let allInputs = document.querySelectorAll("#editor-anglo-keyboard input");
    let canEncode = true;
    for (let i = 0; i < allInputs.length; i++) {
        if (!noteNames[allInputs[i].value]) {
            canEncode = false;
            allInputs[i].classList.add("invalid");
        }
    }

    if (!canEncode) {
        errors += `<span class="error-text">Please correct the notes outlined in red. Buttons must have a valid push note and pull note in the range of D2 - D7. Notes must include octave numbers. Use ‘b’ for flat and ‘#’ for sharp.</span>`
    }

    if (errors) {
        document.getElementById("editor-error").innerHTML = errors;
        document.getElementById("editor-error").style.display = "block";
        return;
    } else if(canEncode) {
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
            } else if (element != editorKeyboard.lastChild){
                encodedLayout += ".";
            }
        }
        document.getElementById("editor-error").style.display = "none";
        console.log(encodedLayout);
        customLayoutFromEditor = encodedLayout;
        customTitleFromEditor = layoutTitle.value.trim();
        let encodedTitle = "";
        if (layoutTitle.value.trim()) {
            encodedTitle = "&title=" + encodeURI(layoutTitle.value.trim());
            console.log(encodedTitle);
        }
        cleanUpEditor();
        USER_LAYOUTS[customTitleFromEditor] = {layout: parseLayout("editor"), url: window.location.href.slice(0, window.location.href.lastIndexOf("/")) + "/?layout=" + encodedLayout + encodedTitle}
        localStorage.setItem("USER_LAYOUTS", JSON.stringify(USER_LAYOUTS));
        buildLayoutDropdown();
        opt_layout.value = "USER_LAYOUT_" + customTitleFromEditor;
        selectLayout();
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
    if (document.querySelectorAll(".editor-button").length == 1) {
        button.firstChild.firstChild.value = "";
        button.lastChild.firstChild.value = "";
        button.style.marginLeft = 0;
        button.firstChild.firstChild.focus();
        return;
    }
    // if the currently active button is the one being deleted, send the focus somewhere useful before deleting

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


function transposeNote(direction) {
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
    currentField.focus();
    populatePicker();
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



function bindInputs(fields) {
    let allfields;
    if (fields == "all") {
        allfields = document.querySelectorAll(".editor-button input");
    } else if (fields = "new") {
        allfields = document.querySelectorAll(".newbutton input");
    }
    allfields.forEach((field) => field.addEventListener('input', (e) => {
        if (isValid(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase())) {
            e.target.classList.remove("invalid");
            e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase();
            playNote(noteNames[e.target.value]);
        }
    }
    ));
    allfields.forEach((field) => field.addEventListener('focus', (e) => {
        currentField = e.target;
        currentButton = e.target.parentNode.parentNode;
        document.querySelectorAll(".editor-button").forEach((button) => {button.classList.remove("selected")});
        currentButton.classList.add("selected");
        mobileDevice && populatePicker();
    }));
    allfields.forEach((field) => field.addEventListener('focusout', (e) => {
        e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase();
        if (!isValid(e.target.value)) {
            e.target.classList.add("invalid");
        } else {
            e.target.classList.remove("invalid");
        }
    }));
    allfields.forEach((field) => field.addEventListener('keydown', (e) => {
        if (e.code.indexOf('Shift') != -1) {
        } else if (e.code == "ArrowUp") {
            transposeNote("up");
        } else if (e.code == "ArrowDown") {
            transposeNote("down");
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
    if (fields == "new") {
        document.querySelectorAll(".newbutton").forEach((button) => {
            button.classList.remove("newbutton");
        })
    }
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

function insertButton(where) {
    let readonly = "";
    if (mobileDevice) {
        readonly = " readonly";
    }
    let newButton = `<div class="editor-button newbutton" style="margin-left:0px"><div class="top"><input type=text maxlength="3"${readonly} placeholder="push" value=""></div><div class="bottom"><input type=text maxlength="3"${readonly} placeholder="pull" value=""></div></div>`;
    if (where == "left") {
        currentButton.insertAdjacentHTML("beforebegin", newButton);
        bindInputs("new");
        currentButton.previousSibling.firstChild.firstChild.focus();
    } else if (where == "right") {
        currentButton.insertAdjacentHTML("afterend", newButton);
        bindInputs("new");
        currentButton.nextSibling.firstChild.firstChild.focus();
    } else if (where == "newRow") {
        if (editorKeyboard.lastChild.nodeName == "BR") {
            editorKeyboard.lastChild.remove();
        }
        editorKeyboard.lastChild.insertAdjacentHTML("afterend", "<br>" + newButton);
        bindInputs("new");
        editorKeyboard.lastChild.firstChild.firstChild.focus();
    }
}


function pickNote(e) {
    let unspecified = notePicker.querySelector("#unspecified");
    if (e.target.id == "prev-field" || e.target.parentNode.id == "prev-field") {
        let inputs = document.querySelectorAll("#editor-anglo-keyboard input");
        for ( i=0; i < inputs.length; i++) {
            if (inputs[i] == currentField && i != 0) {
                currentField = inputs[i-1];
                currentField.focus()
                break;
             }
        }   
    } else if (e.target.id == "next-field" || e.target.parentNode.id == "next-field") {
        let inputs = document.querySelectorAll("#editor-anglo-keyboard input");
        for ( i=0; i < inputs.length; i++) {
            if (inputs[i] == currentField && i != inputs.length -1) {
                currentField = inputs[i+1];
                currentField.focus()
                break;
             }
        }   
    } else if (e.target.id == "unspecified") {
        [...document.querySelectorAll("#mobile-notes button")].forEach((button) => {
            button.classList.remove("selected");
        });
        [...document.querySelectorAll("#mobile-octave button")].forEach((button) => {
            button.classList.remove("selected");
        });
        [...document.querySelectorAll("#mobile-accidental button")].forEach((button) => {
            button.classList.remove("selected");
        });
        e.target.classList.add("selected");
    } else if ("CDEFGABC".includes(e.target.innerText)) {
        [...document.querySelectorAll("#mobile-notes button")].forEach((button) => {
            button.classList.remove("selected");
        });
        e.target.classList.add("selected");
    } else if ("♭♯".includes(e.target.innerText) && !unspecified.classList.contains("selected")) {
        if (e.target.classList.contains("selected")) {
            e.target.classList.remove("selected");
        } else {
            [...document.querySelectorAll("#mobile-accidental button")].forEach((button) => {
                button.classList.remove("selected");
            });
            e.target.classList.add("selected");
        }
    } else if ("234567".includes(e.target.innerText) && !unspecified.classList.contains("selected")) {
        [...document.querySelectorAll("#mobile-octave button")].forEach((button) => {
            button.classList.remove("selected");
        });
        e.target.classList.add("selected");
    }
    let selectedNote = "";
    [...document.querySelectorAll("#mobile-note-picker button.selected")].forEach((button) => {
        selectedNote += button.innerText
    })
    console.log(selectedNote);
    currentField.value = selectedNote.replace("♭", "b").replace("♯", "#");
    if (isValid(selectedNote.replace("♭", "b").replace("♯", "#"))) {
        playNote(noteNames[selectedNote.replace("♭", "b").replace("♯", "#")]);
    }
    currentField.focus();
}

function populatePicker() {
    document.querySelectorAll("#mobile-note-picker button").forEach((button) => {
        button.classList.remove("selected");
    });
    document.querySelectorAll("#mobile-notes button").forEach((button) => {
        if (button.innerText == currentField.value[0]) {
            button.classList.add("selected");
        }
    });
    document.querySelectorAll("#mobile-octave button").forEach((button) => {
        if (currentField.value.includes(button.innerText)) {
            button.classList.add("selected");
        }
    });
    if (currentField.value.includes("#")) {
        document.querySelector("#mobile-accidental button:first-child").classList.add("selected");
    }
    if (currentField.value.includes("b")) {
        document.querySelector("#mobile-accidental button:last-child").classList.add("selected");
    }
}


function cleanUpEditor() {
    editorKeyboard.innerHTML = "";
    layoutTitle.value = "";
    layoutTitle.classList.remove("invalid");
    document.getElementById("editor-error").style.display = "none";
    editorSection.style.display = "none";
    viewerSection.style.display = "block";
    currentMode = "view";
}


notePicker.addEventListener("click", (e) => {
    pickNote(e);
});

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

insertLeftBtn.addEventListener("click", () => {
    insertButton("left");
});

insertRightBtn.addEventListener("click", () => {
    insertButton("right");
});

newRowBtn.addEventListener("click", () => {
    insertButton("newRow");
});

deleteBtn.addEventListener("click", () => {
    deleteButton(currentButton);
})

editLayoutBtn.addEventListener("click", () => {
    renderEditor();
});

cancelBtn.addEventListener("click", () => {
    cleanUpEditor();
});

finishedBtn.addEventListener("click", () => {
    encodeLayoutFromEditor();
})