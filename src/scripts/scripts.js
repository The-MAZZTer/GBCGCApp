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
									process(element);
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
		fastForwardSpeed: 8,
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
			192: "fastforward",
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
		fastForwardSpeed: 8,
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
			192: "fastforward",
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

window.indexedDB = window.indexedDB || window.webkitIndexedDB;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
db = {
	init: function() {
		var self = this;
		indexedDB.open("gbcgc").onsuccess = function(e) {
			var h = self.handle = e.target.result;
			if (h.version != self.version) {
				h.setVersion(self.version).onsuccess = function(e) {
					self.handle.createObjectStore("games", { keyPath: "id" });
					self.handle.createObjectStore("states", { keyPath: "id" }).
						createIndex("game", "game", { unique: false })
					
					self.ready();
				}
			} else {
				self.ready();
			}
		}
	},
	ready: function() {
		for (var i = 0; i < this.readyHandlers.length; i++) {
			this.readyHandlers[i].apply(this, arguments);
		}
		delete this.readyHandlers;
	},
	readyHandlers: [function() {
		if (localStorage.pendingSave) {
			this.writeGameRecord(JSON.parse(localStorage.pendingSave));
			delete localStorage.pendingSave;
		}
		
		if(localStorage.pendingSaveState) {
			var x = JSON.parse(localStorage.pendingSaveState);
			x.slot = 0;
			this.writeStateRecord(x);
			delete localStorage.pendingSaveState;
		}
	}],
	dispose: function() {
		if (this.handle) {
			this.handle.close();
			delete this.handle;
		}
	},
	clear: function() {
		this.handle.transaction("games", "readwrite").objectStore("games").clear();
		this.handle.transaction("states", "readwrite").objectStore("states").
			clear();
	},
	destroy: function() {
		this.dispose();
		indexedDB.deleteDatabase("gbcgc");
	},
	handle: null,
	version: 1,
	getGBColor: function() {
		if (!GameBoyEmulatorInitialized()) {
			return false;
		}
		switch (gameboy.ROM[0x143]) {
			case 0x80:
			case 0xC0:
				return true;
			case 0x32:
				return (gameboy.name + gameboy.gameCode == "Game and Watch ");
			default:
				return false;
		}
	},
	writeGameRecord: function(data) {
		this.handle.transaction("games", "readwrite").objectStore("games").
			put(data).onsuccess = function() {
			
			delete window.pendingSave;
		}
	},
	writeGame: function(quick) {
		if (!GameBoyEmulatorInitialized()) {
			return false;
		}
		
		var sram = gameboy.saveSRAMState();
		if (sram.length > 0) {
			var s = "";
			for (var i = 0; i < sram.length; i++) {
				s += String.fromCharCode(sram[i]);
			}
			sram = s;
		} else {
			sram = null;
		}
		
		var record = {			
			id: gameboy.name,
			system: Number(this.getGBColor()),
			SRAM: sram,
			RTC: gameboy.cTIMER ? gameboy.saveRTCState() : null
		};
		if (quick) {
			window.pendingSave = JSON.stringify(record);
		}
		this.writeGameRecord(record);
	},
	readGame: function(name, callback) {
		this.handle.transaction("games", "readonly").objectStore("games").get(name).
			onsuccess = function(e) {
			
			var res = e.target.result;
			if (!res) {
				callback(null);
			} else {
				var sram = res.SRAM ? new Array(res.SRAM.length) : [];
				if (res.SRAM) {
					for (var i = 0; i < res.SRAM.length; i++) {
						sram[i] = res.SRAM.charCodeAt(i);
					}
					res.SRAM = sram;
				}
				res.RTC = res.RTC || [];
			
				callback(res);
			}
		}
	},
	readStateRecord: function(game, n, callback) {
		this.handle.transaction("states", "readonly").objectStore("states").get(n +
			"|" + game).onsuccess = function(e) {
			
			var res = e.target.result;
			if (!res) {
				callback(null);
			} else {
				callback(res);
			}
		}
	},
	saveStateLoad: function(n, callback) {
		if (!GameBoyEmulatorInitialized()) {
			callback(null);
			return;
		}
		
		n = isNaN(n) ? window.slotUsed : n;
		
		this.readStateRecord(gameboy.name, n, function(res) {
			if (res) {
				res.state.unshift(gameboy.ROM);
			}
			callback(res);
		});
	},
	writeStateRecord: function(data) {
		data.id = data.slot + "|" + data.game;
		this.handle.transaction("states", "readwrite").objectStore("states").
			put(data).onsuccess = function() {
			
			delete window.pendingSaveState;
		}
	},
	saveStateSave: function(n) {
		if (!GameBoyEmulatorInitialized()) {
			return;
		}
		
		n = isNaN(n) ? window.slotUsed : n;
		
		var state = gameboy.saveState();
		state.shift();
		this.writeStateRecord({
			game: gameboy.name,
			slot: n,
			state: state
		});
	},
	quickSaveStateSave: function() {
		if (!GameBoyEmulatorInitialized()) {
			return;
		}
		var state = gameboy.saveState();
		state.shift();
		var record = {
			game: gameboy.name,
			state: state
		};
		window.pendingSaveState = JSON.stringify(record);
		record.slot = 0;
		this.writeStateRecord(record);
	},
	eachGame: function(callback) {
		this.handle.transaction("games", "readonly").objectStore("games").
			openCursor().onsuccess = function(e) {
			
			var x = e.target.result;
			if (x) {
				callback(x.value);
				x.continue();
			} else {
				callback();
			}
		}
	},
	eachState: function(game, callback) {
		this.handle.transaction("states", "readonly").objectStore("states").
			index("game").openCursor(IDBKeyRange.only(game)).onsuccess = function(e) {
			
			var x = e.target.result;
			if (x) {
				callback(x.value);
				x.continue();
			} else {
				callback();
			}
		}
	},
	deleteSRAM: function(game) {
		var os = this.handle.transaction("games", "readwrite").objectStore("games");
		os.get(game).onsuccess = function(e) {
			var res = e.target.result;
			res.SRAM = "";
			os.put(res);
		}
	},
	deleteRTC: function(game) {
		var os = this.handle.transaction("games", "readwrite").objectStore("games");
		os.get(game).onsuccess = function(e) {
			var res = e.target.result;
			res.RTC = [];
			os.put(res);
		}
	},
	deleteState: function(game, slot) {
		this.handle.transaction("states", "readwrite").objectStore("states").
			delete(slot + "|" + game);
	},
	renumberState: function(game, slot, newslot) {
		if (slot == newslot) {
			return;
		}
	
		var os = this.handle.transaction("states", "readwrite").objectStore(
			"states");
		os.get(slot + "|" + game).onsuccess = function(e) {
			var res = e.target.result;
			if (!res) {
				return;
			}

			os.get(newslot + "|" + game).onsuccess = function(e) {
				var res2 = e.target.result;
				res.slot = newslot;
				res.id = newslot + "|" + game;
				if (!res2) {
					os.put(res);
					os.delete(slot + "|" + game);
				} else {
					res2.slot = slot;
					res2.id = slot + "|" + game;
					os.put(res);
					os.put(res2);
				}
			}
		}
	},
	importSRAM: function(name, sram) {
		var self = this;
		this.readGame(name, function(res) {
			res.SRAM = sram;
			self.writeGame(res);
		});
	},
	importRTC: function(name, rtc) {
		var self = this;
		this.readGame(name, function(res) {
			res.RTC = rtc;
			self.writeGame(res);
		});
	},
	importState: function(name, state, callback, slot) {
		var self = this;
		slot = slot || 1;
		this.readStateRecord(name, slot, function(res) {
			if (res) {
				self.importState(name, state, slot + 1);
				return;
			}
			
			self.writeStateRecord({
				game: name,
				slot: slot,
				state: state
			});
			callback(slot);
		});
	}
}

function openFile(callback, accept) {
	$.create("input").prop("type", "file").prop("accept", accept || "").change(
		function() {
			
		$(this).off("change");
		callback(this.files[0]);
	}).click();
}