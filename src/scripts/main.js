$(document).ready(function() {
	var controlDownMap = {
		"right": GameBoyKeyDown,
		"up": GameBoyKeyDown,
		"left": GameBoyKeyDown,
		"down": GameBoyKeyDown,
		"b": GameBoyKeyDown,
		"a": GameBoyKeyDown,
		"select": GameBoyKeyDown,
		"start": GameBoyKeyDown,
		"fullscreen": toggleFullScreen
	}
	var controlUpMap = {
		"right": GameBoyKeyUp,
		"up": GameBoyKeyUp,
		"left": GameBoyKeyUp,
		"down": GameBoyKeyUp,
		"b": GameBoyKeyUp,
		"a": GameBoyKeyUp,
		"select": GameBoyKeyUp,
		"start": GameBoyKeyUp,
		"fullscreen": function() {}
	}

	$(document).on("keydown", function(e) {
		var control = keyMap[e.keyCode];
		if (!control) {
			return true;
		}
		
		e.stopPropagation();
		e.preventDefault();
		controlDownMap[control](control);
		return false;
	}).on("keyup", function(e) {
		var control = keyMap[e.keyCode];
		if (!control) {
			return true;
		}
		
		e.stopPropagation();
		e.preventDefault();
		controlUpMap[control](control);
		return false;
	}).on("dragover", function(e) {
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
	}).on("onfullscreenchange" in document ? "fullscreenchange" :
		"webkitfullscreenchange", function() {
		
		if (document.isFullScreen || document.webkitIsFullScreen ||
			document.fullScreenElement || document.webkitFullScreenElement) {
			
			$("canvas").addClass("fullscreen");
		} else {
			$("canvas").removeClass("fullscreen");
		}
	});
	
	$("#openfile").click(function() {
		$.create("input").prop("type", "file").prop("accept",
			".gb,.gbc").change(function() {
			
			$(this).off("change");
			openROM(this.files[0]);
		}).click();
	});
	
	$("#fullscreen").click(toggleFullScreen);
});

var keyMap = {
	39: "right",
	37: "left",
	38: "up",
	40: "down",
	88: "a",
	90: "b",
	9: "select",
	13: "start",
	122: "fullscreen"
}

function toggleFullScreen() {
	if (document.isFullScreen || document.webkitIsFullScreen ||
		document.fullScreenElement || document.webkitFullScreenElement) {
		
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else {
			document.webkitCancelFullScreen();
		}
		return;
	}
	
	var canvas = $("canvas")[0];
	if (canvas.requestFullScreen) {
		canvas.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	} else {
		canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}
}

function cout(message, colorIndex) {
	console[["log", "warn", "error"][colorIndex || 0]](message);
}

function openROM(file) {
	var fr = new FileReader();
	fr.onload = function() {
		start($("canvas")[0], this.result);
	}
	fr.readAsBinaryString(file);
}