// Borrowed from chrome://newtab/ to aid in i18n...
// Modified to work with Extension i18n API.
			
var i18nTemplate = (function() {
	/**
	 * This provides the handlers for the templating engine. The key is used as
	 * the attribute name and the value is the function that gets called for every
	 * single node that has this attribute.
	 * @type {Object}
	 */
	var handlers = {
		/**
		 * This handler sets the textContent of the element.
		 */
		'i18n-content': function(element, attributeValue) {
			element.textContent = chrome.i18n.getMessage(attributeValue);
		},
 
		/**
		 * This is used to set HTML attributes and DOM properties,. The syntax is:
		 *   attributename:key;
		 *   .domProperty:key;
		 *   .nested.dom.property:key
		 */
		'i18n-values': function(element, attributeValue) {
			var parts = attributeValue.replace(/\s/g, '').split(/;/);
			for (var j = 0; j < parts.length; j++) {
				var a = parts[j].match(/^([^:]+):(.+)$/);
				if (a) {
					var propName = a[1];
					var propExpr = a[2];
 
					var value = chrome.i18n.getMessage(propExpr);
					
					// Ignore missing properties
					if (value) {
						if (propName.charAt(0) == '.') {
							var path = propName.slice(1).split('.');
							var object = element;
							while (object && path.length > 1) {
								object = object[path.shift()];
							}
							if (object) {
								object[path] = value;
								// In case we set innerHTML (ignoring others) we need to
								// recursively check the content
								if (path == 'innerHTML') {
									process(element, obj);
								}
							}
						} else {
							element.setAttribute(propName, value);
						}
					} else {
						console.warn('i18n-values: Missing value for "' + propExpr + '"');
					}
				}
			}
		}
	};
 
	var attributeNames = [];
	for (var key in handlers) {
		attributeNames.push(key);
	}
	var selector = '[' + attributeNames.join('],[') + ']';
 
	/**
	 * Processes a DOM tree with the {@code obj} map.
	 */
	function process(node) {
		var elements = node.querySelectorAll(selector);
		for (var element, i = 0; element = elements[i]; i++) {
			for (var j = 0; j < attributeNames.length; j++) {
				var name = attributeNames[j];
				var att = element.getAttribute(name);
				if (att != null) {
					handlers[name](element, att);
				}
			}
		}
	}
 
	return {
		process: process
	};
})();

$.create = function(tag) {
	return $(document.createElement(tag));
}

$(document).ready(function() {
	i18nTemplate.process(document);
});

Settings = {
	init: function() {
		var s = localStorage.settings;
		if (s) {
			s = JSON.parse(s);
			for (var i in s) {
				this[i] = s[i];
			}
		}
		this.onchange();
	},
	onchange: function() {
		var legacy = {
			soundEnabled: 0,
			bootROM: 1,
			gameBoyMode: 2,
			volume: 3,
			colorizeGB: 4,
			disableTypedArrays: 5,
			emulatorLoopInterval: 6,
			audioBufferMinSpan: 7,
			audioBufferManSpan: 8,
			MBC1Only: 9,
			alwaysAllowMBCBanks: 10,
			useGBROM: 11,
			JSScale: 12,
			imageSmoothing: 13
		}
		for (var i in legacy) {
			settings[legacy[i]] = this[i];
		}

		var s = {};
		for (var i in this) {
			if (this[i] instanceof Function) {
				continue;
			}
			
			s[i] = this[i];
		}
		localStorage.settings = JSON.stringify(s);
	},
	alwaysAllowMBCBanks: false,
	audioBufferMaxSpan: 30,
	audioBufferMinSpan: 15,
	autoSaveState: true,
	bootROM: true,
	colorizeGB: true,
	disableTypedArrays: false,
	emulatorLoopInterval: 4,
	gameBoyMode: false,
	imageSmoothing: true,
	JSScale: false,
	keyMap: {
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
	},
	MBC1Only: false,
	preserveAspect: true,
	runWhenHidden: false,
	runWhenUnfocused: true,
	scaleBy1x: false,
	scaleFullscreen: true,
	scaleWindowed: true,
	soundEnabled: true,
	useGBROM: false,
	volume: 1
}

SaveStates = {
	exists: function(n) {
		return GameBoyEmulatorInitialized() && Boolean(localStorage["FREEZE_" +
			gameboy.name + "_" + n]);
	},
	save: function(n) {
		n = isNaN(n) ? window.slotUsed : n;
		if (GameBoyEmulatorInitialized()) {
			localStorage["FREEZE_" + gameboy.name + "_" + n] =
				JSON.stringify(gameboy.saveState());
			
			$("#selectstate_dropdown > button:nth-child(" + n +
				")").addClass("slotused");
			$("#selectstate").addClass("slotused");
			$("#loadstate").removeClass("disabled");
		}
	},
	load: function(n) {
		n = isNaN(n) ? window.slotUsed : n;
		if (GameBoyEmulatorInitialized() && SaveStates.exists(n)) {
			var filename = "FREEZE_" + gameboy.name + "_" + n;
			clearLastEmulation();
			gameboy = new GameBoyCore($("canvas")[0], "");
			gameboy.returnFromState(JSON.parse(localStorage[filename]));
			gameboy.setSpeed($("#speed_text").val());
			$("#resume").click();
		}
	}
}

SaveMemory = {
	save: function() {
		if (GameBoyEmulatorInitialized()) {
			if (gameboy.cBATT) {
				var sram = gameboy.saveSRAMState();
				if (sram.length > 0) {
					var s = "";
					for (var i = 0; i < s.length; i++) {
						s += String.fromCharCode(sram[i]);
					}
					localStorage["SRAM_" + gameboy.name] = s;
				} else {
					delete localStorage["SRAM_" + gameboy.name];
				}
			}
			if (gameboy.cTIMER) {
				localStorage["RTC_" + gameboy.name] =
					JSON.stringify(gameboy.saveRTCState());
			}
		}
	},
	load: {
		SRAM: function(filename) {
			var s = localStorage["SRAM_" + filename];
			if (s) {
				return [];
			}
			var x = new Array(s.length);
			for (var i = 0; i < s.length; i++) {
				x[i] = s.charCodeAt(i);
			}
			return x;
		},
		RTC: function(filename) {
			var x = localStorage["RTC_" + filename];
			if (!x) {
				return [];
			}
			return JSON.parse(x);
		}
	}
}