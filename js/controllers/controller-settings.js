function setupSettingsView(){
	$("#div-password-success-message").css("display", "none");
	$("#div-settings-success-message").css("display", "none");

	$("#txt-settings-username").attr("placeholder", userDatabase.username);
	$("#txt-settings-firstname").attr("placeholder", userDatabase.firstName);
	$("#txt-settings-lastname").attr("placeholder", userDatabase.lastName);
	$("#txt-settings-email").attr("placeholder", userDatabase.email);

	$('#nav-settings a').click(function (e) {
	  	e.preventDefault();
	  	$(this).tab('show');
	});

	// username stuff

	$("#txt-settings-username").on("keyup", function(){
		var usernameToCheck = $("#txt-settings-username").val();
		checkIfUsernameIsAvailable(usernameToCheck);
	});

	$("#txt-settings-firstname").on("keyup", updateSettingsForm);

	$("#txt-settings-lastname").on("keyup", updateSettingsForm);

	$("#txt-settings-email").on("keyup", updateSettingsForm);
	
	$("#btn-settings-submit").on("click", changeGeneralSettings);

	// password stuff

	$("#txt-settings-current-password").on("keyup", updatePasswordForm);
	/*$("#txt-settings-current-password").on("keyup", function(){
		checkIfPasswordIsCorrect($(this).val());
	});*/
	
	$("#txt-settings-new-password").on("keyup", function(){
		var passwordToCheck = $("#txt-settings-new-password").val();
		checkIfPasswordIsValid(passwordToCheck);
		updatePasswordForm();
	});

	$("#txt-settings-confirm-password").on("keyup", updatePasswordForm);

	$("#btn-password-submit").on("click", changePassword);
}

function updateSettingsForm(){
	if($("#group-change-username").hasClass("has-error")){
		$("#btn-settings-submit").attr("disabled", true);
	}
	else if($("#txt-settings-username").val() == ""
		&& $("#txt-settings-firstname").val() == ""
		&& $("#txt-settings-lastname").val() == ""
		&& $("#txt-settings-email").val() == ""){

		$("#btn-settings-submit").attr("disabled", true);
	}
	else{
		$("#btn-settings-submit").attr("disabled", false);
	}
}

function updatePasswordForm(){
	updateConfirmPasswordField();

	if($("#group-new-password").hasClass("has-error") || $("#group-confirm-password").hasClass("has-error")){
		$("#btn-password-submit").attr("disabled", true);
	}
	else if($("#txt-settings-current-password").val() == ""
		|| $("#txt-settings-new-password").val() == ""
		|| $("#txt-settings-confirm-password").val() == ""){

		$("#btn-password-submit").attr("disabled", true);
	}
	else{
		$("#btn-password-submit").attr("disabled", false);
	}
}

function updateUserAvailabilityDiv(userAvailable){
	var userField = $("#txt-settings-username").val();
	if(userField == ""){
		$("#group-change-username").removeClass("has-success");
		$("#group-change-username").removeClass("has-error");
		$("#group-change-username").removeClass("form-ok");
		$("#group-change-username").removeClass("form-not-ok");

		$("#icon-user-available").removeClass("glyphicon");
		$("#icon-user-available").removeClass("glyphicon-ok");
		$("#icon-user-available").removeClass("glyphicon-remove");
		$("#icon-user-available-sr").html("");

		$("#label-username-availability").html("Enter a new username:");
	}
	else if(userAvailable){
		$("#group-change-username").addClass("has-success");
		$("#group-change-username").removeClass("has-error");
		$("#group-change-username").addClass("form-ok");
		$("#group-change-username").removeClass("form-not-ok");

		$("#icon-user-available").addClass("glyphicon");
		$("#icon-user-available").addClass("glyphicon-ok");
		$("#icon-user-available").removeClass("glyphicon-remove");
		$("#icon-user-available-sr").html("(success)");

		$("#label-username-availability").html("Username is available!");
	}
	else{
		$("#group-change-username").addClass("has-error");
		$("#group-change-username").removeClass("has-success");
		$("#group-change-username").addClass("form-not-ok");
		$("#group-change-username").removeClass("form-ok");

		$("#icon-user-available").addClass("glyphicon");
		$("#icon-user-available").addClass("glyphicon-remove");
		$("#icon-user-available").removeClass("glyphicon-ok");
		$("#icon-user-available-sr").html("(error)");

		$("#label-username-availability").html("Username isn't available, alas :-(");
	}
}

function updateNewPasswordField(passwordIsValid){
	var passField = $("#txt-settings-new-password").val();
	if(passField == ""){
		$("#group-new-password").removeClass("has-success");
		$("#group-new-password").removeClass("has-error");
		$("#group-new-password").removeClass("form-ok");
		$("#group-new-password").removeClass("form-not-ok");

		$("#icon-password-valid").removeClass("glyphicon");
		$("#icon-password-valid").removeClass("glyphicon-ok");
		$("#icon-password-valid").removeClass("glyphicon-remove");
		$("#icon-password-valid-sr").html("");

		$("#label-new-password").html("Enter your new password:");
	}
	else if(passwordIsValid){
		$("#group-new-password").addClass("has-success");
		$("#group-new-password").removeClass("has-error");
		$("#group-new-password").addClass("form-ok");
		$("#group-new-password").removeClass("form-not-ok");

		$("#icon-password-valid").addClass("glyphicon");
		$("#icon-password-valid").addClass("glyphicon-ok");
		$("#icon-password-valid").removeClass("glyphicon-remove");
		$("#icon-password-valid-sr").html("(success)");

		$("#label-new-password").html("Password is valid");
	}
	else{
		$("#group-new-password").addClass("has-error");
		$("#group-new-password").removeClass("has-success");
		$("#group-new-password").addClass("form-not-ok");
		$("#group-new-password").removeClass("form-ok");

		$("#icon-password-valid").addClass("glyphicon");
		$("#icon-password-valid").addClass("glyphicon-remove");
		$("#icon-password-valid").removeClass("glyphicon-ok");
		$("#icon-password-valid-sr").html("(error)");

		$("#label-new-password").html("Password isn't valid, alas :-(");
	}
}

function updateConfirmPasswordField(){
	var newPassword = $("#txt-settings-new-password").val();
	var confirmPassword = $("#txt-settings-confirm-password").val();
	
	if(newPassword == "" || confirmPassword == "" || $("#group-new-password").hasClass("has-error")){
		$("#group-confirm-password").removeClass("has-success");
		$("#group-confirm-password").removeClass("has-error");
		$("#group-confirm-password").removeClass("form-ok");
		$("#group-confirm-password").removeClass("form-not-ok");

		$("#icon-password-confirm-valid").removeClass("glyphicon");
		$("#icon-password-confirm-valid").removeClass("glyphicon-ok");
		$("#icon-password-confirm-valid").removeClass("glyphicon-remove");
		$("#icon-password-confirm-valid-sr").html("");

		$("#label-confirm-password").html("Confirm your new password:");
	}
	else if(confirmPassword == newPassword){
		$("#group-confirm-password").addClass("has-success");
		$("#group-confirm-password").removeClass("has-error");
		$("#group-confirm-password").addClass("form-ok");
		$("#group-confirm-password").removeClass("form-not-ok");

		$("#icon-password-confirm-valid").addClass("glyphicon");
		$("#icon-password-confirm-valid").addClass("glyphicon-ok");
		$("#icon-password-confirm-valid").removeClass("glyphicon-remove");
		$("#icon-password-confirm-valid-sr").html("(success)");

		$("#label-confirm-password").html("Passwords match");
	}
	else{
		$("#group-confirm-password").addClass("has-error");
		$("#group-confirm-password").removeClass("has-success");
		$("#group-confirm-password").addClass("form-not-ok");
		$("#group-confirm-password").removeClass("form-ok");

		$("#icon-password-confirm-valid").addClass("glyphicon");
		$("#icon-password-confirm-valid").addClass("glyphicon-remove");
		$("#icon-password-confirm-valid").removeClass("glyphicon-ok");
		$("#icon-password-confirm-valid-sr").html("(error)");

		$("#label-confirm-password").html("Passwords don't match, alas :-(");
	}
}