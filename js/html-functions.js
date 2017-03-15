function dynamicConstituentLabel(forElement, text){
	var html = '';
	html += '<label for="' + forElement + '">' + text + '</label>';
	return html;
}

function dynamicConstituentTextInput(id){
	var html = '';
	html += '<input type="text" class="form-control" id="' + id + '">';
	return html;
}

function dynamicConstituentDateInput(outerId, innerId){
	var html = '';

	html += '<div class="input-group date" id="' + outerId + '">';
    html += '<input type="text" class="form-control" id="' + innerId + '">';
    html += '<span class="input-group-addon">';
    html += '<span class="glyphicon glyphicon-calendar"></span>';
    html += '</span>';
    html += '</div>';

    return html;
}

function dynamicTextInput(id, text){
	var html = '';

	html += '<div class="form-group">';
	html += dynamicConstituentLabel(id, text);
	html += dynamicConstituentTextInput(id);
	html += '</div>';

	return html;
}

function dynamicDateInput(outerId, innerId, text){
	var html = '';

	html += '<div class="form-group">';
	html += dynamicConstituentLabel(outerId, text);
	html += dynamicConstituentDateInput(outerId, innerId);
	html += '</div>';

	return html;
}

// creates a list element task with an edit and delete button
// @TODO: each project should have its own unique colour
function dynamicListElementTask(task, options){
	var editIdString = '';
	var deleteIdString = '';
	var editClassString = '';
	var deleteClassString = '';
	var checkIdString = '';
	var checkClassString = '';
	var postponeIdString = '';
	var postponeClassString = '';

	var taskId = task.id;
	var taskDone = task.done;
	var taskName = task.name;
	var taskDueDate = task.dueDate;

	var associatedProjectName = findOne("project", "id", task.projectId).name;

	var projectString = '';

	if(typeof options !== "undefined"){
		// overview screen
		if(options.location == "overview"){
			editIdString = 'btn-task-overview-' + taskId;
			deleteIdString = 'btn-del-task-overview-' + taskId;
			editClassString = 'btn-task-overview';
			deleteClassString = 'btn-del-task-overview';
			checkIdString = 'check-task-overview-' + taskId;
			checkClassString = 'check-task-overview';
			postponeIdString = 'btn-task-postpone-overview-' + taskId;
			postponeClassString = 'btn-task-postpone-overview';
			projectString = '   <span class="badge" style="background-color: #ff3300; vertical-align: top;">' + associatedProjectName + '</span>';
		}
		// project screen
		else if(options.location == "project"){
			editIdString = 'btn-task-' + taskId;
			deleteIdString = 'btn-del-task-' + taskId;
			editClassString = 'btn-task';
			deleteClassString = 'btn-del-task';
			checkIdString = 'check-task-' + taskId;
			checkClassString = 'check-task';
			postponeIdString = 'btn-task-postpone-' + taskId;
			postponeClassString = 'btn-task-postpone';
		}
	}

	var html = '';
	var innerHtml = '';
	var doneOpenTag = ''; 
	var doneCloseTag = '';
	var taskDueBadge = '';
	var taskReminderIcon = '';
	var checkedString = '';

	var alternativeHtml = '';

	var taskDueDateAsFormattedString = moment(taskDueDate).format("MMM Do, YYYY");
	
	if(taskDone){
		doneOpenTag = '<del>';
		doneCloseTag = '</del>';
		checkedString = 'checked';
	}

	if(taskDueDateAsFormattedString != '' && taskDueDateAsFormattedString != 'Invalid date'){
		taskDueBadge = ' <span class="badge" style="background-color: blue; vertical-align: top;">' + taskDueDateAsFormattedString + '</span>';
	}

	if(task.reminderTime != "") {
		taskReminderIcon = ' <span class="glyphicon glyphicon-time" aria-hidden="true"></span> '
	}

	html += '<li class="list-group-item clearfix">';
		html += '<span class="pull-left">';
			html += '<input type="checkbox" class="' + checkClassString + '" id="' + checkIdString + '" ' + checkedString + '>   ';
		html += '</span>';

		html += '<span class="list-group-item-text">';
			html += '<em style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 60%; margin-left: 7px;">' + doneOpenTag + taskName + '      ' + doneCloseTag + '</em>' + projectString;
		html += '</span>';

		innerHtml = taskReminderIcon + taskDueBadge + ' ';
		innerHtml += '<div class="btn-group"> <button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <span class="glyphicon glyphicon-wrench" aria-hidden="true"></span> <span class="caret"></span>  </button> <ul class="dropdown-menu dropdown-menu-right">'; 

			innerHtml += '<li>';
				innerHtml += '<a class="' + editClassString + '" id="' + editIdString + '" data-toggle="modal" data-target="#modal-edit-task">';
				innerHtml += '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>   Edit task';
				innerHtml += '</a>';
			innerHtml += '</li>';

			innerHtml += '<li role="separator" class="divider"></li>';

			innerHtml += '<li>';
				innerHtml += '<a class="' + postponeClassString + '" id="' + postponeIdString + '" >';
				innerHtml += '<span class="glyphicon glyphicon-hand-right" aria-hidden="true"></span>   Due tomorrow';
				innerHtml += '</a>';
			innerHtml += '</li>';

			innerHtml += '<li role="separator" class="divider"></li>';

			innerHtml += '<li>';
				innerHtml += '<a class="' + deleteClassString + '" id="' + deleteIdString + '" data-toggle="modal" data-target="#modal-delete-task">'
				innerHtml += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>  Delete task';
				innerHtml += '</a>';
			innerHtml += '</li>';

		innerHtml += '</ul></div>';

		html += '<span class="pull-right">';
		html += innerHtml;
		html += '</span>';
		
	html += '</li>';

	alternativeHtml += '<li class="list-group-item clearfix" style="display: none;">';
	alternativeHtml += '<a class="' + editClassString + '" id="' + editIdString + '"></a>';
	alternativeHtml += '</li>';

	if(task.done && !userDatabase.showCompletedTasks){
		return alternativeHtml;
	}
	else{
		return html;
	}	
}

function dynamicOverviewList(list){
	var html = '';

	html += '<ul class="list-group">';
	for (var i=0; i<list.length; i++){
		if(list[i].dueDate != "" && !list[i].done){
			html += dynamicListElementTask(list[i], {location: "overview"});
		}
	}
	html += '</ul>';

	return html;
}

function dynamicWhatNeedsToBeDone(options){
	// options = {project}; if the options object is empty, we are scanning all projects
	var projects = orderProjects();
	var projectsLength = lengthOfObject(projects);

	var html = '';

	// determine what it should say when the user has overachieved
	var superProductiveString = "";
	switch (userDatabase.trackingPeriod){
		case "today":
			superProductiveString = "You're super-productive today! Why not put your feet up for a bit?";
			break;
		case "last 7 days":
			superProductiveString = "You're super-productive this week! Why not put your feet up for a bit?";
			break;
		default:
			superProductiveString = "You're super-productive this week! Why not put your feet up for a bit?";
	}

	// check if project is undefined (ie if we need to check for ALL projects, not just one)
	if(typeof options.project === "undefined"){
		var whatNeedsToBeDone = collateWhatNeedsToBeDone();
		var arrWhatNeedsToBeDone = [];

		var catchupMinutes = whatNeedsToBeDone.minutes;
		var catchupUnits = whatNeedsToBeDone.units;
		
		// make an array from whatNeedsToBeDone
		$.each(catchupUnits, function(index, elem){
			arrWhatNeedsToBeDone.push({unitName: index, unitAmount: elem});
		});

		if(whatNeedsToBeDone.total > 0){
			html += '<p>In total, you need to do <strong>' + makeMinutesReadable(catchupMinutes) + '</strong> of work';
			if(arrWhatNeedsToBeDone.length > 2){
				html += ', plus ';
				for(var i=0; i<arrWhatNeedsToBeDone.length; i++){
					if(i == arrWhatNeedsToBeDone.length - 1){
						html += 'and <strong>' + arrWhatNeedsToBeDone[i].unitAmount + ' ' + arrWhatNeedsToBeDone[i].unitName + '</strong>.</p>';
					}
					else{
						html += '<strong>' + arrWhatNeedsToBeDone[i].unitAmount + ' ' + arrWhatNeedsToBeDone[i].unitName + '</strong>, ';
					}
				}
			}
			else if(arrWhatNeedsToBeDone.length == 2){
				html += ', plus ';
				for(var i=0; i<arrWhatNeedsToBeDone.length; i++){
					if(i == arrWhatNeedsToBeDone.length - 1){
						html += 'and <strong>' + arrWhatNeedsToBeDone[i].unitAmount + ' ' + arrWhatNeedsToBeDone[i].unitName + '</strong>.</p>';
					}
					else{
						html += '<strong>' + arrWhatNeedsToBeDone[i].unitAmount + ' ' + arrWhatNeedsToBeDone[i].unitName + '</strong> ';
					}
				}
			}
			else if(arrWhatNeedsToBeDone.length == 1){
				html += ', plus ';
				html += '<strong>' + arrWhatNeedsToBeDone[0].unitAmount + ' ' + arrWhatNeedsToBeDone[0].unitName + '</strong>.</p>';
			}
			else{
				html += '.</p>';
			}
		}
	}
	else {
		var project = options.project;
		var whatNeedsToBeDone = whatNeedsToBeDoneForProject(project);

		var targetMinutes = Math.round((project.targetMinutes));
		var catchupMinutes = whatNeedsToBeDone.minutes;
		var targetUnits = Math.round(project.customTarget);
		var catchupUnits = whatNeedsToBeDone.units;

		var totalCatchup = whatNeedsToBeDone.total;

		if(project.trackUnits && project.trackTime){
			html += '<p>Target productivity: <strong>' + targetUnits + ' ' + project.unitName + '</strong> and <strong>' +  makeMinutesReadable(targetMinutes) + ' per day</strong>.</p>';
			
			if(parseInt(catchupUnits) > 0 && parseInt(catchupMinutes) > 0){
				html += '<p>You need to do <strong>' + parseInt(catchupUnits) + ' more ' + project.unitName + '</strong> and <strong>' + makeMinutesReadable(parseInt(catchupMinutes)) + ' </strong> to be on track.</p>';
			}
			else if(parseInt(catchupUnits) > 0 && parseInt(catchupMinutes) <= 0){
				html += '<p>You need to do <strong>' + parseInt(catchupUnits) + ' more ' + project.unitName + '</strong> to be fully on track.</p>';
			}
			else if(parseInt(catchupMinutes) > 0 && parseInt(catchupUnits) <= 0){
				html += '<p>You need to work for <strong>' + makeMinutesReadable(parseInt(catchupMinutes)) + '</strong> more minutes to be fully on track.</p>';
			}
			else{
				html += '<p>' + superProductiveString + '</p>';
			}
		}
	
		else if(project.trackTime){
			html += '<p>Target productivity: <strong>' + makeMinutesReadable(targetMinutes) + ' per day</strong>.</p>';
			if(catchupMinutes > 0){
				html += '<p>You need to work <strong>' + makeMinutesReadable(parseInt(catchupMinutes)) + '</strong> to be on track.</p>';
			}
			else{
				html += '<p>' + superProductiveString + '</p>';
			}
		}
	
		else if(project.trackUnits){
			html += '<p>Target productivity: <strong>' + targetUnits + ' ' + project.unitName + ' per day</strong>.</p>';
			if(catchupUnits > 0){
				html += '<p>You need to do <strong>' + parseInt(catchupUnits) + ' more ' + project.unitName + '</strong> to be on track.</p>';
			}
			else{
				html += '<p>' + superProductiveString + '</p>';
			}
		}
	}

	return html;
}

function dynamicOverviewChartDiv(project){
	var html = '';

	if(dynamicWhatNeedsToBeDone({project: project}) != ""){
		html += '<div class="col-md-6" style="height: 275px;">';
		html += '<p><strong>' + project.name + '</strong></p>';
		html += dynamicWhatNeedsToBeDone({project: project});
		
		html += '<div id="chart-project-' + project.id + '"></div>';

		html += '</div>';
	}

	return html;
}

function dynamicDropdown(id, buttonString, list){
	var html = '';

	html += '<div class="dropdown">';
	html += '<button class="btn btn-default dropdown-toggle" type="button" id="' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' + buttonString + '<span class="caret"></span></button>';
	html += '<ul class="dropdown-menu" aria-labelledby="' + id + '">';
	for (var i=0; i<list.length; i++){
		html += '<li><a href="#">' + list[i] + '</a></li>';
	}
	html += '</ul></div>';

	return html;
}

function dynamicSelect(id, list, options){
	// options could contain title/label
	var html = '';
	var selected = '';

	html += '<select class="form-control" id="' + id + '">';
	for(var i=0; i<list.length; i++){
		if(list[i].selected){
			selected = ' selected = "selected"';
		}
		html += '<option' + selected + ' value="' + i + '" ' + '>' + list[i].string + '</option>';
		selected = '';
	}
	html += '</select>';

	return html;
}

function dynamicOverallLog(individualLog, numberIsOdd){
	// each individualLog contains a note, a date, and the associated project name
	// "odd" is a boolean - true if the log is an odd number, false if even
	var html = '';
	var logDate = moment(new Date(individualLog.date)).format("dddd, MMMM Do YYYY");
	var bgColour;
	var projectId = findOne("project", "name", individualLog.project).id;

	var dateObject = new Date(individualLog.date);
	
	var btnIdAsObject = {object: 'del-btn', projectId: projectId, date: dateObject.getDate(), month: dateObject.getMonth(), year: dateObject.getFullYear()};
	var btnId = JSON.stringify(btnIdAsObject);

	var divIdAsObject = {object: 'div-log', projectId: projectId, date: dateObject.getDate(), month: dateObject.getMonth(), year: dateObject.getFullYear()};
	var divId = JSON.stringify(divIdAsObject);
	
	if(numberIsOdd){
		bgColour = "rgba(249, 72, 116, 0.3)";
	}
	else{
		bgColour = "rgba(42, 246, 249, 0.3)";
	}

	html += "<div id='" + divId + "' class='row' style='padding: 10px; margin-bottom: 10px; border-radius: 5px; background-color: " + bgColour + "'>";
		html += '<div class="col-md-8">';
			html += '<textarea class="input-overall-log form-control" style="margin-bottom: 10px; resize: vertical; background-color: rgba(0, 0, 0, 0);" rows="4">' + individualLog.note + '</textarea>';
		html += '</div>';
		html += '<div class="col-md-4">';
			html += '<p>' + logDate + '</p>';
			html += '<p>(from project <strong>' + individualLog.project + '</strong>)</p>';
			html += "<button type='button' class='btn btn-danger btn-del-overall-log' id='" + btnId + "'>";
				html += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span><span class="hidden-xs"></span>';
			html += '</button>';
		html += '</div>';
	html += '</div>';

	return html;
}