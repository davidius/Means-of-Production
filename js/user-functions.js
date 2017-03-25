// Add empty values ONLY if none of them already exist (otherwise we'd be deleting pre-existent values)
// Also ensures that anything created before certain changes to the prototypes are made are updated accordingly

// Also note that the old version of this function, dealing with localStorage, is in unused.js

function setupUserFirstTime(){
	if(typeof userDatabase.tasks === "undefined" || userDatabase.tasks == "undefined") {
		var tasks = [];

		var newTask = new Task("An example task. Edit via the dropdown menu.");
		newTask.id = 0;
		newTask.projectId = 0;
		newTask.notes = "Use this space to keep any notes you may need later.";
		newTask.number = 0;
		newTask.numberInPhase = 0;

		tasks.push(newTask);

		userDatabase.tasks = tasks;
		// console.log("added tasks object, and included sample task");
	}

	if(typeof userDatabase.projects === "undefined" || userDatabase.projects == "undefined") {
		var projects = [];
		var newProject = new Project(0, "Sample project", 0);
		projects.push(newProject);

		userDatabase.projects = projects;
		// console.log("Added new projects object with 'Sample project'");
	}
}

function setupUser(){
	//IMPORTANT: in order to add an object to localStorage, you have to JSON.stringify() it first, then to retrieve it, you have to JSON.parse() it.

	if(typeof userDatabase.version === "undefined" || userDatabase.version != "1.0.0"){
		userDatabase.version = "1.0.0";
		// console.log("updated version number to 1.0.0");
	}

	if(typeof userDatabase.email === "undefined" || userDatabase.email == "undefined") {
		userDatabase.email = "";
		// console.log("added empty email");
	}
	if(typeof userDatabase.firstName === "undefined" || userDatabase.firstName == "undefined") {
		userDatabase.firstName = "";
		// console.log("added empty firstName");
	}
	if(typeof userDatabase.lastName === "undefined" || userDatabase.lastName == "undefined") {
		userDatabase.lastName = "";
		// console.log("added empty lastName");
	}
	if(typeof userDatabase.verified === "undefined" || userDatabase.verified == "undefined") {
		userDatabase.verified = false;
		// console.log("added verified, set to false");
	}

	if(typeof userDatabase.todoPreference === "undefined" || userDatabase.todoPreference == "undefined"){
		userDatabase.todoPreference = "todo";
		// console.log("added todoPreference and set to 'todo'");
	}
	if(typeof userDatabase.trackingPeriod === "undefined" || userDatabase.trackingPeriod === "undefined"){
		userDatabase.trackingPeriod = "today";
		// console.log("added trackingPeriod and set to 'today'");
	}
	if(typeof userDatabase.showCompletedTasks === "undefined" || userDatabase.showCompletedTasks === "undefined"){
		userDatabase.showCompletedTasks = false;
		// console.log("added showCompletedTasks and set to false");
	}

	$.each(userDatabase.projects, function(i, projectToCheck){
		ensureTaskNumbersAreWellOrdered(projectToCheck);

		if(typeof projectToCheck.customTarget === "undefined"){
			projectToCheck.customTarget = 30;
			// console.log("set this project's undefined customTarget to 30");
		}
		if(typeof projectToCheck.targetMinutes === "undefined"){
			projectToCheck.targetMinutes = 60;
			// console.log("added targetMinutes = " + projectToCheck.targetMinutes);
		}
		if(typeof projectToCheck.sessions === "undefined"){
			projectToCheck.sessions = [];
			// console.log("set this project's undefined sessions object to an empty array");
		}
		if(typeof projectToCheck.units === "undefined"){
			projectToCheck.units = [];
			// console.log("set this project's undefined units object to an empty array");
		}
		
		for(var j=0; j<projectToCheck.sessions.length; j++){
			if(typeof projectToCheck.sessions[j].minutes === "undefined" || (typeof projectToCheck.sessions[j].minutes !== "number" && projectToCheck.sessions[j].minutes == "")){
				projectToCheck.sessions[j].minutes = 0;
				// console.log("added session minutes = " + projectToCheck.sessions[j].minutes);
			}
			if(typeof projectToCheck.sessions[j].minutes === "string"){
				projectToCheck.sessions[j].minutes = parseInt(projectToCheck.sessions[j].minutes);
				console.log("type of minutes was string, so changed to number");
			}
			if(!projectToCheck.sessions[j].date){
				projectToCheck.sessions[j].date = new Date();
				// console.log("date was null, so changed to today");
			}
			if(typeof projectToCheck.sessions[j].date !== "undefined"){
				// make sure these are formatted correctly
				var tempDate = projectToCheck.sessions[j].date;
				while(tempDate.indexOf(" ") != -1){
					var indexToCutAt = tempDate.indexOf(" ");
					tempDate = tempDate.slice(0, indexToCutAt) + tempDate.slice(indexToCutAt + 1);
				}
				projectToCheck.sessions[j].date = tempDate;
			}

			if(typeof projectToCheck.sessions[j].deleted === "undefined"){
				projectToCheck.sessions[j].deleted = false;
				// console.log("set 'deleted' to false for a session whose 'deleted' status was undefined");
			}

			// removed deprecated properties
			if(typeof projectToCheck.sessions[j].units !== "undefined"){
				delete projectToCheck.sessions[j].units;
				// console.log("deleted deprecated property 'units'");
			}
			if(typeof projectToCheck.sessions[j].time !== "undefined"){
				delete projectToCheck.sessions[j].time;
				// console.log("deleted deprecated property 'time'");
			}
			if(typeof projectToCheck.sessions[j].type !== "undefined"){
				delete projectToCheck.sessions[j].type;
				// console.log("deleted deprecated property 'type'");
			}
		}

		for(var j=0; j<projectToCheck.units.length; j++){
			if(typeof projectToCheck.units[j].date !== "undefined"){
				// make sure these are formatted correctly
				var tempDate = projectToCheck.units[j].date;
				while(tempDate.indexOf(" ") != -1){
					var indexToCutAt = tempDate.indexOf(" ");
					tempDate = tempDate.slice(0, indexToCutAt) + tempDate.slice(indexToCutAt + 1);
				}
				projectToCheck.units[j].date = tempDate;
			}
		}
		
		if(typeof projectToCheck.trackTime === "undefined"){
			projectToCheck.trackTime = false;
			// console.log("created trackTime for this project and set it to false");
		}
		if(typeof projectToCheck.trackUnits === "undefined"){
			projectToCheck.trackUnits = false;
			// console.log("created trackUnits for this project and set it to false");
		}

		if(typeof projectToCheck.log === "undefined"){
			projectToCheck.log = [];
			// console.log("added empty log array");
		}
		else{
			$.each(projectToCheck.log, function(index, log){
				if(log.date == null){
					// console.log("date is null! Eugh. Changing to current date...");
					log.date = new Date();
				}
				if(typeof log.date !== "undefined"){
					// make sure these are formatted correctly
					var tempDate = log.date;
					while(tempDate.indexOf(" ") != -1){
						var indexToCutAt = tempDate.indexOf(" ");
						tempDate = tempDate.slice(0, indexToCutAt) + tempDate.slice(indexToCutAt + 1);
					}
					log.date = tempDate;
				}
			});
		}

		if(typeof projectToCheck.unitName === "undefined"){
			projectToCheck.unitName = "units";
			// console.log("made the custom unitName 'units'");
		}
		if(typeof projectToCheck.standardPomodoroTime === "undefined"){
			projectToCheck.standardPomodoroTime = projectToCheck.standardTime/60;
			// console.log("added standardPomodoroTime = " + projectToCheck.standardPomodoroTime);
		}
		if(typeof projectToCheck.standardPomodoroBreak === "undefined"){
			projectToCheck.standardPomodoroBreak = projectToCheck.standardBreak/60;
			// console.log("added standardPomodoroBreak = " + projectToCheck.standardPomodoroBreak);
		}

		// remove deprecated properties
		if(typeof projectToCheck.standardTime !== "undefined"){
			delete projectToCheck.standardTime;
			// console.log("deleted deprecated 'standardTime' property");
		}
		if(typeof projectToCheck.standardBreak !== "undefined"){
			delete projectToCheck.standardBreak;
			// console.log("deleted deprecated 'standardBreak' property");
		}
		if(typeof projectToCheck.totalUnits !== "undefined"){
			delete projectToCheck.totalUnits;
			// console.log("deleted deprecated 'totalUnits' property");
		}
		if(typeof projectToCheck.totalTime !== "undefined"){
			delete projectToCheck.totalTime;
			// console.log("deleted deprecated 'totalTime' property");
		}
		if(typeof projectToCheck.totalMinutes !== "undefined"){
			delete projectToCheck.totalMinutes;
			// console.log("deleted deprecated 'totalMinutes' property");
		}
		if(typeof projectToCheck.targetProductivity !== "undefined"){
			delete projectToCheck.targetProductivity;
			// console.log("deleted deprecated 'targetProductivity' property");
		}
	});

	$.each(userDatabase.tasks, function(i, taskToCheck){
		/*if(typeof taskToCheck.deleted === "undefined"){
			taskToCheck.deleted = false;
			// console.log("set this task's undefined 'deleted' property to false");
		}*/

		if(typeof taskToCheck.projectId === "undefined" && typeof taskToCheck.project === "string" && taskToCheck.project.length > 0){
			// console.log("type of associated project is string (i.e. name), so adding a projectId property with the appropriate id...");
			taskToCheck.projectId = findOneLocal("project", "name", taskToCheck.project).id;
			// console.log("added projectId, which is " + taskToCheck.projectId);
		}

		var associatedProject = findOne("project", "id", taskToCheck.projectId);
		
		/*if((associatedProject==false || associatedProject.deleted) && !taskToCheck.deleted){
			// console.log("deleting task as associated project is deleted...");
			taskToCheck.deleted = true;
		}*/

		/*if(taskToCheck.deleted && taskToCheck.number != -1){
			taskToCheck.number = -1;
			// console.log("this task is deleted, so set its number to -1");
		}*/
		if(typeof taskToCheck.numberInPriorities === "undefined"){
			taskToCheck.numberInPriorities = -1;
			// console.log("added numberInPriorities to task");
		}

		if(typeof taskToCheck.dueDate !== "undefined"){
			// make sure these are formatted correctly
			var tempDueDate = taskToCheck.dueDate;
			while(tempDueDate.indexOf(" ") != -1){
				var indexToCutAt = tempDueDate.indexOf(" ");
				tempDueDate = tempDueDate.slice(0, indexToCutAt) + tempDueDate.slice(indexToCutAt + 1);
			}
			taskToCheck.dueDate = tempDueDate;
		}
		
		if(typeof taskToCheck.reminderTime !== "undefined"){
			// make sure these are formatted correctly
			var tempReminderTime = taskToCheck.reminderTime;
			while(tempReminderTime.indexOf(" ") != -1){
				var indexToCutAt = tempReminderTime.indexOf(" ");
				tempReminderTime = tempReminderTime.slice(0, indexToCutAt) + tempReminderTime.slice(indexToCutAt + 1);
			}
			taskToCheck.reminderTime = tempReminderTime;
		}
		
		// removed deprecated properties
		if(typeof taskToCheck.project !== "undefined"){
			delete taskToCheck.project;
			// console.log("deleted deprecated 'project' property");
		}
		if(typeof taskToCheck.totalTime !== "undefined"){
			delete taskToCheck.totalTime;
			// console.log("deleted deprecated 'totalTime' property");
		}
		if(typeof taskToCheck.totalUnits !== "undefined"){
			delete taskToCheck.totalUnits;
			// console.log("deleted deprecated 'totalUnits' property");
		}
		if(typeof taskToCheck.targetProductivity !== "undefined"){
			delete taskToCheck.targetProductivity;
			// console.log("deleted deprecated 'targetProductivity' property");
		}
		if(typeof taskToCheck.customTarget !== "undefined"){
			delete taskToCheck.customTarget;
			// console.log("deleted deprecated 'customTarget' property");
		}
		if(typeof taskToCheck.sessions !== "undefined"){
			delete taskToCheck.sessions;
			// console.log("deleted deprecated 'sessions' property");
		}
	});

	// properly delete projects that are marked as deleted
	/*$.each(userDatabase.projects, function(i, taskToCheck){
		if(taskToCheck.deleted){
			userDatabase.projects.splice(i, 1);
			// console.log("properly deleted this project (which was earmarked for deletion)");
		}
	});*/

	// properly delete tasks that are marked as deleted
	/*$.each(userDatabase.tasks, function(i, taskToCheck){
		if(taskToCheck.deleted){
			userDatabase.tasks.splice(i, 1);
			// console.log("properly deleted this task (which was earmarked for deletion)");
		}
	});*/
}

// clears localStorage
function clearUser(){
	localStorage.clear();
	window.location.href = "index.html";
}