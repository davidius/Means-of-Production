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

	$.each(userDatabase.projects, function(i, elem){
		sortNumbersOfTasksInProject(elem);

		if(typeof elem.customTarget === "undefined"){
			elem.customTarget = 30;
			// console.log("set this project's undefined customTarget to 30");
		}
		if(typeof elem.targetMinutes === "undefined"){
			elem.targetMinutes = 60;
			// console.log("added targetMinutes = " + elem.targetMinutes);
		}
		if(typeof elem.sessions === "undefined"){
			elem.sessions = [];
			// console.log("set this project's undefined sessions object to an empty array");
		}
		if(typeof elem.units === "undefined"){
			elem.units = [];
			// console.log("set this project's undefined units object to an empty array");
		}
		
		for(var j=0; j<elem.sessions.length; j++){
			if(typeof elem.sessions[j].minutes === "undefined" || (typeof elem.sessions[j].minutes !== "number" && elem.sessions[j].minutes == "")){
				elem.sessions[j].minutes = 0;
				// console.log("added session minutes = " + elem.sessions[j].minutes);
			}
			if(typeof elem.sessions[j].minutes === "string"){
				elem.sessions[j].minutes = parseInt(elem.sessions[j].minutes);
				console.log("type of minutes was string, so changed to number");
			}
			if(!elem.sessions[j].date){
				elem.sessions[j].date = new Date();
				// console.log("date was null, so changed to today");
			}
			if(typeof elem.sessions[j].date !== "undefined"){
				// make sure these are formatted correctly
				var tempDate = elem.sessions[j].date;
				while(tempDate.indexOf(" ") != -1){
					var indexToCutAt = tempDate.indexOf(" ");
					tempDate = tempDate.slice(0, indexToCutAt) + tempDate.slice(indexToCutAt + 1);
				}
				elem.sessions[j].date = tempDate;
			}

			if(typeof elem.sessions[j].deleted === "undefined"){
				elem.sessions[j].deleted = false;
				// console.log("set 'deleted' to false for a session whose 'deleted' status was undefined");
			}

			// removed deprecated properties
			if(typeof elem.sessions[j].units !== "undefined"){
				delete elem.sessions[j].units;
				// console.log("deleted deprecated property 'units'");
			}
			if(typeof elem.sessions[j].time !== "undefined"){
				delete elem.sessions[j].time;
				// console.log("deleted deprecated property 'time'");
			}
			if(typeof elem.sessions[j].type !== "undefined"){
				delete elem.sessions[j].type;
				// console.log("deleted deprecated property 'type'");
			}
		}

		for(var j=0; j<elem.units.length; j++){
			if(typeof elem.units[j].date !== "undefined"){
				// make sure these are formatted correctly
				var tempDate = elem.units[j].date;
				while(tempDate.indexOf(" ") != -1){
					var indexToCutAt = tempDate.indexOf(" ");
					tempDate = tempDate.slice(0, indexToCutAt) + tempDate.slice(indexToCutAt + 1);
				}
				elem.units[j].date = tempDate;
			}
		}
		
		if(typeof elem.trackTime === "undefined"){
			elem.trackTime = false;
			// console.log("created trackTime for this project and set it to false");
		}
		if(typeof elem.trackUnits === "undefined"){
			elem.trackUnits = false;
			// console.log("created trackUnits for this project and set it to false");
		}

		if(typeof elem.log === "undefined"){
			elem.log = [];
			// console.log("added empty log array");
		}
		else{
			$.each(elem.log, function(index, log){
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

		if(typeof elem.unitName === "undefined"){
			elem.unitName = "units";
			// console.log("made the custom unitName 'units'");
		}
		if(typeof elem.standardPomodoroTime === "undefined"){
			elem.standardPomodoroTime = elem.standardTime/60;
			// console.log("added standardPomodoroTime = " + elem.standardPomodoroTime);
		}
		if(typeof elem.standardPomodoroBreak === "undefined"){
			elem.standardPomodoroBreak = elem.standardBreak/60;
			// console.log("added standardPomodoroBreak = " + elem.standardPomodoroBreak);
		}

		// remove deprecated properties
		if(typeof elem.standardTime !== "undefined"){
			delete elem.standardTime;
			// console.log("deleted deprecated 'standardTime' property");
		}
		if(typeof elem.standardBreak !== "undefined"){
			delete elem.standardBreak;
			// console.log("deleted deprecated 'standardBreak' property");
		}
		if(typeof elem.totalUnits !== "undefined"){
			delete elem.totalUnits;
			// console.log("deleted deprecated 'totalUnits' property");
		}
		if(typeof elem.totalTime !== "undefined"){
			delete elem.totalTime;
			// console.log("deleted deprecated 'totalTime' property");
		}
		if(typeof elem.totalMinutes !== "undefined"){
			delete elem.totalMinutes;
			// console.log("deleted deprecated 'totalMinutes' property");
		}
		if(typeof elem.targetProductivity !== "undefined"){
			delete elem.targetProductivity;
			// console.log("deleted deprecated 'targetProductivity' property");
		}
	});

	$.each(userDatabase.tasks, function(i, elem){
		/*if(typeof elem.deleted === "undefined"){
			elem.deleted = false;
			// console.log("set this task's undefined 'deleted' property to false");
		}*/

		if(typeof elem.projectId === "undefined" && typeof elem.project === "string" && elem.project.length > 0){
			// console.log("type of associated project is string (i.e. name), so adding a projectId property with the appropriate id...");
			elem.projectId = findOneLocal("project", "name", elem.project).id;
			// console.log("added projectId, which is " + elem.projectId);
		}

		var associatedProject = findOne("project", "id", elem.projectId);
		
		/*if((associatedProject==false || associatedProject.deleted) && !elem.deleted){
			// console.log("deleting task as associated project is deleted...");
			elem.deleted = true;
		}*/

		/*if(elem.deleted && elem.number != -1){
			elem.number = -1;
			// console.log("this task is deleted, so set its number to -1");
		}*/
		if(typeof elem.numberInPriorities === "undefined"){
			elem.numberInPriorities = -1;
			// console.log("added numberInPriorities to task");
		}

		if(typeof elem.dueDate !== "undefined"){
			// make sure these are formatted correctly
			var tempDueDate = elem.dueDate;
			while(tempDueDate.indexOf(" ") != -1){
				var indexToCutAt = tempDueDate.indexOf(" ");
				tempDueDate = tempDueDate.slice(0, indexToCutAt) + tempDueDate.slice(indexToCutAt + 1);
			}
			elem.dueDate = tempDueDate;
		}
		
		if(typeof elem.reminderTime !== "undefined"){
			// make sure these are formatted correctly
			var tempReminderTime = elem.reminderTime;
			while(tempReminderTime.indexOf(" ") != -1){
				var indexToCutAt = tempReminderTime.indexOf(" ");
				tempReminderTime = tempReminderTime.slice(0, indexToCutAt) + tempReminderTime.slice(indexToCutAt + 1);
			}
			elem.reminderTime = tempReminderTime;
		}
		
		// removed deprecated properties
		if(typeof elem.project !== "undefined"){
			delete elem.project;
			// console.log("deleted deprecated 'project' property");
		}
		if(typeof elem.totalTime !== "undefined"){
			delete elem.totalTime;
			// console.log("deleted deprecated 'totalTime' property");
		}
		if(typeof elem.totalUnits !== "undefined"){
			delete elem.totalUnits;
			// console.log("deleted deprecated 'totalUnits' property");
		}
		if(typeof elem.targetProductivity !== "undefined"){
			delete elem.targetProductivity;
			// console.log("deleted deprecated 'targetProductivity' property");
		}
		if(typeof elem.customTarget !== "undefined"){
			delete elem.customTarget;
			// console.log("deleted deprecated 'customTarget' property");
		}
		if(typeof elem.sessions !== "undefined"){
			delete elem.sessions;
			// console.log("deleted deprecated 'sessions' property");
		}
	});

	// properly delete projects that are marked as deleted
	/*$.each(userDatabase.projects, function(i, elem){
		if(elem.deleted){
			userDatabase.projects.splice(i, 1);
			// console.log("properly deleted this project (which was earmarked for deletion)");
		}
	});*/

	// properly delete tasks that are marked as deleted
	/*$.each(userDatabase.tasks, function(i, elem){
		if(elem.deleted){
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