
function obj(str1,str2){
	this.a = document.querySelector(str1);
	this.b = document.querySelector(str2);
}


let pass	= new obj("#inputPassword","#inputPasswordConfirm"),
	letter 	= new obj("#letter1","#letter2"),
	capital = new obj("#capital1","#capital2"),
	number	= new obj("#number1","#number2"),
	length	= new obj("#length1","#length2");

function display(target,display) {
	document.querySelector(target).style.display=display;
}

function validate(target,select){
	console.log(letter.`${arguments[1]}`)
	// Validate lowercase letters
	let lowerCaseLetters = /[a-z]/g;
	if(target.value.match(lowerCaseLetters)) {
		letter.arguments[1].classList.remove("invalid");
		letter.arguments[1].classList.add("valid");
	} else {
		letter.arguments[1].classList.remove("valid");
		letter.arguments[1].classList.add("invalid");
	}

	// Validate capital letters
	let upperCaseLetters = /[A-Z]/g;
	if(target.value.match(upperCaseLetters)) {
		capital.arguments[1].classList.remove("invalid");
		capital.arguments[1].classList.add("valid");
	} else {
		capital.arguments[1].classList.remove("valid");
		capital.arguments[1].classList.add("invalid");
	}

	// Validate number.arguments[1].s
	let numbers = /[0-9]/g;
	if(target.value.match(numbers)) {
		number.arguments[1].classList.remove("invalid");
		number.arguments[1].classList.add("valid");
	} else {
		number.arguments[1].classList.remove("valid");
		number.arguments[1].classList.add("invalid");
	}

	// Validate length.arguments[1].
	if(target.value.length >= 8) {
		length.arguments[1].classList.remove("invalid");
		length.arguments[1].classList.add("valid");
	} else {
		length.arguments[1].classList.remove("valid");
		length.arguments[1].classList.add("invalid");
	}
}


// When the user clicks on the password field, show the message box
pass.a.onfocus = display("#confirmMessage1","block");
pass.b.onfocus = display("#confirmMessage2","block");

// When the user clicks outside of the password field, hide the message box
pass.a.onblur = display("#confirmMessage1","none");
pass.b.onblur = display("#confirmMessage2","none");

// When the user starts to type something inside the password field
pass.a.onkeyup = validate(pass.a,"a");
pass.b.onkeyup = validate(pass.b,"b");