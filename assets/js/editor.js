const editorContainer = document.getElementById("editor-container");
const editorSection = document.getElementById("editor");
const editLayoutBtn = document.getElementById("editLayoutBtn");






function renderEditor() {
    editorContainer.style.display = "block";
    editor.innerHTML = "";
    for (button of buttons) {
        let pushLabel = button.push;
        let pullLabel = button.pull;
        if (button.newRow) {
            editor.innerHTML += `<br>`;
        }
        editorSection.innerHTML += `<div class="editor-button" style="margin-left:${button.x}px"><div class="top"><input type=text value="${pushLabel}"></div><div class="bottom"><input type=text value="${pullLabel}"></div></div>`;
    }


}


















editLayoutBtn.addEventListener("click", () => {
    renderEditor();
});