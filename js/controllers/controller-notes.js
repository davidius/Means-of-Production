//called when the notes view is brought up
function setupNotesView(){
	var project = getCurrentProject();
	var notes = project.notes;

	$("#txt-notes").val(notes);

	$("#btn-save-notes").off("click").on("click", function(){
		saveNote(project, $("#txt-notes").val());
	});
}