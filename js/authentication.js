var syncStatus = {
	lastSynced: "",
	syncSuccessful: false
};

function uploadChanges(){
	uploadUserDatabaseToFirebase(signedInUser);
}

/*function checkPreAuth() {
	var form = $("#signinForm");
	// if there is a username and password in localStorage, use those to attempt to sign in...
	if(localStorage["username"] != "" && localStorage["password"] != "") {
		handleSignin(true, localStorage["username"], localStorage["password"]);
	}
}*/

function handleSignin(auto, email, pass) {
	var form = $("#signinForm");
	//disable the button so we can't resubmit while we wait
	$("#submitSigninButton", form).attr("disabled", "disabled");
	
	signInWithFirebase(email, pass);
	return false;
}

function signInWithFirebase(email, password){
	// console.log("just about to sign in via firebase...");
	firebaseAppAuth.signInWithEmailAndPassword(email, password).then(function(){
		// console.log("signed in!");
		window.location.href = "index.html";
	}).catch(function(error){
		// console.log(error);
		if(error.code === "auth/user-not-found"){
			// console.log("account doesn't exist, so attempting to create it...");
			firebaseAppAuth.createUserWithEmailAndPassword(email, password).then(function(){
				// console.log("created account!");
				window.location.href = "index.html";
			}).catch(function(error){
				// console.log(error);
			});
		}
	});
}

function handleSignup() {
	var successSignup = false;
	var form = $("#signupForm");

	//disable the button so we can't resubmit while we wait
	// $("#submitSignupButton",form).attr("disabled","disabled");

	var formFirstname = $("#txt-first-name", form).val();
	var formLastname = $("#txt-last-name", form).val();
	var formEmail = $("#txt-email", form).val();
	var formPassword = $("#txt-password", form).val();
	// console.log("username is " + formUsername);

	if(formEmail != '' && formPassword != '') {
		firebaseAppAuth.createUserWithEmailAndPassword(formEmail, formPassword).then(function(user){
			// console.log("successfully created firebase account");
			userDatabase.email = formEmail;
			userDatabase.firstName = formFirstname;
			userDatabase.lastName = formLastname;
			setupUserFirstTime();
			setupUser();

			user.sendEmailVerification();

			databaseRef = firebaseAppDatabase.ref("/users/" + user.uid);
			
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
		    	window.location.href = "index.html";
		    });
		}).catch(function(error){
			alert(error);
		});
	} else {
		alert("You'll need to enter an email and password", function() {});
		$("#submitSignupButton").removeAttr("disabled");
	}
	return false;
}

function handleSignout(){
	// console.log("Signing out...");
	firebaseAppAuth.signOut();
	clearUser();
}

function uploadReminders(email){
	var tasks = userDatabase.tasks.slice();
	var reminders = [];
	$.each(tasks, function(i, elem){
		if(elem.reminderTime != "" && typeof elem.reminderTime != "undefined" && !elem.deleted){
			var reminderDate = new Date(elem.reminderTime);
			var today = new Date();
			if(reminderDate >= today){
				var reminder = {
					id: reminders.length,
					date: reminderDate.toString(),
					content: elem.name
				};
				reminders.push(reminder);
			}
		}
	});

	$.ajax ({
	    url: theURL + '/reminders',
	    type: "POST",
	    data: JSON.stringify({
	    	"email": email,
	    	"reminders": reminders
	    }),
	    dataType: "json",
	    contentType: "application/json; charset=utf-8",
	    success: function(res){
	    	console.log("A response!");
	        if(res) {
	        	if(res.message == "success"){
	        		console.log("set up a timed email!");
	        	}
	        } else {
				alert("The email didn't send, for some reason...", function() {});
			}
		}
	});
}

function checkVerified(){
	$.ajax({
		url: theURL + '/check',
		type: 'POST',
		data: JSON.stringify({
			"username": userDatabase.username
		}),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function(res){
			if(res){
				userDatabase.verified = res.verified;
			}
		}
	});
}

function changeGeneralSettings(){
	var oldUsername = userDatabase.username;
	var oldFirstName = userDatabase.firstName;
	var oldLastName = userDatabase.lastName;
	var oldEmail = userDatabase.email;
	
	var newUsername = $("#txt-settings-username").val() != "" ? $("#txt-settings-username").val() : userDatabase.username;
	var newFirstName = $("#txt-settings-firstname").val() != "" ? $("#txt-settings-firstname").val() : userDatabase.firstName;
	var newLastName = $("#txt-settings-lastname").val() != "" ? $("#txt-settings-lastname").val() : userDatabase.lastName;
	var newEmail = $("#txt-settings-email").val() != "" ? $("#txt-settings-email").val() : userDatabase.email;

	var changeUsername, changeFirstName, changeLastName, changeEmail;
	changeUsername = changeFirstName = changeLastName = changeEmail = false;

	if(newUsername != "" && newUsername != oldUsername){
		changeUsername = true;
	}
	if(newFirstName != "" && newFirstName != oldFirstName){
		changeFirstName = true;
	}
	if(newLastName != "" && newLastName != oldLastName){
		changeLastName = true;
	}
	if(newEmail != "" && newEmail != oldEmail){
		changeEmail = true;
	}

	$.ajax({
		url: theURL + '/changegeneralsettings',
		type: 'POST',
		crossDomain: true,
		xhrFields: {
			withCredentials: false
		},
		data: JSON.stringify({
			"oldUsername": oldUsername,

			"newUsername": newUsername,
			"newFirstName": newFirstName,
			"newLastName": newLastName,
			"newEmail": newEmail,

			"changeUsername": changeUsername,
			"changeFirstName": changeFirstName,
			"changeLastName": changeLastName,
			"changeEmail": changeEmail
		}),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function(res){
			if(res){
				if(res.newUsername){
					userDatabase.username = res.newUsername;
					// console.log("username is now " + localStorage["username"]);
				}
				if(res.newFirstName){
					userDatabase.firstName = res.newFirstName;
					// console.log("first name is now " + localStorage["firstName"]);
				}
				if(res.newLastName){
					userDatabase.lastName = res.newLastName;
					// console.log("last name is now " + localStorage["lastName"]);
				}
				if(res.newEmail){
					userDatabase.email = res.newEmail;
					// console.log("email is now " + localStorage["email"]);
				}
				$("#div-settings-success-message").css("display", "block");
			}
		}
	});
}

/*function checkIfPasswordIsCorrect(passwordToCheck){
	$.ajax({
		url: theURL + '/checkpassword',
		type: 'POST',
		crossDomain: true,
		xhrFields: {
			withCredentials: false
		},
		data: JSON.stringify({
			"username": localStorage["username"],
			"password": passwordToCheck
		}),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function(res){
			if(res){
				console.log(res);
				return(res.passwordCorrect);
			}
			else{
				return false;
			}
		}
	});
}*/

function changePassword(){
	var username = userDatabase.username;
	var currentPassword = $("#txt-settings-current-password").val();
	var newPassword = $("#txt-settings-new-password").val();

	var promisePasswordCheck = new Promise(function(resolve, reject){
		// var passwordCorrect = checkIfPasswordIsCorrect(currentPassword);
		$.ajax({
			url: theURL + '/checkpassword',
			type: 'POST',
			crossDomain: true,
			xhrFields: {
				withCredentials: false
			},
			data: JSON.stringify({
				"username": userDatabase.username,
				"password": currentPassword
			}),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success: function(res){
				if(res){
					// console.log(res);
					resolve(res.passwordCorrect);
				}
				else{
					resolve(false);
				}
			}
		});
	});
	
	promisePasswordCheck.then(val => {
		// console.log("val = " + val + ", and it's of type " + typeof val);
		if(val){
			$.ajax({
				url: theURL + '/changepassword',
				type: 'POST',
				crossDomain: true,
				xhrFields: {
					withCredentials: false
				},
				data: JSON.stringify({
					"username": username,
					"currentPassword": currentPassword,
					"newPassword": newPassword
				}),
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				success: function(res){
					if(res){
						// console.log(res.message);
						$("#div-password-success-message").css("display", "block");
					}
				}
			});
		}
		else{
			$("#div-password-error-message").addClass("alert alert-danger");
			$("#div-password-error-message p").html("The password you entered isn't correct");
		}
	}).catch(reason => {
		// console.log(reason);
	});
}



function checkIfEmailIsAvailable(emailToCheck){
	firebaseAppAuth.fetchProvidersForEmail(emailToCheck).then(function(arrayOfProviders){
		if(arrayOfProviders.length > 0){
			updateEmailAvailabilityDivInSignup(false);
		}
		else updateEmailAvailabilityDivInSignup(true);
	}).catch(function(error){
		updateEmailAvailabilityDivInSignup(false);
	});
}

function checkIfPasswordIsValid(passwordToCheck){
	var valid = false;

	var lengthIsFine = false;
	var containsNumbers = false;
	var containsSpecialChars = false;

	if(passwordToCheck.length >= 7){
		lengthIsFine = true;
	}
	else{
		lengthIsFine = false;
	}
	var numbers = /[0-9]/;
	// !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ 
	var specialChars = /[!"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\]\\\^_`\{\}\|~£€]/;

	containsNumbers = numbers.test(passwordToCheck);
	containsSpecialChars = specialChars.test(passwordToCheck);

	valid = lengthIsFine && (containsNumbers || containsSpecialChars);

	updateNewPasswordField(valid);
	updatePasswordField(valid);
}