db.init();

layout = {
	"options": {
		"gameboy": {
			"gameBoyMode": {
				type: "checkbox"
			},
			"colorizeGB": {
				type: "checkbox"
			}
		},
		"autopause": {
			"runWhenUnfocused": {
				type: "checkbox"
			},
			"runWhenHidden": {
				type: "checkbox"
			},
			"fastForwardSpeed": {
				type: "range",
				min: 1,
				max: 999,
				rangeMax: 32,
				step: 1
			}
		},
		"saves": {
			"autoSaveState": {
				type: "checkbox"
			},
			"manageButton": {
				type: "button",
				target: "manage"
			}
		},
		"scale": {
			"scaleWindowed": {
				type: "checkbox"
			},
			"scaleFullscreen": {
				type: "checkbox"
			},
			"preserveAspect": {
				type: "checkbox"
			},
			"scaleBy1x": {
				type: "checkbox"
			}
		},
		"sound": {
			"soundEnabled": {
				type: "checkbox"
			},
			"volume": {
				type: "range",
				min: 0,
				max: 1,
				step: 0.01
			}
		}
	},
	"controls": {
		"gameboyControls": {
			"": {
				type: "controls",
				keys: ["up", "down", "left", "right", "a", "b", "select", "start"]
			}
		},
		"stateControls": {
			"": {
				type: "controls",
				keys: ["savestate", "loadstate", "slot1", "slot2", "slot3", "slot4",
					"slot5", "slot6", "slot7", "slot8", "slot9", "slot10"]
			}
		},
		"miscControls": {
			"": {
				type: "controls",
				keys: ["fullscreen", "fastforward"]
			}
		}
	},
	"manage": {
		"games": {
			"": {
				type: "manage"
			}
		}
	},
	"debug": {
		"javascript": {
			"disableTypedArrays": {
				type: "checkbox",
				invert: true
			},
			"emulatorLoopInterval": {
				type: "range",
				min: 1,
				max: 999,
				rangeMax: 20,
				step: 1
			}/*,
			"imageSmoothing": {
				type: "checkbox"
			}*/
		},
		"audioBuffer": {
			"audioBufferMinSpan": {
				type: "range",
				min: 1,
				max: 999,
				rangeMax: 99,
				step: 1
			},
			"audioBufferMaxSpan": {
				type: "range",
				min: 1,
				max: 999,
				rangeMax: 99,
				step: 1
			}
		},
		"bios": {
			"bootROM": {
				type: "checkbox"
			},
			"useGBROM": {
				type: "checkbox"
			}
		},
		"banking": {
			"alwaysAllowMBCBanks": {
				type: "checkbox"
			},
			"MBC1Only": {
				type: "checkbox"
			}
		}
	}
}

$(document).off("ready").ready(function(e) {
	var frag = $.create();
	var frag2 = $.create();
	for (var i in layout) {
		var page = layout[i];
		frag.append(
			$.create("li").prop("id", i).click(function() {
				location.hash = "#" + this.id;
			}).append(
				$.create("button").attr("i18n-content", i + "Nav")
			)
		);
			
		var content = $.create("div").prop("id", i + "Content")
		content.append(
			$.create("h1").attr("i18n-content", i + "Nav")
		);
		for (var j in page) {
			var category = page[j];
			var section = $.create("div");
			section.append(
				$.create("h2").attr("i18n-content", j + "Category")
			);

			for (var k in category) {
				var setting = category[k];
				switch (setting.type) {
					case "checkbox":
						generateCheckbox(k, setting, section);
						break;
					case "range":
						generateRange(k, setting, section);
						break;
					case "button":
						generateButton(k, setting, section);
						break;
					case "controls":
						generateControls(k, setting, section);
						break;
					case "manage":
						generateManage(k, setting, section);
						break;
				}
			}
			
			content.append(section);
		}
		
		frag2.append(content);
	}
	$("#nav ul").prepend(frag);
	$("#content").append(frag2);
	
	i18nTemplate.process(document);
	
	$("#nav li:last-child").click(function() {
		for (var i in Settings.defaults) {
			Settings[i] = Settings.defaults[i];
		}
		Settings.onchange();
		
		syncSettings();
		syncKeys();
	});
	
	var canvas = $("#hoverCanvas")[0];
	canvas.width = 160;
	canvas.height = 144;
	
	$(window).on("hashchange", function() {
		switchPage(location.hash);
	});
	switchPage(location.hash);
});

function switchPage(hash) {
	if (!hash || !$("#nav > ul > li" + hash)[0]) {
		hash = "#options";
	}
	$("#nav li").removeClass("selected");
	$("#content > div").removeClass("selected");
	$(hash).addClass("selected");
	$(hash + "Content").addClass("selected");
	$("title").text($(hash + " > button").text());
}

function generateCheckbox(name, setting, parent) {
	parent.append(
		$.create("div").addClass("checkbox").append(
			$.create("label").append(
				$.create("input").prop("type", "checkbox").prop("name", name).
					prop("invert", setting.invert).prop("checked", Boolean(Settings[name]
					^ setting.invert)).change(function() {
					
					Settings[this.name] = Boolean(this.checked ^ this.invert);
					Settings.onchange();
				})
			).append(
				$.create("span").attr("i18n-content", name + "Setting")
			)
		)
	);
}

function generateRange(name, setting, parent) {
	var min = setting.min;
	var max = setting.max;
	var rangeMax = setting.rangeMax || max;
	var step = setting.step;
	var range = $.create("input").prop("type", "range").prop("name", name).
		prop("max", rangeMax).prop("min", min).prop("step", step).prop("value",
		Settings[name]).change(function() {
		
		Settings[this.name] = this.updown.value = this.value;
		Settings.onchange();
	});
	var updown = $.create("input").prop("type", "number").prop("name", name).
		prop("max", max).prop("min", min).prop("step", step).prop("value",
		Settings[name]).prop("range", range[0]).change(function() {
		
		Settings[this.name] = this.range.value = this.value;
		Settings.onchange();
	})
	range[0].updown = updown[0];
	parent.append(
		$.create("div").addClass("range").append(
			$.create("label").append(
				$.create("span").attr("i18n-content", name + "Setting")
			).append(range).append(updown)
		)
	);
}

function generateButton(name, setting, parent) {
	parent.append(
		$.create("div").addClass("button").append(
			$.create("button").addClass("realButton").attr("i18n-content", name +
				"Setting").prop("target", setting.target).click(function() {
				
				$("#" + this.target).click();
			})
		)
	);
}

function generateControls(name, setting, parent) {
	var keys = setting.keys;
	
	var map = {};
	for (var i in Settings.keyMap) {
		map[Settings.keyMap[i]] = i;
	}
	
	var list = $.create("list").addClass("controls");
	for (var i = 0; i < keys.length; i++) {
		list.append(
			$.create("div").prop("name", keys[i]).prop("key", map[keys[i]]).
				mousedown(function(e) {
				
				if (e.target.tagName == "BUTTON") {
					return;
				}
				
				$("list").children().removeAttr("selected");
				$(this).attr("selected", "selected").find(".keyCol").
					text(chrome.i18n.getMessage("waitingForKey"));
				
				$(document).off("keydown").off("mousedown").prop("activeRow", this).
					keydown(function(e) {
					
					delete Settings.keyMap[this.activeRow.key];
					Settings.keyMap[e.keyCode] = this.activeRow.name;
					Settings.onchange();
					this.activeRow.key = e.keyCode;
					
					$(this).mousedown();
					
					e.stopPropagation();
					e.preventDefault();
					return false;
				}).mousedown(function() {
					$("list").children().removeAttr("selected");
					$(document).removeProp("activeRow").off("keydown").off("mousedown");
					syncKeys();
				});
				
				e.stopPropagation();
				e.preventDefault();
				return false;
			}).append(
				$.create("div").append(
					$.create("div").addClass("nameCol").attr("i18n-content", keys[i] +
						"Control")
				).append(
					$.create("div").addClass("keyCol").text(map[keys[i]] ? (chrome.i18n.getMessage("key" +
						map[keys[i]]) || ("Unknown (" + map[keys[i]] + ")")) : "")
				)
			).append(
				$.create("button").addClass("delete").click(function() {
					delete Settings.keyMap[this.parentNode.key];
					Settings.onchange();
					delete this.parentNode.key;
					syncKeys();
				})
			)
		);
	}
	parent.append(list);
}

function generateManage(name, setting, parent) {
	var container;
	parent.append(
		container = $.create("div").addClass("manage").append(
			$.create("button").addClass("realButton").attr("i18n-content",
				"clearAll").click(function() {
				
				if (confirm(chrome.i18n.getMessage("areYouSure"))) {
					db.clear();
					$(".manage > div").remove();
				}
			})
		)
	);
	db.readyHandlers.push(function() {
		this.eachGame(function(data) {
			if (!data) {
				return;
			}
			
			var list;
			var header;
			container.append(
				$.create("div").append(
					header = $.create("h3").addClass("system" + data.system).text(data.id)
				).append(
					list = $.create("list")
				)
			);
			
			if (data.SRAM != null) {
				header.append(
					$.create("button").addClass("realButton").text(
						chrome.i18n.getMessage("importSaveSRAM")).click(function() {
						
						
					})
				);
				if (data.SRAM.length) {
					list.append(
						$.create("div").prop("name", data.id).
							mousedown(function(e) {
							
							if (e.target.tagName == "BUTTON") {
								return;
							}
							
							$("list").children().removeAttr("selected").removeAttr("focus");
							$(this).attr("selected", "selected").attr("focus", "focus");
							
							$(document).mousedown(function() {
								$("list").children().removeAttr("focus");
								$(document).off("mousedown");
							});
							
							e.stopPropagation();
						}).append(
							$.create("div").append(
								$.create("div").addClass("iconCol")
							).append(
								$.create("div").addClass("nameCol").
									text(chrome.i18n.getMessage("manageSRAM"))
							).append(
								$.create("div").addClass("slotCol")
							).append(
								$.create("div").addClass("exportCol").append(
									$.create("button").addClass("export").
										text(chrome.i18n.getMessage("export")).click(function() {
										
										var id = $(this).parent().parent().parent().prop("name");
										db.readGame(id, function(sram) {
											download(id + ".sram", sram);
										});
									})
								)
							)
						).append(
							$.create("button").addClass("delete").click(function() {
								var row = $(this).parent();
								var game = row.prop("name");
								db.deleteSRAM(game);
								
								var list = row.parent()
								row.mouseout();
								row.remove();
							})
						)
					);
				}
			}
			if (data.RTC != null) {
				header.append(
					$.create("button").addClass("realButton").text(
						chrome.i18n.getMessage("importSaveRTC")).click(function() {
						
						
					})
				);
				if (data.RTC.length) {
					list.append(
						$.create("div").prop("name", data.id).
							mousedown(function(e) {
							
							if (e.target.tagName == "BUTTON") {
								return;
							}
							
							$("list").children().removeAttr("selected").removeAttr("focus");
							$(this).attr("selected", "selected").attr("focus", "focus");
							
							$(document).mousedown(function() {
								$("list").children().removeAttr("focus");
								$(document).off("mousedown");
							});
							
							e.stopPropagation();
						}).append(
							$.create("div").append(
								$.create("div").addClass("iconCol")
							).append(
								$.create("div").addClass("nameCol").
									text(chrome.i18n.getMessage("manageRTC"))
							).append(
								$.create("div").addClass("slotCol")
							).append(
								$.create("div").addClass("exportCol").append(
									$.create("button").addClass("export").
										text(chrome.i18n.getMessage("export")).click(function() {
										
										var id = $(this).parent().parent().parent().prop("name");
										db.readGame(id, function(sram, rtc) {
											download(id + ".rtc", serialize(rtc));
										});
									})
								)
							)
						).append(
							$.create("button").addClass("delete").click(function() {
								var row = $(this).parent();
								var game = row.prop("name");
								db.deleteRTC(game);
								
								var list = row.parent()
								row.mouseout();
								row.remove();
							})
						)
					);
				}
			}
			header.append(
				$.create("button").addClass("realButton").text(
					chrome.i18n.getMessage("importSaveState")).click(function() {
					
					
				})
			);
			db.eachState(data.id, function(data) {
				if (!data) {
					return;
				}
				
				var canvas, name;
				list.append(
					$.create("div").prop("name", data.game).prop("slot", data.slot).
						mousedown(function(e) {
						
						if (e.target.tagName == "BUTTON") {
							return;
						}
						
						$("list").children().removeAttr("selected").removeAttr("focus");
						$(this).attr("selected", "selected").attr("focus", "focus");
						
						$(document).mousedown(function() {
							$("list").children().removeAttr("focus");
							$(document).off("mousedown");
						});
						
						e.stopPropagation();
					}).mouseover(function() {
						var src = $(this).find("canvas");
						var target = $("#hoverCanvas");
						
						var context = src[0].getContext("2d");
						var imageData = context.getImageData(0, 0, 160, 144);
						var context = target[0].getContext("2d");
						
						context.putImageData(imageData, 0, 0);
						
						var pos = src.offset();
						target.css("left", pos.left - 1 + "px").css("top", pos.top - 1 +
							"px").addClass("visible");
					}).mouseout(function() {
						$("#hoverCanvas").removeClass("visible");
					}).append(
						$.create("div").append(
							$.create("div").addClass("iconCol").append(
								canvas = $.create("canvas")
							)
						).append(
							$.create("div").addClass("nameCol").
								text(chrome.i18n.getMessage("slotDescription"))
						).append(
							$.create("div").addClass("slotCol").append(
								$.create("div").append(
									$.create("div").text(data.slot)
								).append(
									$.create("input").prop("type", "number").prop("min", 0).
										prop("step", 1).prop("value", data.slot).blur(function() {
										
										var node = $(this).parent().parent().parent().parent();
										var val = Math.max(0, Math.round(this.value));
										var slot = node.prop("slot");
										if (isNaN(val) || slot == val) {
											return;
										}
										db.renumberState(node.prop("name"), slot, val);
										var list = node.parent();
										var swapnode = null;
										list.children().each(function(index, element) {
											element = $(element);
											var curr = element.prop("slot");
											if (curr == val) {
												swapnode = element;
												return false;
											}
										});
										node.prop("slot", val);
										$(this).parent().children("div").text(val);
										
										node.detach();
										if (swapnode) {
											swapnode.prop("slot", slot).
												find(".slotCol > div > input").prop("value", slot);
											swapnode.find(".slotCol > div > div").text(slot);
											swapnode.detach();
										}
										
										list.children().each(function(index, element) {
											element = $(element);
											var curr = element.prop("slot");
											if (curr > val) {
												element.before(node);
												return false;
											}
										});
										if (!node.parent().length) {
											list.append(node);
										}
										
										if (swapnode) {
											list.children().each(function(index, element) {
												element = $(element);
												var curr = element.prop("slot");
												if (curr > slot) {
													element.before(swapnode);
													return false;
												}
											});
											if (!swapnode.parent().length) {
												list.append(swapnode);
											}
										}
									})
								)
							)
						).append(
							$.create("div").addClass("exportCol").append(
								$.create("button").addClass("export").
									text(chrome.i18n.getMessage("export")).click(function() {
									
									var row = $(this).parent().parent().parent();
									var id = row.prop("name");
									var slot = row.prop("slot");
									db.readStateRecord(id, slot, function(data) {
										download(data.game + "." + data.slot + ".state",
											serialize(data.state));
									});
								})
							)
						)
					).append(
						$.create("button").addClass("delete").click(function() {
							var row = $(this).parent();
							var game = row.prop("name");
							var slot = row.prop("slot");
							db.deleteState(game, slot);
							
							var list = row.parent();
							row.mouseout();
							row.remove();
						})
					)
				);
				
				canvas[0].width = 160;
				canvas[0].height = 144;
				renderFrameBuffer(data.state[70], canvas[0]);
			});
		});
	});
}

function syncSettings() {
	$("input[type=checkbox]").each(function(index, element) {
		element.checked = Settings[element.name];
	});
	
	$("input[type=range], input[type=number]").each(function(index, element) {
		element.value = Settings[element.name];
	});
}

function syncKeys() {
	var map = {};
	for (var i in Settings.keyMap) {
		map[Settings.keyMap[i]] = i;
	}
	
	$("list").children().each(function(index, element) {
		var name = $(element).prop("name");
		var key = map[name];
		if (!key) {
			$(element).removeProp("key").find(".keyCol").text("");
		} else {
			$(element).prop("key", key).find(".keyCol").
				text(chrome.i18n.getMessage("key" + key) || ("Unknown (" + key + ")"));
		}
	});
}

function renderFrameBuffer(buffer, canvas) {
	var context = canvas.getContext("2d");
	var imageData = context.createImageData(160, 144);
	for (var from = 0, to = 0; from < 160 * 144; from++) {
		var x = buffer[from];
		imageData.data[to++] = (x >> 16) & 0xFF;
		imageData.data[to++] = (x >> 8) & 0xFF;
		imageData.data[to++] = x & 0xFF;
		imageData.data[to++] = 0xFF;
	}
	context.putImageData(imageData, 0, 0);
}

function download(filename, data) {
	//location.href = "data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=\"" + encodeURI(filename) + "\";base64," + btoa(data);
	var x = "";
	for (var i = 0; i < data.length; i++) {
		x += String.fromCharCode(data[i]);
	}
	data = x;
	
	var filesystem;
	
	var pending = 1;
	
	window.requestFileSystem = window.requestFileSystem ||
		window.webkitRequestFileSystem;
	window.requestFileSystem(window.TEMPORARY, data.length + (8 * 1024),
		function(fs) {
		
		filesystem = fs;
		
		var dr = fs.root.createReader();
		dr.readEntries(function removeEntries(res) {
			if (!res.length) {
				dec();
				return;
			}
			
			pending += res.length;
			for (var i = 0; i < res.length; i++) {
				res[i].remove(dec);
			}
			dr.readEntries(arguments.callee);
		});
	});
	
	function dec() {
		if (--pending) {
			return;
		}
		filesystem.root.getFile(filename, {create: true}, function(file) {
			file.createWriter(function(fw) {
				fw.onwriteend = function() {
					fw.onwriteend = function() {
						location.href = file.toURL();
					}
					fw.write(new Blob([data]));
				}
				fw.truncate(data.length);
			});
		});
	}
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
