function setupPomodoroPage(){
	var project = getCurrentProject();
	var htmlToAdd = "";

	htmlToAdd += '<label for="txt-pom-time">Duration of work (in minutes):</label>  <input type="text" class="form-control" name="txt-pom-time" id="txt-pom-time" placeholder="By default, this is 25">';
	htmlToAdd += '<label for="txt-pom-break-time">Duration of break (in minutes):</label>  <input type="text" class="form-control" name="txt-pom-break-time" id="txt-pom-break-time" value="" placeholder="By default, this is 5">';

	htmlToAdd += "<p>Start pomodoro for <strong>" + project.name + "</strong>?</p>";

	$("#div-pomodoro").html(htmlToAdd);

	$("#btn-start-pomodoro").off("click").on("click", startPomodoro);
}

function setupPomodoroClock(){
	$("#btn-pause").off("click").on("click", pausePomodoro);

	updateMinutesAndSeconds();

	if(pomodoroRunning && !pomodoroPaused){
		$("#btn-pause").html('<span class="glyphicon glyphicon-pause" aria-hidden="true">');
	}
}

function updateMinutesAndSeconds(){
	var minutesAndSecondsLeft = getMinutesAndSecondsLeft();
	var minutesString = minutesAndSecondsLeft.minutes;
	var secondsString = minutesAndSecondsLeft.seconds;
	
	$("#div-clock-itself").html("<p>" + minutesString + ": " + secondsString + "</p>");
}