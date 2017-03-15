function saveNote(project, userNote){
	var projects = userDatabase.projects.slice();
	var notes = project.notes.slice();

	var indexOfProject = findIndexOfProjectOrTask("project", project);

	project.notes = userNote;
	
	//save to the project, then upload...
	projects[indexOfProject] = project;
	projectsRef.set(projects);
}
