$(document).ready(function(e) {
	$(window).on("hashchange", function() {
		switchPage(location.hash);
	});
	switchPage(location.hash);
	
	$("#optionsNav").click(function() {
		location.hash = "";
	});
	$("#controlsNav").click(function() {
		location.hash = "#controls";
	});
	$("#manageNav").click(function() {
		location.hash = "#manage";
	});
});

function switchPage(hash) {
	$("#optionsNav").removeClass("selected");
	$("#controlsNav").removeClass("selected");
	$("#manageNav").removeClass("selected");
	switch (hash) {
		case "#controls":
			$("#controlsNav").addClass("selected");
			$("title").text($("#controlsNav button").text());
			break;
		case "#manage":
			$("#manageNav").addClass("selected");
			$("title").text($("#manageNav button").text());
			break;
		default:
			$("#optionsNav").addClass("selected");
			$("title").text($("#optionsNav button").text());
			break;
	}
}