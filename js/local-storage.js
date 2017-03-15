//@TODO: add a function for updating local storage, so you don't have so much repetition

/*function makeCopyOfLocalStorage(){
	var copy = {};

	copy.tasks = (localStorage["tasks"]) ? JSON.parse(localStorage["tasks"]) : {};
	copy.projects = (localStorage["projects"]) ? JSON.parse(localStorage["projects"]) : {};
	copy.version = localStorage["version"] ? localStorage["version"] : "";
	copy.loggedIn = (localStorage["loggedIn"]) ? JSON.parse(localStorage["loggedIn"]) : false;
	copy.username = localStorage["username"] ? localStorage["username"] : "";
	copy.email = localStorage["email"] ? localStorage["email"] : "";
	copy.firstName = localStorage["firstName"] ? localStorage["firstName"] : "";
	copy.lastName = localStorage["lastName"] ? localStorage["lastName"] : "";
	copy.verified = (localStorage["verified"]) ? JSON.parse(localStorage["verified"]) : false;
	copy.todoPreference = localStorage["todoPreference"] ? localStorage["todoPreference"] : "todo";
	copy.trackingPeriod = localStorage["trackingPeriod"] ? localStorage["trackingPeriod"] : "today";
	copy.showCompletedTasks = (localStorage["showCompletedTasks"]) ? JSON.parse(localStorage["showCompletedTasks"]) : false;
	copy.connectedWithFirebase = (localStorage["connectedWithFirebase"]) ? JSON.parse(localStorage["connectedWithFirebase"]) : false;

	return copy;
}*/

/*function makeLocalStorageMatchCopy(){
	localStorage["tasks"] = JSON.stringify(userDatabase.tasks);
	localStorage["projects"] = JSON.stringify(userDatabase.projects);
	localStorage["version"] = userDatabase.version;
	localStorage["loggedIn"] = JSON.stringify(userDatabase.loggedIn);
	localStorage["username"] = userDatabase.username;
	localStorage["email"] = userDatabase.email;
	localStorage["firstName"] = userDatabase.firstName;
	localStorage["lastName"] = userDatabase.lastName;
	localStorage["verified"] = JSON.stringify(userDatabase.verified);
	localStorage["todoPreference"] = userDatabase.todoPreference;
	localStorage["trackingPeriod"] = userDatabase.trackingPeriod;
	localStorage["showCompletedTasks"] = JSON.stringify(userDatabase.showCompletedTasks);
	localStorage["connectedWithFirebase"] = JSON.stringify(userDatabase.connectedWithFirebase);
}*/