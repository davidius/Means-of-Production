// $(".li-task a").css("background-color", "#B295DE");

// react when the user interacts with the project list (in the left navbar)
function sortMainList(){
	$("#list-main").sortable({
	    revert: true,
	    connectWith: "#list-main",
	    placeholder: "ui-state-highlight",
	    stop: function(){
	    	var listElements = $(this).find("li"); // an array of every li in the list. Each element becomes the id of the corresponding project
	    	var arrangedProjects = [];
	    	var localProjects = userDatabase.projects.slice();
	    	var willRefresh;

	    	// for every list element, create a corresponding element in arrangedProjects (the project with matching id)
	    	$.each(listElements, function(index, elem){
	    		listElements[index] =  $(elem).find("a.btn-proj").prop("id");
	    		var chopIndex = listElements[index].lastIndexOf("-");
				listElements[index] = listElements[index].slice(chopIndex + 1);
				
				arrangedProjects[index] = findOne("project", "id", listElements[index]);
				arrangedProjects[index].number = index;
	    	});

	    	$.each(arrangedProjects, function(index, elem){
	    		var indexOfProject = findIndexOfProjectOrTask("project", elem);
	    		localProjects[indexOfProject].number = elem.number;
	    	});
	    	
	    	userDatabase.projects = localProjects.slice();
	    	// console.log("uploading changes...");
			uploadChanges();
		},
		// the following allows JQuery UI to process the drag and the click separately, without conflict
		helper: "clone"
	});
}

// react when the user interacts with task lists
function sortTaskLists(){
	//the following governs lists in kanban view
	$( ".connectedSortable" ).sortable({
	    revert: true,
	    connectWith: ".connectedSortable",
	    placeholder: "ui-state-highlight",
	    dropOnEmpty: true,
	    //deal with an item being dropped into a list
	    receive: function(){
	    	var listElements = $(this).children("li");
	    	var arrangedTasks = [];
	    	localTasks = userDatabase.tasks.slice();

	    	var ulID = $(this).prop("id");
	    	var cutIndex = ulID.lastIndexOf("-");
	    	ulID = ulID.slice(cutIndex + 1);
	    	
	    	$.each(listElements, function(index, elem){
	    		listElements[index] =  $(elem).find(".btn-task").prop("id");
	    		var chopIndex = listElements[index].lastIndexOf("-");
				listElements[index] = listElements[index].slice(chopIndex + 1); //change each element of listElements to id of the "list element"

	    		arrangedTasks[index] = findOne("task", "id", listElements[index]);
	    		arrangedTasks[index].phase = getCurrentProject().phases[ulID];
	    		arrangedTasks[index].numberInPhase = index;
	    	});

	    	$.each(arrangedTasks, function(index, elem){
	    		var indexOfTask = findIndexOfProjectOrTask("task", elem);
	    		localTasks[indexOfTask].phase = elem.phase;
	    		localTasks[indexOfTask].numberInPhase = elem.numberInPhase;
	    	});

	    	userDatabase.tasks = localTasks;
			// uploadChanges();
		},
	    //deal with rearrangements in each list
	    stop: function(){
	    	var listElements = $(this).children("li");
	    	var arrangedTasks = [];
	    	localTasks = userDatabase.tasks.slice();

	    	$.each(listElements, function(index, elem){
	    		listElements[index] =  $(elem).find(".btn-task").prop("id");
	    		var chopIndex = listElements[index].lastIndexOf("-");
				listElements[index] = listElements[index].slice(chopIndex + 1);

	    		arrangedTasks[index] = findOne("task", "id", listElements[index]);
	    		arrangedTasks[index].numberInPhase = index;
	    	});

	    	$.each(arrangedTasks, function(index, elem){
	    		var indexOfTask = findIndexOfProjectOrTask("task", elem);
	    		localTasks[indexOfTask].numberInPhase = elem.numberInPhase;
	    	});

	    	userDatabase.tasks = localTasks;
			// uploadChanges();
		}
	});

	//the following governs the to do list
	$( "#list-project-todo" ).sortable({
	    revert: true,
	    connectWith: "#list-project-todo",
	    placeholder: "ui-state-highlight",
	    stop: function(){
	    	var listElements = $(this).children("li");
	    	var arrangedTasks = [];
	    	localTasks = userDatabase.tasks.slice();

	    	$.each(listElements, function(index, elem){
	    		listElements[index] =  $(elem).find(".btn-task").prop("id");
	    		var chopIndex = listElements[index].lastIndexOf("-");
				listElements[index] = listElements[index].slice(chopIndex + 1);

				arrangedTasks[index] = findOne("task", "id", listElements[index]);
	    		arrangedTasks[index].number = index;
	    	});

	    	$.each(arrangedTasks, function(index, elem){
	    		var indexOfTask = findIndexOfProjectOrTask("task", elem);
	    		localTasks[indexOfTask].number = elem.number;
	    	});
	    	
	    	userDatabase.tasks = localTasks;
			// uploadChanges();
		}
	});
}

// populate the project list
function populateProjectList(){
	var htmlToAdd = '';
	var htmlToAddForCollapsibleMenu = '';
	var projects = orderProjects();
	var projectsLength = lengthOfObject(projects);

	// for each project, add a link in the sidebar
	for (var i=0; i<projectsLength; i++){
		var tasks = orderList(findMany("tasks", "projectId", projects[i]), "todo", projects[i]); //for the purpose of finding the number of tasks only
		for (var j=tasks.length-1; j>=0; j--){
			if(tasks[j].done){
				tasks.splice(j, 1);
			}
		}
		var tasksLengthString = '';
		var hrefString = '';
		
		if(tasks.length > 0){
			tasksLengthString = '   <span class="badge">' + tasks.length + '</span>';
		}
		else{
			tasksLengthString = '';
		}

		htmlToAdd += '<li><a href="#view-project" class="btn-proj" id="btn-proj-' + projects[i].id + '"><strong>' + projects[i].name + tasksLengthString + '</strong></a></li>';

		htmlToAddForCollapsibleMenu += '<li><a href="#view-project" class="btn btn-link visible-xs-block mobile-btn btn-coll-proj" id="btn-coll-proj-' + projects[i].id + '"><strong>' + projects[i].name + tasksLengthString + '</strong></a></li>';
	}

	$("#list-main").html(htmlToAdd);
	sortMainList();

	$("#ul-user-span").html(htmlToAddForCollapsibleMenu);
}