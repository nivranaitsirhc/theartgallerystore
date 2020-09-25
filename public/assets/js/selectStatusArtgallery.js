(function(){
	let dropDown$ = $('#inputGroupSelect01'),
		textField$ = $('#inputGroupSelectText');

		function changeVal() {
			let x =	parseInt(textField$.val());
			if(!!x && x > 0 && x < 6) {
				dropDown$.val(x)
			}
		}

		textField$.on('keyup',changeVal);
		changeVal();
}
)()