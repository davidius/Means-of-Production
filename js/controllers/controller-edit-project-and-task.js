function setupEditProjectPage(){
	var project = getCurrentProject();

	$("#input-project-name").attr("placeholder", project.name);
	$("#input-project-name").val("");

	$("#switch-track-time").prop("checked", project.trackTime);
	$("#switch-track-units").prop("checked", project.trackUnits);

	$("#input-target-time").attr("placeholder", project.targetMinutes);
	$("#input-target-time").val("");
	$("#input-target-units").attr("placeholder", project.customTarget);
	$("#input-target-units").val("");
	$("#input-unit-name").attr("placeholder", project.unitName);
	$("#input-unit-name").val("");

	$("#btn-save-project").off("click").on("click", function(){
		saveProject(project);
	});
}

function setupEditTaskPage(){
	var task = getCurrentTask();
	var project = findOne("project", "id", task.projectId);
	var projects = orderProjects();
	var projectsLength = lengthOfObject(projects);
	var phases = project.phases;
	
	var htmlProject = "";
	var htmlPhase = "";

	var associatedProjectName = findOne("project", "id", task.projectId).name;

	$("#modal-edit-task-error").css("display", "none");

	$("#taskName").val(task.name);

	for (var i = 0; i < projectsLength; i++) {
		if(projects[i].name==associatedProjectName){
			htmlProject += "<option selected='selected' value = \"" + projects[i].name + "\">" + projects[i].name + "</option>";
		}
		else{
			htmlProject += "<option value = \"" + projects[i].name + "\">" + projects[i].name + "</option>";
		}
	}
	
	// populate the "project" dropdown
	$("#changeProjectChoice").html(htmlProject);
	
	// populate the "phase" dropdown
	for (var i = 0; i < phases.length; i++) {
		if(phases[i]==task.phase){
			htmlPhase += "<option selected='selected' value = \"" + phases[i] + "\">" + phases[i] + "</option>";
		}
		else{
			htmlPhase += "<option value = \"" + phases[i] + "\">" + phases[i] + "</option>";
		}
	}
	$("#phaseChoice").html(htmlPhase);
	
	// populate the "due date" datepicker
	
	$("#inputDueDate").datetimepicker({
		format: 'MMM Do, YYYY'
	});
		
	// check if the task has a due date; if so, populate accordingly
	if(task.dueDate != "" && task.dueDate != "Invalid date"){
		var taskDueDateAsFormattedString = moment(task.dueDate).format("MMM Do, YYYY");
		$("#inputDueDateText").val(taskDueDateAsFormattedString);
	}
	else{
		$("#inputDueDateText").val("");
	}

	// populate the "reminder" input
	$("#inputReminderTime").datetimepicker({
		stepping: 5,
		format: 'MMM Do, YYYY HH:mm'
	});
	
	// check if the task has a reminder; if so, populate accordingly
	if(task.reminderTime != "" && task.reminderTime != "Invalid date"){
		var taskReminderAsFormattedString = moment(task.reminderTime).format("MMM Do, YYYY HH:mm");
		$("#inputReminderTimeText").val(taskReminderAsFormattedString);
	}
	else{
		$("#inputReminderTimeText").val("");
	}

	$("#switchDone").prop("checked", task.done);

	$("#text-task-notes").val(task.notes);
	
	$("#btn-delete-task").off("click").on("click", function(){
		deleteTask(getCurrentTask());
	});
	$("#btn-save-task").off("click").on("click", function(){
		var saved = saveTask(getCurrentTask());
		if(!saved){
			$("#modal-edit-task-error").css("display", "block");
		}
	});
}