const viewerSection = document.getElementById("viewer");
const editorContainer = document.getElementById("editor-container");
const editor = document.getElementById("editor");
const editLayoutBtn = document.getElementById("editLayoutBtn");






function renderEditor() {
    currentMode = "edit"
    editorContainer.style.display = "block";
    viewerSection.style.display = "none";
    editor.innerHTML = "";
    for (button of buttons) {
        let pushLabel = button.push;
        let pullLabel = button.pull;
        if (button.newRow) {
            editor.innerHTML += `<br>`;
        }
        editor.innerHTML += `<div class="editor-button" style="margin-left:${button.x}px"><div class="top"><input type=text value="${pushLabel}"></div><div class="bottom"><input type=text value="${pullLabel}"></div></div>`;
    }
    bindInputs();

}






function bindInputs() {
    let allfields = document.querySelectorAll(".editor-button input");
    allfields.forEach((field) => field.addEventListener('input', (e) => {
        console.log(e.target.value);
    }
    ));
    allfields.forEach((field) => field.addEventListener('blur', (e) => {
        console.log("Now validating " + e.target.value);
    }));
}









editLayoutBtn.addEventListener("click", () => {
    renderEditor();
});