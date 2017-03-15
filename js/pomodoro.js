//pomodoro stuff***************************************************************************************************************

var timePomodoro;
var timeBreak;
var timeLeft = 30;
var timeDone = 0;
var timeDoneStored = 0;
var breakLeft = 5;
var breakDone = 0;
var breakDoneStored = 0;
var timer;
var pomodoroRunning = false;
var pomodoroOnABreak = false;
var pomodoroPaused = false;
var pomodoroResumed = false;
var pomodoroProject = ""; //add this to localStorage???
var pomodoroSound = new Audio('audio/tone.mp3');
var start;

function startPomodoro(){
	pomodoroOnABreak = false;
	$("#view-pomodoro").removeClass("not-being-used");
	$("#btn-pause").html('<span class="glyphicon glyphicon-pause" aria-hidden="true">');
	if(pomodoroRunning){
		//tell the user that a pomodoro is already running
		alert("A pomodoro is already running!");
	}
	else{
		pomodoroProject = getCurrentProject();
		if($("#txt-pom-time").val()=="test"){
			timePomodoro = timeLeft = 7;
			timeBreak = breakLeft = 3;
		}
		else{
			// also check for invalid inputs, like characters, etc.
			if($("#txt-pom-time").val()==""){
				timePomodoro = timeLeft = pomodoroProject.standardPomodoroTime * 60;
			}
			else{
				timePomodoro = timeLeft = $("#txt-pom-time").val() * 60;
			}
			if($("#txt-pom-break-time").val()==""){
				timeBreak = breakLeft = pomodoroProject.standardPomodoroBreak * 60;
			}
			else{
				timeBreak = breakLeft = $("#txt-pom-break-time").val() * 60;
			}
		}
		if(localStorage["platform"] == "web"){
			$("#modal-pomodoro").modal("hide");
		}
		timeDone = 0;
		pomodoroRunning = true;
		start = new Date().getTime();
		updateMinutesAndSeconds();
		timer = setInterval(updateTimer, 1000);
	}
}

//deals with what happens when the pause/play button is pressed, in whatever situation it's pressed
function pausePomodoro(){
	//currently playing?
	if(pomodoroRunning && !pomodoroPaused){
		pomodoroPaused = true;
		clearInterval(timer);
		$("#btn-pause").html('<span class="glyphicon glyphicon-play" aria-hidden="true">');
	}
	//currently paused?
	else if(pomodoroRunning && pomodoroPaused){
		pomodoroPaused = false;
		pomodoroResumed = true;
		start = new Date().getTime();
		//if the user is on a break, use the break timer; otherwise use the regular one
		if(pomodoroOnABreak){
			timer = setInterval(updateTimerBreak, 1000);
		}
		else{
			timer = setInterval(updateTimer, 1000);
		}
		$("#btn-pause").html('<span class="glyphicon glyphicon-pause" aria-hidden="true">');
	}
}

// takes care of what happens every second while a pomodoro is running
function updateTimer(){
	var currentTime = new Date().getTime();
	
	if(timeLeft > 0){
		if(pomodoroResumed){
			pomodoroResumed = false;
			timeDoneStored = timeDone;
		}
		if(!pomodoroResumed){
			timeDone = timeDoneStored + Math.floor((currentTime - start)/1000);
		}
		timeLeft = timePomodoro - timeDone;
	}
	if(timeLeft <= 0){
		clearInterval(timer);
		endPomodoro();
	}

	updateMinutesAndSeconds();
}

//when a pomodoro is complete, save the record of this in the local storage (and later on the server)
function endPomodoro(){
	var timeDoneInMinutes;
	$("#view-pomodoro").addClass("not-being-used");

	$("#modal-pomodoro").modal("show");
	
	pomodoroRunning = false;
	timeDoneStored = 0;
	$("#btn-start-pomodoro").prop("disabled", false).removeClass('ui-disabled');
	
	timeLeft = pomodoroProject.standardPomodoroTime * 60;
	var htmlToAdd = "";

	htmlToAdd += "<p>Completed a session for <strong>" + pomodoroProject.name + "</strong>! You are awesome!</p>";

	$("#btn-start-pomodoro").html("Start break?");
	$("#btn-start-pomodoro").off("click").on("click", startBreak);
	
	$("#div-pomodoro").html(htmlToAdd);

	timeDoneInMinutes = Math.floor(timeDone/60);
	saveSession({timeDone: timeDoneInMinutes, date: new Date(), project: pomodoroProject});
	
	$("#btn-pause").html('<span class="glyphicon glyphicon-play" aria-hidden="true">');

	pomodoroSound.play();
	notify("Completed a session!");
}

function cancelPomodoro(){
	
}

//called when the work part of a pomodoro is done
function startBreak(){
	pomodoroOnABreak = true;
	$("#view-pomodoro").removeClass("not-being-used");

	$("#btn-start-pomodoro").prop("disabled", true).addClass('ui-disabled');
	$("#view-pomodoro").addClass("on-a-break");
	$("#btn-pause").html('<span class="glyphicon glyphicon-pause" aria-hidden="true">');
	breakDone = 0;
	pomodoroRunning = true;
	if(localStorage["platform"] == "web"){
		$("#modal-pomodoro").modal("hide");
	}
	start = new Date().getTime();
	updateMinutesAndSeconds();
	timer = setInterval(updateTimerBreak, 1000);
}

function updateTimerBreak(){
	var currentTime = new Date().getTime();

	if(breakLeft > 0){
		if(pomodoroResumed){
			pomodoroResumed = false;
			breakDoneStored = breakDone;
		}
		if(!pomodoroResumed){
			breakDone = breakDoneStored + Math.floor((currentTime - start)/1000);
		}
		breakLeft = timeBreak - breakDone;
	}
	if(breakLeft <= 0){
		clearInterval(timer);
		endBreak();
	}

	updateMinutesAndSeconds();
}

function endBreak(){
	pomodoroRunning = false;
	$("#view-pomodoro").addClass("not-being-used");

	if(localStorage["platform"] == "web"){
		$("#modal-pomodoro").modal("show");
	}
	$("#btn-start-pomodoro").prop("disabled", false).removeClass('ui-disabled');
	$("#btn-start-pomodoro").html("Start pomodoro?");
	$("#btn-start-pomodoro").off("click").on("click", startPomodoro);

	setupPomodoroPage();

	$("#view-pomodoro").removeClass("on-a-break");
	$("#btn-pause").html('<span class="glyphicon glyphicon-play" aria-hidden="true">');

	pomodoroSound.play();
	notify("Break over!");
}

function notify(message){
	var options = {
    	icon: "favicon.png"
	}

	// Let's check if the browser supports notifications
	  if (!("Notification" in window)) {
	    alert("This browser does not support desktop notification");
	  }

	  // Let's check whether notification permissions have already been granted
	  else if (Notification.permission === "granted") {
	    // If it's okay let's create a notification
	    var notification = new Notification(message, options);
	  }

	  // Otherwise, we need to ask the user for permission
	  else if (Notification.permission !== 'denied') {
	    Notification.requestPermission(function (permission) {
	      // If the user accepts, let's create a notification
	      if (permission === "granted") {
	        var notification = new Notification(message, options);
	      }
	    });
	  }

	  // At last, if the user has denied notifications, and you 
	  // want to be respectful there is no need to bother them any more.
}

function getMinutesAndSecondsLeft(){
	var minutes, seconds;
	var minutesString, secondsString;

	if(!pomodoroOnABreak){
		var minutes = Math.floor(timeLeft/60);
		var seconds = timeLeft - (minutes*60);
	}
	else {
		var minutes = Math.floor(breakLeft/60);
		var seconds = breakLeft - (minutes*60);
	}
	
	if(minutes < 10){
		minutesString = "0" + minutes.toString();
	}
	else{
		minutesString = minutes.toString();
	}
	if(seconds < 10){
		secondsString = "0" + seconds.toString();
	}
	else{
		secondsString = seconds.toString();
	}

	return {minutes: minutesString, seconds: secondsString};
}