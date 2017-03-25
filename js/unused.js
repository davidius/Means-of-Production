//returns the task that has the given id
/*function findTaskById(taskId){
	var tasks = JSON.parse(localStorage["tasks"]);
	var tasksLength = lengthOfObject(tasks);
	
	for(var i=0; i<tasksLength; i++){
		if(tasks[i].id == taskId){
			return tasks[i];
		} 
	}
}*/

//returns an array of tasks in the given project
/*function tasksInProject(project){
	var tasks = JSON.parse(localStorage["tasks"]);
	var tasksLength = lengthOfObject(tasks);
	var returnTasks = [];

	for(var i=0; i<tasksLength; i++){
		if(tasks[i].project == project.name) returnTasks.push(tasks[i]);
	}

	return returnTasks;
}*/

//returns the task that has the given name
/*function findTaskByName(taskName){
	var tasks = JSON.parse(localStorage["tasks"]);
	var tasksLength = lengthOfObject(tasks);
	
	for(var i=0; i<tasksLength; i++){
		if(tasks[i].name == taskName){
			return tasks[i];
		} 
	}
}*/

//returns the project with the given name
/*function findProjectByName(projectName){
	var projects = JSON.parse(localStorage["projects"]);
	var projectsLength = lengthOfObject(projects);
	
	for(var i=0; i<projectsLength; i++){
		if(projects[i].name == projectName){
			return projects[i];
		} 
	}
}*/

//returns the project with the given id
/*function findProjectById(projectId){
	var projects = JSON.parse(localStorage["projects"]);
	var projectsLength = lengthOfObject(projects);
	
	for(var i=0; i<projectsLength; i++){
		if(projects[i].id == projectId){
			return projects[i];
		} 
	}
}*/

//returns the project with the given number
/*function findProjectByNumber(number){
	var projects = JSON.parse(localStorage["projects"]);
	var projectsLength = lengthOfObject(projects);
	
	for(var i=0; i<projectsLength; i++){
		if(projects[i].number == number){
			return projects[i];
		} 
	}
}*/

//returns an array of tasks that belong to the given project phase
//findInArray("tasks", "phase", argX, findMany("tasks", "project", [project]))
//so syntax is findInArray(what, by, array)
function findTasksByPhase(taskPhase, project){
	var tasks = findMany("tasks", "project", project);
	var tasksLength = lengthOfObject(tasks);
	var matchedTasks = [];

	for(var i=0; i<tasksLength; i++){
		if(tasks[i].phase == taskPhase){
			matchedTasks.push(tasks[i]);
		} 
	}

	return matchedTasks;
}

//returns the task with the given number, belonging to the given project
//findInArray("task", "number", argX, findMany("tasks", "project", [project]))
function findTaskByNumber(project, number){
	var tasks = findMany("tasks", "project", project);
	var tasksLength = lengthOfObject(tasks);
	
	for(var i=0; i<tasksLength; i++){
		if(tasks[i].number == number){
			return tasks[i];
		} 
	}
}

//returns the task with the given number, belonging to the given project and phase
//findInArray("task", "numberInPhase", argX, findInArray("tasks", "phase", argX, findMany("tasks", "project", [project])))
function findTaskByNumberInPhase(project, phase, numberInPhase){
	var tasks = findMany("tasks", "project", project);
	var returnTasks = [];

	$.each(tasks, function(index, elem){
		if(elem.phase == phase && elem.numberInPhase == numberInPhase){
			returnTasks[index] = elem;
		}
		else{
			returnTasks[index] = "empty";
		}
	});

	for(var i=returnTasks.length; i>=0; i--){
		if(returnTasks[i] == "empty"){
			returnTasks.splice(i, 1);
		}
	}
	
	return returnTasks[0];
}

var series = workDoneInRange(getCurrentProject(), startDate, endDate);
$.jqplot.config.dashLength = 5;
$.jqplot.config.gapLength = 2;
var options = {
	seriesDefaults: {
		linePattern: "dashed",
		lineWidth: 3,
		rendererOptions: {
			smooth: true
		}
	},
	series: [{showMarker:false}], //only remove this when you can keep the markers only on productive days...
	axes: {
		xaxis: {
			renderer: $.jqplot.DateAxisRenderer,
			labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
	        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
	        tickOptions: {
	            // labelPosition: 'middle',
	            angle: 15
	        },
			label: "Date"
		},
		yaxis: {
			label: "Productivity (time)",
			labelRenderer: $.jqplot.CanvasAxisLabelRenderer
		}
	},
	highlighter: {
		show: true,
		sizeAdjust: 7.5
	}
	
};
var plot1 = $.jqplot ('chartdiv', [series], options);
plot1.replot();

// this function was called only on the first load. Now the refresh() function accounts for the first load
function firstLoad(){
	$(window).on('hashchange', hashChange);

	sync();
	
	$("#main").addClass("pinkish");

	if(localStorage["loggedIn"] == "true"){
		$("#main").removeClass("pinkish");
		//load app.html into div #body-index
   		$("#body-index").load("subpages/app.html", function(){
   			var $mainContent = $("#view-main");
   			var newHash = window.location.hash.substring(1);
   			if(newHash == ''){
   				newHash = 'main';
   			}
	        $mainContent.hide().load("subpages/" + newHash + ".html", function() {
	        	populateProjectList();
	        	if(newHash == "main"){
	        		setupOverviewPage();
	        	}
	        	else if(newHash == "view-project"){
	        		setupProjectPage();
	        	}
	        	else if(newHash == "view-productivity"){
	        		setupProductivityView();
	        	}
	        	else if(newHash == "view-log"){
	        		setupOverallLogView();
	        	}
	        	else if(newHash == "view-settings"){
	        		setupSettingsView();
	        	}
	        	
	        	setupButtonsEtc(newHash);

    			moment.updateLocale('en', {
    			    week: {
    			    	dow: 1
    			    }
    			});

	            $mainContent.fadeIn(200);
				var timeout = window.setTimeout(setupCharts, 500);
    		});
   		});
   	}
   	else{
   		console.log("NOT logged in...");
   		$("#body-index").load("subpages/view-landing.html", function(){
   			var $mainContent = $("#body-index");
   		});
   	}

	$( ".sortable" ).sortable();
    $( ".sortable" ).disableSelection();
}

function setupUser(){
	//IMPORTANT: in order to add an object to localStorage, you have to JSON.stringify() it first, then to retrieve it, you have to JSON.parse() it.

	console.log("setupUser()...");

	if(typeof localStorage["lastSaved"] === "undefined"){
		localStorage["lastSaved"] = JSON.stringify(new Date(1985, 10, 22));
		console.log("set undefined lastSaved to " + localStorage["lastSaved"]);
	}
	if(typeof localStorage["version"] === "undefined" || localStorage["version"] != "1.0.0"){
		localStorage["version"] = "1.0.0";
		console.log("updated version number to 1.0.0");
	}

	if(typeof localStorage["loggedIn"] === "undefined" || localStorage["loggedIn"] == "undefined") {
		localStorage["loggedIn"] = false;
		console.log("added loggedIn, set to false");
	}
	if(typeof localStorage["username"] === "undefined" || localStorage["username"] == "undefined") {
		localStorage["username"] = "";
		console.log("added empty username");
	}
	/*if(typeof localStorage["password"] !== "undefined" || localStorage["password"] != "undefined"){
		localStorage.removeItem("password");
	}*/
	if(typeof localStorage["email"] === "undefined" || localStorage["email"] == "undefined") {
		localStorage["email"] = "";
		console.log("added empty email");
	}
	if(typeof localStorage["firstName"] === "undefined" || localStorage["firstName"] == "undefined") {
		localStorage["firstName"] = "";
		console.log("added empty firstName");
	}
	if(typeof localStorage["lastName"] === "undefined" || localStorage["lastName"] == "undefined") {
		localStorage["lastName"] = "";
		console.log("added empty lastName");
	}
	if(typeof localStorage["verified"] === "undefined" || localStorage["verified"] == "undefined") {
		localStorage["verified"] = false;
		console.log("added verified, set to false");
	}

	if(typeof localStorage["tasks"] === "undefined" || localStorage["tasks"] == "undefined") {
		var tasks = {};
		tasks["0"] = new Task("An example task. Edit via the dropdown menu.");
		tasks["0"].id = 0;
		tasks["0"].projectId = 0;
		tasks["0"].notes = "Use this space to keep any notes you may need later.";

		localStorage["tasks"] = JSON.stringify(tasks);
		console.log("added tasks object, and included sample task");
	}

	if(typeof localStorage["projects"] === "undefined" || localStorage["projects"] == "undefined") {
		var projects = {};
		projects["0"] = new Project(0, "Sample project", 0);

		localStorage["projects"] = JSON.stringify(projects);
		console.log("Added new projects object with 'Sample project'");
	}

	if(typeof localStorage["currentTask"] === "undefined" || localStorage["currentTask"] == "undefined") {
		localStorage["currentTask"] = "";
		console.log("added empty currentTask object");
	}
	if(typeof localStorage["currentProject"] === "undefined" || localStorage["currentProject"] == "undefined") {
		localStorage["currentProject"] = "";
		console.log("added empty currentProject object");
	}
	if(typeof localStorage["todoPreference"] === "undefined" || localStorage["todoPreference"] == "undefined"){
		localStorage["todoPreference"] = "todo";
		console.log("added todoPreference and set to 'todo'");
	}
	if(typeof localStorage["trackingPeriod"] === "undefined" || localStorage["trackingPeriod"] === "undefined"){
		localStorage["trackingPeriod"] = "today";
		console.log("added trackingPeriod and set to 'today'");
	}
	if(typeof localStorage["showCompletedTasks"] === "undefined" || localStorage["showCompletedTasks"] === "undefined"){
		localStorage["showCompletedTasks"] = false;
		console.log("added showCompletedTasks and set to false");
	}

	var projects = JSON.parse(localStorage["projects"]);
	var tasks = JSON.parse(localStorage["tasks"]);

	$.each(projects, function(i, elem){
		console.log("project = " + elem.name);
		if(typeof elem.deleted === "undefined"){
			elem.deleted = false;
			console.log("set this project's undefined 'deleted' property to false");
		}
		if(typeof elem.customTarget === "undefined"){
			elem.customTarget = 30;
			console.log("set this project's undefined customTarget to 30");
		}
		if(typeof elem.targetMinutes === "undefined"){
			elem.targetMinutes = 60;
			console.log("added targetMinutes = " + elem.targetMinutes);
		}
		if(typeof elem.sessions === "undefined"){
			elem.sessions = [];
			console.log("set this project's undefined sessions object to an empty array");
		}
		/*if(typeof elem.unitRecords === "undefined"){
			elem.unitRecords = {};
			console.log("set this project's undefined unitRecords object to an empty array");
		}*/
		/*if(typeof elem.units === "undefined"){
			var units = [];
			$.each(elem.unitRecords, function(unitRecordIndex, unitRecord){
				units.push({date: unitRecordIndex, units: unitRecord});
			});
			elem.units = units;
			console.log("just populated the new units array with data from unitRecords");
		}*/
		if(typeof elem.units === "undefined"){
			elem.units = [];
			console.log("set this project's undefined units object to an empty array");
		}
		
		for(var j=0; j<elem.sessions.length; j++){
			if(typeof elem.sessions[j].minutes === "undefined" || (typeof elem.sessions[j].minutes !== "number" && elem.sessions[j].minutes == "")){
				// elem.sessions[j].minutes = elem.sessions[j].time/60;
				elem.sessions[j].minutes = 0;
				console.log("added session minutes = " + elem.sessions[j].minutes);
			}
			if(!elem.sessions[j].date){
				elem.sessions[j].date = new Date();
				console.log("date was null, so changed to today");
			}
			var sessionDate = new Date(elem.sessions[j].date);

			if(typeof elem.sessions[j].deleted === "undefined"){
				elem.sessions[j].deleted = false;
				console.log("set 'deleted' to false for a session whose 'deleted' status was undefined");
			}

			// removed deprecated properties
			if(typeof elem.sessions[j].units !== "undefined"){
				delete elem.sessions[j].units;
				console.log("deleted deprecated property 'units'");
			}
			if(typeof elem.sessions[j].time !== "undefined"){
				delete elem.sessions[j].time;
				console.log("deleted deprecated property 'time'");
			}
			if(typeof elem.sessions[j].type !== "undefined"){
				delete elem.sessions[j].type;
				console.log("deleted deprecated property 'type'");
			}
		}
		
		if(elem.deleted && elem.number != -1){
			elem.number = -1;
			console.log("this project is deleted, so set its number to -1");
		}
		if(typeof elem.trackTime === "undefined"){
			elem.trackTime = false;
			console.log("created trackTime for this project and set it to false");
		}
		if(typeof elem.trackUnits === "undefined"){
			elem.trackUnits = false;
			console.log("created trackUnits for this project and set it to false");
		}

		if(typeof elem.log === "undefined"){
			console.log("added log (based on project notes), and deleted project notes. Also created a new actual notes object for storing project notes.");
		}
		else{
			$.each(elem.log, function(index, log){
				if(log.date == null){
					console.log("date is null! Eugh. Changing to current date...");
					log.date = new Date();
				}
			});
		}

		if(typeof elem.unitName === "undefined"){
			elem.unitName = "units";
			console.log("made the custom unitName 'units'");
		}
		if(typeof elem.standardPomodoroTime === "undefined"){
			elem.standardPomodoroTime = elem.standardTime/60;
			console.log("added standardPomodoroTime = " + elem.standardPomodoroTime);
		}
		if(typeof elem.standardPomodoroBreak === "undefined"){
			elem.standardPomodoroBreak = elem.standardBreak/60;
			console.log("added standardPomodoroBreak = " + elem.standardPomodoroBreak);
		}

		// remove deprecated properties
		if(typeof elem.standardTime !== "undefined"){
			delete elem.standardTime;
			console.log("deleted deprecated 'standardTime' property");
		}
		if(typeof elem.standardBreak !== "undefined"){
			delete elem.standardBreak;
			console.log("deleted deprecated 'standardBreak' property");
		}
		if(typeof elem.totalUnits !== "undefined"){
			delete elem.totalUnits;
			console.log("deleted deprecated 'totalUnits' property");
		}
		if(typeof elem.totalTime !== "undefined"){
			delete elem.totalTime;
			console.log("deleted deprecated 'totalTime' property");
		}
		if(typeof elem.totalMinutes !== "undefined"){
			delete elem.totalMinutes;
			console.log("deleted deprecated 'totalMinutes' property");
		}
		if(typeof elem.targetProductivity !== "undefined"){
			delete elem.targetProductivity;
			console.log("deleted deprecated 'targetProductivity' property");
		}
	});

	$.each(tasks, function(i, elem){
		if(typeof elem.deleted === "undefined"){
			elem.deleted = false;
			console.log("set this task's undefined 'deleted' property to false");
		}

		if(typeof elem.projectId === "undefined" && typeof elem.project === "string" && elem.project.length > 0){
			console.log("type of associated project is string (i.e. name), so adding a projectId property with the appropriate id...");
			elem.projectId = findOneLocal("project", "name", elem.project).id;
			console.log("added projectId, which is " + elem.projectId);
		}

		var associatedProject = findOneLocal("project", "id", elem.projectId);
		
		if((associatedProject==false || associatedProject.deleted) && !elem.deleted){
			console.log("deleting task as associated project is deleted...");
			elem.deleted = true;
		}

		if(elem.deleted && elem.number != -1){
			elem.number = -1;
			console.log("this task is deleted, so set its number to -1");
		}
		if(typeof elem.numberInPriorities === "undefined"){
			elem.numberInPriorities = -1;
			console.log("added numberInPriorities to task");
		}

		// removed deprecated properties
		if(typeof elem.project !== "undefined"){
			delete elem.project;
			console.log("deleted deprecated 'project' property");
		}
		if(typeof elem.totalTime !== "undefined"){
			delete elem.totalTime;
			console.log("deleted deprecated 'totalTime' property");
		}
		if(typeof elem.totalUnits !== "undefined"){
			delete elem.totalUnits;
			console.log("deleted deprecated 'totalUnits' property");
		}
		if(typeof elem.targetProductivity !== "undefined"){
			delete elem.targetProductivity;
			console.log("deleted deprecated 'targetProductivity' property");
		}
		if(typeof elem.customTarget !== "undefined"){
			delete elem.customTarget;
			console.log("deleted deprecated 'customTarget' property");
		}
		if(typeof elem.sessions !== "undefined"){
			delete elem.sessions;
			console.log("deleted deprecated 'sessions' property");
		}
	});

	// properly delete projects that are marked as deleted
	$.each(projects, function(i, elem){
		if(elem.deleted){
			delete projects[i];
			console.log("properly deleted this project (which was earmarked for deletion)");
		}
	});

	// properly delete tasks that are marked as deleted
	$.each(tasks, function(i, elem){
		if(elem.deleted){
			delete tasks[i];
			console.log("properly deleted this task (which was earmarked for deletion)");
		}
	});
	
	localStorage["projects"] = JSON.stringify(projects);
	localStorage["tasks"] = JSON.stringify(tasks);
	// console.log("user data is definitely complete!")

	userDatabase = makeCopyOfLocalStorage();
}

// sync local and remote
function OLDsync(functionToDoWhenComplete){
	if(localStorage["loggedIn"] == "true"){ // @REMOVE
		syncStatus.syncSuccessful = false;
		// console.log("syncing...");
		// checkPreAuth();

		// first things first, check if the local or server version was updated more recently...
		$.ajax ({
			url: theURL + '/download',
			type: "POST",
			crossDomain: true,
			xhrFields: {
				withCredentials: false
			},
			data: JSON.stringify({"username": userDatabase.username}),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success: function(res){
		        if(res) {
		        	syncStatus.syncSuccessful = true;
		        	var amendedResLastSaved = "";
		        	
		        	if(localStorage["lastSaved"].indexOf('"') != -1){
		        		var newString = localStorage["lastSaved"].slice(1, -1);
		        		localStorage["lastSaved"] = newString;
		        	}
		        	if(res.lastSaved.indexOf('"') != -1){
		        		var newString = res.lastSaved.slice(1, -1);
		        		amendedResLastSaved = newString;
		        	}

		        	console.log("res.lastSaved = " + amendedResLastSaved + ", of type " + typeof amendedResLastSaved + ", localStorage['lastSaved'] = " + localStorage["lastSaved"] + ", of type " + typeof localStorage["lastSaved"]);
		        	// get data from server

		        	var serverDate = new Date(amendedResLastSaved);
		        	var localDate = new Date(localStorage["lastSaved"]);
		        	console.log("serverDate = " + serverDate);
		        	console.log("localDate = " + localDate);
					
					if(res.lastSaved){
						// was the server updated more recently than the local version?
						if(new Date(amendedResLastSaved) > new Date(localStorage["lastSaved"])){ // @REMOVE
							//download data
							console.log("server was updated more recently, so will download...");
							copyDownloadedDataToLocal({
								username: res.username,
								email: res.email,
								firstName: res.firstName,
								lastName: res.lastName,
								projects: res.projects,
								tasks: res.tasks,
								todoPreference: res.todoPreference,
								lastSaved: JSON.stringify(new Date()),
								connectedWithFirebase: res.connectedWithFirebase
							}, functionToDoWhenComplete);
						}
						// or was the local version saved more recently?
						else if(new Date(amendedResLastSaved) < new Date(localStorage["lastSaved"])){ // @REMOVE
							//upload data
							// console.log("local was updated more recently, so will upload...");
							uploadChanges(functionToDoWhenComplete);
						}
						else{
							console.log("last saved at the same time -- no need to do anything!");
							setupUser(); // this takes care of updating the userDatabase object

							syncStatus.lastSynced = new Date();
							if(typeof functionToDoWhenComplete !== "undefined"){
								functionToDoWhenComplete();
							}
							else{
								$("#btn-sync").html("<span class='glyphicon glyphicon-ok' aria-hidden='true'></span>");
								var timeout = window.setTimeout(function(){
									updateSyncStatus();
								}, 2000);
							}
						}
					}
					else{
						console.log("no lastSaved on server...");
						setupUser(); // this takes care of updating the userDatabase object
						functionToDoWhenComplete();
					}
					// refresh();
				} 
				// no response from server
				else {
					$("#btn-sync").html("Means of Production     <span class='glyphicon glyphicon-remove' aria-hidden='true'></span>");
				}
				$("#submitSigninButton").removeAttr("disabled");
			}
		});
		
		var offlineTimeout = window.setTimeout(function(){
			// console.log("syncStatus.syncSuccessful = " + syncStatus.syncSuccessful);
			updateSyncStatus();
			/*if(!syncStatus.syncSuccessful){
				$("#btn-sync").html("<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>");
			}*/
		}, 4000);
	}
}

function syncThenRefresh(){
	sync(function(){
		refresh();
	});
}

function copyDownloadedDataToLocal(changesToDownload, functionToDoWhenComplete){
	// console.log("copyDownloadedDataToLocal()...");

	// @REMOVE
	localStorage["username"] = changesToDownload.username;
	localStorage["email"] = changesToDownload.email;
	localStorage["firstName"] = changesToDownload.firstName;
	localStorage["lastName"] = changesToDownload.lastName;
	localStorage["projects"] = changesToDownload.projects;
	localStorage["tasks"] = changesToDownload.tasks;
	localStorage["todoPreference"] = changesToDownload.todoPreference;
	localStorage["loggedIn"] = true;
	localStorage["lastSaved"] = changesToDownload.lastSaved;
	localStorage["connectedWithFirebase"] = changesToDownload.connectedWithFirebase;
	setupUser(); // this takes care of updating the userDatabase object

	$("#btn-sync").html("<span class='glyphicon glyphicon-cloud-download' aria-hidden='true'></span>");
	var timeout = window.setTimeout(function(){
		$("#btn-sync").html("<span class='glyphicon glyphicon-ok' aria-hidden='true'></span>");
		var timeout2 = window.setTimeout(function(){
			syncStatus.lastSynced = new Date();
			if(typeof functionToDoWhenComplete !== "undefined"){
				functionToDoWhenComplete();
			}
			else{
				updateSyncStatus();
			}
		}, 750);
	}, 750);
}

function OLDuploadChanges(functionToDoWhenComplete){
	makeLocalStorageMatchCopy();
	localStorage["lastSaved"] = JSON.stringify(new Date());
	// console.log("just set lastSaved to " + localStorage["lastSaved"] + ", which is of type " + typeof localStorage["lastSaved"]);
	
	// console.log("Uploading changes...");

	$.ajax ({
	    url: theURL + '/upload',
	    type: "POST",
	    data: JSON.stringify({
	    	"username": userDatabase.username,
	    	"projects": JSON.stringify(userDatabase.projects),
	    	"tasks": JSON.stringify(userDatabase.tasks),
	    	"currentProject": JSON.stringify(userDatabase.currentProject),
	    	"currentTask": JSON.stringify(userDatabase.currentTask),
	    	"todoPreference": userDatabase.todoPreference,
	    	"lastSaved": localStorage["lastSaved"],
	    	"trackingPeriod": userDatabase.trackingPeriod,
	    	"connectedWithFirebase": userDatabase.connectedWithFirebase
		}),
	    dataType: "json",
	    contentType: "application/json; charset=utf-8",
	    success: function(res){
	    	// console.log("Changes uploaded!");
	    	uploadReminders(userDatabase.email, userDatabase.username);
	    	$("#btn-sync").html("<span class='glyphicon glyphicon-cloud-upload' aria-hidden='true'></span>");
	    	var timeout = window.setTimeout(function(){
	    		$("#btn-sync").html("<span class='glyphicon glyphicon-ok' aria-hidden='true'></span>");
	    		var timeout2 = window.setTimeout(function(){
	    			syncStatus.lastSynced = new Date();
			    	if(typeof functionToDoWhenComplete !== "undefined"){
						// console.log("at least one argument, so executing callback function...");
						functionToDoWhenComplete();
					}
					else{
						updateSyncStatus();
					}
	    		}, 750);
	    	}, 750);
	    	makeLocalStorageMatchCopy();
	    }
	});

	if(currentUid){
		// console.log("there is a currentUid, so connected with firebase, so uploading...");
		uploadUserDatabaseToFirebase(signedInUser);
	}
	else{
		// console.log("not connected to firebase, so NOT uploading");
	}
}

// use the syncStatus object to ascertain whether a sync was successful. If not, show a cross
function updateSyncStatus(){
	if(syncStatus.lastSynced != ""){
		var dateToShow = moment(syncStatus.lastSynced).format("ddd, HH:mm");
		$("#btn-sync").css("color", "blue");
		$("#btn-sync").html('Synced ' + dateToShow);
		$("#btn-sync").prop("title", "Last synced at exactly " + syncStatus.lastSynced);
	}
	else if(!syncStatus.syncSuccessful){
		// $("#btn-sync").html("<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>");
		$("#btn-sync").css("color", "red");
		$("#btn-sync").html('Couldn\'t sync 🤔');
		$("#btn-sync").removeProp("title");
	}
}

//might make sense to give this another name, as it's mostly used to get information from the server, not to actually sign in
function OLDhandleSignin(auto, user, pass) {
	var form = $("#signinForm");
	//disable the button so we can't resubmit while we wait
	$("#submitSigninButton",form).attr("disabled", "disabled");
	var u = user;
	var p = pass;

	if(u != '' && p!= '') {
		$.ajax ({
			url: theURL + '/signin',
			type: "POST",
			crossDomain: true,
			xhrFields: {
				withCredentials: false
			},
			data: JSON.stringify({"username": u, "password": p}),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success: function(res){
		        if(res) {
					//store
					// @TODO: is this an exact replica of copyDownloadedDataToLocal()???
					// if so, obviously replace the below with a call to that function
					
					localStorage["username"] = res.username;
					localStorage["email"] = res.email;
					localStorage["firstName"] = res.firstName;
					localStorage["lastName"] = res.lastName;
					localStorage["projects"] = res.projects;
					localStorage["tasks"] = res.tasks;
					localStorage["todoPreference"] = res.todoPreference;
					localStorage["trackingPeriod"] = res.trackingPeriod;
					localStorage["lastSaved"] = JSON.stringify(new Date());
					localStorage["loggedIn"] = true;

					setupUser(); // this takes care of updating the userDatabase object

					//make sure that any relevant changes are updated on the server!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					if(!auto) {
		        		signInWithFirebase(localStorage['email'], p);
		        	}
		        	// console.log("successfully synced!");
				} else {
					alert("Your signup failed, for some reason...", function() {});
				}
				$("#submitSigninButton").removeAttr("disabled");
			}
		});
	} else if (auto) {
		//navigator.notification.alert("You must enter a username and password", function() {});
		alert("You must enter a username and password", function() {});
		$("#submitSigninButton").removeAttr("disabled");
	}
	return false;
}

function OLDhandleSignup() {
	var successSignup = false;
	var form = $("#signupForm");
	//disable the button so we can't resubmit while we wait
	$("#submitSignupButton",form).attr("disabled","disabled");
	var formFirstname = $("#txt-first-name", form).val();
	var formLastname = $("#txt-last-name", form).val();
	var formEmail = $("#txt-email", form).val();
	var formUsername = $("#txt-username", form).val();
	var formPassword = $("#txt-password", form).val();
	// console.log("username is " + formUsername);
	if(formUsername != '' && formPassword != '') {
		// console.log("Juuuuust about to send a POST request to http://todo-doubleup.rhcloud.com/signup...");
		$.ajax ({
			url: theURL + '/signup',
		    type: "POST",
		    crossDomain: true,
		    data: JSON.stringify({
		    	"firstName": formFirstname, 
		    	"lastName": formLastname, 
		    	"email": formEmail, 
		    	"username": formUsername, 
		    	"password": formPassword}),
		    dataType: "json",
		    contentType: "application/json; charset=utf-8",
		    success: function(res){
		    	// console.log("A response!");
		        if(res) {
		        	if(res.message == "exists"){
		        		alert("User already exists");
		        		window.location.hash = "";
		        	}
		        	else if(res.message == "success"){
		        		successSignup = true;
		        		//store
		        		localStorage.clear();
		        		localStorage["username"] = res.username;
		        		localStorage["firstName"] = res.firstName;
		        		localStorage["lastName"] = res.lastName;
		        		localStorage["email"] = res.email;
		        		localStorage.setItem("loggedIn", true);

		        		setupUser(); // this takes care of updating the userDatabase object
		        		// console.log("finished setting up user");

		        		firebaseAppAuth.createUserWithEmailAndPassword(localStorage['email'], formPassword).then(function(){
		        			// console.log("successfully created firebase account");
		        			uploadChanges(function(){
		        				// console.log("upload has definitely finished, so redirecting...");
		        				window.location.href = "index.html";
		        			});
		        		});
		        	}
		        	else{
		        		alert(res.message);
		        	}
				} else {
					alert("Your signup failed, for some reason...", function() {});
				}
				$("#submitSignupButton").removeAttr("disabled");
				successSignup = true;
		    }
		});
	} else {
		//navigator.notification.alert("You must enter a username and password", function() {});
		alert("You might need to enter a username and password", function() {});
		$("#submitSignupButton").removeAttr("disabled");
	}
	return false;
}

function OLDhandleSignout(){
	// console.log("Signing out...");
	$.ajax({
		url: theURL + '/signout',
		type: 'GET',
		success: function(){
			if(currentUid){
				firebaseAppAuth.signOut();
			}
			clearUser();
		}
	});
}

function checkIfUsernameIsAvailable(usernameToCheck){
	$.ajax({
		url: theURL + '/checkusername',
		type: 'POST',
		crossDomain: true,
		xhrFields: {
			withCredentials: false
		},
		data: JSON.stringify({
			"username": usernameToCheck
		}),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function(res){
			if(res){
				if(res.isAvailable){
					updateUserAvailabilityDiv(true);
					updateUserAvailabilityDivInSignup(true);
				}
				else{
					updateUserAvailabilityDiv(false);
					updateUserAvailabilityDivInSignup(false);
				}
			}
			updateSettingsForm();
		}
	});
}

// orders the user's tasks in the user's order of priority
// NOTE THAT CURRENTLY THIS DOES NOT ORDER IN TERMS OF PRIORITY, IT JUST FILTERS OUT DELETED TASKS.
function orderTasks(){
	var unorderedArr = userDatabase.tasks.slice();
	var ordered = []; // not yet used
	var numbers = []; // not yet used

	// remove all deleted tasks from the array
	for(var i=unorderedArr.length-1; i>=0; i--){
		if(unorderedArr[i].deleted){
			unorderedArr.splice(i, 1);
		}
	}
	
	return unorderedArr;
}