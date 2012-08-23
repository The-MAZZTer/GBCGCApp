$(document).ready(function(e) {
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
	$(hash).addClass("selected");
	$("title").text($(hash + " > button").text());
}