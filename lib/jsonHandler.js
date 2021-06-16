// to use : past raw json in the second entry and click on load
function loadWorld(){
    var json = document.getElementById('json').value;

    blocks = JSON.parse(json);
    console.log("json loaded");
    drawScene();
}

// to use click on save, it will output a json saving the array "blocks"
function saveWorld(){
    var name = "save"+Date.now()+".txt";

    var jsonString = JSON.stringify(blocks);

    var a = document.createElement("a");
    var file = new Blob([jsonString], {type: jsonString});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}