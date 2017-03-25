function setupProjectPage(){
	var tasks = orderTaskList(findMany("tasks", "projectId", getCurrentProject()), "todo", getCurrentProject());
	var phasesLength = getCurrentProject().phases.length;
	var tasksPerPhase = [];
	var arrayLengths = [];

	var allTasksInProject = findMany("tasks", "projectId", getCurrentProject());
	
	var htmlHeader = '';
	var htmlIntro = '';
	var htmlCheckboxesOrIntro = '';
	var htmlTodo = '';
	var htmlKanban = '';
	var htmlViewButton = '';

	/*INTRO TEXT---------------------------------------------------------*/

	htmlIntro += '<h1>' + getCurrentProject().name + '   <button type="button" data-toggle="modal" data-target="#modal-edit-project" class="btn" id="btn-edit-project"><span class="glyphicon glyphicon-cog" aria-hidden="true"></span></button></h1>';

	htmlIntro += dynamicWhatNeedsToBeDone({project: getCurrentProject()});
	$("#div-project-intro").html(htmlIntro);

	/*TEXT FOR TODO/KANBAN VIEWS IF THERE ARE NO TASKS---------------------------------------------*/
	/*(if there are tasks, add checkboxes allowing the user to show completed tasks and switch between todo and kanban views)-----------------------------------------------------------------*/

	if(tasks.length == 0){
		htmlCheckboxesOrIntro += '<div class="col-md-9"><p>Hmm. It seems like you haven\'t set yourself any tasks. Which is cool, I mean, no pressure or anything. If you feel like it, there\'s an "Add task" button right there.</p></div>';
	}
	else{
		var showCompletedTasks = userDatabase.showCompletedTasks;
		var checkClassString = 'check-show-completed';
		var checkedString = '';
		var todoSelectedString = '';
		var todoActiveString = '';
		var kanbanSelectedString = '';
		var kanbanActiveString = '';

		if(showCompletedTasks){
			checkedString = "checked";
		}
		if(userDatabase.todoPreference == "todo"){
			todoSelectedString = "checked";
			todoActiveString = "active";
		}
		else if(userDatabase.todoPreference == "kanban"){
			kanbanSelectedString = "checked";
			kanbanActiveString = "active";
		}
		
		htmlCheckboxesOrIntro += '<div class="row" style="padding: 7px; margin-bottom: 10px; background-color: #98DADE; border-radius: 10px;">';

		htmlCheckboxesOrIntro += '<div class="btn-group col-md-6" data-toggle="buttons">';
			htmlCheckboxesOrIntro += '<label class="btn btn-primary ' + todoActiveString + '">';
				htmlCheckboxesOrIntro += '<input type="radio" id="radio-todo" name="options" autocomplete="off" ' + todoSelectedString + '> To-do list';
			htmlCheckboxesOrIntro += '</label>';
			htmlCheckboxesOrIntro += '<label class="btn btn-primary ' + kanbanActiveString + '">';
				htmlCheckboxesOrIntro += '<input type="radio" id="radio-kanban" name="options" autocomplete="off" ' + kanbanSelectedString + '> Kanban';
			htmlCheckboxesOrIntro += '</label>';
		htmlCheckboxesOrIntro += '</div>';

		htmlCheckboxesOrIntro += '<div class="checkbox col-md-6">';
		htmlCheckboxesOrIntro += '<label>';
		htmlCheckboxesOrIntro += '<input type="checkbox" class="' + checkClassString + '" ' + checkedString + '> Show completed tasks?';
		htmlCheckboxesOrIntro += '</label>';
		htmlCheckboxesOrIntro += '</div>';

		htmlCheckboxesOrIntro += '</div>';
	}

	$("#div-project-tk-checks-and-switches").html(htmlCheckboxesOrIntro);

	/*TO-DO LIST-----------------------------------------------------------------*/

	if(tasks.length > 0){
		htmlTodo += '<div class="col-md-8 col-md-offset-1">';

		htmlTodo += '<ul class="list-group" id="list-project-todo">';
		
		for (var i=0; i<tasks.length; i++){
			htmlTodo += dynamicListElementTask(tasks[i], {location: "project"});
		}
		htmlTodo += '</ul>';
		htmlTodo += '</div>';
	}
	$("#div-project-todo").html(htmlTodo);
	
	/*KANBAN VIEW---------------------------------------------------------------*/

	if(tasks.length > 0){
		htmlKanban += '<div class="table-responsive">';
		htmlKanban += '<table id="table-project-kanban" class="table"><thead><tr>';

		//header row
		for(var i=0; i<phasesLength; i++){
			// for each phase...
			htmlKanban += '<th style="width:33.3%">' + getCurrentProject().phases[i] + '</th>';
			// ...create an array containing all the tasks that belong to this phase
			
			var unorderedTasksInPhase = findInArray("tasks", "phase", getCurrentProject().phases[i], allTasksInProject);
			tasksPerPhase[i] = orderTaskPhaseList(getCurrentProject(), i);
			arrayLengths.push(tasksPerPhase[i].length);
		}
		htmlKanban += '</tr></thead><tbody><tr>';
		
		//tasks lists for each phase
		for(var i=0; i<phasesLength; i++){
			//for each phase...
			htmlKanban += '<td>';
			htmlKanban += '<ul class="connectedSortable list-group" id="phase-' + i + '">';
			
			$.each(tasksPerPhase[i], function(index, elem){
				if(localStorage["platform"] == "web"){
					htmlKanban += dynamicListElementTask(elem, {location: "project"});
				}
			});
			htmlKanban += '</ul>';
			htmlKanban += '</td>';
		}
		htmlKanban += '</tr></thead>';
		htmlKanban += '</tbody>';
	}
	htmlKanban += '</table>';
	htmlKanban += '</div>';
	$("#div-project-kanban").html(htmlKanban);

	/*buttons and views--------------------------------------------------------------------------------*/

	function unClick(){
		$("#btn-show-todo").removeClass('ui-btn-active ui-focus');
		$(".btn").blur(); //need an actual way to blur buttons!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	}

	function showTodo(){
		var timeout = setTimeout(unClick, 2);
		$("#div-project-tk-checks-and-switches").css("display", "block");
		$("#div-project-todo").css("display", "block");
		$("#div-project-kanban").css("display", "none");
	}
	function showKanban(){
		var timeout = setTimeout(unClick, 2);
		$("#div-project-tk-checks-and-switches").css("display", "block");
		$("#div-project-kanban").css("display", "block");
		$("#div-project-todo").css("display", "none");
	}

	$("#radio-todo").off("change").on("change", function(){
		userDatabase.todoPreference = "todo";
		showTodo();
	});
	$("#radio-kanban").off("change").on("change", function(){
		userDatabase.todoPreference = "kanban";
		showKanban();
	});

	$("#btn-show-todo").off("click").on("click", function(){
		var timeout = setTimeout(unClick, 2);
		$("#div-project-todo-or-kanban").css("display", "block");
		$("#div-project-productivity").css("display", "none");
		setupProductivityPage();
	});
	$("#btn-show-graph").off("click").on("click", function(){
		$("#div-project-todo-or-kanban").css("display", "none");
		$("#div-project-productivity").css("display", "inline");
		setupCharts();
		setupProductivityPage();
	});

	if(userDatabase.todoPreference == "todo"){
		showTodo();
	}
	else{
		showKanban();
	}
			
	/*ADD IT ALL AND INITIALISE-----------------------------------------------*/
	
	sortTaskLists();

	$( ".connectedSortable" ).disableSelection();
    $( "#list-project-todo" ).disableSelection();
    
    if(localStorage["platform"] == "mobile"){
    	$('.connectedSortable').listview().listview('refresh');
    	$('#list-project-todo').listview().listview('refresh');
    	$("#table-project-kanban").table().table("rebuild");
    }
    else if(localStorage["platform"] == "web"){
    	// $(".nav-horizontal, .connectedSortable, #list-project-todo").find("li").find("a").button();
    }

    $("#btn-edit-project").off("click").on("click", function(){
    	setupEditProjectPage();
    });
    $(".btn-task").off("click").on("click", function(){
    	setCurrentTask($(this).attr("id"));
    });
    $('#modal-edit-task').on('show.bs.modal', function (e) {
	  	// do something...
	  	setupEditTaskPage();
	});

    $(".btn-del-task").off("click").on("click", function(){
    	setCurrentTask($(this).attr("id"));
    });
    $("#btn-delete-task").off("click").on("click", function(){
    	deleteTask(getCurrentTask());
    });
    $(".btn-task-popup").off("click").on("click", function(){
    	setCurrentTask($(this).attr("id"));
    });

    $(".check-task").off("click").on("click", function(){
    	var associatedId = getAssociatedID($(this).attr("id"));
    	checkTask(associatedId, $(this).prop("checked"));
    });

    $(".btn-task-postpone").off("click").on("click", function(){
    	var associatedId = getAssociatedID($(this).attr("id"));
    	postponeTaskTillTomorrow(associatedId);
    });

    $(".check-show-completed").off("click").on("click", function(){
    	var checked = $(this).prop("checked");
    	var showCompletedTasks;
    	if(checked){
    		showCompletedTasks = true;
    	}
    	else{
    		showCompletedTasks = false;
    	}
    	userDatabase.showCompletedTasks = showCompletedTasks;
    	uploadChanges();
    });

    // $("#btn-show-graph").off("click").on("click", setupProductivityPage);
    $(".btn-notes-view").off("click").on("click", setupNotesView);
    $(".btn-log-view").off("click").on("click", setupLogView);
    $("#btn-popup-delete-project").off("click").on("click", function(){
    	setupAddTaskPage();
    });
    $("#btn-delete-project").off("click").on("click", function(){
    	deleteProject(getCurrentProject());
    });
    $("#btn-task-page").off("click").on("click", function(){
    	setupAddTaskPage();
    });
    $(".btn-pomodoro-page").on("click", function(){
    	setupPomodoroPage();
    });
    
    $(".btn-add-productivity-page").on("click", setupAddProductivityPage);
}

// this sets up the sessions view (currently just below the charts in the productivity view)
function setupProductivityPage(){
	$("#input-date-change-units").datetimepicker({
		format: 'MMM Do, YYYY',
		useCurrent: true
	});
	// @TODO: add an event listener for when the user selects a date -- this must call populateSessionView
	$("#input-date-change-units").off("dp.change").on("dp.change", function(){
		var dateToSend = makeDateObjectFromMoment(moment($("#input-date-change-units-text").val(), 'MMM Do, YYYY'));
		dateToSend.setHours(0, 0, 0, 0);
		populateSessionView(dateToSend);
	});

	// find all sessions for a given day in this project
	var htmlUnits = '';
	
	var project = getCurrentProject();
	var projects = userDatabase.projects.slice();
	var sessions = project.sessions.slice();
	var undeletedSessions = [];
	// var unitRecords = project.unitRecords;
	var units = project.units.slice();
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	

	// cycle through all sessions, then when we find a session that took place on this day, add a button for it
	// @IMPORTANT: note this also adds the units from the given day. For this to work, there ABSOLUTELY MUST be only one "unitRecord" per day
	function populateSessionView(dateToLookAt){
		$("#txt-units-done").attr("placeholder", 0);

		var dateAsString = dateToLookAt.toISOString();

		$("#input-date-change-units-text").val(moment(dateAsString).format("MMM Do, YYYY"));

		var unitsToShow = findUnitsOnDay(project, dateAsString);
		if(typeof unitsToShow !== "undefined"){
			$("#txt-units-done").attr("placeholder", unitsToShow);
		}

		var sessionsOnThisDay = 0;

		var htmlSessionsIntro = '<h4 style="margin-top: 5px;">Sessions</h4>';
		var htmlSessions = '';
		
		htmlSessions += '<ul class="list-group" id="list-productivity-sessions">';
		for (var i=0; i<sessions.length; i++){
			var sessionDate = new Date(sessions[i].date);
			if(sessionDate.getDate() == dateToLookAt.getDate() && sessionDate.getMonth() == dateToLookAt.getMonth() && sessionDate.getFullYear() == dateToLookAt.getFullYear()){

				if(sessions[i].minutes > 0 && !sessions[i].deleted){
					// add ids and classes to each button so we can identify what to do with them when clicked...
					// btn-edit-session-i, btn-del-session-i

					sessionsOnThisDay += 1;

					var sessionLength, sessionDateHours, sessionDateMinutes;

					sessionLength = makeMinutesReadableForSession(sessions[i].minutes) + " session";
					sessionDateHours = (sessionDate.getHours() < 10) ? "0" + sessionDate.getHours() : sessionDate.getHours();
					sessionDateMinutes = (sessionDate.getMinutes() < 10) ? "0" + sessionDate.getMinutes() : sessionDate.getMinutes();

					htmlSessions += '<li class="list-group-item">  A <strong>' + sessionLength + '</strong> at ' + sessionDateHours + ':' + sessionDateMinutes + 
					'<button type="button" id="btn-del-session-' + i + '" class="btn-del-session btn btn-danger btn-xs pull-right" data-toggle="modal" data-target="#modal-del-pomodoro"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>               <button type="button" id="btn-edit-session-' + i + '" class="btn-edit-session btn btn-primary btn-xs pull-right" data-toggle="modal" data-target="#modal-edit-pomodoro"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button></li>';
				}
			}
		}
		htmlSessions += '</ul>';
		if(sessionsOnThisDay > 0){
			htmlSessionsIntro += '<p><strong>Sessions completed on this day:</strong></p>';
		}
		else{
			htmlSessionsIntro += '<p>Sessions will appear here once you\'ve done some work.</p>';
		}
		$("#div-sessions-themselves").html(htmlSessionsIntro + htmlSessions);

		$(".btn-edit-session").off("click").on("click", function(){
			var buttonId = $(this).attr("id");
			//cut actual id number off string and convert to number
			var idNumber = parseInt(buttonId.slice(17), 10);
			
			setupEditPomodoroModal(idNumber);
		});

		$(".btn-del-session").off("click").on("click", function(){
			var buttonId = $(this).attr("id");
			//cut actual id number off string and convert to number
			var idNumber = parseInt(buttonId.slice(16), 10);
			
			setupDeletePomodoroModal(idNumber);
		});
	}

	populateSessionView(today);

	// only show the panel containing the chart if productivity is being tracked
	if(getCurrentProject().trackUnits || getCurrentProject().trackTime){
		$("#panel-for-project-productivity-chart").css("display", "block");
	}
	else{
		$("#panel-for-project-productivity-chart").css("display", "none");
	}

	$("#add-units-error").css("display", "none");

	$("#btn-change-units-done").off("click").on("click", function(){
		var unitsToAdd = parseInt($("#txt-units-done").val());
		if(isNaN(unitsToAdd)){
			$("#add-units-error").css("display", "block");
		}
		else{
			if($("#input-date-change-units-text").val() == ""){
				console.log("user didn't enter a date");
			}
			else{
				var dateToSend = makeDateObjectFromMoment(moment($("#input-date-change-units-text").val(), 'MMM Do, YYYY'));
				dateToSend.setHours(0, 0, 0, 0);
				var dateToAdd = dateToSend.toISOString();

				saveUnitsOnDay(project, dateToAdd, unitsToAdd);
			}
		}
	});
}