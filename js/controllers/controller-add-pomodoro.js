function setupAddProductivityPage(){
	$("#input-date-add-prod").datetimepicker({
		format: 'MMM Do, YYYY HH:mm'
		// locale: moment.locale("en")
	});
	// for some reason useCurrent: true doesn't work...

	$("#modal-add-pomodoro-error").css("display", "none");

	$("#input-date-add-prod").on("dp.show", function(e){
		// by default, set the date and time to the present moment
		var today = new Date();
		$("#input-date-add-prod").data("DateTimePicker").date(moment(today));
		$("#input-date-add-prod").data("DateTimePicker").stepping(5);
	});

	$("#input-date-add-prod-text").val("");
	$("#txt-new-session").val("");

	$("#txt-new-session").attr("placeholder", "in minutes");

	$("#btn-change-prod").off("click").on("click", function(){
		var timeDone = parseInt($("#txt-new-session").val());
		var sessionDate = makeDateObjectFromMoment(moment($("#input-date-add-prod-text").val(), 'MMM Do, YYYY HH:mm'));
		
		if((timeDone != "" && !isNaN(parseInt(timeDone))) && sessionDate != "Invalid Date"){
			saveSession({timeDone: timeDone, date: sessionDate, project: getCurrentProject()});
			$("#modal-add-productivity").modal("hide");
		}
		else{
			$("#modal-add-pomodoro-error").css("display", "block");
		}
	});
}