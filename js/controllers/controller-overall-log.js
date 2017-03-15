function setupOverallLogView(){
	var htmlToAdd = '';
	var projects = orderProjects();
	var overallLog = [];
	var htmlProject = '';

	$("#modal-overall-log-error").css("display", "none");

	// populate the overallLog array
	for(var i=0; i<projects.length; i++){
		var project = projects[i];
		var projectLog = project.log;
		if(projectLog.length > 0){
			for(var j=0; j<projectLog.length; j++){
				if(projectLog[j].note != ""){
					overallLog.push({date: projectLog[j].date, note: projectLog[j].note, project: project.name});
				}
			}
		}
	}
	// order the overallLog array by date
	overallLog.sort(function(a, b){
		return makeDateObject(b.date) - makeDateObject(a.date);
	});

	// display the ordered overallLog array
	for(var i=0; i<overallLog.length; i++){
		var numberIsOdd;
		numberIsOdd = (parseInt(i+1) % 2 == 0) ? false : true;
		htmlToAdd += dynamicOverallLog(overallLog[i], numberIsOdd);
	}

	$("#div-overall-log").html(htmlToAdd);


	if(overallLog.length == 0){
		$("#div-overall-log-intro").css("display", "block");
	}


	$(".input-overall-log").off("keyup").on("keyup", function(){
		var newText = $(this).val();
		$("#btn-overall-log-save-changes").prop("disabled", false);
	});
	$(".btn-del-overall-log").off("click").on("click", function(){
		var objId = JSON.parse($(this).prop("id"));
		
		var date = new Date(objId.year, objId.month, objId.date);
		var projectId = objId.projectId;
		var project = findOne("project", "id", projectId);
		var note = $(this).parent().find(".input-overall-log").val();

		deleteLog(project, date);
	});



	// populate the project dropdown
	for (var i=0; i<projects.length; i++) {
		htmlProject += "<option value = \"" + projects[i].name + "\">" + projects[i].name + "</option>";
	}
	$("#dropdown-log-project").html(htmlProject);

	$("#input-date-overall-log").datetimepicker({
		format: 'MMM Do, YYYY'
	});

	$("#btn-save-overall-log").off("click").on("click", function(){
		var dateToAdd = makeDateObjectFromMoment(moment($("#input-date-overall-log-text").val(), 'MMM Do, YYYY'));
		var associatedProject = findOne("project", "name", $("#dropdown-log-project").val());

		if($("#input-date-overall-log-text").val() != "" && $("#txt-overall-log").val() != ""){
			addLog(associatedProject, dateToAdd, $("#txt-overall-log").val());
			$("#modal-overall-log").modal("hide");
		}
		else{
			$("#modal-overall-log-error").css("display", "block");
		}
	});

	$("#btn-overall-log-save-changes").off("click").on("click", function(){
		var arrayOfDivs = $("#div-overall-log").children("div");
		$.each(arrayOfDivs, function(index, elem){
			var objId = JSON.parse($(elem).prop("id"));

			var date = new Date(objId.year, objId.month, objId.date);
			var projectId = objId.projectId;
			var project = findOne("project", "id", projectId);
			var note = $(elem).find(".input-overall-log").val();
			
			addLog(project, date, note);
		});
	});
}

