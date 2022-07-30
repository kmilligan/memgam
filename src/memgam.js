/**
 * memgam - a simple memory game
 *
 */
(function() {

'use strict';

const defaultConfig = 
{
	buttons: 
	[
		// colors courtesy of https://colorbrewer2.org
		{ name: "red", display: "", color: "#e41a1c", sound: "130.8" },
		{ name: "orange", display: "", color: "#ff7f00", sound: "246.9" },
		{ name: "yellow", display: "", color: "#ffff33", sound: "174.6" },
		{ name: "green", display: "", color: "#4daf4a", sound: "196.0" },
		{ name: "blue", display: "", color: "#377eb8", sound: "164.8" },
		{ name: "purple", display: "", color: "#984ea3", sound: "220.0" }
	],
	steps: 10,
	onWin: function()
	{
		console.log('player wins!');
	},
	onLose: function(reason)
	{
		console.log('player loses; ', reason);
	},
	containerSelector: '#gameboard',
	// various timers, in ms
	buttonTimeOn: 500,
	buttonTimeOff: 200,
	buttonTimeout: 3000,
	betweenLoops: 500
};

// we only want one of these
// but we can't create it until the user does something
let audioContext = null;

// attach to window object for access
window.memgam = function(options)
{
	this.options = { ...defaultConfig, ...options};
};

// **** public methods ****

/**
 * Show a game board but don't start a game
 */
memgam.prototype.showBoard = function()
{
	setupGameBoard(this);
};

/**
 * Setup a new game board and play!
 */
memgam.prototype.startNewGame = function()
{
	resetState(this);
	const buttons = setupGameBoard(this);
	const pattern = generateGamePattern(this, buttons);
	playGame(this, buttons, pattern);
};


// **** private methods ****
const resetState = function(that)
{
	that.inProgress = false;
	that.playersTurn = false;

	if(!audioContext)
		audioContext = new AudioContext();

	that.audioContext = audioContext;

	if(that.activeButton && that.activeButton.oscillator)
		that.activeButton.oscillator.stop();
	that.activeButton = null;
};

const setupGameBoard = function(that)
{
	const config = that.options;
	const container = document.querySelector(config.containerSelector);

	// empty it
	while(container.firstElementChild)
		container.firstElementChild.remove();

	// shuffle our list
	shuffle(config.buttons);

	// add them to the board
	const buttons = [];
	for(let i = 0; i < config.buttons.length; i++)
	{
		// create and add it to our gameboard
		const button = createButton(that, i, config.buttons[i]);
		container.appendChild(button);
		buttons.push(button);
	}
	return buttons;
};

const createButton = function(that, buttonNumber, buttonConfig)
{
	// create the button element
	const button = document.createElement('a');
	button.classList.add('memgam-gamebutton');
	button.dataset.buttonnum = buttonNumber;
	button.dataset.frequency = buttonConfig.sound;
	button.style = 'background-color: ' + buttonConfig.color;

	const buttonText = document.createElement('span');
	buttonText.className = 'memgam-gamebutton-text';
	buttonText.innerHTML = buttonConfig.display;
	button.appendChild(buttonText);

	// function(foo) { return bar; } --> foo => bar;
	button.addEventListener('mousedown', event => buttonPressed(that, event));
	button.addEventListener('touchstart', event => buttonPressed(that, event));
	button.addEventListener('mouseup', event => buttonReleased(that, event));

	return button;
};

const shuffle = function(array)
{
	let currentIndex = array.length;
	let randomIndex, tmp;
	
	// While there remain elements to shuffle.
	while (currentIndex != 0) 
	{
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		tmp = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = tmp;
	}
};

const buttonPressed = function(that, event)
{
	// might get both touchstart and mousedown
	if(that.activeButton)
		return false;

	if(!that.playersTurn)
	{
		console.log('not your turn!');
		return false;
	}

	that.activeButton = event.target;
	that.activeButton.oscillator = playSound(that, that.activeButton.dataset.frequency, 0);
	return false;
};

const buttonReleased = function(that, event)
{
	if(!that.activeButton || !that.activeButton.oscillator)
		return false;

	that.activeButton.oscillator.stop();

	if(that.activeButton != event.target)
		return false;

	that.activeButton = null;

	const buttonNumber = event.target.dataset.buttonnum;
	checkButtonPress(that, buttonNumber);	

	return false;
};

const generateGamePattern = function(that, buttons)
{
	const config = that.options;
	const pattern = [];
	const numButtons = buttons.length;
	for(let i = 0; i < config.steps; i++)
	{
		pattern.push(Math.floor(Math.random() * numButtons));
	}
	return pattern;
};

const playPattern = async function(that, buttons, pattern, step)
{
	const timings = modifyTimingsByStep(step, that.options.buttonTimeOn, that.options.buttonTimeOff);

	for(let i = 0; i < step; i++)
	{
		activateButton(that, buttons[pattern[i]], timings.on, timings.off);
		await wait(timings.on + timings.off);
	}
};

const modifyTimingsByStep = function(step, timeOn, timeOff)
{
	const timings = 
	{
		on: timeOn,
		off: timeOff
	}

	const redux = (step - 1) * 20;
	timings.on = Math.max(timings.on - redux, 50);
	timings.off = Math.max(timings.off - redux, 50);

	return timings;
};

const activateButton = async function(that, button, timeOn, timeOff)
{
	playSound(that, button.dataset.frequency, timeOn);
	button.classList.add('lit');
	await wait(timeOn);
	button.classList.remove('lit');
	await wait(timeOff);
};

const playSound = function(that, frequency, timeOn)
{
	// setup audio
	let oscillator = that.audioContext.createOscillator();
	oscillator.connect(that.audioContext.destination);
	oscillator.frequency.setValueAtTime(frequency, that.audioContext.currentTime);
	oscillator.type = 'triangle';
	oscillator.start();
	if(timeOn > 0)
		oscillator.stop(that.audioContext.currentTime + (timeOn / 1000));

	return oscillator;
};

const wait = function(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
};

const getPlayerInput = async function(that, pattern, step)
{
	that.playersTurn = true;
	for(let i = 0; i < step; i++)
	{
		that.buttonExpected = pattern[i];
		that.expectation = createExpectation(that.options.buttonTimeout);
		that.expectation.catch(function(message)
		{
			console.log('fail!',message);
			that.playersTurn = false;
			// not clear why, but at this point we effectively throw an error
			// (maybe the promise returned by calling getPlayerInput is rejected)
		});
		await that.expectation;
	}
	that.playersTurn = false;
};

const createExpectation = function(timeout)
{
	let met, notMet, timer;
	const promise = new Promise((resolve, reject) =>
	{
		met = resolve;
		notMet = reject;

		timer = setTimeout(function()
		{
			reject('timed out');
		}, timeout);
	});

	promise.met = (value) =>
	{
		clearTimeout(timer);
		met(value);
	};

	promise.notMet = (value) =>
	{
		clearTimeout(timer);
		notMet(value);
	};

	return promise;
};

const checkButtonPress = function(that, buttonNumber)
{
	if(buttonNumber == that.buttonExpected)
		that.expectation.met();
	else
		that.expectation.notMet('wrong button');	
};

const playGame = async function(that, buttons, pattern)
{
	let config = that.options;
	that.inProgress = true;

	for(let i = 1; i <= config.steps; i++)
	{
		await wait(config.betweenLoops);
		await playPattern(that, buttons, pattern, i);
		// there are a couple lessons here;
		// first is that async functions automagically return promises.
		// second is that i don't understand what is calling that promise's reject...
		await getPlayerInput(that, pattern, i).catch(function(reason)
		{
			that.inProgress = false;
			if(that.activeButton && that.activeButton.oscillator)
				that.activeButton.oscillator.stop();
			config.onLose(reason);
			// no implicit error thrown here (like in getPlayerInput), not sure why
		});
		if(!that.inProgress)
			return;
	}

	that.inProgress = false;
	config.onWin();
};

})();
