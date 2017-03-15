function Project(id, name, number){
	this.id = id;
	this.name = name;
	this.number = number; //a user-given number denoting the place in the order of projects as shown -- when a user deletes a project (or task), number becomes -1 so that it doesn't appear

	this.phases = ["To do", "Doing", "Done"];

	this.standardPomodoroTime = 25;
	this.standardPomodoroBreak = 5;
	this.sessions = []; // each element corresponds to one session, even if there were multiple per day; and each element is as follows: {id, date, minutes, units, deleted, type} -- NOTE "minutes" has superseded "time"
	/*each session object contains:
	- id
	- minutes
	- date
	- deleted
	*/

	this.unitRecords = {}; // each element is an object representing the number of units done on a given day. For each day there can only be one object, so the date property functions as an id
	/*each unitRecord object contains:
	- date
	- units
	*/
	this.units = []; 

	this.trackUnits = false;
	this.trackTime = false;

	this.unitName = "units";

	this.customTarget = 30; // this should be renamed
	this.targetMinutes = 240;
	
	this.log = []; // note that in older versions this is confusingly called notes -- make sure to rename it log
	// also note that each element is an object with two properties: date and note (confusing???)
	this.notes = "";

	this.deleted = false;

	// THE FOLLOWING ARE DEPRECATED PROPERTIES OF THE PROJECT PROTOTYPE
	// this.standardTime = 1500; //[DEPRECATED]
	// this.standardBreak = 300; //[DEPRECATED]
	// this.totalUnits = 0; //DEPRECATED
	// this.totalTime = 0; //DEPRECATED
	// this.totalMinutes = 0; //DEPRECATED
	// this.targetProductivity = 14400; //DEPRECATED
	
	// THE FOLLOWING ARE DEPRECATED PROPERTIES OF THE SESSION PROTOTYPE
	/*
	- units [DEPRECATED]
	- type (can be timeRecord or unitRecord) [DEPRECATED]
	- time [THIS IS DEPRECATED IN FAVOUR OF minutes]
	*/
}

function Task(name){
	this.id = "";
	this.name = name;
	this.number = ""; // a user-given number denoting the place in the order of tasks as shown in the to-do list
	this.numberInPhase = -1;
	this.numberInPriorities = ""; // a user-given number denoting the place in the order of tasks as shown in the main screen's priorities list

	this.projectId = -1; // the id of the associated project. This should be used instead of this.project

	this.phase = "";
	this.dueDate = "";
	this.reminderTime = "";
	this.done = false;
	
	this.notes = "";

	this.deleted = false;

	// THE FOLLOWING ARE DEPRECATED PROPERTIES OF THE TASK PROTOTYPE
	/*this.project = $("#select-project").val();
	this.totalTime = 0;
	this.totalUnits = 0;

	this.targetProductivity = 7200;
	this.customTarget = 30;

	this.sessions = []; // each element corresponds to one session, even if there were multiple per day; and each element is as follows: {id, date, time, deleted}*/
}