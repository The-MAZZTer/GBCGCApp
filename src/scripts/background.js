$(document).off("ready");

if (chrome.fileBrowserHandler) {
	chrome.fileBrowserHandler.onExecute.addListener(function(id, details) {
		details.entries[0].file(function(file) {
			var fr = new FileReader();
			fr.onload = function() {
				var data = this.result;
				db.readyHandlers[1] = function() {
					db.writeROM(data, function() {
						db.dispose();
						chrome.tabs.create({url: "/index.html"});			
					});
				}
				db.init();
			}
			fr.readAsBinaryString(file);
		});
	});
}