//add a new project based on the properties given in the form
function addProject(){
	var projects = userDatabase.projects.slice();
	
	var nextAvailableProjectId = getNextAvailableId(projects);
	var nextAvailableProjectNumber = getNextAvailableNumber(projects);

	if($("#txt-project").val() != ""){
		var newProject = new Project(nextAvailableProjectId, $("#txt-project").val(), nextAvailableProjectNumber); //id, name, number
		
		projects.push(newProject);
		localStorage["currentProject"] = parseInt(newProject.id);
		userDatabase.projects = projects;

		projectsRef.set(userDatabase.projects);

		$("#modal-add-project").modal("hide");
		return true;
	}
	else{
		return false;
	}
}

//add a new task based on the properties given in the form
function addTask(){
	var localTasks = userDatabase.tasks.slice();
	var projectTasks = findMany("tasks", "projectId", getCurrentProject());

	var phases = [];

	var nextAvailableTaskId = getNextAvailableId(localTasks);
	
	var newTask;
	if($("#txt-task").val() != ""){
		newTask = new Task($("#txt-task").val());

		newTask.id = nextAvailableTaskId;
		newTask.number = getNextAvailableNumber(localTasks);
		
		newTask.projectId = getCurrentProject().id;
		phases = findOne("project", "id", newTask.projectId).phases;
		newTask.phase = phases[0]; // place in the first phase of the project by default
		newTask.numberInPhase = findInArray("tasks", "phase", phases[0], findMany("tasks", "projectId", findOne("project", "id", newTask.projectId))).length; // place on the end of the list of tasks in that phase

		// update the localTasks object and then localStorage
		localTasks.push(newTask);
		userDatabase.currentTask = newTask;
		userDatabase.tasks = localTasks;

		tasksRef.set(userDatabase.tasks)
		
		$("#modal-add-task").modal("hide");
		return true;
	}
	else{
		return false;
	}
}

function saveProject(project){
	var projects = userDatabase.projects.slice();

	// get the index of the project
	var indexOfProject = findIndexOfProjectOrTask("project", project);

	// @TODO: make sure no invalid values are accepted

	if($("#input-project-name").val() != ""){
		project.name = $("#input-project-name").val();
		// update all associated tasks accordingly
		// @TODO: obviously, this shouldn't be necessary -- the associated project should be the object rather than the name
	}

	if($("#input-target-time").val() != ""){
		project.targetMinutes = $("#input-target-time").val();
	}

	if($("#input-target-units").val() != ""){
		project.customTarget = $("#input-target-units").val();
	}

	if($("#input-unit-name").val() != ""){
		project.unitName = $("#input-unit-name").val();
	}

	if($("#switch-track-time").prop("checked")){
		project.trackTime = true;
	}
	else{
		project.trackTime = false;
	} 

	if($("#switch-track-units").prop("checked")){
		project.trackUnits = true;
	}
	else{
		project.trackUnits = false;
	}

	//update userDatabase and upload to firebase
	projects[indexOfProject] = project;
	userDatabase.projects = projects;
	projectsRef.set(userDatabase.projects);
	
	setupOverviewPage(); // @TODO: is this repeated in refresh???
	$("#modal-edit-project").modal("hide");
}

function saveTask(task){
	var tasks = userDatabase.tasks.slice();
	var originalPhase = task.phase;

	// get the index of the task
	var indexOfTask = findIndexOfProjectOrTask("task", task);
	
	if($("#taskName").val() != "" && $("#taskName").val()){
		task.name = $("#taskName").val();
	}
	task.projectId = findOne("project", "name", $("#changeProjectChoice").val()).id;

	task.phase = $("#phaseChoice").val();

	var taskDueDateAsFormattedString = "";
	if($("#inputDueDateText").val() == "") {
		taskDueDateAsFormattedString = "";
	}
	else {
		taskDueDateAsFormattedString = (makeDateObjectFromMoment(moment($("#inputDueDateText").val(), 'MMM Do, YYYY'))).toISOString();
	}
	
	if(taskDueDateAsFormattedString != "Invalid Date"){
		task.dueDate = taskDueDateAsFormattedString;
	}
	
	var taskReminderTimeAsFormattedString = "";
	if($("#inputReminderTimeText").val() == ""){
		taskReminderTimeAsFormattedString = "";
	}
	else {
		taskReminderTimeAsFormattedString = (makeDateObjectFromMoment(moment($("#inputReminderTimeText").val(), 'MMM Do, YYYY HH:mm'))).toISOString();
	}
	
	if(taskReminderTimeAsFormattedString != "Invalid Date"){
		task.reminderTime = taskReminderTimeAsFormattedString;
	}
	
	if($("#switchDone").prop("checked")){
		task.done = true;
	}
	else{
		task.done = false;
	}

	// @TODO: check this bit
	if(task.phase != originalPhase){
		var arr3 = findMany("tasks", "projectId", findOne("project", "id", task.projectId));
		var arr4 = findInArray("tasks", "phase", originalPhase, findMany("tasks", "projectId", findOne("project", "id", task.projectId)));
		$.each(arr3, function(index, elem){
			arr3[index] = elem.name;
		});
		$.each(arr4, function(index, elem){
			arr4[index] = elem.name;
		});
		var tempArray2 = arr3.filter(function(n){
			return arr4.indexOf(n) != -1;
		});
		$.each(tempArray2, function(index, elem){
			tempArray2[index] = findOne("task", "name", tempArray2[index]);
			
			var tempID = tempArray2[index].id;
			tasks[tempID].numberInPhase -= 1;
		});
	}

	task.notes = $("#text-task-notes").val();
	
	if($("#taskName").val() != ""){
		//update localStorage
		tasks[indexOfTask] = task;

		userDatabase.tasks = tasks;

		tasksRef.set(userDatabase.tasks);
		uploadReminders(userDatabase.email);

		$("#modal-edit-task").modal("hide");
		return true;
	}
	else{
		console.log("not saving changes to task");
		return false;
	}
}

function deleteProject(project){
	var projects = userDatabase.projects.slice();
	var tasks = userDatabase.tasks.slice();

	// get the index of the project
	var indexOfProject = findIndexOfProjectOrTask("project", project);

	// delete associated tasks
	for(var i=tasks.length-1; i>=0; i--){
		if(tasks[i].projectId == project.id){
			tasks.splice(i, 1);
		}
	}

	// delete the project itself
	projects.splice(indexOfProject, 1);

	localStorage["currentProject"] = "";
	localStorage["currentTask"] = "";

	userDatabase.projects = projects;
	userDatabase.tasks = tasks;

	projectsRef.set(userDatabase.projects);
	tasksRef.set(userDatabase.tasks);

	$("#modal-delete-project").modal("hide");
	window.location.hash = "";
}

function deleteTask(task){
	var tasks = userDatabase.tasks.slice();
	var associatedProject = findOne("project", "id", task.projectId);
	
	// get the index of the task
	var indexOfTask = findIndexOfProjectOrTask("task", task);
	
	tasks.splice(indexOfTask, 1);

	userDatabase.tasks = tasks;
	ensureTaskNumbersAreWellOrdered(associatedProject);

	localStorage["currentTask"] = "";

	tasksRef.set(userDatabase.tasks);
	uploadReminders(userDatabase.email);
	
	$("#modal-delete-task").modal("hide");
}

function checkTask(id, checked){
	var tasks = userDatabase.tasks.slice();
	var task = findOne("task", "id", id);

	// get the index of the task
	var indexOfTask = findIndexOfProjectOrTask("task", task);
	
	if(checked){
		task.done = true;
	}
	else{
		task.done = false;
	}

	tasks[indexOfTask] = task;
	userDatabase.tasks = tasks;
	tasksRef.set(userDatabase.tasks);
}

// this function looks at all the tasks in a project and ensures that they are numbered correctly
// This should be called whenever task ordering is affected, i.e. when a new task is added, a task is deleted, tasks are rearranged, etc.
function ensureTaskNumbersAreWellOrdered(project){
	var tasks = orderTaskList(findMany("tasks", "projectId", project), "todo", project);
	
	$.each(tasks, function(index, task){
		task.number = index;
	});

	$.each(tasks, function(index, task){
		var correspondingIndex = findIndexOfProjectOrTask("task", task);
		userDatabase.tasks[correspondingIndex] = task;
	});

	$.each(project.phases, function(indexOfPhase, phaseToCheck){
		ensureTaskNumbersInPhaseAreWellOrdered(project, indexOfPhase);
	});
}

// this function looks at all the tasks in a project phase and ensures that they are numbered correctly
function ensureTaskNumbersInPhaseAreWellOrdered(project, phaseNumber){
	var tasks = orderTaskPhaseList(project, phaseNumber);
	
	$.each(tasks, function(index, task){
		task.numberInPhase = index;
		var correspondingIndex = findIndexOfProjectOrTask("task", task);
		userDatabase.tasks[correspondingIndex] = task;
	});
}

function postponeTaskTillTomorrow(id){
	var tasks = userDatabase.tasks.slice();
	var task = findOne("task", "id", id);

	// get the index of the task
	var indexOfTask = findIndexOfProjectOrTask("task", task);

	var newDueDate = new Date();
	newDueDate.setDate(newDueDate.getDate() + 1);
	newDueDate.setHours(0, 0, 0, 0);
	var newDueDateAsString = newDueDate.toISOString();
	
	task.dueDate = newDueDateAsString;
	
	tasks[indexOfTask] = task;
	userDatabase.tasks = tasks;
	tasksRef.set(userDatabase.tasks);
}