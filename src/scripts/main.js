$(document).ready(function() {
	$(document).on("dragover", function(e) {
		e.stopPropagation();
		var items = e.originalEvent.dataTransfer.items;
		if (items.length != 1 || items[0].kind != "file") {
			return;
		}
		e.originalEvent.dataTransfer.dropEffect = "copy";
	}).on("drop", function(e) {
		e.stopPropagation();
		e.preventDefault();
		openROM(e.originalEvent.dataTransfer.files[0]);
	});
	
	$("#openfile").click(function() {
		$.create("input").prop("type", "file").prop("accept", ".gb,.gbc").change(function() {
			$(this).off("change");
			openROM(this.files[0]);
		}).click();
	});
});

function openROM(file) {
	var fr = new FileReader();
	fr.onload = function() {
		start($("canvas")[0], this.result);
	}
	fr.readAsBinaryString(file);
}

function cout() {
	console.log.apply(console, arguments);
}