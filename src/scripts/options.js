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
			"manage": {
				type: "button"
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
				max: 1
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
				max: Infinity,
				rangeMax: 20
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
				max: Infinity,
				rangeMax: 99
			},
			"audioBufferMaxSpan": {
				type: "range",
				min: 1,
				max: Infinity,
				rangeMax: 99
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
		frag.append($.create("li").prop("id", i).append($.create("button").
			attr("i18n-content", i + "Nav")));
			
		var content = $.create("div").prop("id", i + "Content")
		content.append($.create("h1").attr("i18n-content", i + "Nav"))
		for (var j in layout[i]) {
			content.append($.create("h2").attr("i18n-content", j + "Category"));
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