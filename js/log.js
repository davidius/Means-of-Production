function addLog(project, userDate, userNote){
	var projects = userDatabase.projects.slice();
	var log = project.log;
	var matchIndex = -1;
	var dateAsString = userDate.toISOString();

	var indexOfProject = findIndexOfProjectOrTask("project", project);

	//cycle through the log array to see if the user-given date matches any date in the array
	for(var i=0; i<log.length; i++){
		var logDate = new Date(log[i].date);
		if(Date.parse(logDate) == Date.parse(userDate)){
			matchIndex = i;
		}
	}

	//if there was a match, replace the saved note with the new note; otherwise, save a new entry
	if(matchIndex >= 0){
		log[matchIndex].note = userNote;
	}
	else{
		log.push({date: dateAsString, note: userNote});
	}

	//save to the project, then upload...
	project.log = log;
	projects[indexOfProject] = project;
	projectsRef.set(projects);
}

function deleteLog(project, userDate){
	var projects = userDatabase.projects.slice();
	var log = project.log;
	var matchIndex = -1;

	var indexOfProject = findIndexOfProjectOrTask("project", project);

	//cycle through the log array to see if the user-given date matches any date in the array
	for(var i=0; i<log.length; i++){
		var logDate = new Date(log[i].date);
		if(Date.parse(logDate) == Date.parse(userDate)){
			matchIndex = i;
		}
	}

	//if there was a match, replace the saved note with the new note; otherwise, save a new entry
	if(matchIndex >= 0){
		log.splice(matchIndex, 1);
	}
	
	//save to the project, then upload...
	project.log = log;
	projects[indexOfProject] = project;
	projectsRef.set(projects);
}