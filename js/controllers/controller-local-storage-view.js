function setupLocalStorageView(){
	var html = '';
	var projects, tasks, username = "";

	projects = JSON.parse(localStorage["projects"]);
	tasks = JSON.parse(localStorage["tasks"]);

	username = (localStorage["username"]);
	
	html += '<h1>Username: ' + username + '</h1>';
	html += '<h1>Tasks</h1>';
	$.each(tasks, function(index, task){
		html += '<div style="background-color: lightblue; margin-bottom: 15px;">';
		html += '<p>{</p>';
			html += '<p class="tabbed">id: ' + task.id + '</p>';
			html += '<p class="tabbed">name: ' + task.name + '</p>';
			html += '<p class="tabbed">number: ' + task.number + '</p>';
			html += '<p class="tabbed">numberInPhase: ' + task.numberInPhase + '</p>';
			html += '<p class="tabbed">numberInPriorities: ' + task.numberInPriorities + '</p>';
			html += '<p class="tabbed">projectId: ' + task.projectId + '</p>';
			html += '<p class="tabbed">phase: ' + task.phase + '</p>';
			html += '<p class="tabbed">dueDate: ' + task.dueDate + '</p>';
			html += '<p class="tabbed">reminderTime: ' + task.reminderTime + '</p>';
			html += '<p class="tabbed">done: ' + task.done + '</p>';
			html += '<p class="tabbed">notes: ' + task.notes + '</p>';
			html += '<p class="tabbed">deleted: ' + task.deleted + '</p>';

			html += '<hr>';

			html += '<p class="tabbed" style="color: red;">[DEPRECATED] project: ' + task.project + '</p>';
			html += '<p class="tabbed" style="color: red;">[DEPRECATED] totalTime: ' + task.totalTime + '</p>';
			html += '<p class="tabbed" style="color: red;">[DEPRECATED] totalUnits: ' + task.totalUnits + '</p>';
			html += '<p class="tabbed" style="color: red;">[DEPRECATED] targetProductivity: ' + task.targetProductivity + '</p>';
			html += '<p class="tabbed" style="color: red;">[DEPRECATED] customTarget: ' + task.customTarget + '</p>';
			html += '<p class="tabbed" style="color: red;">[DEPRECATED] sessions: ' + task.sessions + '</p>';
		html += '<p>}</p>';
		html += '</div>';
	});
	html += '<h1>Projects</h1>';
	$.each(projects, function(index, project){
		html += '<div style="background-color: lightgrey; margin-bottom: 15px;">';
		html += '<p>{</p>'; 
		html += '<p class="tabbed">id: ' + project.id + '</p>';
		html += '<p class="tabbed"><strong>name: ' + project.name + '</strong></p>';
		html += '<p class="tabbed">number: ' + project.number + '</p>';
		html += '<p class="tabbed">phases: ' + project.phases + '</p>';
		
		html += '<p class="tabbed">standardPomodoroTime: ' + project.standardPomodoroTime + '</p>';
		html += '<p class="tabbed">standardPomodoroBreak: ' + project.standardPomodoroBreak + '</p>';
		html += '<p class="tabbed" style="color: blue;">sessions: [</p>';
		$.each(project.sessions, function(ind, session){
			html += '<p class="tabbed-twice">id: ' + session.id + '</p>';
			html += '<p class="tabbed-twice">minutes: ' + session.minutes + '</p>';
			html += '<p class="tabbed-twice">date: ' + session.date + '</p>';
			html += '<p class="tabbed-twice">deleted: ' + session.deleted + '</p>';
			html += '<p class="tabbed-twice" style="color: red;">[DEPRECATED] units: ' + session.units + '</p>';
			html += '<p class="tabbed-twice" style="color: red;">[DEPRECATED] type: ' + session.type + '</p>';
			html += '<p class="tabbed-twice" style="color: red;">[DEPRECATED] time: ' + session.time + '</p>';
		});
		html += '<p class="tabbed" style="color: blue;">]</p>';
		html += '<p class="tabbed" style="color: blue;">unitRecords: {</p>';
		$.each(project.unitRecords, function(ind, unitRecord){
			html += '<p class="tabbed-twice">date = ' + ind + '</p>';
			html += '<p class="tabbed-twice">units = ' + unitRecord + '</p>';
		});
		html += '<p class="tabbed" style="color: blue;">}</p>';
		html += '<p class="tabbed">trackUnits: ' + project.trackUnits + '</p>';
		html += '<p class="tabbed">trackTime: ' + project.trackTime + '</p>';
		html += '<p class="tabbed">unitName: ' + project.unitName + '</p>';
		html += '<p class="tabbed">customTarget: ' + project.customTarget + '</p>';
		html += '<p class="tabbed">targetMinutes: ' + project.targetMinutes + '</p>';
		html += '<p class="tabbed" style="color: blue;">log: [</p>';
		$.each(project.log, function(ind, log){
			html += '<p class="tabbed-twice">date: ' + log.date + '</p>';
			html += '<p class="tabbed-twice">note: ' + log.note + '</p>';
		});
		html += '<p class="tabbed" style="color: blue;">]</p>';
		html += '<p class="tabbed">notes: ' + project.notes + '</p>';
		html += '<p class="tabbed">deleted: ' + project.deleted + '</p>';

		html += '<hr>';
		
		html += '<p class="tabbed" style="color: red;">[DEPRECATED] standardTime: ' + project.standardTime + '</p>';
		html += '<p class="tabbed" style="color: red;">[DEPRECATED] standardBreak: ' + project.standardBreak + '</p>';
		html += '<p class="tabbed" style="color: red;">[DEPRECATED] totalUnits: ' + project.totalUnits + '</p>';
		html += '<p class="tabbed" style="color: red;">[DEPRECATED] totalTime: ' + project.totalTime + '</p>';
		html += '<p class="tabbed" style="color: red;">[DEPRECATED] totalMinutes: ' + project.totalMinutes + '</p>';
		html += '<p class="tabbed" style="color: red;">[DEPRECATED] targetProductivity: ' + project.targetProductivity + '</p>';
		html += '<p class="tabbed" style="color: red;">[DEPRECATED] units: ' + project.units + '</p>';

		html += '<p>}</p>';
		html += '</div>';
	});

	$("#div-view-local-storage").html(html);
}