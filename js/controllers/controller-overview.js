function setupOverviewPage(){
	/*
	project button id = "btn-proj-" + id; goes to #view-project
	project popup button id = "btn-proj-popup-" + id
	task button id = "btn-task-" + id
	task popup button id = "btn-task-popup-" + id
	*/
	var today = new Date();

	var diff = 8 - today.getDay(); // Monday.getDay() = 1, 8, 15, etc. Sunday = 0
	if(diff > 7){
		diff = diff - 7;
	}
	var startOfNextWeek = new Date();
	var endOfNextWeek = new Date();
	startOfNextWeek.setDate(today.getDate() + diff);
	endOfNextWeek.setTime(startOfNextWeek.getTime() + (6 * 86400000));
	
	// @TODO: come up with a better system than "prehistory" and "future"
	var prehistory = new Date(1985, 10, 22);
	var future = new Date(3000, 10, 22);

	var tasksOverdue = orderTasksByDateBetween(prehistory, today, "excludeEnd");
	var tasksToday = orderTasksByDateBetween(today, today, "excludeNeither");
	var tasksThisWeek = orderTasksByDateBetween(today, startOfNextWeek, "excludeBoth");
	var tasksNextWeek = orderTasksByDateBetween(startOfNextWeek, endOfNextWeek, "excludeNeither");
	var tasksForLater = orderTasksByDateBetween(endOfNextWeek, future, "excludeBoth");
	var prioritiesNum = 0;

	var htmlPriorities = '';
	
	$("#firstName").html("<h1>" + "Hey there, " + userDatabase.firstName + "</h1>");

	/* show the user's priorities--------------------------------------------------------------------------*/
	if(tasksOverdue.length > 0){
		prioritiesNum++;
		htmlPriorities += '<div class="col-md-9">';
		htmlPriorities += '<h4>Overdue tasks</h4>';
		htmlPriorities += dynamicOverviewList(tasksOverdue);
		htmlPriorities += '</div>';
	}
	if(tasksToday.length > 0){
		prioritiesNum++;
		htmlPriorities += '<div class="col-md-9">';
		htmlPriorities += '<h4>Today</h4>';
		htmlPriorities += dynamicOverviewList(tasksToday);
		htmlPriorities += '</div>';
	}
	if(tasksThisWeek.length > 0){
		prioritiesNum++;
		htmlPriorities += '<div class="col-md-9">';
		htmlPriorities += '<h4>Rest of the week</h4>';
		htmlPriorities += dynamicOverviewList(tasksThisWeek);
		htmlPriorities += '</div>';
	}
	if(tasksNextWeek.length > 0){
		prioritiesNum++;
		htmlPriorities += '<div class="col-md-9">';
		htmlPriorities += '<h4>Next week</h4>';
		htmlPriorities += dynamicOverviewList(tasksNextWeek);
		htmlPriorities += '</div>';
	}
	if(tasksForLater.length > 0){
		prioritiesNum++;
		htmlPriorities += '<div class="col-md-9">';
		htmlPriorities += '<h4>Even later</h4>';
		htmlPriorities += dynamicOverviewList(tasksForLater);
		htmlPriorities += '</div>';
	}
	
	if(prioritiesNum > 0){
		$("#div-priorities").html("<div class='col-md-9'><p>Here are the tasks you have assigned due dates to:</p></div>" + htmlPriorities);
	}
	else{
		$("#div-overview-intro").css("display", "block");
	}

	$(".btn-task-overview").off("click").on("click", function(){
    	setCurrentTask($(this).attr("id"));
    });
    $('#modal-edit-task').on('show.bs.modal', function (e) {
	  	// do something...
	  	setupEditTaskPage();
	});

    $(".btn-del-task-overview").off("click").on("click", function(){
    	setCurrentTask($(this).attr("id"));
    });

    $(".check-task-overview").off("click").on("click", function(){
    	var associatedId = getAssociatedID($(this).attr("id"));
    	checkTask(associatedId, $(this).prop("checked"));
    });

    $(".btn-task-postpone-overview").off("click").on("click", function(){
    	var associatedId = getAssociatedID($(this).attr("id"));
    	postponeTaskTillTomorrow(associatedId);
    });
}

function setupTaskPage(){
	var htmlToAdd = "";
	/*var projects = JSON.parse(localStorage["projects"]);
	for (var i = 0; i < lengthOfObject(projects); i++) {
		htmlToAdd += "<option value = \"" + projects[i].name + "\">" + projects[i].name + "</option>";
	}
	$("#select-project").html(htmlToAdd);
	$("#select-project").selectmenu().selectmenu("refresh");*/
}