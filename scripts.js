
var bracketsNeeded = Settings.trigonometric || Settings.exponentiation || Settings.logarithms;
if(Settings.trigonometric) $('.trigonometric').show();
if(Settings.constants) $('.constants').show();
if(Settings.exponentiation) $('.exponentiation').show();
if(Settings.logarithms) $('.logarithms').show();
if(bracketsNeeded) $('.brackets').show();


document.querySelector('.appName').innerHTML = Settings.name;
document.querySelector('.appIcon').src = Settings.icon;
document.querySelector('.appIcon').onerror = function(){document.querySelector('.appIcon').style = 'display:none';}

function adjust_brightness(hex, percent){
	// strip the leading # if it's there
	hex = hex.replace(/^\s*#|\s*$/g, '');

	// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	if(hex.length == 3){
		hex = hex.replace(/(.)/g, '$1$1');
	}

	var r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);

	return '#' +
		((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
		((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
		((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

var style = '#calculator {	background: #'+Settings.bgColor+'; \
background: linear-gradient(#'+Settings.bgColor+', '+adjust_brightness(Settings.bgColor,20)+');\
box-shadow: 0px 4px '+adjust_brightness(Settings.bgColor,40)+', 0px 10px 15px rgba(0, 0, 0, 0.2);\
}\
.additional.keys span {background: #'+Settings.additionalKeyColor+';}\
.keys span {background: #'+Settings.keysColor+';}\
.top span.clear {background: #'+Settings.eraseColor+'; box-shadow: 0px 4px '+adjust_brightness(Settings.eraseColor,-30)+';}\
.top span.clear:hover {background: '+adjust_brightness(Settings.eraseColor,-10)+'; box-shadow: 0px 4px '+adjust_brightness(Settings.eraseColor,-30)+';}\
.top span.clear:active {top: 4px; box-shadow: 0px 0px '+adjust_brightness(Settings.eraseColor,-30)+';}\
.keys span.eval {background: #'+Settings.evalColor+'; box-shadow: 0px 4px '+adjust_brightness(Settings.evalColor,-150)+'; color: '+adjust_brightness(Settings.evalColor,-300)+';}\
.keys span.eval:hover {background: '+adjust_brightness(Settings.evalColor,-170)+';box-shadow: 0px 4px '+adjust_brightness(Settings.evalColor,-250)+';color: #ffffff;}\
.keys span.eval:active {box-shadow: 0px 0px '+adjust_brightness(Settings.evalColor,-50)+';top: 4px;}\
.keys span:hover {background: #'+Settings.pressedColor+';box-shadow: 0px 4px '+adjust_brightness(Settings.pressedColor,-30)+';color: white;}\
.keys span:active {box-shadow: 0px 0px '+adjust_brightness(Settings.pressedColor,-30)+';top: 4px;}\
';

var stylesheet = document.createElement('style');
stylesheet.type = "text/css";
stylesheet.appendChild(document.createTextNode(style));
document.querySelector('head').appendChild(stylesheet);


var stylesheet2 = document.createElement('style');
stylesheet2.type = "text/css";
stylesheet2.appendChild(document.createTextNode(Settings.customCss));
document.querySelector('head').appendChild(stylesheet2);

// Get all the keys from document
var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '÷','^'];
var decimalAdded = false;

function bracketsBalance(string){
	var balance = 0;
	for(var i = 0; i < string.length; i++){
		if(string[i] == '(') balance++;
		if(string[i] == ')') balance--;
	}
	return balance;
}

// Add onclick event to all the keys and perform operations
for(var i = 0; i < keys.length; i++) {
	keys[i].onclick = function(e) {
		// Get the input and button values
		var input = document.querySelector('.screen');
		var inputVal = input.innerHTML;
		var btnVal = this.innerHTML;

		// Now, just append the key values (btnValue) to the input string and finally use javascript's eval function to get the result
		// If clear key is pressed, erase everything
		if(btnVal == 'C') {
			input.innerHTML = '';
			decimalAdded = false;
		}

		// If eval key is pressed, calculate and display the result
		else if(btnVal == '=') {
			var balance = bracketsBalance(inputVal);
			while(balance > 0){
				inputVal += ')';
				balance--;
			}
			var equation = inputVal;
			var lastChar = equation[equation.length - 1];

			// Replace all instances of x and ÷ with * and / respectively. This can be done easily using regex and the 'g' tag which will replace all instances of the matched character/substring
			equation =
				equation.replace(/x/g, '*')
					.replace(/÷/g, '/')
					.replace(/√/g,'sqrt');

			// Final thing left to do is checking the last character of the equation. If it's an operator or a decimal, remove it
			if(operators.indexOf(lastChar) > -1 || lastChar == '.')
				equation = equation.replace(/.$/, '');

			math.import({
				'ln':function(num){
					return Math.log(num);
				},
				lg:function(num){
					return Math.log(num)/Math.log(10);
				}
				}
			);

			if(equation)
				input.innerHTML = math.eval(equation)//.toExponential();

			decimalAdded = false;
		}

		else if(btnVal == 'π'){
			input.innerHTML += '3.14159';
			decimalAdded = true;
		}

		else if(btnVal == 'e'){
			input.innerHTML += '2.71828';
			decimalAdded = true;
		}

		else if(['sin','cos','tan','ln','lg'].indexOf(btnVal) != -1){
			var lastChar = inputVal[inputVal.length - 1];
			if(lastChar && operators.indexOf(lastChar) == -1 && ['('].indexOf(lastChar) == -1){
				input.innerHTML += 'x';
			}
			input.innerHTML += btnVal + '(';
		}

		else if(btnVal ==  '√'){
			var lastChar = inputVal[inputVal.length - 1];
			if(lastChar && operators.indexOf(lastChar) == -1 && ['('].indexOf(lastChar) == -1){
				input.innerHTML += 'x';
			}
			input.innerHTML += btnVal + '(';
		}

		// Basic functionality of the calculator is complete. But there are some problems like
		// 1. No two operators should be added consecutively.
		// 2. The equation shouldn't start from an operator except minus
		// 3. not more than 1 decimal should be there in a number

		// We'll fix these issues using some simple checks

		// indexOf works only in IE9+
		else if(operators.indexOf(btnVal) > -1) {
			// Operator is clicked
			// Get the last character from the equation
			var lastChar = inputVal[inputVal.length - 1];

			// Only add operator if input is not empty and there is no operator at the last
			if(inputVal != '' && operators.indexOf(lastChar) == -1 && ['('].indexOf(lastChar) == -1 )
				input.innerHTML += btnVal;

			// Allow minus if the string is empty
			else if(inputVal == '' && btnVal == '-')
				input.innerHTML += btnVal;

			// Replace the last operator (if exists) with the newly pressed operator
			if(operators.indexOf(lastChar) > -1 && inputVal.length > 1) {
				// Here, '.' matches any character while $ denotes the end of string, so anything (will be an operator in this case) at the end of string will get replaced by new operator
				input.innerHTML = inputVal.replace(/.$/, btnVal);
			}

			decimalAdded =false;
		}

		// Now only the decimal problem is left. We can solve it easily using a flag 'decimalAdded' which we'll set once the decimal is added and prevent more decimals to be added once it's set. It will be reset when an operator, eval or clear key is pressed.
		else if(btnVal == '.') {
			if(!decimalAdded) {
				input.innerHTML += btnVal;
				decimalAdded = true;
			}
		}

		// if any other key is pressed, just append it
		else {
			input.innerHTML += btnVal;
		}

		// prevent page jumps
		e.preventDefault();
	}
}