function setupAddProjectPage(){
	$("#modal-add-project-error").css("display", "none");
	$("#btn-add-project").off("click").on("click", function(){
		var added = addProject();
		if(!added){
			$("#modal-add-project-error").css("display", "block");
		}
	});
	$("#txt-project").val("");
}

function setupAddTaskPage(){
	$("#modal-add-task-error").css("display", "none");
	$("#btn-add-task").off("click").on("click", function(){
		var added = addTask();
		if(!added){
			$("#modal-add-task-error").css("display", "block");
		}
	});
	$("#txt-task").val("");
}