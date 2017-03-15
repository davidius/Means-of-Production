function setupEditPomodoroModal(idOfPomodoro){
	var projects = userDatabase.projects.slice();
	var project = getCurrentProject();
	var sessions = project.sessions.slice();
	var session = sessions[idOfPomodoro];
	var newDate, newMinutes, newDateAsString, newMinutesAsNumber;

	var indexOfProject = findIndexOfProjectOrTask("project", project);

	$("#input-date-edit-pomodoro").datetimepicker({
		format: 'MMM Do, YYYY HH:mm',
		useCurrent: true
	});

	$("#modal-edit-pomodoro-error").css("display", "none");

	var pomodoroDateAsFormattedString = moment(session.date).format("MMM Do, YYYY HH:mm");
	$("#input-date-edit-pomodoro-text").val(pomodoroDateAsFormattedString);

	$("#txt-session-minutes").val(session.minutes);

	$("#btn-change-pomodoro").off("click").on("click", function(){
		newDate = makeDateObjectFromMoment(moment($("#input-date-edit-pomodoro-text").val(), 'MMM Do, YYYY HH:mm'));
		newMinutes = $("#txt-session-minutes").val();
		newDateAsString = newDate.toISOString();
		newMinutesAsNumber = parseInt(newMinutes);

		if(newDate != "Invalid Date" && !isNaN(parseInt(newMinutes))){
			sessions[idOfPomodoro].date = newDateAsString;
			sessions[idOfPomodoro].minutes = newMinutesAsNumber;
			
			projects[indexOfProject].sessions = sessions;

			projectsRef.set(projects);

			$("#modal-edit-pomodoro").modal("hide");
		}
		else{
			$("#modal-edit-pomodoro-error").css("display", "block");
		}
		
	});
}

function setupDeletePomodoroModal(idOfPomodoro){
	var projects = userDatabase.projects.slice();
	var project = getCurrentProject();
	var sessions = project.sessions.slice();
	var session = sessions[idOfPomodoro];

	var indexOfProject = findIndexOfProjectOrTask("project", project);

	// console.log("currently this session (id " + idOfPomodoro + ") is deleted = " + session.deleted);
	
	$("#btn-del-pomodoro").off("click").on("click", function(){
		session.deleted = true;

		projects[indexOfProject].sessions = sessions;

		projectsRef.set(projects);

		$("#modal-del-pomodoro").modal("hide");
	});
}