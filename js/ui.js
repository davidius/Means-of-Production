function tapText() {
	currentWord = getSelected();
	if (Modernizr.localstorage) {
		// window.localStorage is available!
		if (currentWord.length == 0) {
			console.log("Word has length 0.");
		} else if ( typeof currentWord === "undefined") {
			console.log("Word is undefined.");
		} else {
			var whitespace = /\s/g;
			var result = [];
			result = currentWord.match(whitespace);
			if (result != null) {
				alert("Can't select more than one word at a time!");
			} else {
				console.log("Word is defined and has letters in it! Yay!");
				alert("Handing it over to Google...");
				preGoogle(currentWord);
			}
		}
	} else {
		// no native support for HTML5 storage :(
		// maybe try dojox.storage or a third-party solution
	}
}

function getSelected() {
	var t = "";
	if (window.getSelection) {
		t = window.getSelection();
		//Safari and Chrome on iOS
	} else if (document.getSelection) {
		t = document.getSelection();
	} else if (document.selection) {
		t = document.selection.createRange().text;
	}
	t = $.trim(t);
	return t;
}

function clearSelection() {
	//the following setTimeout deselects the selected text. This may not ultimately be necessary...

	//setTimeout(function() {
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	} else if (document.getSelection) {
		document.getSelection().removeAllRanges();
	} else if (document.selection) {
		document.selection.removeAllRanges();
	}
	//}, 25);
}

// Callback function references the event target and adds the 'swipeleft' class to it
function swipeleftHandler(event) {
	if (!$("div.box").hasClass("swipedHorizontal")) {
		$("div.box").addClass("swipedHorizontal");
		$(':mobile-pagecontainer').pagecontainer('change', '#translationPage', {
			transition : 'slidefade',
			changeHash : false,
			//reverse: true,
			showLoadMsg : true
		});
	}
}

function swiperightHandler(event) {
	if ($("div.box").hasClass("swipedHorizontal")) {
		$("div.box").removeClass("swipedHorizontal");
		$(':mobile-pagecontainer').pagecontainer('change', '#originalPage', {
			transition : 'slidefade',
			changeHash : false,
			reverse : true,
			showLoadMsg : true
		});
	}
}

/*
 function swipeupHandler(event) {
 if (!$("div.box").hasClass("swipedVertical")) {
 $("div.box").addClass("swipedVertical");
 $(':mobile-pagecontainer').pagecontainer('change', '#translationPage', {
 transition : 'slideup',
 changeHash : false,
 //reverse: true,
 showLoadMsg : true
 });
 }
 }

 function swipedownHandler(event) {
 if (!$("div.box").hasClass("swipedVertical")) {
 $("div.box").addClass("swipedVertical");
 $(':mobile-pagecontainer').pagecontainer('change', '#translationPage', {
 transition : 'slidedown',
 changeHash : false,
 //reverse: true,
 showLoadMsg : true
 });
 }
 }
 */

function goUp() {
	if (currentPage > 0) {
		currentPage -= 1;
		$("#originalText").html(database.languages[currentLanguage].readings[currentReading].pages[currentPage].original);
		$("#englishText").html(database.languages[currentLanguage].readings[currentReading].pages[currentPage].english);
	}
	sortUpDownButtons();
}

function goDown() {
	if (currentPage < database.languages[currentLanguage].readings[currentReading].pages.length - 1) {
		currentPage += 1;
		$("#originalText").html(database.languages[currentLanguage].readings[currentReading].pages[currentPage].original);
		$("#englishText").html(database.languages[currentLanguage].readings[currentReading].pages[currentPage].english);
	}
	sortUpDownButtons();
}

function sortUpDownButtons() {
	if (currentPage == 0) {
		$("#upButton").css("background-color", "#666666");
		$("#upButton2").css("background-color", "#666666");
	}
	else{
		$("#upButton").css("background-color", "#468966");
		$("#upButton2").css("background-color", "#468966");
	}
	if (currentPage == database.languages[currentLanguage].readings[currentReading].pages.length - 1) {
		$("#downButton").css("background-color", "#666666");
		$("#downButton2").css("background-color", "#666666");
	}
	else{
		$("#downButton").css("background-color", "#468966");
		$("#downButton2").css("background-color", "#468966");
	}
}