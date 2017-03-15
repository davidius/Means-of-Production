/*functions relating to measuring and displaying productivity------------------------------------------------------------------*/

// EXTREMELY IMPORTANT NOTE: whenever you create a new date you MUST do it with new Date(). That is, you should never say var a = b; you should always say var a = new Date(b). If you don't do this, then any changes to a will be reflected in b.

function makeDateObject(argDate){
	var milliseconds = Date.parse(argDate);
	var date = new Date(milliseconds);
	return date;
}

function makeDateObjectFromMoment(argMoment){
	var date = new Date(argMoment.year(), argMoment.month(), argMoment.date(), argMoment.hour(), argMoment.minute(), argMoment.second(), argMoment.millisecond());
	return date;
}

function makeDateObjects(array){
	//convert the strings in the "dates" array to actual date objects..........
	var dates = array.slice();
	$.each(dates, function(index, elem){
		var milliseconds = Date.parse(elem);
		var date = new Date(milliseconds);
		dates[index] = date;
	});
	return dates;
}

// convert the arguments into date objects
// if no date objects are given, set one week ago as the start and today as the end
function getStartAndEndDates(start, end){
	var startDate, endDate;

	if(end === undefined){
		endDate = new Date();
		endDate.setHours(23, 59, 59, 999);
	}
	else{
		endDate = makeDateObject(end);
	}

	if(start === undefined){
		switch (userDatabase.trackingPeriod){
			case "today":
				startDate = new Date();
				break;
			case "last 7 days":
				startDate = new Date(endDate - 6*24*60*60*1000);
				break;
			default:
				startDate = new Date(endDate - 6*24*60*60*1000);
		}
		startDate.setHours(0, 0, 0, 0); //23, 59, 59
	}
	else{
		var startDate = makeDateObject(start);
	}
	
	return [startDate, endDate];
}

function findUnitsOnDay(project, dateAsString){
	var units = project.units.slice();
	var matchIndex = -1;

	//cycle through the units array to see if the user-given date matches any date in the array
	for(var i=0; i<units.length; i++){
		var unitDate = new Date(units[i].date);
		if(Date.parse(unitDate) == Date.parse(dateAsString)){
			matchIndex = i;
		}
	}

	//if there was a match, return the value
	if(matchIndex >= 0){
		return units[matchIndex].units;
	}
	else{
		return 0;
	}
}

function saveUnitsOnDay(project, dateAsString, unitsDoneOnDay){
	var projects = userDatabase.projects.slice();
	var units = project.units.slice();
	var matchIndex = -1;

	var indexOfProject = findIndexOfProjectOrTask("project", project);

	//cycle through the units array to see if the user-given date matches any date in the array
	for(var i=0; i<units.length; i++){
		var unitDate = new Date(units[i].date);
		if(Date.parse(unitDate) == Date.parse(dateAsString)){
			matchIndex = i;
		}
	}

	//if there was a match, replace matching element's units value with user-given value, otherwise add to the array
	if(matchIndex >= 0){
		units[matchIndex].units = unitsDoneOnDay;
	}
	else{
		units.push({date: dateAsString, units: unitsDoneOnDay});
	}

	//save to the project, then upload...
	project.units = units;
	projects[indexOfProject] = project;
	projectsRef.set(projects);
}

//returns the amount of work done on each day for a given project in a given date range
//the array returned contains array-elements with element 0 = date and element 1 = productivity
//the 4th parameter accepts either "time" or "units", depending on what is being measured
//unit of time = minute
function workDoneInRange(options){
	// options = {project, start, end, timeOrUnits}
	var project = options.project;
	var startDate = options.start;
	var endDate = options.end;
	var timeOrUnits = options.timeOrUnits;

	// arrays of all the dates and all the session times/units in the given project
	var dates = [];
	var sessionsOrUnits = [];

	var sourceArray = [];

	if(timeOrUnits == "time"){
		sourceArray = project.sessions.slice();
	}
	else if(timeOrUnits == "units"){
		sourceArray = project.units.slice();
	}
	
	// rearrange in order of date, from earliest to latest
	sourceArray.sort(function(a, b){
		return makeDateObject(a.date) - makeDateObject(b.date);
	});

	// fill out the dates array and the sessionsOrUnits array (in the latter case by replacing session objects with the pertinent numbers)
	for(var i=0; i<sourceArray.length; i++){
		dates[i] = sourceArray[i].date;
		if(timeOrUnits == "time"){
			if(parseInt(sourceArray[i].minutes) >= 0 && !sourceArray[i].deleted){
				sessionsOrUnits[i] = parseInt(sourceArray[i].minutes);
			}
			else{
				sessionsOrUnits[i] = 0;
			}
		}
		else if(timeOrUnits == "units"){
			if(parseInt(sourceArray[i].units) >= 0){
				sessionsOrUnits[i] = parseInt(sourceArray[i].units);
			}
			else{
				sessionsOrUnits[i] = 0;
			}
		}
	}
	
	dates = makeDateObjects(dates);
	
	// 86400000 is the number of milliseconds in a day
	var daysInRange = Math.ceil((endDate - startDate) / 86400000); // must double-check that this is ALWAYS right
	var arrayOfWorkDoneEachDayInRange = [];
	var rangeProductivity = [];

	// delete all those elements (from the dates and sessionsOrUnits arrays) that don't belong to the given date range
	for(var i=dates.length-1; i>=0; i--){
		if(dates[i]<startDate || dates[i]>endDate){
			dates.splice(i, 1);
			sessionsOrUnits.splice(i, 1);
		}
	}

	// create an array (arrayOfWorkDoneEachDayInRange) where each element represents the total amount of work done in a day (but no element if no work done)
	// note that each element is an object: {date, time/units, number}, where "number" is the number of sessions on that day
	for(var i=0; i<dates.length; i++){
		// check if the element in dates has the same date as the previous one; if so, combine elements in arrayOfWorkDoneEachDayInRange...
		if(i>0 && dates[i] !== undefined && dates[i].getDate() == dates[i-1].getDate()){
			arrayOfWorkDoneEachDayInRange[arrayOfWorkDoneEachDayInRange.length-1].number++;
			if(timeOrUnits == "time"){
				arrayOfWorkDoneEachDayInRange[arrayOfWorkDoneEachDayInRange.length-1].minutes += sessionsOrUnits[i];
			}
			else if(timeOrUnits == "units"){
				arrayOfWorkDoneEachDayInRange[arrayOfWorkDoneEachDayInRange.length-1].units += sessionsOrUnits[i];
			}
		}
		// if not, create a new element
		else{
			arrayOfWorkDoneEachDayInRange.push(new Object());
			arrayOfWorkDoneEachDayInRange[arrayOfWorkDoneEachDayInRange.length-1].date = dates[i];
			arrayOfWorkDoneEachDayInRange[arrayOfWorkDoneEachDayInRange.length-1].number = 1;
			if(timeOrUnits == "time"){
				arrayOfWorkDoneEachDayInRange[arrayOfWorkDoneEachDayInRange.length-1].minutes = sessionsOrUnits[i];
			}
			else if(timeOrUnits == "units"){
				arrayOfWorkDoneEachDayInRange[arrayOfWorkDoneEachDayInRange.length-1].units = sessionsOrUnits[i];
			}
		}
	}

	//fill out the array (add in 0s where necessary)
	var iDate = new Date(Date.parse(startDate)); //iDate is the date-ified version of i in the for loop
	var j = 0; //the iterator over arrayOfWorkDoneEachDayInRange
	for(var i=0; i<daysInRange; i++){
		// check if iDate is a date on which any work was done
		if(hasDate(iDate, arrayOfWorkDoneEachDayInRange)){
			// if any work was done, add a 2-element array: [date, amount of work]
			if(timeOrUnits == "time"){
				rangeProductivity.push([iDate.toDateString(), arrayOfWorkDoneEachDayInRange[j].minutes]);
			}
			else if(timeOrUnits == "units"){
				rangeProductivity.push([iDate.toDateString(), arrayOfWorkDoneEachDayInRange[j].units]);
			}
			j++;
		}
		else{
			// if no work was done, add a 2-element array: [date, 0]
			rangeProductivity.push([iDate.toDateString(), 0]);
		}
		iDate.setDate(iDate.getDate() + 1);
	}

	// console.log("convert date strings to actual dates, because JavaScript is a FUCKING IDIOT");
	for(var i=0; i<rangeProductivity.length; i++){
		rangeProductivity[i][0] = new Date (rangeProductivity[i][0]);
	}

	return rangeProductivity;
}

//returns the amount of time/number of units required in order to catch up to the target
//if returning the amount of time, it returns this in minutes
function getCatchup(options){
	var project = options.project;
	var timeOrUnits = options.timeOrUnits;

	var catchup;
	var targetAverage, averageProductivity, rangeProductivity;
	
	var startDate = getStartAndEndDates(options.start, options.end)[0];
	var endDate = getStartAndEndDates(options.start, options.end)[1];
	
	if(timeOrUnits == "time"){
		targetAverage = project.targetMinutes;
	}
	else if(timeOrUnits == "units"){
		targetAverage = project.customTarget;
	}

	averageProductivity = getAverageProductivity({project: project, start: startDate, end: endDate, timeOrUnits: timeOrUnits});
	rangeProductivity = workDoneInRange({project: project, start: startDate, end: endDate, timeOrUnits: timeOrUnits});

	catchup = (targetAverage - averageProductivity) * rangeProductivity.length;
	return catchup;
}

function whatNeedsToBeDoneForProject(project){
	// var averageMinutes = (getAverageProductivity({project: project, timeOrUnits: "time"})).toFixed(2);
	// var productivityMinutes = ((averageMinutes / targetMinutes) * 100).toFixed(2);
	// var averageUnits = (getAverageProductivity({project: project, timeOrUnits: "units"})).toFixed(2);
	// var productivityUnits = ((averageUnits / targetUnits) * 100).toFixed(2);
	var catchupMinutes = 0;
	var catchupUnits = 0;

	if(project.trackTime){
		catchupMinutes = (getCatchup({project: project, timeOrUnits: "time"})).toFixed(2);
	}
	if(project.trackUnits){
		catchupUnits = (getCatchup({project: project, timeOrUnits: "units"})).toFixed(2);
	}
	
	var totalCatchup = parseInt(catchupMinutes) + parseInt(catchupUnits);

	var whatNeedsToBeDone = {};
	whatNeedsToBeDone.minutes = catchupMinutes;
	whatNeedsToBeDone.units = catchupUnits;
	whatNeedsToBeDone.total = totalCatchup;

	return whatNeedsToBeDone;
}

// cycles through all projects determining the catchupMinutes and catchupUnits (for all unique unit types)
function collateWhatNeedsToBeDone(){
	var projects = orderProjects();
	
	var whatNeedsToBeDone = {};

	var minutes = 0;
	var units = {};
	var unitsSum = 0;

	for(var i=0; i<projects.length; i++){
		var project = projects[i];
		var todoForThisProject = whatNeedsToBeDoneForProject(project);
		minutes += parseInt(todoForThisProject.minutes);
		unitsSum += parseInt(todoForThisProject.units);
		if(parseInt(todoForThisProject.units) > 0){
			if(typeof units[project.unitName] === "undefined"){
				units[project.unitName] = parseInt(todoForThisProject.units);
			}
			else{
				units[project.unitName] += parseInt(todoForThisProject.units);
			}
		}
	}

	whatNeedsToBeDone.minutes = minutes;
	whatNeedsToBeDone.units = units;
	whatNeedsToBeDone.total = minutes + unitsSum;

	return whatNeedsToBeDone;
}

//for getTotalProductivity and getAverageProductivity: deal with cases where the date range has length 0 and other anomalies

//returns the total productivity for the given period (if time, then in minutes)
function getTotalProductivity(options){
	// options = {project, start, end, timeOrUnits}
	var project = options.project;
	var timeOrUnits = options.timeOrUnits;

	var startDate = getStartAndEndDates(options.start, options.end)[0];
	var endDate = getStartAndEndDates(options.start, options.end)[1];

	var rangeProductivity = workDoneInRange({project: project, start: startDate, end: endDate, timeOrUnits: timeOrUnits});
	var totalProductivity = 0;

	for(var i=0; i<rangeProductivity.length; i++){
		totalProductivity += rangeProductivity[i][1];
	}

	return totalProductivity;
}

function getTargetTimeForDateRange(props){
	var project = props.project;
	var start = new Date(props.start);
	var end = new Date(props.end);
	var dailyTarget = project.targetMinutes;

	start.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);
	end.setTime(end.getTime() + (24*60*60*1000));
	
	var range =  (end - start) / (24*60*60*1000);

	return dailyTarget * range;
}

function getTargetUnitsForDateRange(props){
	var project = props.project;
	var start = new Date(props.start);
	var end = new Date(props.end);
	var dailyTarget = project.customTarget;

	start.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);
	end.setTime(end.getTime() + (24*60*60*1000));
	
	var range =  (end - start) / (24*60*60*1000);

	return dailyTarget * range;
}

// returns an object containing the productivity and slacking across ALL projects, for use mainly in charts
function getOverallProductivity(){
	var projects = orderProjects();
	
	var startDate = getStartAndEndDates()[0];
	var endDate = getStartAndEndDates()[1];
	
	var productivity = 0;
	var slacking = 0;
	var totalPercent = 0;

	var totalTargetTime = 0; // the target amount of time in minutes
	var totalTime = 0; // total amount of time in minutes
	var numberOfProjectsWhereTimeIsTracked = 0;
	var timeProductivityPct = 0; // IN PERCENT
	var timeSlackingPct = 0; // IN PERCENT

	var totalUnitsInPercent = 0;
	var numberOfProjectsWhereUnitsAreTracked = 0;
	var numberOfTrackedProjects = 0;

	var unitProductivityPct = 0; // IN PERCENT
	var unitSlackingPct = 0; // IN PERCENT
	
	for(var i=0; i<projects.length; i++){
		project = projects[i];
		// console.log("scanning project '" + project.name + "' from " + startDate + " to " + endDate);

		var projectTargetTime = getTargetTimeForDateRange({project: project, start: startDate, end: endDate});
		var projectTargetUnits = getTargetUnitsForDateRange({project: project, start: startDate, end: endDate});
		
		if(project.trackUnits && project.trackTime){
			totalTargetTime += projectTargetTime;
			totalTime += getTotalProductivity({project: project, start: startDate, end: endDate, timeOrUnits: "time"});
			numberOfProjectsWhereTimeIsTracked += 1;
			
			totalUnitsInPercent += (getTotalProductivity({project: project, start: startDate, end: endDate, timeOrUnits: "units"}) / projectTargetUnits) * 100;
			numberOfProjectsWhereUnitsAreTracked += 1;

			numberOfTrackedProjects += 1;
		}
		else if(project.trackUnits && !project.trackTime){
			totalUnitsInPercent += (getTotalProductivity({project: project, start: startDate, end: endDate, timeOrUnits: "units"}) / projectTargetUnits) * 100;
			numberOfProjectsWhereUnitsAreTracked += 1;

			numberOfTrackedProjects += 1;
		}
		else if(!project.trackUnits && project.trackTime){
			totalTargetTime += projectTargetTime;
			totalTime += getTotalProductivity({project: project, start: startDate, end: endDate, timeOrUnits: "time"});
			numberOfProjectsWhereTimeIsTracked += 1;

			numberOfTrackedProjects += 1;
		}
	}
	
	if(numberOfProjectsWhereTimeIsTracked > 0){
		timeProductivityPct = (totalTime / totalTargetTime) * 100;
		timeSlackingPct = 100 - timeProductivityPct;
	}

	if(numberOfProjectsWhereUnitsAreTracked > 0){
		unitProductivityPct = totalUnitsInPercent / numberOfTrackedProjects;
		unitSlackingPct = 100 - unitProductivityPct;
	}

	productivity = timeProductivityPct + unitProductivityPct;
	slacking = timeSlackingPct + unitSlackingPct;
	if((productivity + slacking) > 100){
		productivity = productivity / 2;
		slacking = slacking / 2;
	}
	// console.log("productivity = " + productivity + ", slacking = " + slacking + "\n\n");

	return {productivity: productivity, slacking: slacking};
}

//returns the average productivity for the given period (if time, then in minutes)
function getAverageProductivity(options){
	// options = {project, start, end, timeOrUnits}
	var project = options.project;
	var timeOrUnits = options.timeOrUnits;

	var startDate = getStartAndEndDates(options.start, options.end)[0];
	var endDate = getStartAndEndDates(options.start, options.end)[1];

	var rangeProductivity = workDoneInRange({project: project, start: startDate, end: endDate, timeOrUnits: timeOrUnits});
	var totalProductivity = getTotalProductivity({project: project, start: startDate, end: endDate, timeOrUnits: timeOrUnits});

	var averageProductivity = totalProductivity / rangeProductivity.length;
	return averageProductivity;
}

// returns an object containing the average productivity and average slacking in the given period (????????)
// note that it currently returns these AS PERCENTAGES to account for cases where some projects track both units and time, and others don't
function getAverageProductivityAndSlacking(project){
	var averageProductivity, averageSlacking, averageUnits, averageMinutes, timeOrUnits, target;

	if(project.trackUnits && project.trackTime){
		averageUnits = ((getAverageProductivity({project: project, timeOrUnits: "units"}))/project.customTarget) * 100;
		averageMinutes = ((getAverageProductivity({project: project, timeOrUnits: "time"}))/project.targetMinutes) * 100;
		averageProductivity = (averageUnits + averageMinutes) / 2;
		averageSlacking = 100 - averageProductivity;
		if(averageSlacking < 0){
			averageProductivity = 100;
			averageSlacking = 0;
		}
	}
	else{
		if(project.trackUnits){
			target = project.customTarget;
			averageProductivity = (getAverageProductivity({project: project, timeOrUnits: "units"})); // divide by target, times by 100
		}
		else if(project.trackTime){
			target = project.targetMinutes;
			averageProductivity = (getAverageProductivity({project: project, timeOrUnits: "time"})); // divide by target, times by 100
		}
		else{
			averageProductivity = target = 0;
		}
		
		averageSlacking = target - averageProductivity;
		if(averageSlacking < 0){
			averageProductivity = target;
			averageSlacking = 0;
		}
	}

	return {productivity: averageProductivity, slacking: averageSlacking};
}

//returns true if the given tempArray contains the given date, false otherwise
function hasDate(date, tempArray){
	var arr = [];

	//make a new array with just the days on which work was done
	$.each(tempArray, function(index, elem){
		arr[index] = elem.date.toDateString();
	});

	if(arr.indexOf(date.toDateString()) != -1){
		return true;
	}
	else{
		return false;
	} 
}

//returns true if the given monthArray contains the given date, false otherwise
function hasDateInMonth(date, monthArray){
	var arr = [];

	//make a new array with just the days on which work was done
	$.each(monthArray, function(index, elem){
		arr[index] = elem.date.getDate();
	});

	if(arr.indexOf(date) != -1){
		return true;
	}
	else{
		return false;
	} 
}

//returns the total time of work for the project
function totalTime(project){
	var sessions = [];
	var total = 0;
	$.each(project.sessions, function(index, elem){
		sessions[index] = parseInt(elem.minutes);
	});
	if(sessions.length > 0){
		total = sessions.reduce(function(a,b){
			return a + b;
		});
	}
	return total;
}

//returns the total number of units done for the project
function totalUnits(project){
	var unitArray = [];
	var total = 0;
	$.each(project.sessions, function(index, elem){
		if(typeof elem.units !== "undefined" && elem.units != ""){
			unitArray[index] = parseInt(elem.units);
		}
	});
	if(unitArray.length > 0){
		total = unitArray.reduce(function(a,b){
			return a + b;
		});
	}
	return total;
}



// saves a session (either in number of units or minutes, or both, and always with a date)
// the object passed here has the following properties:
// timeDone (number of minutes) - should be a number (not a string)
// date (of type Date)
// project
function saveSession(newSession){
	var timeDone = newSession.timeDone;
	var date = newSession.date;
	var project = newSession.project;

	var indexOfProject = findIndexOfProjectOrTask("project", project);
	var nextAvailableId = getNextAvailableId(project.sessions);

	var projects = userDatabase.projects.slice();
	var sessionToAdd = {};

	if(date == "" || date == "Invalid date"){
		alert("You need to enter a valid date, dude.");
	}
	else{
		var dateAsString = date.toISOString();
		
		sessionToAdd = {id: nextAvailableId, minutes: timeDone, date: dateAsString, deleted: false};

		projects[indexOfProject].sessions.push(sessionToAdd);

		projectsRef.set(projects);
	}
}

// takes a number of minutes and converts it into a readable string (i.e. containing hours and minutes as appropriate)
function makeMinutesReadable(inputMinutes){
	var readableTime = "";
	var hours, minutes;
	var minutesString = ""; 
	var hoursString = "";

	if(inputMinutes > 60){
		minutes = inputMinutes % 60;
		hours = (inputMinutes - minutes) / 60;

		if(minutes > 1) {
			minutesString = "and " + minutes + " minutes";
		}
		else if(minutes == 1) {
			minutesString = "and 1 minute";
		}
		
		if(hours > 1) hoursString = hours + " hours ";
		else hoursString = hours + " hour ";

		readableTime = hoursString + minutesString;
	}
	else if(inputMinutes == 60){
		readableTime = "one hour";
	}
	else{
		readableTime = inputMinutes + " minutes";
	}

	return readableTime;
}

// same as makeMinutesReadable(), except adapted for the needs of individual sessions
function makeMinutesReadableForSession(inputMinutes){
	var readableTime = "";
	var hours, minutes;
	var minutesString = ""; 
	var hoursString = "";

	if(inputMinutes > 60){
		minutes = inputMinutes % 60;
		hours = (inputMinutes - minutes) / 60;
		
		if(minutes > 1){
			minutesString = "and " + minutes + " minutes ";
		}
		else if(minutes == 1) {
			minutesString = "and 1 minute ";
		}
		
		if(hours > 1) hoursString = hours + " hours ";
		else hoursString = hours + " hour ";

		readableTime = hoursString + minutesString;
	}
	else if(inputMinutes == 60){
		readableTime = "one hour";
	}
	else{
		readableTime = inputMinutes + " minute";
	}

	return readableTime;
}