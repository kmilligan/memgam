/**
 * memgam - a simple memory game
 *
 *@see LICENSE and README.md files for details.
 */

(function(root) {

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

// convenience accessor
const document = root.document;

// attach to global/window object for access from the outside
root.memgam = function(options)
{
	this.options = { ...defaultConfig, ...options};
};

// **** public methods ****

/**
 * Show a game board but don't start a game
 */
root.memgam.prototype.showBoard = function()
{
	setupGameBoard(this);
};

/**
 * Setup a new game board and play!
 */
root.memgam.prototype.startNewGame = function()
{
	resetState(this);
	const buttons = setupGameBoard(this);
	const pattern = generateGamePattern(this, buttons);
	playGame(this, buttons, pattern);
};


// **** private methods ****

class Sounder
{
	// we only want one of these
	// but we can't create it until the user does something
	static audioContext = null;

	static minRampMS = 200; 

	oscillator = null;
	gainNode = null;

	constructor()
	{
		if(!Sounder.audioContext)
			Sounder.audioContext = new AudioContext();
	}

	/**
	* Play a sound at the given frequency;
	* defaults to using a triangle wave. 
	* By default, will continue to play until 
	* stopGracefully() is called.
	*
	* Duration is specified in milliseconds.
	*/
	play(frequency, duration = 0, type = 'triangle')
	{
		if(this.oscillator)
			throw new Error('Create a new instance to play another sound.');

		// create our oscillator and gain nodes,
		// and connect them up
		this.oscillator = Sounder.audioContext.createOscillator();
		this.oscillator.frequency.setValueAtTime(frequency, Sounder.audioContext.currentTime);
		this.oscillator.type = type;

		this.gainNode = Sounder.audioContext.createGain();
		this.oscillator.connect(this.gainNode);
		this.gainNode.connect(Sounder.audioContext.destination);

		// create the sound!
		this.oscillator.start();

		if(duration > 0)
			this.stopGracefully(duration);
	}

	/**
	* Stop playing the current sound after
	* the specified duration in milliseconds, which defaults to 0 (now),
	* but fade out the sound to avoid audible clicks
	* caused by cutting mid-wafeform.
	*/
	stopGracefully(duration = 0)
	{
		// thought about making this an exception,
		// but that could be annoying
		if(!this.oscillator)
		{
			console.log('no oscillator; call play() first');
			return;
		}

		// audio api deals in seconds, not ms
		// also, we need to set a minimum because we need time
		// for the ramp to actually occur
		const durationSec = Math.max(duration, Sounder.minRampMS) / 1000; 

		const endTime = Sounder.audioContext.currentTime + durationSec;
		// this is important as an initial value
		this.gainNode.gain.setValueAtTime(
			this.gainNode.gain.value, Sounder.audioContext.currentTime);
		//sounder.gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
		this.gainNode.gain.linearRampToValueAtTime(0, endTime);
		// not clear this is needed, but seems right
		this.oscillator.stop(endTime);
	}
}

const resetState = function(that)
{
	that.inProgress = false;
	that.playersTurn = false;

	if(that.activeButton && that.activeButton.sounder)
		that.activeButton.sounder.stopGracefully();
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

	// our release handler needs to be everywhere; as it is easy
	// to press down within one of our buttons, but release outside of one.
	// remove the previous handler first, tho.
	if(that.releaseHandler)
	{
		document.removeEventListener('pointerup', that.releaseHandler);
		that.releaseHandler = null;
	}
	that.releaseHandler = event => buttonReleased(that, event);
	document.addEventListener('pointerup', that.releaseHandler);

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

	// first lesson: pointer events work better than mouse/touch events.
	// function(foo) { return bar; } --> foo => bar;
	button.addEventListener('pointerdown', event => buttonPressed(that, event));
	// second lesson: you still might not release within the button, 
	// so have to listen more generically on document instead.
	//button.addEventListener('pointerup', event => buttonReleased(that, event));

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
	//console.log('PRESS', event);
	// not clear why, but sometimes we get consecutive press events
	// without a release, which confuses things, so in that case,
	// assume they've released
	if(that.activeButton)
	{
		console.log('received button press, but already active button; assuming release.');
		buttonReleased(that, { target: that.activeButton } );
	}

	if(!that.playersTurn)
	{
		console.log('not your turn!');
		return false;
	}

	that.activeButton = event.target;
	that.activeButton.sounder = new Sounder();
	that.activeButton.sounder.play(that.activeButton.dataset.frequency);
	return false;
};

const buttonReleased = function(that, event)
{
	// all we care about is if there's an active button.
	if(!that.activeButton || !that.activeButton.sounder)
	{
		console.log('no active button');
		return false;
	}
	//console.log('RELEASE', event);

	that.activeButton.sounder.stopGracefully();

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
	const sounder = new Sounder();
	sounder.play(button.dataset.frequency, timeOn);
	button.classList.add('lit');
	await wait(timeOn);
	button.classList.remove('lit');
	await wait(timeOff);
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
			if(that.activeButton && that.activeButton.sounder)
				that.activeButton.sounder.stopGracefully();
			config.onLose(reason);
			// no implicit error thrown here (like in getPlayerInput), not sure why
		});
		if(!that.inProgress)
			return;
	}

	that.inProgress = false;
	config.onWin();
};

// "global" is for node, "window" is for browser
})((typeof window !== 'undefined'? window : global ));
