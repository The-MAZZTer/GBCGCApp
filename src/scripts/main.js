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
		"savestate": function() {},
		"loadstate": function() {},
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
		"savestate": function() {},
		"loadstate": function() {},
		"fullscreen": function() {}
	}

	$(window).resize(sizeCanvas);
	
	$(document).mousedown(closeDropDown).keydown(function(e) {
		if (e.target.tagName == "INPUT") {
			return true;
		}
	
		closeDropDown();
	
		var control = keyMap[e.keyCode];
		if (!control) {
			return true;
		}
		
		e.stopPropagation();
		e.preventDefault();
		controlDownMap[control](control);
		return false;
	}).keyup(function(e) {
		if (e.target.tagName == "INPUT") {
			return true;
		}
	
		closeDropDown();
	
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
		$.create("INPUT").prop("type", "file").prop("accept",
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
			closeDropDown();
			document.dropdown = e.target;
			$(e.target).addClass("selected");
			dropdown.slideDown("fast", sizeCanvas);
		}
		
		e.stopPropagation();
		e.preventDefault();
		return false;
	});

	$("#selectstate_dropdown, #tools_dropdown").mousedown(function(e) {
		if (e.target.tagName == "INPUT") {
			return true;
		}
	
		e.stopPropagation();
		e.preventDefault();
		return false;
	});
	
	$("#volume_button").click(function() {
		if ($("#volume").val() <= 0) {
			$("#volume").val(window.unmuteTo || 1);
			setVolume({target: $("#volume")[0]});
		} else {
			window.unmuteTo = $("#volume").val();
			$("#volume").val(0);
			setVolume({target: $("#volume")[0]});
		}
	});
	$("#volume").change(setVolume).mouseup(rememberUnmute);
	$("#volume_text").change(setVolume).blur(rememberUnmute);

	$("#speed_button").click(function() {
		$("#speed").val(1);
		setSpeed({target: $("#speed")[0]});
	});
	$("#speed").change(setSpeed);
	$("#speed_text").change(setSpeed);
	
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
	if (e && e.target.tagName == "INPUT") {
		return true;
	}
	
	var x = document.dropdown;
	if (x) {
		$(x).removeClass("selected").unbind("mouseup", closeDropDown);
		$("#" + x.id + "_dropdown").not(":hidden").slideUp("fast", sizeCanvas);
		delete document.dropdown;
	}
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
	116: "savestate",
	120: "loadstate",
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
	$("#toolbar button").removeClass("disabled");
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

function setVolume(e) {
	var val = e.target.value;
	
	$("#volume").val(val);
	$("#volume_text").val(val);
	
	if (val <= 0) {
		$("#volume_button").removeClass().addClass("mute");
	} else if (val <= 1/3) {
		$("#volume_button").removeClass().addClass("none");
	} else if (val <= 2/3) {
		$("#volume_button").removeClass().addClass("low");
	} else {
		$("#volume_button").removeClass();
	}
}

function rememberUnmute() {
	var val = $("#volume").val();
	if (val <= 0) {
		return;
	}
	window.unmuteTo = val;
}

function setSpeed(e) {
	var val = e.target.value;
	if (e.target.id == "speed") {
		val = Math.round(Math.pow(val, 3) * 1000) / 1000;
		$("#speed_text").val(val);
	} else {
		$("#speed").val(Math.pow(val, 1/3));
	}
	
	if (val < 1) {
		$("#speed_button").removeClass().addClass("less");
	} else if (val > 1) {
		$("#speed_button").removeClass().addClass("more");
	} else {
		$("#speed_button").removeClass();
	}
}