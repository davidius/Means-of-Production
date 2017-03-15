/*sets up all appropriate charts (depending on the current view)*/
function setupCharts(){
	var currentScreen = window.location.hash.substring(1);
	var projects = orderProjects();
	var projectsLength = lengthOfObject(projects);
	var pieTitle = "";

	if(userDatabase.trackingPeriod == "today"){
		pieTitle = "Today's pie of productivity";
	}
	else{
		pieTitle = "This week's pie of productivity";
	}

	// populate charts in the project view
	if(currentScreen == "view-project"){
		// show the pie chart for total productivity (both time and units), for this week
		if(getCurrentProject().trackUnits && getCurrentProject().trackTime){
			preparePie({project: getCurrentProject(), timeOrUnits: "both", target: 100, containerId: 'div-project-chart-today', title: pieTitle});
		}
		// show the pie chart for total time (this week)
		else if(getCurrentProject().trackTime){
			preparePie({project: getCurrentProject(), timeOrUnits: "time", target: getCurrentProject().targetMinutes, containerId: 'div-project-chart-today', title: pieTitle});
		}
		// show the pie for total units (this week)
		else if(getCurrentProject().trackUnits){
			preparePie({project: getCurrentProject(), timeOrUnits: "units", target: getCurrentProject().customTarget, containerId: 'div-project-chart-today', title: pieTitle});
		}
		// show the chart for hours done (this week by default)
		/*var startDate = getStartAndEndDates(start, end)[0];
		var endDate = getStartAndEndDates(start, end)[1];*/
		var end = new Date();
		end.setHours(23, 59, 59, 999);
		var start = new Date(end - 21*24*60*60*1000); // 3 weeks
		start.setHours(0, 0, 0, 0);
		
		google.charts.setOnLoadCallback(drawProductivityChart(start, end, 'div-dashboard', 'div-chart', 'div-filter'));
	}

	// populate charts in the overview view
	else if(currentScreen == "view-productivity"){
		//@TODO: the following must only be drawn if at least one project is being tracked
		preparePie({overall: true, containerId: 'div-overall-productivity', title: pieTitle});

		for(var i=0; i<projectsLength; i++){
			var elementId = 'chart-project-' + projects[i].id;
			if(projects[i].trackUnits && projects[i].trackTime){
				preparePie({project: projects[i], timeOrUnits: "both", target: 100, containerId: elementId, title: ''});
			}
			else if(projects[i].trackUnits){
				preparePie({project: projects[i], timeOrUnits: "units", target: projects[i].customTarget, containerId: elementId, title: ''});
			}
			else if(projects[i].trackTime){
				preparePie({project: projects[i], timeOrUnits: "time", target: projects[i].targetMinutes, containerId: elementId, title: ''});
			}
		}
	}
}

// options = {overall, project, timeOrUnits, target, containerId, title}
function preparePie (options){
	var overall = typeof options.overall !== "undefined" ? options.overall : false;
	var project = options.project; // not defined if pie chart is overall
	var timeOrUnits = options.timeOrUnits; // not defined if pie chart is overall
	var target = options.target; // not defined if pie chart is overall
	var containerId = options.containerId;
	var title = options.title;

	var trackingPeriod = userDatabase.trackingPeriod;

	var averageProductivity = 0;
	var averageSlacking = 0;
	
	if(overall){
		averageProductivity = getOverallProductivity().productivity;
		averageSlacking = getOverallProductivity().slacking;
	}
	else{
		averageProductivity = getAverageProductivityAndSlacking(project).productivity;
		averageSlacking = getAverageProductivityAndSlacking(project).slacking;
	}

	google.charts.setOnLoadCallback(drawProductivityPie(averageProductivity, averageSlacking, containerId, title));
}

// draws a time-based productivity pie in the project view
// options = {containerId, title}
function drawProductivityPie(average, target, containerId, title){
	if(target > 0){
		var data = new google.visualization.arrayToDataTable([
		    ['Thing being measured', 'Minutes'],
		    ['Average daily work', average],
		    ['Average daily slacking', target]
	    ]);
	}
	else{
		var data = new google.visualization.arrayToDataTable([
		    ['Thing being measured', 'Minutes'],
		    ['Average daily work', average]
	    ]);
	}
	
	var options = {
        title: title,
        is3D: true,
        sliceVisibilityThreshold: 0,
        backgroundColor: 'transparent'
    };

	if(!document.getElementById(containerId)){
		console.log("nowhere to put the chart :-(");
	}
	else{
		var chart = new google.visualization.PieChart(document.getElementById(containerId));
		chart.draw(data, options);
	}
}

// draws a chart dashboard onto the supplied HTML elements
function drawProductivityChart(startDate, endDate, dashboardId, chartId, filterId){
	var data; 
	var targetUnits = "target number of " + getCurrentProject().unitName;
	var actualUnits = getCurrentProject().unitName;

	var hAxisTitle = "Date";
	var vAxisTitle = "";

	var rangeShownStart = new Date(endDate - 6*24*60*60*1000);
	rangeShownStart.setHours(0, 0, 0, 0); 

	// get arrays for time and units worked, along with targets 
	// @TODO: this should be abstracted out

	var timeSeries = workDoneInRange({project: getCurrentProject(), start: startDate, end: endDate, timeOrUnits: "time"});
	timeSeries.unshift([{type: "date", label: "date"}, {type: "number", label: "productive time"}]);
	
	var unitSeries = workDoneInRange({project: getCurrentProject(), start: startDate, end: endDate, timeOrUnits: "units"});
	unitSeries.unshift([{type: "date", label: "date"}, {type: "number", label: actualUnits}]);
	
	var timeSeriesWithTarget = [];
	timeSeriesWithTarget[0] = [
		timeSeries[0][0],

		timeSeries[0][1],
		{type: "string", role: "tooltip", p: {html: true}},

		{type: "number", label: "target productivity"},
		{type: "string", role: "tooltip", p: {html: true}}
	];
	for(var i=1; i<timeSeries.length; i++){
		var minutesTooltip, targetTooltip;

		var minutesAsPercent = (timeSeries[i][1] / getCurrentProject().targetMinutes) * 100;

		minutesTooltip = "<div style='margin: 10px;'><p>you worked for <strong>" + makeMinutesReadable(timeSeries[i][1]) + "</strong>, which is <strong>" + minutesAsPercent.toFixed() + "%</strong> of your daily goal</p></div>";
		targetTooltip = "<div style='margin: 10px;'><p>daily target: <strong>" + getCurrentProject().targetMinutes + " minutes</strong></p></div>";

		timeSeriesWithTarget[i] = [timeSeries[i][0], timeSeries[i][1], minutesTooltip, getCurrentProject().targetMinutes, targetTooltip];
	}

	var unitSeriesWithTarget = [];
	unitSeriesWithTarget[0] = [
		unitSeries[0][0],

		unitSeries[0][1],
		{type: "string", role: "tooltip", p: {html: true}},

		{type: "number", label: targetUnits},
		{type: "string", role: "tooltip", p: {html: true}}
	];
	for(var i=1; i<unitSeries.length; i++){
		var unitsTooltip, targetTooltip;

		var unitsAsPercent = (unitSeries[i][1] / getCurrentProject().customTarget) * 100;

		unitsTooltip = "<div style='margin: 10px;'><p>you did <strong>" + unitSeries[i][1] + " " + actualUnits + "</strong>, which is <strong>" + unitsAsPercent.toFixed() + "%</strong> of your daily goal</p></div>";
		targetTooltip = "<div style='margin: 10px;'><p>daily target: <strong>" + getCurrentProject().customTarget + " " + actualUnits + "</strong></p></div>";

		unitSeriesWithTarget[i] = [unitSeries[i][0], unitSeries[i][1], unitsTooltip, getCurrentProject().customTarget, targetTooltip];
	}

	// get array for time and units worked, along with targets, but this time in terms of percent 
	// @TODO: this should be abstracted out

	var percentSeriesWithTarget = [];
	percentSeriesWithTarget[0] = [
		{type: "date", label: "date"}, 

		{type: "number", label: "productive time"}, 
		{type: "string", role: "tooltip", p: {html: true}},

		{type: "number", label: actualUnits},
		{type: "string", role: "tooltip", p: {html: true}},

		{type: "number", label: "target (both time and units)"},
		{type: "string", role: "tooltip", p: {html: true}}
	];
	for(var i=1; i<timeSeries.length; i++){
		var minutesAsPercent, unitsAsPercent, minutesTooltip, unitsTooltip, targetTooltip;

		minutesAsPercent = (timeSeries[i][1] / getCurrentProject().targetMinutes) * 100;
		unitsAsPercent = (unitSeries[i][1] / getCurrentProject().customTarget) * 100;

		minutesTooltip = "<div style='margin: 10px;'><p>you worked for <strong>" + makeMinutesReadable(timeSeries[i][1]) + "</strong>, which is <strong>" + minutesAsPercent.toFixed() + "%</strong> of your daily goal</p></div>";
		unitsTooltip = "<div style='margin: 10px;'><p>you did <strong>" + unitSeries[i][1] + " " + actualUnits + "</strong>, which is <strong>" + unitsAsPercent.toFixed() + "%</strong> of your daily goal</p></div>";
		targetTooltip = "<div style='margin: 10px;'><p>daily target</p></div>";

		percentSeriesWithTarget[i] = [timeSeries[i][0], minutesAsPercent, minutesTooltip, unitsAsPercent, unitsTooltip, 100, targetTooltip];
	}
	
	if(getCurrentProject().trackUnits && getCurrentProject().trackTime){
		data = new google.visualization.arrayToDataTable(percentSeriesWithTarget);
		vAxisTitle = "Productivity (in percent)";
	}
	else if(getCurrentProject().trackUnits){
		data = new google.visualization.arrayToDataTable(unitSeriesWithTarget);
	}
	else if(getCurrentProject().trackTime){
		data = new google.visualization.arrayToDataTable(timeSeriesWithTarget);
	}
	
	// Set chart options
	var options = {
		title:'Your awesome productivity',
		tooltip: {
			isHtml: true
		},
		hAxis: {
			format: "MMM dd, yyyy",
			title: hAxisTitle
			// maxValue: timeSeries[timeSeries.length-1][0]
		},
		vAxis: {
			format: "decimal",
			title: vAxisTitle
		},
		animation: {
			startup: "true"
		}
	};

	if(!document.getElementById(chartId)){
		console.log("nowhere to put the chart :-(");
	}
	else if(typeof data === "undefined"){
		// console.log("no data to plot");
	}
	else{
		var dashboard = new google.visualization.Dashboard(document.getElementById(dashboardId));
		
		var donutRangeSlider = new google.visualization.ControlWrapper({
			'controlType': 'ChartRangeFilter',
	        'containerId': filterId,
            'options': {
	            'filterColumnLabel': 'date',
	            'ui': {
	            	'chartOptions': {
	            		'height': 50
	            	}
	            }
	        },
	        'state': {
	        	'range':{
	        		'start': rangeShownStart, // normally timeSeries[0][0]
	        		'end': endDate
	        	}
	        }
		});

		var chart = new google.visualization.ChartWrapper({
			'chartType': 'AreaChart',
			'containerId': chartId,
			'options': options
		});

		// var chart = new google.visualization.AreaChart(document.getElementById('div-chart'));

		var formatter = new google.visualization.NumberFormat(
		    {fractionDigits: 2});
		
		formatter.format(data, 1); // Apply formatter to second column
		
		
		// $("#div-chart").html("");
		dashboard.bind(donutRangeSlider, chart);
		// chart.draw(data, options);

		dashboard.draw(data);
	}
}