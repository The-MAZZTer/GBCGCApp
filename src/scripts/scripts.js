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
	return tag ? $(document.createElement(tag)) :
		$(document.createDocumentFragment());
}

$(document).ready(function() {
	i18nTemplate.process(document);
});

Settings = {
	init: function() {
		if (/CrOS/.test(navigator.userAgent)) {
			this.defaults = this.crOSDefaults;
		}
		delete this.crOSDefaults;
		
		for (var i in this.defaults) {
			this[i] = this.defaults[i];
		}
	
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
		if ("settings" in window) {
			var legacy = {
				soundEnabled: 0,
				bootROM: 1,
				gameBoyMode: 2,
				volume: 3,
				colorizeGB: 4,
				disableTypedArrays: 5,
				emulatorLoopInterval: 6,
				audioBufferMinSpan: 7,
				audioBufferMaxSpan: 8,
				MBC1Only: 9,
				alwaysAllowMBCBanks: 10,
				useGBROM: 11,
				imageSmoothing: 13
			}
			for (var i in legacy) {
				settings[legacy[i]] = this[i];
			}
			settings[12] = false;
		}

		var s = {};
		for (var i in this) {
			if (this[i] instanceof Function) {
				continue;
			}
			
			s[i] = this[i];
		}
		localStorage.settings = JSON.stringify(s);
		
		$(document.body).addClass("changed");
	},
	defaults: {
		alwaysAllowMBCBanks: false,
		audioBufferMaxSpan: 30,
		audioBufferMinSpan: 15,
		autoSaveState: true,
		bootROM: true,
		colorizeGB: true,
		disableTypedArrays: false,
		emulatorLoopInterval: 4,
		gameBoyMode: false,
		imageSmoothing: false,
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
		runWhenUnfocused: false,
		scaleBy1x: false,
		scaleFullscreen: true,
		scaleWindowed: true,
		soundEnabled: true,
		useGBROM: false,
		volume: 1
	},
	crOSDefaults: {
		alwaysAllowMBCBanks: false,
		audioBufferMaxSpan: 30,
		audioBufferMinSpan: 15,
		autoSaveState: true,
		bootROM: true,
		colorizeGB: true,
		disableTypedArrays: false,
		emulatorLoopInterval: 4,
		gameBoyMode: false,
		imageSmoothing: false,
		keyMap: {
			39: "right",
			37: "left",
			38: "up",
			40: "down",
			88: "a",
			90: "b",
			9: "select",
			13: "start",
			113: "savestate",
			112: "loadstate",
			115: "fullscreen",
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
		runWhenUnfocused: false,
		scaleBy1x: false,
		scaleFullscreen: true,
		scaleWindowed: true,
		soundEnabled: true,
		useGBROM: false,
		volume: 1
	}
}
Settings.init();

SaveMemory = {
	get: {
		SRAM: function() {
			if (!GameBoyEmulatorInitialized() || !gameboy.cBATT) {
				return null;
			}
			
			var sram = gameboy.saveSRAMState();
			if (sram.length > 0) {
				var s = "";
				for (var i = 0; i < s.length; i++) {
					s += String.fromCharCode(sram[i]);
				}
				return s;
			} else {
				return null;
			}
		},
		RTC: function() {
			if (!GameBoyEmulatorInitialized() || !gameboy.cTIMER) {
				return null;
			}
			
			return gameboy.saveRTCState();
		}
	},
	decode: {
		SRAM: function(s) {
			if (!s) {
				return [];
			}
			var x = new Array(s.length);
			for (var i = 0; i < s.length; i++) {
				x[i] = s.charCodeAt(i);
			}
			return x;
		},
		RTC: function(x) {
			if (!x) {
				return [];
			}
			return x;
		}
	}
}

window.indexedDB = window.indexedDB || window.webkitIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
db = {
	init: function() {
		var self = this;
		indexedDB.open("gbcgc").onsuccess = function(e) {
			var h = self.handle = e.target.result;
			if (h.version != self.version) {
				h.setVersion(self.version).onsuccess = function(e) {
					self.handle.createObjectStore("games", { keyPath: "id" });
					self.handle.createObjectStore("states", { keyPath: "id" });
					
					self.ready();
				}
			} else {
				self.ready();
			}
		}
	},
	ready: function() {},
	dispose: function() {
		if (this.handle) {
			this.handle.close();
			delete this.handle;
		}
	},
	destroy: function() {
		this.dispose();
		indexedDB.deleteDatabase("gbcgc");
	},
	handle: null,
	version: 1,
	tableExists: function(name) {
		var tables = this.handle.objectStoreNames;
		for (var i = 0; i < tables.length; i++) {
			if (tables[i] === name) {
				return true;
			}
		}
		return false;
	},
	getGBColor: function() {
		if (!GameBoyEmulatorInitialized()) {
			return false;
		}
		var colorbyte = gameboy.ROM[0x143];
		if (colorbyte === 0x80) {
			return true;
		}
		if (colorbyte === 0x32 && this.name + this.gameCode == "Game and Watch ") {
			return true;
		}
		return gameboy.cGBC;
	},
	writeGamesRecord: function(data) {
		this.handle.transaction("games", IDBTransaction.READ_WRITE).
			objectStore("games").put(data);
	},
	writeGame: function() {
		if (!GameBoyEmulatorInitialized()) {
			return false;
		}
		
		this.writeGamesRecord({
			id: gameboy.name,
			system: Number(this.getGBColor()),
			SRAM: SaveMemory.get.SRAM(),
			RTC: SaveMemory.get.RTC()
		});
	},
	readGame: function(name, callback) {
		this.handle.transaction("games", IDBTransaction.READ_ONLY).
			objectStore("games").get(name).onsuccess = function(e) {
			
			var res = e.target.result;
			if (!res) {
				callback([], []);
			} else {
				callback(SaveMemory.decode.SRAM(res.SRAM),
					SaveMemory.decode.RTC(res.RTC));
			}
		}
	},
	saveStateLoad: function(n, callback) {
		if (!GameBoyEmulatorInitialized()) {
			callback(null);
			return;
		}
		
		n = isNaN(n) ? window.slotUsed : n;
		
		this.handle.transaction("states", IDBTransaction.READ_ONLY).
			objectStore("states").get(n + "|" + gameboy.name).onsuccess =
			function(e) {
			
			var res = e.target.result;
			if (!res) {
				callback(null);
			} else {
				callback(res.state, res.slot);
			}
		}
	},
	writeStateRecord: function(data) {
		data.id = data.slot + "|" + data.game;
		this.handle.transaction("states", IDBTransaction.READ_WRITE).
			objectStore("states").put(data);
	},
	saveStateSave: function(n) {
		if (!GameBoyEmulatorInitialized()) {
			return;
		}
		
		n = isNaN(n) ? window.slotUsed : n;
		
		this.writeStateRecord({
			game: gameboy.name,
			slot: n,
			state: gameboy.saveState()
		});
	},
	getAll: function(callback) {
		var games = {};
		var self = this;
		this.handle.transaction("games", IDBTransaction.READ_WRITE).
			objectStore("games").openCursor().onsuccess = function(e) {
			
			var x = e.target.result;
			if (x) {
				x.value.states = {};
				games[x.value.id] = x.value;
				x.continue();
			} else {
				self.handle.transaction("states", IDBTransaction.READ_WRITE).
					objectStore("states").openCursor().onsuccess = function(e) {
					
					var x = e.target.result;
					if (x) {
						var states = games[x.value.game].states[x.value.slot] = true;
						x.continue();
					} else {
						callback(games);
					}
				}
			}
		}
	}
}