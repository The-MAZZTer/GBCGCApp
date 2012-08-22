Function.Empty = function() {}

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
		"savestate": SaveStates.save,
		"loadstate": SaveStates.load,
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
		"savestate": Function.Empty,
		"loadstate": Function.Empty,
		"fullscreen": Function.Empty
	}
	
	$(window).resize(sizeCanvas).unload(function() {
		autoSave();
	});
	
	$(document).mousedown(closeDropDown).keydown(function(e) {
		if (e.target.tagName == "INPUT") {
			return true;
		}
		
		if ($("#aboutlayer").is(":visible")) {
			closeAbout();
			e.stopPropagation();
			e.preventDefault();
			return false;
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
	
	$("#loadstate").click(SaveStates.load);
	
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
	
	$("#savestate").click(SaveStates.save);
	
	$("#fullscreen").click(toggleFullScreen);
	
	$("#options").click(function() {
		if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
			$("#pause").click();
		}
		closeDropDown();
		window.open("options.html");
	});
	$("#managestates").click(function() {
		if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
			$("#pause").click();
		}
		closeDropDown();
		window.open("options.html#manage");
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
	
	window.slotUsed = 1;
	for (var i = 1; i <= 20; i++) {
		var button = $.create("button").prop("id", "slot" +
			i).text(i).click(function() {
			
			switchSlot(this.id);
		});
		if (i == window.slotUsed) {
			button.addClass("selected");
		}
		$("#selectstate_dropdown").append(button);
		
		controlDownMap["slot" + i] = switchSlot;
		controlUpMap["slot" + i] = Function.Empty;
	}
	
	$("#about").click(function() {
		if (window.autoResume = (GameBoyEmulatorInitialized() &&
			GameBoyEmulatorPlaying())) {
			
			$("#pause").click();
		}
		$("#aboutlayer").removeClass("hidden");
	});
	$("#aboutlayer").click(closeAbout);
	
	sizeCanvas();

	Settings.init();
	setVolume({target: {value: Settings.volume}});
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
	122: "fullscreen",
	49: "slot1",
	50: "slot2",
	51: "slot3",
	52: "slot4",
	53: "slot5",
	54: "slot6",
	55: "slot7",
	56: "slot8",
	57: "slot9",
	48: "slot10"
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
	gameboy.setSpeed($("#speed_text").val());
	
	$("#selectstate_dropdown > button").each(function(index, element) {
		if (SaveStates.exists(index + 1)) {
			$(element).addClass("slotused");
		} else {
			$(element).removeClass("slotused");
		}
	});
	if (SaveStates.exists(window.slotUsed)) {
		$("#selectstate").addClass("slotused");
		$("#loadstate").removeClass("disabled");
	} else {
		$("#selectstate").removeClass("slotused");
		$("#loadstate").addClass("disabled");
	}
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
	var val = Math.min(Math.max(parseFloat(e.target.value), 0), 1);
	
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
	
	Settings.volume = val;
	Settings.onchange();
	
	if (GameBoyEmulatorInitialized()) {
		gameboy.changeVolume();
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
	var val = parseFloat(e.target.value);
	if (e.target.id == "speed") {
		val = Math.max(Math.round(Math.pow(val, 3) * 1000) / 1000, 0.001);
		$("#speed_text").val(val);
	} else {
		val = Math.max(val, 0.001);
		$("#speed").val(Math.pow(val, 1/3));
	}
	
	if (val < 1) {
		$("#speed_button").removeClass().addClass("less");
	} else if (val > 1) {
		$("#speed_button").removeClass().addClass("more");
	} else {
		$("#speed_button").removeClass();
	}
	
	if (GameBoyEmulatorInitialized()) {
		gameboy.setSpeed(val);
	}
}

function closeAbout() {
	if (window.autoResume) {
		$("#resume").click();
	}
	
	$("#aboutlayer").addClass("hidden");
}

function switchSlot(slot) {
	var index = parseInt(slot.substr(4), 10);
	$("#selectstate_dropdown > button:nth-child(" + window.slotUsed +
		")").removeClass("selected");
	$("#selectstate_dropdown > button:nth-child(" + index +
		")").addClass("selected");
	$("#selectstate").text(index);
	if (SaveStates.exists(index)) {
		$("#selectstate").addClass("slotused");
		$("#loadstate").removeClass("disabled");
	} else {
		$("#selectstate").removeClass("slotused");
		$("#loadstate").addClass("disabled");
	}
	window.slotUsed = index;
	closeDropDown();
}

SaveStates = {
	exists: function(n) {
		return GameBoyEmulatorInitialized() && Boolean(localStorage["FREEZE_" +
			gameboy.name + "_" + n]);
	},
	save: function() {
		if (GameBoyEmulatorInitialized()) {
			localStorage["FREEZE_" + gameboy.name + "_" + window.slotUsed] =
				JSON.stringify(gameboy.saveState());
			
			$("#selectstate_dropdown > button:nth-child(" + window.slotUsed +
				")").addClass("slotused");
			$("#selectstate").addClass("slotused");
			$("#loadstate").removeClass("disabled");
		}
	},
	load: function() {
		if (GameBoyEmulatorInitialized() && SaveStates.exists(window.slotUsed)) {
			var filename = "FREEZE_" + gameboy.name + "_" + window.slotUsed;
			clearLastEmulation();
			gameboy = new GameBoyCore($("canvas")[0], "");
			gameboy.savedStateFileName = filename;
			gameboy.returnFromState(JSON.parse(localStorage[filename]));
			gameboy.setSpeed($("#speed_text").val());
			$("#resume").click();
		}
	}
}
