(function() {
	setInterval(function() {var x = document.getElementById("available"); var y = x.innerHTML; x.innerHTML = y - 1;}, 30000);
});