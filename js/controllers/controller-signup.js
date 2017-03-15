function setupSignupView(){
	$("#txt-first-name").on("keyup", updateSignupForm);
	$("#txt-last-name").on("keyup", updateSignupForm);
	$("#txt-email").on("keyup", function(){
		checkIfEmailIsAvailable($("#txt-email").val());
	});
	$("#txt-password").on("keyup", function(){
		checkIfPasswordIsValid($("#txt-password").val());
	});

	$("#signupForm").on("submit", handleSignup);
}

function updateSignupForm(){
	if($("#group-email-signup").hasClass("has-error") || $("#group-password-signup").hasClass("has-error") ){
		$("#submitSignupButton").attr("disabled", true);
	}
	else if($("#txt-first-name").val() == "" || $("#txt-last-name").val() == "" || $("#txt-email").val() == "" || $("#txt-username").val() == "" || $("#txt-password").val() == ""){
		$("#submitSignupButton").attr("disabled", true);
	}
	else{
		$("#submitSignupButton").attr("disabled", false);
	}
}

function updateEmailAvailabilityDivInSignup(emailAvailable){
	var emailField = $("#txt-email").val();
	if(emailField == ""){
		$("#group-email-signup").removeClass("has-success");
		$("#group-email-signup").removeClass("has-error");
		$("#group-email-signup").removeClass("form-ok");
		$("#group-email-signup").removeClass("form-not-ok");

		$("#icon-email-available-signup").removeClass("glyphicon");
		$("#icon-email-available-signup").removeClass("glyphicon-ok");
		$("#icon-email-available-signup").removeClass("glyphicon-remove");
		$("#icon-email-available-signup-sr").html("");

		$("#label-email-signup").html("Email address");
	}
	else if(emailAvailable){
		$("#group-email-signup").addClass("has-success");
		$("#group-email-signup").removeClass("has-error");
		$("#group-email-signup").addClass("form-ok");
		$("#group-email-signup").removeClass("form-not-ok");

		$("#icon-email-available-signup").addClass("glyphicon");
		$("#icon-email-available-signup").addClass("glyphicon-ok");
		$("#icon-email-available-signup").removeClass("glyphicon-remove");
		$("#icon-email-available-signup-sr").html("(success)");

		$("#label-email-signup").html("Email address is available!");
	}
	else{
		$("#group-email-signup").addClass("has-error");
		$("#group-email-signup").removeClass("has-success");
		$("#group-email-signup").addClass("form-not-ok");
		$("#group-email-signup").removeClass("form-ok");

		$("#icon-email-available-signup").addClass("glyphicon");
		$("#icon-email-available-signup").addClass("glyphicon-remove");
		$("#icon-email-available-signup").removeClass("glyphicon-ok");
		$("#icon-email-available-signup-sr").html("(error)");

		$("#label-email-signup").html("Can't use this email, alas :-(");
	}
	updateSignupForm();
}

function updatePasswordField(passwordIsValid){
	var passField = $("#txt-password").val();
	if(passField == ""){
		$("#group-password-signup").removeClass("has-success");
		$("#group-password-signup").removeClass("has-error");
		$("#group-password-signup").removeClass("form-ok");
		$("#group-password-signup").removeClass("form-not-ok");

		$("#icon-password-valid-signup").removeClass("glyphicon");
		$("#icon-password-valid-signup").removeClass("glyphicon-ok");
		$("#icon-password-valid-signup").removeClass("glyphicon-remove");
		$("#icon-password-valid-signup-sr").html("");

		$("#label-password-signup").html("Password (7 characters or more, including at least one number or special character)");
	}
	else if(passwordIsValid){
		$("#group-password-signup").addClass("has-success");
		$("#group-password-signup").removeClass("has-error");
		$("#group-password-signup").addClass("form-ok");
		$("#group-password-signup").removeClass("form-not-ok");

		$("#icon-password-valid-signup").addClass("glyphicon");
		$("#icon-password-valid-signup").addClass("glyphicon-ok");
		$("#icon-password-valid-signup").removeClass("glyphicon-remove");
		$("#icon-password-valid-signup-sr").html("(success)");

		$("#label-password-signup").html("Password is valid");
	}
	else{
		$("#group-password-signup").addClass("has-error");
		$("#group-password-signup").removeClass("has-success");
		$("#group-password-signup").addClass("form-not-ok");
		$("#group-password-signup").removeClass("form-ok");

		$("#icon-password-valid-signup").addClass("glyphicon");
		$("#icon-password-valid-signup").addClass("glyphicon-remove");
		$("#icon-password-valid-signup").removeClass("glyphicon-ok");
		$("#icon-password-valid-signup-sr").html("(error)");

		$("#label-password-signup").html("Password isn't valid, alas :-(");
	}
	updateSignupForm();
}