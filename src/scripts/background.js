chrome.fileBrowserHandler.onExecute.addListener(function(id, details) {
	details.entries[0].file(function(file) {
		var fr = new FileReader();
		fr.onload = function() {
			window.open("/index.html?file=" + encodeURI(this.result));
		}
		fr.readAsBinaryString(file);
	});
});