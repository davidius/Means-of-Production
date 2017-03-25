/*functions for finding projects and tasks by various criteria----------------------------------------------------------*/

//IMPORTANT: make this a universal finding function to replace all the specific types!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*
what = the thing to search for
by = the thing to search by (e.g. id, name, etc.)
where = where to find it, e.g. project or phase
note that "where" must be an array so that you can search for things where multiple places!!!!!!!!!!!!!!!!!!
*/
function findOne(what, by, argX){
	var array = [];
	var thingToReturn;
	
	if(what == "task"){
		array = userDatabase.tasks.slice();
	}
	else if(what == "project"){
		array = userDatabase.projects.slice();
	}
	
	$.each(array, function(i, elem){
		if(elem[by] == argX){
			thingToReturn = elem;
		}
	});

	if(typeof thingToReturn !== "undefined"){
		return thingToReturn;
	}
	else return false;
}

function findMany(what, where, argX){
	var array = [];
	var returnArray = [];
	var argA;

	if(what == "tasks"){
		array = userDatabase.tasks.slice();
	}
	else if(what == "projects"){
		array = userDatabase.projects.slice();
	}
	
	if(where == "project"){
		argA = argX.name;
	}
	else if(where == "projectId"){
		argA = argX.id;
	}
	else{
		argA = argX;
	}

	$.each(array, function(i, elem){
		if(elem[where] == argA){
			returnArray.push(elem);
		}
	});
	
	if(typeof returnArray !== "undefined"){
		return returnArray;
	}
	else return false;
}

//a better syntax would be (what, [by], [argX], array), where by and argX are arrays of things to search by. You know it makes sense
function findInArray(what, by, argX, array){
	//returns either an array or a single object, depending on what's requested
	var returnArray = [];
	var argA;
	var thingToReturn;

	if(by == "project"){
		argA = argX.name;
	}
	else{
		argA = argX;
	}

	if(what == "task" || what == "project"){
		/*for(var i=0; i<lengthOfObject(array); i++){
			if(array[i][by] == argA){
				return array[i];
			} 
		}*/
		$.each(array, function(i, elem){
			if(elem[by] == argA){
				thingToReturn = elem;
			}
		});
	}
	else if(what == "tasks" || what == "projects"){
		/*for(var i=0; i<lengthOfObject(array); i++){
			if(array[i][by] == argA){
				returnArray.push(array[i]);
			}
		}*/
		$.each(array, function(i, elem){
			if(elem[by] == argA){
				returnArray.push(elem);
			}
		});
		thingToReturn = returnArray;
	}

	if(typeof thingToReturn !== "undefined"){
		return thingToReturn;
	}
	else return false;
}

// typeOfThing can either be "project" or "task"
// call as follows: findIndexOfProjectOrTask("task", taskToCheck);
function findIndexOfProjectOrTask(typeOfThing, actualThing){
	var indexToReturn;
	var arrayToScan = [];

	if(typeOfThing == "project"){
		arrayToScan = userDatabase.projects.slice();
	}
	else if(typeOfThing == "task"){
		arrayToScan = userDatabase.tasks.slice();
	}

	$.each(arrayToScan, function(index, projectOrTask){
		if(projectOrTask.id == actualThing.id){
			indexToReturn = index;
		}
	});

	return indexToReturn;
}

function getNextAvailableId(array){
	// make an array of all project IDs in order to ascertain which is the next available one
	var arrayOfIDs = [];
	var nextAvailableId;

	$.each(array, function(index, elem){
		arrayOfIDs.push(elem.id);
	});

	if(arrayOfIDs.length > 0){
		nextAvailableId = Math.max(...arrayOfIDs) + 1;
	}
	else{
		nextAvailableId = 0;
	}

	return nextAvailableId;
}

function getNextAvailableNumber(array){
	// make an array of all project IDs in order to ascertain which is the next available one
	var arrayOfNumbers = [];
	var nextAvailableNumber;

	$.each(array, function(index, elem){
		arrayOfNumbers.push(elem.number);
	});

	if(arrayOfNumbers.length > 0){
		nextAvailableNumber = Math.max(...arrayOfNumbers) + 1;
	}
	else{
		nextAvailableNumber = 0;
	}

	return nextAvailableNumber;
}

function improvedFind(){
	//IMPROVE ALL THE FIND FUNCTIONS AND COMPRESS THEM INTO ONE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

function compareDate(a, b){
	var aDate = new Date(a.dueDate);
	var bDate = new Date(b.dueDate);
	return aDate.getTime() - bDate.getTime();
}

function compareNumbers(a, b){
	return a - b;
}

//orders the user's projects by the user-created order and returns the list
function orderProjects(){
	var unorderedArr = userDatabase.projects.slice();
	var ordered = [];
	var numbers = [];

	//remove all deleted projects from the array
	for(var i=unorderedArr.length-1; i>=0; i--){
		if(unorderedArr[i].deleted){
			unorderedArr.splice(i, 1);
		}
	}
	
	//create an array of numbers corresponding to the order of the "numbers" of each project that isn't deleted
	$.each(unorderedArr, function(i, elem){
		numbers.push(elem.number);
	});

	numbers.sort(compareNumbers);
	
	//create an ordered array based on the order of the numbers in the "numbers" array
	$.each(numbers, function(i, elem){
		var corresponding = findOne("project", "number", elem);
		ordered.push(corresponding);
	});

	return ordered;
}

// returns a list of tasks in a given range
// rangeNature can be "excludeStart", "excludeEnd", "excludeBoth", or "excludeNeither"
// start and end are date objects, and rangeNature is a string
// NOTE THAT THIS CURRENTLY FILTERS OUT TASKS THAT ARE DONE OR WHICH HAVE NO DUE DATE. THIS IS NOT IDEAL.
function orderTasksByDateBetween(start, end, rangeNature){
	start.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);
	var startDate = start.getTime();
	var endDate = end.getTime();

	var unorderedArr = userDatabase.tasks.slice();
	var orderedArr = []; // not yet used
	var numbers = []; // not yet used
	
	// remove all deleted tasks, all tasks without a due date, all tasks that are done, and all tasks outside the range from the array
	for(var i=unorderedArr.length-1; i>=0; i--){
		if(unorderedArr[i].deleted || unorderedArr[i].dueDate == "" || unorderedArr[i].done){
			unorderedArr.splice(i, 1);
		}
		else{
			var dueDate = new Date(unorderedArr[i].dueDate);
			dueDate.setHours(0, 0, 0, 0);
			dueDate = dueDate.getTime();
			
			switch(rangeNature){
				case "excludeStart":
					if(dueDate > endDate){
						unorderedArr.splice(i, 1);
					}
					else if(dueDate <= startDate){
						unorderedArr.splice(i, 1);
					}
					break;
				case "excludeEnd":
					if(dueDate >= endDate){
						unorderedArr.splice(i, 1);
					}

					else if(dueDate < startDate){
						unorderedArr.splice(i, 1);
					}
					break;
				case "excludeBoth":
					if(dueDate >= endDate){
						unorderedArr.splice(i, 1);
					}
					else if(dueDate <= startDate){
						unorderedArr.splice(i, 1);
					}
					break;
				case "excludeNeither":
					if(dueDate > endDate){
						unorderedArr.splice(i, 1);
					}
					else if(dueDate < startDate){
						unorderedArr.splice(i, 1);
					}
					break;
			}
		}
	}

	orderedArr = unorderedArr;
	orderedArr.sort(compareDate);
	
	return orderedArr;
}

// takes an array of tasks and returns the ones from that array which are completed
// (returns an array)
function getCompletedTasks(tasks){
	var completedTasks = [];

	for(var i=0; i<tasks.length; i++){
		if(tasks[i].done){
			completedTasks.push(tasks[i]);
		}
	}

	return completedTasks;
}

//orders a task list (whether in todo or kanban view)
function orderTaskList(unorderedArr, where, phaseOrProject){
	//"where" can be "todo" or "phase"
	var copyOfUnorderedArr = unorderedArr.slice();
	var ordered = [];
	var numbers = [];
	var allTasksInProject = findMany("tasks", "projectId", phaseOrProject);

	//remove all deleted tasks from the array
	for(var i=copyOfUnorderedArr.length-1; i>=0; i--){
		if(copyOfUnorderedArr[i].deleted){
			copyOfUnorderedArr.splice(i, 1);
		}
	}

	if(where == "todo"){
		$.each(copyOfUnorderedArr, function(index, elem){
			numbers[index] = elem.number;
		});
		
		numbers.sort(compareNumbers);
		$.each(numbers, function(index, numberOfTask){
			var correspondingTasks = findInArray("tasks", "number", numberOfTask, allTasksInProject);
			$.each(correspondingTasks, function(indexOfTask, correspondingTask){
				if(ordered.indexOf(correspondingTask) == -1){
					ordered.push(correspondingTask);
				}
			});
		});
	}
	
	if(typeof ordered[0] === "undefined"){
		ordered.splice(0, ordered.length);
	}

	return ordered;
}

// @IMPORTANT: phase is given in numerical form (it's possible that the user will give multiple phases the same name)
function orderTaskPhaseList(project, phaseNumber){
	var allTasksInProject = findMany("tasks", "projectId", project);
	var tasksInPhase = findInArray("tasks", "phase", project.phases[phaseNumber], allTasksInProject);

	var numbers = [];
	var ordered = [];

	$.each(tasksInPhase, function(index, elem){
		numbers.push(elem.numberInPhase);
	});
	
	numbers.sort(compareNumbers);

	$.each(numbers, function(index, numberInPhaseOfTask){
		var correspondingTasks = findInArray("tasks", "numberInPhase", numberInPhaseOfTask, tasksInPhase);
		$.each(correspondingTasks, function(indexOfTask, correspondingTask){
			if(ordered.indexOf(correspondingTask) == -1){
				ordered.push(correspondingTask);
			}
		});
	});

	return ordered;
}

/*dealing with objects-----------------------------------------------------------------*/

function lengthOfObject(obj) {
	var length = 0;
	$.each(obj, function(i, elem) {
		length++;
	});
	return length;
}

/*getting and setting the current project and task----------------------------------------------------------------------------*/

function getAssociatedID(id){
	var index = id.lastIndexOf("-");
	id = id.slice(index + 1);

	return id;
}

function setCurrentProject(id){
	id = getAssociatedID(id);
	localStorage["currentProject"] = parseInt(id);
}

function setCurrentTask(id){
	id = getAssociatedID(id);
	localStorage["currentTask"] = parseInt(id);
}

function getCurrentProject(){
	return findOne("project", "id", localStorage["currentProject"]);
}

function getCurrentTask(){
	return findOne("task", "id", localStorage["currentTask"]);
}

/*OTHER------------------------------------------------------------------------------------------------------------------*/