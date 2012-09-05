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
		"tiltControls": {
			"": {
				type: "controls",
				keys: ["tiltup", "tiltdown", "tiltleft", "tiltright"]
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
					$.create("div").addClass("keyCol").text(map[keys[i]] ?
						(chrome.i18n.getMessage("key" + map[keys[i]]) || ("Unknown (" +
						map[keys[i]] + ")")) : "")
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

function createSRAMRow(id) {
	return $.create("div").prop("id", "save_" + id.replace(" ", "_") + "_SRAM").
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
						
						var id = $(this).parent().parent().parent().parent().parent().
							prop("name");
						db.readGame(id, function(res) {
							download(id + ".sram", res.SRAM);
						});
					})
				)
			)
		).append(
			$.create("button").addClass("delete").click(function() {
				var row = $(this).parent();
				var game = row.parent().parent().prop("name");
				db.deleteSRAM(game);
				
				row.mouseout();
				row.remove();
			})
		);
}

function createRTCRow(id) {
	return $.create("div").prop("id", "save_" + id.replace(" ", "_") + "_RTC").
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
						
						var id = $(this).parent().parent().parent().parent().parent().
							prop("name");
						db.readGame(id, function(res) {
							download(id + ".rtc", serialize(res.RTC));
						});
					})
				)
			)
		).append(
			$.create("button").addClass("delete").click(function() {
				var row = $(this).parent();
				var game = row.parent().parent().prop("name");
				db.deleteRTC(game);
				
				row.mouseout();
				row.remove();
			})
		);
}

function createStateRow(id, slot, bitmap) {
	var canvas;
	var res =
		$.create("div").prop("slot", slot).prop("id", "save_" + id.replace(" ", "_")
			+ "_" + slot).mousedown(function(e) {
			
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
			target.css("left", pos.left - 1 + "px").css("top", pos.top - 1 + "px").
				addClass("visible");
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
						$.create("div").text(slot)
					).append(
						$.create("input").prop("type", "number").prop("min", 0).
							prop("step", 1).prop("value", slot).blur(function() {
							
							var node = $(this).parent().parent().parent().parent();
							var val = Math.max(0, Math.round(this.value));
							var slot = node.prop("slot");
							if (isNaN(val) || slot == val) {
								return;
							}
							db.renumberState(node.parent().parent().prop("name"), slot, val);
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
								swapnode.prop("slot", slot).find(".slotCol > div > input").
									prop("value", slot);
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
						var id = row.parent().parent().prop("name");
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
				var game = row.parent().parent().prop("name");
				var slot = row.prop("slot");
				db.deleteState(game, slot);
				
				row.mouseout();
				row.remove();
			})
		);
	
	canvas[0].width = 160;
	canvas[0].height = 144;
	renderFrameBuffer(bitmap, canvas[0]);
	return res;
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
				$.create("div").prop("name", data.id).append(
					header = $.create("h3").addClass("system" + data.system).text(data.id)
				).append(
					list = $.create("list")
				)
			);
			
			if (data.SRAM != null) {
				header.append(
					$.create("button").addClass("realButton").text(
						chrome.i18n.getMessage("importSaveSRAM")).click(function() {
						
						var self = this;
						openFile(function(file) {
							var fr = new FileReader();
							fr.onload = function() {
								var container = $(self).parent().parent();
								var id = container.prop("name");
								db.importSRAM(id, this.result);
								
								var row = $("#save_" + id.replace(" ", "_") + "_SRAM");
								if (!row.length) {
									container.children("list").prepend(createSRAMRow(id));
								}
							}
							fr.readAsBinaryString(file);
						}, ".sram");
					})
				);
				if (data.SRAM.length) {
					list.append(createSRAMRow(data.id));
				}
			}
			if (data.RTC != null) {
				header.append(
					$.create("button").addClass("realButton").text(
						chrome.i18n.getMessage("importSaveRTC")).click(function() {
						
						var self = this;
						openFile(function(file) {
							var fr = new FileReader();
							fr.onload = function() {
								var container = $(self).parent().parent();
								var id = container.prop("name");
								db.importRTC(id, this.result);
								
								var row = $("#save_" + id.replace(" ", "_") + "_RTC");
								if (!row.length) {
									var row = $("#save_" + id.replace(" ", "_") + "_SRAM");
									if (row.length) {
										row.after(createRTCRow(id));
									} else {
										container.children("list").prepend(createRTCRow(id));
									}
								}
							}
							fr.readAsBinaryString(file);
						}, ".rtc");
					})
				);
				if (data.RTC.length) {
					list.append(createRTCRow(data.id));
				}
			}
			header.append(
				$.create("button").addClass("realButton").text(
					chrome.i18n.getMessage("importSaveState")).click(function() {
						
					var self = this;
					openFile(function(file) {
						var fr = new FileReader();
						fr.onload = function() {
							var container = $(self).parent().parent();
							var id = container.prop("name");
							db.importState(id, this.result, function(slot, state) {
								var list = container.children("list");
								var row = createStateRow(id, slot, state[70]);
								list.children().each(function(index, element) {
									var slot2 = $(element).prop("slot");
									if (slot2 === undefined) {
										return;
									}
									
									if (slot2 < slot) {
										return;
									}
									
									$(element).before(row);
									row = null;
									return false;
								});
								if (row) {
									list.append(row);
								}
							});
						}
						fr.readAsBinaryString(file);
					}, ".state");
				})
			);
			db.eachState(data.id, function(data) {
				if (!data) {
					return;
				}
				
				list.append(createStateRow(data.id, data.slot, data.state[70]));
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
				text(chrome.i18n.getMessage("key" + key) ||
					chrome.i18n.getMessage("unknownkey", key.toString()));
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
	data = new Uint8Array(data);
	
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
