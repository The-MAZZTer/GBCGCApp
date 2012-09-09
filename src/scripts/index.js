Function.Empty = function() {}

$(document).ready(function() {
	window.forceTilt = {up: false, down: false, left: false, right: false};
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
		"fullscreen": toggleFullScreen,
		"fastforward": function() {
			window.fastforward = true
			if (GameBoyEmulatorInitialized) {
				gameboy.setSpeed(Settings.fastForwardSpeed);
			}
		},
		"tiltup": function() {
			window.forceTilt.up = true;
			changeTilt();
		},
		"tiltdown": function() {
			window.forceTilt.down = true;
			changeTilt();
		},
		"tiltleft": function() {
			window.forceTilt.left = true;
			changeTilt();
		},
		"tiltright": function() {
			window.forceTilt.right = true;
			changeTilt();
		}
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
		"fullscreen": Function.Empty,
		"fastforward": function() {
			delete window.fastforward;
			if (GameBoyEmulatorInitialized) {
				gameboy.setSpeed($("#speed_text").val());
			}
		},
		"tiltup": function() {
			window.forceTilt.up = false;
			changeTilt();
		},
		"tiltdown": function() {
			window.forceTilt.down = false;
			changeTilt();
		},
		"tiltleft": function() {
			window.forceTilt.left = false;
			changeTilt();
		},
		"tiltright": function() {
			window.forceTilt.right = false;
			changeTilt();
		}
	}
	
	$(window).resize(sizeCanvas).on("beforeunload", function() {
		if (!GameBoyEmulatorInitialized() || !gameboy.name) {
			return;
		}
		
		db.writeGame(true);
		if (Settings.autoSaveState) {
			db.quickSaveStateSave();
		} else {
			delete window.pendingSaveState;
		}
		
		if ((window.pendingSave ? window.pendingSave.length : 0) +
			(window.pendingSaveState ? window.pendingSaveState.length : 0) > 2600000)
			{
			
			return chrome.i18n.getMessage("unableToAutoSave");
		}
	}).unload(function() {
		if (GameBoyEmulatorInitialized() && gameboy.name) {
			try {
				if (window.pendingSave) {
					localStorage.pendingSave = window.pendingSave;
				}
				if (Settings.autoSaveState && window.pendingSaveState) {
					localStorage.pendingSaveState = window.pendingSaveState;
				}
			} catch(e) {}
		}
		delete window.pendingSave;
		delete window.pendingSaveState;
	}).on("deviceorientation", changeTilt).focus(function() {
		window.isFocused = true;
	}).blur(function() {
		window.isFocused = false;
	});
	
	$(document).mousedown(closeDropDown).keydown(function(e) {
		window.isFocused = true;
	
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
		
		var control = Settings.keyMap[e.keyCode];
		if (!control) {
			return true;
		}
		
		e.stopPropagation();
		e.preventDefault();
		controlDownMap[control](control);
		return false;
	}).keyup(function(e) {
		window.isFocused = true;	

		if (e.target.tagName == "INPUT") {
			return true;
		}
		
		closeDropDown();
		
		var control = Settings.keyMap[e.keyCode];
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
		window.isFocused = true;
		e.stopPropagation();
		e.preventDefault();
		openROM(e.originalEvent.dataTransfer.files[0]);
	}).on("onfullscreenchange" in document ? "fullscreenchange" :
		"webkitfullscreenchange", sizeCanvas);
	
	$("#openfile").click(function() {
		openFile(openROM, ".gb,.gbc");
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
			loadROM(gameboy.getROMImage(), true);
		}
	});
	
	$("#loadstate").click(SaveStates.load);
	
	$("#selectstate, #tools").mousedown(function(e) {
		window.isFocused = true;
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
		window.isFocused = true;
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
		closeDropDown();
		window.open("options.html");
	});
	$("#controls").click(function() {
		closeDropDown();
		window.open("options.html#controls");
	});
	$("#managestates").click(function() {
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
	
	$("#close").click(closeROM);
	
	if (Settings.imageSmoothing) {
		$("canvas").addClass("smooth");
	}

	sizeCanvas();

	setVolume({target: {value: Settings.volume}});
	
	db.readyHandlers.push(function() {
		var query = location.search;
		if (query[0] == "?") {
			query = query.substr(1).split("&");
			var kvp = {};
			for (var i = 0; i < query.length; i++) {
				var x = query[i].split("=");
				kvp[x[0]] = x[1];
			}
			if (kvp.file) {
				loadROM(decodeURI(kvp.file));
			}
		}
	});
	db.init();
	
	$("canvas").mousemove(function(e) {
		if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
			var x = e.offsetX / this.offsetWidth;
			var y = e.offsetY / this.offsetHeight;
			gameboy.GyroEvent(x * 2 - 1, y * 2 - 1);
		}
	});
});

var lastTilt = { beta: 0, gamma: 0 };
function changeTilt(e) {
	/*if (e) {
		lastTilt.beta = e.beta;
		lastTilt.gamma = e.gamma;
		e.preventDefault();
	}
	if (GameBoyEmulatorInitialized() && GameBoyEmulatorPlaying()) {
		if (window.forceTilt.left && !window.forceTilt.right) {
			var x = -1;
		} else if (!window.forceTilt.left && window.forceTilt.right) {
			var x = 1;
		} else {
			var x = (lastTilt.gamma * Math.PI / 180) || 0;
		}
		if (window.forceTilt.up && !window.forceTilt.down) {
			var y = -1;
		} else if (!window.forceTilt.up && window.forceTilt.down) {
			var y = 1;
		} else {
			var y = (lastTilt.beta * Math.PI / 180) || 0;
		}
		
		gameboy.GyroEvent(x, y);
	}*/
}
function closeDropDown(e) {
	window.isFocused = true;	
	
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
	
	var canvas = $("#canvasContainer")[0];
	if (canvas.requestFullScreen) {
		canvas.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	} else {
		canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}
}

function cout(message, colorIndex) {
	console[["log", "warn", "error"][colorIndex || 0]](message);
}

function closeROM(reset) {
	if (GameBoyEmulatorInitialized()) {
		if (reset === true) {
			db.writeGame();
		} else {
			autoSave();	//If we are about to load a new game, then save the last one...
		}
		clearLastEmulation();
	}

	$("#pause, #resume, #reset, #loadstate, #savestate, #close").
		addClass("disabled");
	$("#resume").addClass("hidden");
	$("#pause").removeClass("hidden");
	$("#selectstate_dropdown > button, #selectstate").removeClass("slotused");
	
	var canvas = $("canvas")[0];
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	gameboy = null;
}

function loadROM(data, reset) {
	closeROM(reset);

	$("#toolbar button").removeClass("disabled");
	$("#resume").addClass("hidden");
	$("#pause").removeClass("hidden");
	var name = "";
	for (var index = 0x134; index < 0x13F; index++) {
		if (data.charCodeAt(index) > 0) {
			name += data[index];
		}
	}
	
	db.readGame(name, function(res) {
		gameboy = new GameBoyCore($("canvas")[0], data);
		gameboy.openMBC = function() { return (res && res.SRAM) || [] };
		gameboy.openRTC = function() { return (res && res.RTC) || [] };
		gameboy.start();
		
		if (!reset && Settings.autoSaveState) {
			SaveStates.load(0, function(data) {
				autoSaveLoaded();
			});
		} else {
			autoSaveLoaded();
		}
	});
}

function autoSaveLoaded() {
	run();
	
	if (window.fastforward) {
		gameboy.setSpeed(Settings.fastForwardSpeed);
	} else {
		gameboy.setSpeed($("#speed_text").val());
	}
	
	$("#selectstate_dropdown > button").removeClass("slotused").
		each(function(index, element) {
		
		SaveStates.exists(index + 1, function(data, n) {
			if (data && data.state) {
				$($("#selectstate_dropdown > button")[n - 1]).addClass("slotused");
			}
		});
	});
	SaveStates.exists(window.slotUsed, function(data) {
		if (data && data.state) {
			$("#selectstate").addClass("slotused");
			$("#loadstate").removeClass("disabled");
		} else {
			$("#selectstate").removeClass("slotused");
			$("#loadstate").addClass("disabled");
		}
	})
	
	db.writeGame();
}

function openROM(file) {
	var fr = new FileReader();
	fr.onload = function() {
		loadROM(this.result);
	}
	fr.readAsBinaryString(file);
}

function sizeCanvas() {
	var container = $("#canvasContainer");
	var canvas = container.children("canvas");
	
	var nativeWidth = 160;
	var nativeHeight = 140;
	
	if (document.isFullScreen || document.webkitIsFullScreen ||
		document.fullScreenElement || document.webkitFullScreenElement) {
		
		var canScale = Settings.scaleFullscreen;
		var maxHeight = container.css("height", "100%").height();
	} else {
		var canScale = Settings.scaleWindowed;
		var maxHeight = container.height($(document.body).height() -
			$("#toolbar").height() - 2).height();
	}
	
	var maxWidth = container.width();
	
	if (!canScale) {
		var width = nativeWidth;
		var height = nativeHeight;
	} else {
		if (Settings.scaleBy1x) {
			var width = (Math.floor(maxWidth / nativeWidth) * nativeWidth) ||
				maxWidth;
			var height = (Math.floor(maxHeight / nativeHeight) * nativeHeight) ||
				maxHeight;
		} else {
			var width = maxWidth;
			var height = maxHeight;
		}
		
		if (Settings.preserveAspect) {
			var aspect = nativeWidth / nativeHeight;
			if (height * aspect > maxWidth) {
				height = width / aspect;
			} else {
				width = height * aspect;
			}
		}
	}
	canvas.css("marginLeft", (maxWidth - width) / 2).css("marginTop", (maxHeight -
		height) / 2).width(width).height(height);
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
	
	if (GameBoyEmulatorInitialized() && !window.fastforward) {
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
	$($("#selectstate_dropdown > button")[window.slotUsed - 1]).
		removeClass("selected");
	$($("#selectstate_dropdown > button")[index - 1]).addClass("selected");
	$("#selectstate").text(index);
	SaveStates.exists(index, function(data) {
		if (data && data.state) {
			$("#selectstate").addClass("slotused");
			$("#loadstate").removeClass("disabled");
		} else {
			$("#selectstate").removeClass("slotused");
			$("#loadstate").addClass("disabled");
		}
	});
	window.slotUsed = index;
	closeDropDown();
}

function autoSave() {
	if (GameBoyEmulatorInitialized()) {
		db.writeGame();
		if (Settings.autoSaveState) {
			SaveStates.save(0);
		}
	}
}

function run() {
	if (GameBoyEmulatorInitialized() && !GameBoyEmulatorPlaying()) {
		gameboy.stopEmulator &= 1;
		gameboy.firstIteration = (new Date()).getTime();
		gameboy.iterations = 0;
		gbRunInterval = setInterval(function () {
			if (!Settings.runWhenHidden && (document.hidden || document.webkitHidden)) {
				return;
			}
			
			if (!Settings.runWhenBlurred && !window.isFocused) {
				return;
			}
			
			gameboy.run();
		}, Settings.emulatorLoopInterval);
	}
}

SaveStates = {
	exists: function(n, callback) {
		if (n && n.substr) {
			n = parseInt(n.substr(4), 10);
		} else if (isNaN(n)) {
			n = window.slotUsed;
		}

		db.saveStateLoad(n, callback);
	},
	save: function(n) {
		if (n && n.substr) {
			n = parseInt(n.substr(4), 10);
		} else if (isNaN(n)) {
			n = window.slotUsed;
		}
	
		db.saveStateSave(n);
	
		if (n && GameBoyEmulatorInitialized()) {
			$($("#selectstate_dropdown > button")[n - 1]).addClass("slotused");
			$("#selectstate").addClass("slotused");
			$("#loadstate").removeClass("disabled");
		}
	},
	load: function(n, callback) {
		if (n && n.substr) {
			n = parseInt(n.substr(4), 10);
		} else if (isNaN(n)) {
			n = window.slotUsed;
		}

		db.saveStateLoad(n, function(data) {
			if (!data) {
				if (callback) {
					callback(null);
				}
				return;
			}
			
			var ROM = gameboy.getROMImage();
			var SRAM = gameboy.saveSRAMState();
			var RTC = gameboy.saveRTCState();
			clearLastEmulation();
			gameboy = new GameBoyCore($("canvas")[0], ROM);
			gameboy.openMBC = function() { return SRAM };
			gameboy.openRTC = function() { return RTC };
			gameboy.start();
			gameboy.returnFromState(data.state);
			gameboy.setSpeed($("#speed_text").val());
			$("#resume").click();
			
			if (callback) {
				callback(data);
			}
		});
	}
}
