//IMPORTANT: in order to add an object to localStorage, you have to JSON.stringify() it first, then to retrieve it, you have to JSON.parse() it.

var userDatabase = {};

var refreshes = 0;
var html = {};

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

}

function startUp(){
	// console.log("startUp() called... (this does nothing more than set the platform)");
	if (Modernizr.localstorage) {
		// window.localStorage is available!
		var d = new Date();
		var str = window.location.href;

		//mobile
		if(str.indexOf("mobile.html") == -1){
			localStorage["platform"] = "web";
		}
		//web
		else{
			localStorage["platform"] = "mobile";
		}
	} else {
		//what???
	}
}

$(document).on({
	// anything here?
})

//Note that the following simply means $(document).ready(function(){...});
$(function() {
	
});

/*--------------------------firebase stuff-----------------------------------------------------*/

var databaseRef;

var tasksRef, projectsRef, lastSavedRef, versionRef, loggedInRef, usernameRef, emailRef, firstNameRef, lastNameRef, verifiedRef, currentTaskRef, currentProjectRef, todoPreferenceRef, trackingPeriodRef, showCompletedTasksRef;

var currentUid = null;
var signedInUser;

// FirebaseUI config. Uncomment when we've entirely switched to firebase
/*uiConfig = {
  callbacks: {
    signInSuccess: function(user, credential, redirectUrl){
      handleSignedInUser(user);
      // do not redirect
      return false;
    }
  },
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  signInFlow: "popup",
  // Terms of service url.
  tosUrl: '<your-tos-url>'
};

// Initialize the FirebaseUI Widget using Firebase.
ui = new firebaseui.auth.AuthUI(firebaseAppAuth);*/

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
	  // The observer is also triggered when the user's token has expired and is
	  // automatically refreshed. In that case, the user hasn't changed so we should
	  // not update the UI.
	  refreshes = 0;
	  if (user && user.uid == currentUid) {
	    return;
	  }
	  signedInUser = user;
	  user ? handleSignedInUser(user) : handleSignedOutUser();
});

function uploadUserDatabaseToFirebase(user){
	databaseRef.set({
    	tasks: userDatabase.tasks,
    	projects: userDatabase.projects,
    	version: userDatabase.version,
    	email: userDatabase.email,
    	firstName: userDatabase.firstName,
    	lastName: userDatabase.lastName,
    	verified: userDatabase.verified,
    	todoPreference: userDatabase.todoPreference,
    	trackingPeriod: userDatabase.trackingPeriod,
    	showCompletedTasks: userDatabase.showCompletedTasks
    }).then(function(){
    	console.log("successfully uploaded to firebase");
    	refresh();
    });
}

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
	$(window).on('hashchange', refresh); // @TODO: hashChange() just loads refresh()...

	currentUid = user.uid;
	databaseRef = firebaseAppDatabase.ref("/users/" + user.uid);

    tasksRef = firebaseAppDatabase.ref("/users/" + user.uid + "/tasks/");
    projectsRef = firebaseAppDatabase.ref("/users/" + user.uid + "/projects/");
    versionRef = firebaseAppDatabase.ref("/users/" + user.uid + "/version/");
    loggedInRef = firebaseAppDatabase.ref("/users/" + user.uid + "/loggedIn/");
    emailRef = firebaseAppDatabase.ref("/users/" + user.uid + "/email/");
    firstNameRef = firebaseAppDatabase.ref("/users/" + user.uid + "/firstName/");
    lastNameRef = firebaseAppDatabase.ref("/users/" + user.uid + "/lastName/");
    verifiedRef = firebaseAppDatabase.ref("/users/" + user.uid + "/verified/");
    todoPreferenceRef = firebaseAppDatabase.ref("/users/" + user.uid + "/todoPreference/");
    trackingPeriodRef = firebaseAppDatabase.ref("/users/" + user.uid + "/trackingPeriod/");
    showCompletedTasksRef = firebaseAppDatabase.ref("/users/" + user.uid + "/showCompletedTasks/");

	databaseRef.on("value", function(snapshot){
		userDatabase.tasks = snapshot.val().tasks ;
		userDatabase.projects = snapshot.val().projects;
		userDatabase.version = snapshot.val().version;
		userDatabase.email = snapshot.val().email;
		userDatabase.firstName = snapshot.val().firstName;
		userDatabase.lastName = snapshot.val().lastName;
		userDatabase.verified = snapshot.val().verified;
		userDatabase.todoPreference = snapshot.val().todoPreference;
		userDatabase.trackingPeriod = snapshot.val().trackingPeriod;
		userDatabase.showCompletedTasks = snapshot.val().showCompletedTasks;

		setupUser();
		refresh();
	});
	
  // the following checks for changes to firebase, then updates the UI. Doesn't apply yet
  /*tagsRef.on('value', (snap) => {
    localTags = [];
    snap.forEach((child) => {
      localTags.push(child.val());
    });
  });
  itemsRef.on('value', (snap) => {
    localItems = [];
    snap.forEach((child) => {
      localItems.push(child.val());
    });
    refresh();
  });*/
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
	$(window).on('hashchange', populateLandingPage);

	$(".offline-ui.offline-ui-up").css("display", "none");
	
	populateLandingPage();
	/*userIsSignedIn = false;
    ui.start('#signed-out', uiConfig);*/
};

/*----------------refreshing, etc.------------------------------------------------------------------------------*/

//IMPORTANT: whenever the project or task buttons are clicked (whichever type), the current project, task, etc. are set

// refreshes the page
function refresh(){
	var $mainContent;
    var $pageWrap;
    var baseHeight;
    var $el;
    
	var newHash = window.location.hash.substring(1);
    $("#main").removeClass("pinkish");

	if(newHash == ''){
		newHash = 'main';
	}

	// do the following only if it's the first load
	if(refreshes == 0){
		var promiseApp = new Promise(function(resolve, reject){
			$("#div-dynamic-app").load("subpages/app.html", function(){
				html.app = $("#div-dynamic-app").html();
				resolve("loaded app");
			});
		});
		var promiseOverview = new Promise(function(resolve, reject){
			$("#div-dynamic-overview").load("subpages/main.html", function(){
				html.overview = $("#div-dynamic-overview").html();
				resolve("loaded overview");
			});
		});
		var promiseProject = new Promise(function(resolve, reject){
			$("#div-dynamic-project").load("subpages/view-project.html", function(){
				html.project = $("#div-dynamic-project").html();
				resolve("loaded project view");
			});
		});
		var promiseProductivity = new Promise(function(resolve, reject){
			$("#div-dynamic-productivity").load("subpages/view-productivity.html", function(){
				html.productivity = $("#div-dynamic-productivity").html();
				resolve("loaded productivity view");
			});
		});
		var promiseOverallLog = new Promise(function(resolve, reject){
			$("#div-dynamic-overall-log").load("subpages/view-log.html", function(){
				html.overallLog = $("#div-dynamic-overall-log").html();
				resolve("loaded overall log view");
			});
		});
		var promiseSettings = new Promise(function(resolve, reject){
			$("#div-dynamic-settings").load("subpages/view-settings.html", function(){
				html.settings = $("#div-dynamic-settings").html();
				resolve("loaded settings view");
			});
		});
		var promiseAbout = new Promise(function(resolve, reject){
			$("#div-dynamic-about").load("subpages/view-about.html", function(){
				html.about = $("#div-dynamic-about").html();
				resolve("loaded about view");
			});
		});
		var promisePomodoro = new Promise(function(resolve, reject){
			$("#div-dynamic-pomodoro").load("subpages/pomodoro-clock.html", function(){
				html.pomodoro = $("#div-dynamic-pomodoro").html();
				resolve("loaded pomodoro view");
			});
		});
		var promiseLocalStorage = new Promise(function(resolve, reject){
			$("#div-dynamic-local-storage").load("subpages/view-local-storage.html", function(){
				html.localStorage = $("#div-dynamic-local-storage").html();
				resolve("loaded local storage view");
			});
		});
		
		Promise.all([promiseApp, promiseOverview, promiseProject, promiseProductivity, promiseOverallLog, promiseSettings, promiseAbout, promisePomodoro, promiseLocalStorage]).then(values => {
			$("#body-index").html(html.app);

			$("#div-dynamic-app").html("");
			$("#div-dynamic-overview").html("");
			$("#div-dynamic-project").html("");
			$("#div-dynamic-productivity").html("");
			$("#div-dynamic-overall-log").html("");
			$("#div-dynamic-settings").html("");
			$("#div-dynamic-about").html("");
			$("#div-dynamic-pomodoro").html("");
			$("#div-dynamic-add-project-modal").html("");
			$("#div-dynamic-local-storage").html("");

			populateMainContent(newHash);
		}).catch(reason => {
			// console.log(reason);
		});
	}
	else{
		populateMainContent(newHash);
	}
	
	refreshes++;
    
	$(".sortable").sortable();
	$(".sortable").disableSelection();
}

function hashChange(){
	refresh();
}

function setupButtonsEtc(newHash){
	$(".mobile-btn").off("click");

    /*$(".nav-sidebar li a").off("click").on("click", function(){
    	$(".nav-sidebar li a").removeClass("active");
    	$(this).addClass("active");
    });*/

   	$("#signupForm").on("submit", handleSignup);
	$("#signinForm").on("submit", function(){
		handleSignin(false, $("#username", form).val(), $("#password", form).val());
	});
	$("#signoutButton").off("click").on("click", handleSignout);
	$("#btn-ensure-complete").off("click").on("click", setupUser);
	// $("#btn-sync").off("click").on("click", syncThenRefresh); 

	$("#view-pomodoro").html(html.pomodoro);
	setupPomodoroClock();

	$(".btn-proj").off("click").on("click", function(){
		setCurrentProject($(this).attr("id"));
		refresh();
	});
	
	$(".mobile-btn").on("click", function(){
		$("#navbar").removeClass("in");
		$("#navbar").attr("aria-expanded", "false");
	});
	$(".btn-coll-proj").on("click", function(){
		setCurrentProject($(this).attr("id"));
		refresh();
	});
	
	$("#btn-project-page").off("click").on("click", function(){
		setupAddProjectPage();
	});
	$("#btn-coll-add-project").on("click", function(){
		setupAddProjectPage();
	});
}

// populates the main window of the app, as well as the main list of projects
function populateMainContent(newHash){
	var htmlToLoad;
	// console.log("newHash is " + newHash);
	if(newHash == "main"){
		htmlToLoad = html.overview;
	}
	else if(newHash == "view-project"){
		htmlToLoad = html.project;
	}
	else if(newHash == "view-productivity"){
		htmlToLoad = html.productivity;
	}
	else if(newHash == "view-log"){
		htmlToLoad = html.overallLog;
	}
	else if(newHash == "view-about"){
		htmlToLoad = html.about;
	}
	else if(newHash == "view-settings"){
		htmlToLoad = html.settings;
	}
	else if(newHash == "local-storage"){
		htmlToLoad = html.localStorage;
	}
	else{
		htmlToLoad = html.overview;
	}
	
	$("#view-main")
	    .fadeOut(200, function() {
        	$("#view-main").hide().html(htmlToLoad);
        	
        	populateProjectList();
        	
        	if(newHash == "main"){
        		setupOverviewPage();
        	}
        	else if(newHash == "view-project"){
        		setupProjectPage();
        	}
        	else if(newHash == "view-productivity"){
        		setupProductivityView();
        	}
        	else if(newHash == "view-log"){
        		setupOverallLogView();
        	}
        	else if(newHash == "view-settings"){
        		setupSettingsView();
        	}
        	else if(newHash == "local-storage"){
        		setupLocalStorageView();
        	}
        	else{
        		setupOverviewPage();
        	}
        	
        	setupButtonsEtc();

        	moment.updateLocale('en', {
        	    week: {
        	    	dow: 1
        	    }
        	});

        	// IMPORTANT NOTE: it's the damned animation that causes the flash
        	// however, it would be nice to include the animation, so figure out a way to include it
        	$("#view-main").fadeIn(500, function() {
                var timeout = window.setTimeout(setupCharts, 500);
                refreshInspirationalQuote();
            });
        });
}

function populateLandingPage(){
	var newHash = "";
	
	$mainContent = $("#body-index");

	newHash = window.location.hash.substring(1);
	/*if(newHash == ''){
		newHash = 'view-landing';
	}*/
	if(newHash != 'view-landing' && newHash != 'view-signin' && newHash != 'view-signup'){
		newHash = 'view-landing';
	}

	if(newHash == 'view-landing' || newHash == 'view-signin' || newHash == 'view-signup') {
		$("#main").addClass("pinkish");
	}
	
    $mainContent.load("subpages/" + newHash + ".html", function() {
    	if(newHash == "view-signup"){
    		setupSignupView();
    	}
		$("#submitSigninButton").off("click").on("click", function(){
			handleSignin(false, $("#username").val(), $("#password").val());
		});
    });    
}

function refreshInspirationalQuote(){
	var randomNumber = Math.floor(Math.random() * 4) + 1;
	var inspirationalQuote;
	
	switch(randomNumber){
		case 1:
			inspirationalQuote = '"Concentration, see. I suspect that\'s the key with you hugely successful types." - <em>Al Swearengen, Deadwood</em>';
			break;
		case 2:
			inspirationalQuote = '"Life. Sometimes it seems like one vile task after another." - <em>Al Swearengen, Deadwood</em>';
			break;
		case 3:
			inspirationalQuote = '"Make haste slowly" - <em>Emperor Augustus</em>';
			break;
		case 4:
			inspirationalQuote = '"Look on my works, ye mighty, and despair" - <em>Shelley\'s Ozymandias</em>';
			break;
	}

	$("#inspirational-quote").html(inspirationalQuote);
}