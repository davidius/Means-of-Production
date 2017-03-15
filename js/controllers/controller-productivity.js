// show the user's productivity across projects in handy pie form
// IMPORTANT NOTE: the chart representing overall productivity is handled in charts.js
function setupProductivityView(){
	var projects = orderProjects();
	var projectsLength = lengthOfObject(projects);
	var htmlProductivityIntro = '';
	var htmlOverviewCharts = '';
	
	var arrayOfPeriods = [{string: "for today", selected: false}, {string: "for the last 7 days", selected: false}];
	switch (userDatabase.trackingPeriod) {
		case "today":
			arrayOfPeriods[0].selected = true;
			break;
		case "last 7 days":
			arrayOfPeriods[1].selected = true;
			break;
	}
	
	htmlProductivityIntro += '<h1>Your productivity</h1>';
	htmlProductivityIntro += dynamicSelect("list-period-overall", arrayOfPeriods);
	htmlProductivityIntro += dynamicWhatNeedsToBeDone({});

	for(var i=0; i<projectsLength; i++){
		htmlOverviewCharts += dynamicOverviewChartDiv(projects[i]);
	}

	$("#div-overview-charts").html(htmlOverviewCharts);
	$("#div-productivity-intro").html(htmlProductivityIntro);

	$("#list-period-overall").on("change", function(){
		switch($(this).val()){
			case "0":
				userDatabase.trackingPeriod = "today";
				break;
			case "1":
				userDatabase.trackingPeriod = "last 7 days";
				break;
		}
		uploadChanges();
	});
}