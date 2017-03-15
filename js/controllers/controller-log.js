//called when the log view is brought up
function setupLogView(){
	$("#modal-log-error").css("display", "none");
	
	$("#btn-save-log").off("click").on("click", function(){
		var dateToAdd = makeDateObjectFromMoment(moment($("#input-date-log-text").val(), 'MMM Do, YYYY'));
		if(dateToAdd != "Invalid Date" && $("#txt-log").val() != ""){
			addLog(getCurrentProject(), dateToAdd, $("#txt-log").val());
			$("#modal-log").modal("hide");
		}
		else{
			$("#modal-log-error").css("display", "block");
		}
	});
	$("#input-date-log").datetimepicker({
		format: 'MMM Do, YYYY'
	});
	$("#input-date-log").off("dp.change").on("dp.change", function(){
		var dateToView = makeDateObjectFromMoment(moment($("#input-date-log-text").val(), 'MMM Do, YYYY'));
		refreshLogView(getCurrentProject(), dateToView);
	});
	$("#input-date-log-text").val("");
	$("#txt-log").val("");
}

function refreshLogView(project, userDate){
	var log = project.log;
	var matchIndex = -1;

	//cycle through the log array to see if the user-given date matches any date in the array
	for(var i=0; i<log.length; i++){
		var noteDate = new Date(log[i].date);
		if(Date.parse(noteDate) == Date.parse(userDate)){
			matchIndex = i;
		}
	}

	//if there was a match, show the appropriate saved note
	if(matchIndex >= 0){
		$("#txt-log").val(log[matchIndex].note);
	}
	else{
		$("#txt-log").val("");
	}
}