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
		"keyMap": {
			type: "controls"
		}
	},
	"manage": {
		"games": {
			type: "manage"
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
			}
		},
		"graphics": {
			"imageSmoothing": {
				type: "checkbox"
			},
			"JSScale": {
				type: "checkbox"
			}
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
	var frag = $(document.createDocumentFragment());
	var frag2 = $(document.createDocumentFragment());
	for (var i in layout) {
		var page = layout[i];
		frag.append(
			$.create("li").prop("id", i).append(
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
					case "controls":
						generateControls(k, setting, section);
						break;
					case "manage":
						generateManage(k, setting, section);
						break;
					case "button":
						generateButton(k, setting, section);
						break;
				}
			}
			content.append(section)
		}
		
		frag2.append(content);
	}
	$("#nav ul").append(frag);
	$("#content").append(frag2);
	
	i18nTemplate.process(document);

	$(window).on("hashchange", function() {
		switchPage(location.hash);
	});
	switchPage(location.hash);
	
	$("#nav li").click(function() {
		location.hash = "#" + this.id;
	});
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

function generateControls(name, setting, parent) {
}

function generateManage(name, setting, parent) {
}

function generateButton(name, setting, parent) {
	parent.append(
		$.create("div").addClass("button").append(
			$.create("button").attr("i18n-content", name + "Setting").prop("target",
				setting.target).click(function() {
				
				$("#" + this.target).click();
			})
		)
	);
}