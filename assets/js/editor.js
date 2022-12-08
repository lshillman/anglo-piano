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
    editorKeyboard.innerHTML = "";
    for (button of buttons) {
        let pushLabel = button.push;
        let pullLabel = button.pull;
        if (button.newRow) {
            editorKeyboard.innerHTML += `<br>`;
        }
        editorKeyboard.innerHTML += `<div class="editor-button" style="margin-left:${button.x}px"><div class="top"><input type=text maxlength="3" placeholder="push" value="${pushLabel}"></div><div class="bottom"><input type=text maxlength="3"  placeholder="pull" value="${pullLabel}"></div></div>`;
    }
    bindInputs("all");
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
                allInputs[i].classList.add("invalid");
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
            } else if (element != editorKeyboard.lastChild){
                encodedLayout += ".";
            }
        }
        document.getElementById("editor-error").style.display = "none";
        console.log(encodedLayout);
        customLayoutFromEditor = encodedLayout;
        customTitleFromEditor = layoutTitle.value;
        let encodedTitle = "";
        if (layoutTitle.value) {
            encodedTitle = "&title=" + encodeURI(layoutTitle.value);
            console.log(encodedTitle);
        }
        let stateObj = { Title: "Anglo Piano", Url: window.location.href.slice(0, window.location.href.lastIndexOf("/")) + "/?" + encodedLayout + encodedTitle};
        history.pushState(stateObj, stateObj.Title, stateObj.Url);
        cleanUpEditor();
        USER_LAYOUTS[customTitleFromEditor] = parseLayout("editor");
        localStorage.setItem("USER_LAYOUTS", JSON.stringify(USER_LAYOUTS));
        buildLayoutDropdown();
        opt_layout.value = "USER_LAYOUT_" + customTitleFromEditor
    } else {
        document.getElementById("editor-error").style.display = "block";
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
    if (document.querySelectorAll(".editor-button").length == 1) {
        button.firstChild.firstChild.value = "";
        button.lastChild.firstChild.value = "";
        button.firstChild.firstChild.focus();
        return;
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
    }));
    allfields.forEach((field) => field.addEventListener('focusout', (e) => {
        e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase();
        if (!isValid(e.target.value)) {
            e.target.classList.add("invalid");
        }
    }));
    allfields.forEach((field) => field.addEventListener('keydown', (e) => {
        if (e.code.indexOf('Shift') != -1) {
        } else if (e.code == "ArrowUp") {
            if (editorNotes[e.target.value].next) {
                e.target.value = editorNotes[e.target.value].next;
            }
            playNote(noteNames[e.target.value]);
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
    if (fields == "new") {
        document.querySelectorAll(".newbutton").forEach((button) => {
            button.classList.remove("newbutton");
        })
    }
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

function insertButton(where) {
    let newButton = `<div class="editor-button newbutton" style="margin-left:0px"><div class="top"><input type=text maxlength="3" placeholder="push" value=""></div><div class="bottom"><input type=text maxlength="3" placeholder="pull" value=""></div></div>`;
    if (where == "left") {
        currentButton.insertAdjacentHTML("beforebegin", newButton);
        bindInputs("new");
        currentButton.previousSibling.firstChild.firstChild.focus();
    } else if (where == "right") {
        currentButton.insertAdjacentHTML("afterend", newButton);
        bindInputs("new");
        currentButton.nextSibling.firstChild.firstChild.focus();
    } else if (where == "newRow") {
        editorKeyboard.lastChild.insertAdjacentHTML("afterend", "<br>" + newButton);
        bindInputs("new");
        editorKeyboard.lastChild.firstChild.firstChild.focus();
    }
}

function cleanUpEditor() {
    editorKeyboard.innerHTML = "";
    layoutTitle.value = "";
    document.getElementById("editor-error").style.display = "none";
    editorSection.style.display = "none";
    viewerSection.style.display = "block";
    currentMode = "view";
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