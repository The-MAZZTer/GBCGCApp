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

	$(window).resize(sizeCanvas);
	
	$(document).mousedown(function() {
		if (document.dropdown) {
			closeDropDown({target: document.dropdown});
		}
	}).keydown(function(e) {
		var control = keyMap[e.keyCode];
		if (!control) {
			return true;
		}
		
		e.stopPropagation();
		e.preventDefault();
		controlDownMap[control](control);
		return false;
	}).keyup(function(e) {
		var control = keyMap[e.keyCode];
		if (!control) {
			return true;
		}
		
		e.stopPropagation();
		e.preventDefault();
		controlUpMap[control](control);
		return false;
	}).on("selectstart", function() {
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
		"webkitfullscreenchange", sizeCanvas);
	
	$("#openfile").click(function() {
		$.create("input").prop("type", "file").prop("accept",
			".gb,.gbc").change(function() {
			
			$(this).off("change");
			openROM(this.files[0]);
		}).click();
	});
	$("#pause").click(function() {
		$("#pause").addClass("hidden");
		$("#resume").removeClass("hidden");
		pause();
	});
	$("#resume").click(function() {
		$("#resume").addClass("hidden");
		$("#pause").removeClass("hidden");
		run();
	});
	$("#reset").click(function() {
		if (GameBoyEmulatorInitialized()) {
			loadROM(gameboy.getROMImage());
		}
	});
	
	$("#selectstate, #tools").mousedown(function(e) {
		var dropdown = $("#" + e.target.id + "_dropdown");
		if (document.dropdown === e.target) {
			$(e.target).mouseup(closeDropDown);
		} else {
			if (document.dropdown) {
				closeDropDown({target: document.dropdown});
			}
			document.dropdown = e.target;
			$(e.target).addClass("selected");
			dropdown.slideDown("fast", sizeCanvas);
		}
		
		e.stopPropagation();
		e.preventDefault();
		return false;
	});

	$("#selectstate_dropdown, #tools_dropdown").mousedown(function(e) {
		e.stopPropagation();
		e.preventDefault();
		return false;
	});
	
	for (var i = 1; i <= 20; i++) {
		var button = $.create("button").text(i);
		if (i == 1) {
			button.addClass("selected");
		}
		$("#selectstate_dropdown").append(button);
	}
	
	$("#fullscreen").click(toggleFullScreen);
	
	sizeCanvas();
});

function closeDropDown(e) {
	delete document.dropdown;
	$(e.target).removeClass("selected").unbind("mouseup", closeDropDown);
	$("#" + e.target.id + "_dropdown").not(":hidden").slideUp("fast", sizeCanvas);
}

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

function loadROM(data) {
	$("#toolbar > button").removeClass("disabled");
	$("#resume").addClass("hidden");
	$("#pause").removeClass("hidden");
	
	start($("canvas")[0], data);
}

function openROM(file) {
	var fr = new FileReader();
	fr.onload = function() {
		loadROM(this.result);
	}
	fr.readAsBinaryString(file);
}

function sizeCanvas() {
	if (document.isFullScreen || document.webkitIsFullScreen ||
		document.fullScreenElement || document.webkitFullScreenElement) {
		
		$("canvas").addClass("fullscreen").height("100%").width("100%");
	} else {
		$("canvas").removeClass("fullscreen").height($("body").height() -
			$("#toolbar").height() - ($("#secondaryToolbar").not(":hidden").height()
			|| 0)).width("100%");
	}
}