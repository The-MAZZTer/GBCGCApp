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
			70: "fullscreen",
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
			48: "slot10",
			104: "tiltup",
			98: "tiltdown",
			100: "tiltleft",
			102: "tiltright"
		},
		MBC1Only: false,
		mouseTilt: true,
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
			48: "slot10",
			87: "tiltup",
			83: "tiltdown",
			65: "tiltleft",
			68: "tiltright"
		},
		MBC1Only: false,
		mouseTilt: true,
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
		var d = indexedDB.open("gbcgc", 1)
		d.onsuccess = function(e) {
			self.handle = e.target.result;
			self.ready();
		}
		d.onupgradeneeded = function(e) {
			var h = e.target.result;
			h.createObjectStore("games", { keyPath: "id" });
			h.createObjectStore("states", { keyPath: "id" }).
				createIndex("game", "game", { unique: false })
			h.createObjectStore("roms", { keyPath: "id" });
		}
	},
	ready: function() {
		for (var i = 0; i < this.readyHandlers.length; i++) {
			this.readyHandlers[i].apply(this, arguments);
		}
	},
	readyHandlers: [function() {
		if (localStorage.pendingSave) {
			var s = localStorage.pendingSave;
			var x = new Uint8Array(s.length);
			for (var i = 0; i < s.length; i++) {
				x[i] = s.charCodeAt(i);
			}
			var x = deserialize(x);
			this.writeGameRecord({
				id: x[0],
				system: x[1],
				SRAM: x[2],
				RTC: x[3]
			});
			delete localStorage.pendingSave;
		}
		
		if(localStorage.pendingSaveState) {
			var s = localStorage.pendingSaveState;
			var x = new Uint8Array(s.length);
			for (var i = 0; i < s.length; i++) {
				x[i] = s.charCodeAt(i);
			}
			var x = deserialize(x);
			this.writeStateRecord({
				game: x[0],
				slot: 0,
				state: x[1]
			});
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
		this.handle.transaction("roms", "readwrite").objectStore("roms").clear();
	},
	destroy: function() {
		this.dispose();
		indexedDB.deleteDatabase("gbcgc");
	},
	handle: null,
	version: 1,
	getGBColor: function() {
		if (!GameBoyEmulatorInitialized() || !gameboy.name) {
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
		if (!GameBoyEmulatorInitialized() || !gameboy.name) {
			return false;
		}
		
		var record = {			
			id: gameboy.name,
			system: Number(this.getGBColor()),
			SRAM: (gameboy.cBATT && gameboy.MBCRam.length) ? gameboy.saveSRAMState() :
				null,
			RTC: gameboy.cTIMER ? gameboy.saveRTCState() : null
		};
		if (quick) {
			var x = serialize([record.id, record.system, record.SRAM,
				record.RTC]);
			var s = "";
			for (var i = 0; i < x.length; i++) {
				s += String.fromCharCode(x[i]);
			}
			window.pendingSave = s;
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
		if (!GameBoyEmulatorInitialized() || !gameboy.name) {
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
		if (!GameBoyEmulatorInitialized() || !gameboy.name) {
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
			slot: 0,
			state: state
		};

		var x = serialize([record.game, record.state]);
		var s = "";
		for (var i = 0; i < x.length; i++) {
			s += String.fromCharCode(x[i]);
		}
		window.pendingSaveState = s;

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
			res.SRAM = [];
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
			var x = new Uint8Array(sram.length);
			for (var i = 0; i < sram.length; i++) {
				x[i] = sram.charCodeAt(i);
			}
		
			res.SRAM = x;
			self.writeGameRecord(res);
		});
	},
	importRTC: function(name, rtc) {
		var self = this;
		this.readGame(name, function(res) {
			var x = new Uint8Array(rtc.length);
			for (var i = 0; i < rtc.length; i++) {
				x[i] = rtc.charCodeAt(i);
			}
		
			res.RTC = deserialize(x);
			self.writeGameRecord(res);
		});
	},
	importState: function(name, state, callback, slot) {
		var self = this;
		slot = slot || 1;
		this.readStateRecord(name, slot, function(res) {
			if (res) {
				self.importState(name, state, callback, slot + 1);
				return;
			}
			
			var x = new Uint8Array(state.length);
			for (var i = 0; i < state.length; i++) {
				x[i] = state.charCodeAt(i);
			}
		
			state = deserialize(x);
			self.writeStateRecord({
				game: name,
				slot: slot,
				state: state
			});
			callback(slot, state);
		});
	},
	writeROM: function(rom, callback) {
		this.handle.transaction("roms", "readwrite").objectStore(
			"roms").put({id: "", data: rom}).onsuccess = callback;
	},
	readROM: function(callback) {
		var os = this.handle.transaction("roms", "readwrite").objectStore(
			"roms");
		os.get("").onsuccess = function(e) {
			var res = e.target.result;
			if (!res) {
				callback(null);
				return;
			}
			var data = res.data;
			os.clear();
			callback(data);
		}
	}
}

function openFile(callback, accept) {
	$.create("input").prop("type", "file").prop("accept", accept || "").change(
		function() {
			
		$(this).off("change");
		callback(this.files[0]);
	}).click();
}

function serialize(src, dest) {
	if (!src) {
		return null;
	}
	
	var types = {
		"boolean": 0,
		"string": 1,
		"byte": 2,
		"sbyte": 3,
		"short": 4,
		"ushort": 5,
		"long": 6,
		"ulong": 7,
		"ulonglong": 8,
		"double": 9,
		"array": 10,
		"null": 11,
		"undefined": 12
	}
	
	var dest = dest || [];
	function encodeNumber(src) {
		if (isNaN(src)) {
			throw new Error();
		}
		if (src === Infinity) {
			throw new Error();
		}
		if (src === -Infinity) {
			throw new Error();
		}
		if (Math.round(src) !== src) {
			dest.push(types.double);
			
			var signbit = 0;
			if (src < 0) {
				signbit = 1;
				src *= -1;
			}
			var exp = 0;
			while (src >= 2) {
				exp++;
				src /= 2;
			}
			while (src < 1) {
				exp--;
				src *= 2;
			}
			exp = (exp >>> 0) & 0x7FF;
			
			var sig = 0;
			for (var i = 0; i < 4; i++) {
				sig <<= 1;
				if (src >= 1) {
					src -= 1;
					sig |= 1;
				}
				src *= 2;
			}
			
			dest.push((signbit << 7) | (exp >> 4));
			dest.push(((exp & 0x0F) << 4) | sig);
			
			for (var i = 0; i < 6; i++) {
				sig = 0;
				for (var j = 0; j < 8; j++) {
					sig <<= 1;
					if (src >= 1) {
						src -= 1;
						sig |= 1;
					}
					src *= 2;
				}
				dest.push(sig);
			}

			return;
		}
		
		if (src >= 0 && src < 256) {
			dest.push(types.byte);
			dest.push(src);
			return;
		}
		if (src >= -128 && src < 127) {
			dest.push(types.sbyte);
			dest.push((src >>> 0) & 0xFF);
			return;
		}
		var bytes;
		if (src >= -32768 && src <= 32767) {
			dest.push(types.short);
			bytes = 2;
			src = (src >>> 0);
		} else if (src >= 0 && src < 65536) {
			dest.push(types.ushort);
			bytes = 2;
		} else if (src >= -2147483648 && src < 2147483647) {
			dest.push(types.long);
			bytes = 4;
			src = (src >>> 0);
		} else if (src >= 0 && src < 4294967296) {
			dest.push(types.ulong);
			bytes = 4;
		} else {
			dest.push(types.ulonglong);
			for (var i = 0; i < 8; i++) {
				dest.push(src & 0xFF);
				src /= 0x100;
			}
			return;
		}
		
		for (var i = 0; i < bytes; i++) {
			dest.push(src & 0xFF);
			src >>= 8;
		}
	}

	for (var i = 0; i < src.length; i++) {
		if (src[i] instanceof Array) {
			dest.push(types.array);
			encodeNumber(src[i].length);
			if (src[i].length) {
				serialize(src[i], dest);
			}
			continue;
		}
		if (src[i] === null) {
			dest.push(types.null);
			continue;
		}
		switch (typeof(src[i])) {
			case "undefined":
				dest.push(type.undefined);
				continue;
			case "boolean":
				dest.push(types.boolean);
				dest.push(Number(src[i]));
				continue;
			case "string":
				dest.push(types.string);
				if (src[i].indexOf("\x00") > -1) {
					throw new Error();
				}
				for (var j = 0; j < src[i].length; j++) {
					dest.push(src[i].charCodeAt(j));
				}
				dest.push(0);
				continue;
			case "number":
				encodeNumber(src[i]);
				continue;
			default:
				throw new Error();
		}
	}
	return dest;
}
function deserialize(src, length) {
	if (arguments.callee.caller !== arguments.callee) {
		window._pos = 0;
	}

	if (!src) {
		return null;
	}
	
	var types = {
		"boolean": 0,
		"string": 1,
		"byte": 2,
		"sbyte": 3,
		"short": 4,
		"ushort": 5,
		"long": 6,
		"ulong": 7,
		"ulonglong": 8,
		"double": 9,
		"array": 10,
		"null": 11,
		"undefined": 12
	}
	
	var dest = [];
	for (var i = window._pos; i < src.length && (!length || dest.length <
		length); ) {
		
		switch (src[i++]) {
			case types.null:
				dest.push(null);
				continue;
			case types.undefined:
				dest.push(undefined);
				continue;
			case types.boolean:
				dest.push(Boolean(src[i++]));
				continue;
			case types.string:
				var chr;
				var s = "";
				while (chr = src[i++]) {
					s += String.fromCharCode(chr);
				}
				dest.push(s);
				continue;
			case types.byte:
				dest.push(src[i++]);
				continue;
			case types.sbyte:
				dest.push(src[i++] << 24 >> 24);
				continue;
			case types.ushort:
				dest.push(src[i++] | (src[i++] << 8));
				continue;
			case types.short:
				dest.push((src[i++] | (src[i++] << 8)) << 16 >> 16);
				continue;
			case types.ulong:
				dest.push((src[i++] | (src[i++] << 8) | (src[i++] << 16) |
					(src[i++] << 24)) >>> 0);
				continue;
			case types.long:
				dest.push(src[i++] | (src[i++] << 8) | (src[i++] << 16) |
					(src[i++] << 24));
				continue;
			case types.ulonglong:
				var value = 0;
				for (var j = 0; j < 8; j++) {
					value += src[i++] * Math.pow(256, j);
				}
				dest.push(value);
				continue;
			case types.double:
				var b = [src[i++], src[i++], src[i++], src[i++], src[i++], src[i++],
					src[i++], src[i++]];
				
				var num = 0;
				for (var j = 7; j >= 2; j--) {
					for (var k = 0; k < 8; k++) {
						num /= 2;
						var bit = (b[j] >> k) & 0x1;
						if (bit) {
							num += 1;
						}
					}
				}
				for (var k = 0; k < 4; k++) {
					num /= 2;
					var bit = (b[1] >> k) & 0x1;
					if (bit) {
						num += 1;
					}
				}
				
				var exp = ((b[0] & 0x7F) << 4) | ((b[1] & 0xF0) >> 4);
				exp = exp << 20 >> 20;
				while (exp < 0) {
					exp++;
					num /= 2;
				}
				while (exp > 0) {
					exp--;
					num *= 2;
				}
				
				if (b[0] & 0x80) {
					num *= -1;
				}
				dest.push(num);
				continue;
			case types.array:
				window._pos = i;
				var len = deserialize(src, 1)[0];
				if (len) {
					dest.push(deserialize(src, len));
				} else {
					dest.push([]);
				}
				i = window._pos;
				continue;
			default:
				throw new Error();
		}
	}
	window._pos = i;
	return dest;
}
