/**
 *	SliderElement class, representing an individual DOM node for the sliders.
 *	This is so we can add sliders and attach events to them individually.
 *	
 *	@class SliderElement
 *	@param {Object} domNode - the individual DOM node representing the Slider Element
 *	@param {Object} optionsOverride - optional overrides to default values
 *	@constructor
 */
function SliderElement(domNode, optionsOverride) {
	/**
	 *	The html dom element for the slider	
	 *
	 *	@property node
	 *	@type {object}
	 */
	this.container = domNode;

	/**
	 *	Options override 
	 *
	 *	@property optionsOverride
	 *	@type {object}
	 */
	this.optionsOverride = optionsOverride;

	/**
	 *	The slider that needs to be scrolled
	 *	
	 *	@property slider
	 *	@type {object}
	 */
	this.slider = {};

	/**
	 *	Used to calculate the movement of the mouse along the x 
	 *	axis from when the mouse button was first held down
	 *	
	 *	@property dx
	 *	@type {number}
	 *	@default 0
	 */
	this.dx = 0;

	/**
	 *	Used to store the current translated X coordinate of the slider
	 *
	 *	@property sliderX
	 *	@type {number}
	 *	@default {0}
	 */
	this.sliderX = 0;

	/**
	 *	Determine whether to start dragging the slider with this.
	 *
	 *	@property mousedown
	 *	@type {number}
	 *	@default 0
	 */
	this.mousedown = 0;

	/**
	 *	The slides contained within the slider
	 *
	 *	@property slides
	 *	@type {Object}
	 */
	this.slides = {};

	/**
	 *	The slider width, determined by the slider container width
	 *	
	 *	@property sliderWidth
	 *	@type {number}
	 *	@default 0
	 */
	this.sliderWidth = 0;

	/**
	 *	The events we need to attach to the slider, for mouse and touch events
	 *
	 *	@property events
	 *	@type {Object}
	 *	@default {}
	 */
	this.events = {};

	/**
	 *	The id associated with the repaint of the slider 
	 *	
	 *	@property animationFrameId
	 *	@type {number}
	 */
	this.animationFrameId;

	/**
	 *	Slider animation transition duration
	 *
	 *	@property transitionDuration
	 *	@type {number}
	 *	@default 350
	 */
	this.transitionDuration = 350;

	/**
	 *	Callback timeout to be used by functions spawned multiple times 
	 *	and that have callbacks that only need to be called once.
	 *	
	 *	@property callbackTimeout
	 *	@type {number}
	 */
	this.callbackTimeout;

	/**
	 *	Custom events: ie; for when the slider is dropped
	 *
	 *	@property customEvents
	 *	@type {Object}
	 *	@default {}
	 */
	this.customEvents;

	/**
	 *	Custom options for the slider
	 *
	 *	@property options
	 *	@type {Object}
	 *	@default {}
	 *	@TODO: Allow these to be passed in externally
	 */
	this.options;

	/**
	 *	Current slider speed when it is snapping back to a position
	 *
	 *	@property {number} currentSpeed
	 *	@default 0
	 */
	this.currentSpeed = 0;

	/**
	 *	The current slide the slider is on
	 *
	 *	@property {number} currentSlide
	 *	@default 0
	 */
	this.currentSlide = 0;

	/**
	 *	Number of slide items to show at the same time.
	 *
	 *	@property {number} concurrentSlides
	 *	@default 1
	 */
	this.concurrentSlides = 1;

	/**
	 *	Slider is animating
	 *
	 *	@property {boolean} isAnimating
	 *	@default false
	 */
	this.isAnimating = false;

	/**
	 *	Slider image DOM nodes
	 *
	 *	@property {object} images
	 */
	this.images;

	/**
	 *	Finally, initialise the slider.
	 */
	this.init();
};

SliderElement.prototype.init = function() {

	/**
	 *	Setting up
	 */
	this.slider = this.container.getElementsByClassName('slider')[0];
	this.slides = this.container.getElementsByClassName('slide');
	this.sliderWidth = this.container.offsetWidth;

	/**
	 *	Slider image DOM elements
	 */
	this.images = this.container.querySelectorAll('img');
	
	/**
	 *	Adding custom events
	 */
	this.customEvents = {
		sliderdrop: new CustomEvent('sliderdrop', {}),
		boundsreached: new CustomEvent('sliderboundsreached', {}),
		slidecomplete: new CustomEvent('slidecomplete', {})
	};

	/**
	 *	And slider options
	 */
	this.options = {
		snapToNearest: true,
		snapSpeedMillis: 400
	};

	/**
	 *	Adding any custom properties to override defaults.
	 *	If the given object has a property that matches the slider 
	 *	object, we swap around the values.
	 */
	for (var property in this.optionsOverride) {
		if(this.hasOwnProperty(property)) {
			this[property] = this.optionsOverride[property];
		}
	}

	/**
	 *	Listen for image loading events. Every time an image loads,
	 *	we may need to rerun the slider width calculation to ensure 
	 *	that it is correct and that the slides move into the correct
	 *	position.
	 */
	[].forEach.call(this.images, function(imageObject) {
		imageObject.addEventListener('load', function() {
			this.sliderWidth = this.container.offsetWidth;	
		}.bind(this));
	}.bind(this));

	/** 
	 *	The events added now which need to be set up later
	 */
	this.events = [
		{
			listeners: {
				mouse: 'dragstart',
				touch: 'touchdragstart'
			},
			attachTo: this.container,
			functionCall: this.onDragStart
		},
		{
			listeners: {
				mouse: 'mousedown',
				touch: 'touchstart'
			},
			attachTo: this.container,
			functionCall: this.onDown
		},
		{
			listeners: {
				mouse: 'mousemove',
				touch: 'touchmove'
			},
			attachTo: this.container,
			functionCall: this.onMove
		},
		{
			listeners: {
				mouse: 'mouseup',
				touch: 'touchend'
			},
			attachTo: this.container,
			functionCall: this.onUp
		},
		{
			listeners: {
				mouse: 'mouseleave',
				touch: 'touchleave'
			},
			attachTo: this.container,
			functionCall: this.onLeave
		},
		{
			listeners: {
				mouse: 'sliderdrop',
				touch: 'sliderdrop'
			},
			attachTo: this.container,
			functionCall: this.onSliderDrop
		},
		{
			listeners: {
				'mouse': 'resize',
				'touch': 'resize'
			},
			attachTo: window,
			functionCall: this.onWindowResize
		}
	];

	/**
	 *	Finally, set up the events
 	 */
 	this.setupEvents();

};

/**
 *	Method to handle a window resize event, which will ultimately
 *	have an effect on slider calculations
 *
 *	@method onResize
 *	@return undefined - returns nothing
 */
SliderElement.prototype.onWindowResize = function() {

	/**
	 *	Clear any queued timeouts 
	 */
	clearTimeout(this.callbackTimeout);

	/**
	 *	Then run this bound and throttled function
	 *	which resets the slider
	 */
	this.callbackTimeout = setTimeout(function(){
		this.sliderWidth = this.container.offsetWidth;
		this.goToSlide(this.currentSlide);
	}.bind(this), 500);
}

/**
 *	Method to set up the events for the SliderElement
 *	
 *	@method setupEvents
 *	@return undefined
 */
SliderElement.prototype.setupEvents = function() {

	/**
	 *	Reference 'this' inside function scope by assigning it to self.
	 */
	var self = this;

	/**
	 *	Loop through each event and set it up
	 */
	[].forEach.call(this.events, function(eventObject) {
		/** 
		 *	Attach mouse events if this is not a touch device,
		 *	or add touch events. Note that we bind the current
		 *	instance of the sliderElement to the function call,
		 *	or we would be passing in the element in question.
		 */
		if(!self.isTouchCapable()) {
			eventObject.attachTo.addEventListener(eventObject.listeners.mouse, eventObject.functionCall.bind(self), false);
		}
		else {
			eventObject.attachTo.addEventListener(eventObject.listeners.touch, eventObject.functionCall.bind(self), false);
		}

	});
};

/**
 *	Function to call on dragstart events for mouse and touch based devices
 *
 *	@method onDragStart
 *	@param {object} e - the event
 *	@return undefined
 */
SliderElement.prototype.onDragStart = function(e) {
	/**
	 *	Called on events 'touchdragstart' and 'dragstart'
	 */
	e.preventDefault();
};

/**
 *	Function to call on mousedown and touchstart events for mouse and touch based devices
 *
 *	@method onDown
 *	@param {object} e - the event
 *	@return undefined
 */
SliderElement.prototype.onDown = function(e) {
	/**
	 *	Called on events 'touchstart' and 'mousedown'.
	 *	Set mousedown state and call the slider update function
	 *	to trigger a repaint on window repaint.
	 *
	 *	Important: Remember to kill all actively running animations
	 */
	this.cancelUpdate();
	this.update();
	this.mousedown = e.pageX || e.touches[0].pageX;
};

/**
 *	Function to call on mousemove and touchmove events for mouse and touch based devices
 *
 *	@method onMove
 *	@param {object} e - the event
 *	@return undefined
 */
SliderElement.prototype.onMove = function(e) {
	/**
	 *	Called on events 'touchmove' and 'mousemove'.
	 *
	 *	Update the coordinates for the mouse direction.
	 *	This will be used to determine the translation
	 *	for the slider repaint function.
	 */

	e.preventDefault();

	if(this.mousedown) {
		var xCoord = e.pageX || e.touches[0].pageX;
		this.dx = 0 - (this.mousedown - xCoord);
	}
};

/**
 *	Function to call on mouseup and touchend events for mouse and touch based devices
 *
 *	@method onUp
 *	@param {object} e - the event
 *	@return undefined
 */
SliderElement.prototype.onUp = function(e) {
	/**
	 *	Called on events 'touchend' and 'mouseup'.
	 *	Cancel the repaint of the slider and reset mouse diff
	 *	but first update the sliderX coordinates.
	 */
	this.mousedown = false;
	this.cancelUpdate();
	this.sliderX += this.dx;
	this.customEvents.sliderdrop.dx = this.dx;
	this.dx = 0;

	/**
	 *	Finally, trigger the sliderdrop event
	 */
	this.container.dispatchEvent(this.customEvents.sliderdrop);

};

/**
 *	Function to call on mouseleave and touchleave events for mouse and touch based devices
 *
 *	@method onLeave
 *	@param {object} e - the event
 *	@return undefined
 */
SliderElement.prototype.onLeave = function(e) {

	/**
	 *	Only dispatch the sliderDrop custom event to 
	 *	go to a slide if the mouse is down and the slider
	 *	is being dragged on mouse leave
	 */
	if(this.mousedown) {
		this.container.dispatchEvent(this.customEvents.sliderdrop);
	}

	/**
	 *	Called on events 'touchleave' and 'mouseleave'.
	 *	Cancel the repaint of the slider and reset mouse diff
	 */
	this.mousedown = false;
	this.cancelUpdate();
	this.sliderX += this.dx;
	this.customEvents.sliderdrop.dx = this.dx;
	this.dx = 0;
};

/**
 *	Function to call when the slider has been dropped, as in, 
 *	when the mouse or touch leaves the slider area and it is 
 *	no longer scrolling.
 *
 *	@method onSliderDrop
 *	@param {object} - custom event parameter containing the drop X coordinate {e.dx}
 *	@return undefined
 */
SliderElement.prototype.onSliderDrop = function(e) {

	/**
	 *	Function carrying out calculations helping to decide whether to 
	 *	move the slider and if so, in which direction.
	 *
	 *	If it has moved more than 50% in any direction, then the threshhold 
	 *	has been met and we should move to the nexr/prev slide.
	 *
	 *	If the direction the slider was pulled was negative, then move it to 
	 *	the left, ot move it to the right, if the threshhold has been met.
	 *
	 *	This is a self-executing function, whose values are assigned to movement.
	 */
	var movement = (function(dx) {
		var amount = e.dx < 0 ? 0 - e.dx:e.dx,
			threshholdCrossed = amount % this.sliderWidth > (this.sliderWidth / 6),
			direction = e.dx < 0 ? 'left':'right';
		return {
			amount: amount,
			threshholdCrossed: threshholdCrossed,
			direction: direction
		}
	}).bind(this)();

	/**
	 *	Snap the slider back into position only if this has been specified 
	 *	as an option and the slider is not already in an animating state.
	 */
	if(this.options.snapToNearest && !this.isAnimating) {

		var slideNumber = this.currentSlide;

		/**
		 *	Determining which slide we need to move to
		 */
		if(movement.threshholdCrossed) {
			switch(movement.direction) {
				case 'left': 
					slideNumber++;
					break;
				case 'right': 
					slideNumber--;
					break;
			}
		}
		this.goToSlide(slideNumber);
	}
};

/**
 *	Method to push the slider to the next/prev slide
 *	
 *	@method go
 *	@param {string} direction - can be either 'next' or 'previous'
 *	@return undefined
 */
SliderElement.prototype.go = function(direction) {
	switch(direction) {
		case 'next': {
			this.goToSlide(this.currentSlide + 1);
			break;
		}
		case 'previous': {
			this.goToSlide(this.currentSlide - 1);
			break;
		}
	}
};

/**
 *	Function to move to a numbered slide
 *
 *	@method goToSlide
 *	@param {number} slideNumber - the slide number to go to
 *	@return undefined - returns nothing
 */
SliderElement.prototype.goToSlide = function(slideNumber) {

	/**
	 *	Set slider animating state to true and add CSS animation
	 *	properties to the slider.
	 *	We also reset the properties on the boundsReached event,
	 *	only needing it when we hit the beginning or end of the 
	 *	slider.
	 */
	this.isAnimating = true;
	this.toggleSmoothAnimation(true);
	var sliderBounds = {},
		numberOfSlides = this.slides.length / this.concurrentSlides;

	/**
	 *	If the slideNumber is greater than the number of slides
	 *	or less than zero, apply these constraints
	 */
	if(slideNumber >= (numberOfSlides)) {
		slideNumber = numberOfSlides - 1;
		sliderBounds.direction = 'right';
		sliderBounds.slideNumber = slideNumber;
	}
	if(slideNumber < 0) {
		slideNumber = 0;
		sliderBounds.direction = 'left';
		sliderBounds.slideNumber = slideNumber;
	} 

	/**
	 *	Setting the slider translateX destination
	 */
	var translateToX = 0 - (slideNumber * this.sliderWidth);

	/**
	 *	Then calling the transform function, resetting states with a callback
	 *	once the animation has completed.
	 */
	this.transform(translateToX, function(x) {
		this.callbackTimeout = setTimeout(function() {
			this.sliderX = x;
			this.isAnimating = false;
			this.toggleSmoothAnimation(false);
			this.currentSlide = slideNumber;

			/**
			 *	If we hit either end of the slider, dispatch the event
			 */
			if(typeof sliderBounds.direction !== 'undefined') {
				this.customEvents.boundsreached.data = sliderBounds;
				this.container.dispatchEvent(this.customEvents.boundsreached);
			}

			/**
			 *	Fire of the slidecomplete custom event 
			 */
			this.customEvents.slidecomplete.data = {
				currentSlide: this.currentSlide 
			};

			this.container.dispatchEvent(this.customEvents.slidecomplete);

		}.bind(this), this.transitionDuration);
	}.bind(this));
};

/**
 *	Function to toggle CSS smooth transition on or off 
 *	
 *	@method toggleSmoothAnimation
 *	@param {boolean} on - whether to apply or remove this property
 *	@return undefined - returns nothing
 */
SliderElement.prototype.toggleSmoothAnimation = function(on) {

	if(on) {
		this.slider.style.transitionDuration = this.slider.style.WebkitTransitionDuration = this.transitionDuration + 'ms';
		this.slider.style.transitionProperty = this.slider.style.WebkitTransitionProperty = 'transform';
	}
	else {
		this.slider.style.transitionDuration = this.slider.style.WebkitTransitionDuration = 'initial';
		this.slider.style.transitionProperty = this.slider.style.WebkitTransitionProperty = 'initial';
	}
}

/**
 *	Function to detect touch or mouse based devices
 *	
 *	@method isTouchCapable
 *	@return {boolean} true if this is a touch device or false if not
 *	
 *	@TODO: 	Dealing with hybrid devices, like the lenovo touch which
 *			has both a touchscreen and mouse.
 */
SliderElement.prototype.isTouchCapable = function() {
	return 'ontouchstart' in document.documentElement;
};

/**
 *	Function to repaint the slider when needed	
 *
 *	@method update
 *	@param  {number} movementMultiplier - how many pixels to move per mouse pixel moved
 *	@return undefined
 */
SliderElement.prototype.update = function() {

	/**
	 *	By calling this binding, this function will continuously run
	 *	each time an animation frame is requested, effectively giving 
	 *	us a nicely timed loop so we can update the UI for the slider.
	 *
	 */
	this.animationFrameId = this.requestAnimationFrame(this.update.bind(this));
	var translateX = (this.sliderX + this.dx);
	this.transform(translateX);
};

/**
 *	Function to apply CSS transforms for the slider
 *
 *	@method transform
 *	@param {number} translateX - the CSS transform translateX property
 *	@param {function} callback - optional callback to execute when done
 */
SliderElement.prototype.transform = function(translateX, callback) {
	if(typeof translateX !== 'number') {
		throw {
			error: 'Not a number',
			message: 'translateX parameter needs to be a number. You passed in: ' + (typeof translateX)
		}
		return;
	}

	this.slider.style.transform = this.slider.style.webkitTransform = 'translate3d(' + translateX + 'px,0,0)';

	if(typeof callback !== 'undefined') {
		callback(translateX);
	}
};

/**
 *	Debug helper function
 *
 *	@method debug
 *	@param {string} message - the debug message to render
 *	@return undefined
 */
SliderElement.prototype.debug = function(message) {
	var debug = document.querySelector('.debug');
	if(debug.firstChild) {
		debug.removeChild(debug.firstChild);
	}

	debug.appendChild(document.createTextNode(message));
};

/**
 *	Function to cancel repainting of the slider
 *	
 *	@method cancelUpdate
 *	@return undefined
 */
SliderElement.prototype.cancelUpdate = function() {
	window.cancelAnimationFrame(this.animationFrameId);
	this.animationFrameId = 0;
};

/**
 *	Method to request animation tick for the slider (cross-browser)
 *	
 *	@method requestAnimationFrame
 *	@param {function} callback - the callback to execute 
 *	@return {object} the callback executed on window repaint
 */
SliderElement.prototype.requestAnimationFrame = function(callback) {

	return	window.requestAnimationFrame(callback)			||
			window.webkitRequestAnimationFrame(callback)	||
			window.mozRequestAnimationFrame(callback)		||
			window.oRequestAnimationFrame(callback)			||
			window.msRequestAnimationFrame(callback)		||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
};

/** 
 *	The slider class, which acts upon one or more slider elements
 *
 *	@class Slider
 *
 */
Slider = {

	/**
	 *	The slider elements selected by class name, for which 
	 *	we can have none or more.
	 *
	 *	@property sliderElements
	 *	@type {Array}
	 */
	sliderElements: [],

	/**
	 *	Function to set up all slider elements on a page.
	 *
	 *	@method setupAll
	 *	@param {string} sliderSelectorContainer - A string representing the selector for the slider container(s)
	 *	@return undefined
	 */
	setupAll: function(sliderContainerSelector) {

		var self = this,
			sliderContainers = document.querySelectorAll(sliderContainerSelector);

		/**
		 *	Use Array.prototype foreach call passing in the sliderContainers,
		 *	looping through and matching all items in the above query.
		 */
		[].forEach.call(sliderContainers, function(sliderContainer) {
			self.addSlide(sliderContainer);
		});
	},	

	/**
	 *	Function to set up a targeted slider element on a page and return it 
	 *	as a single instance of a SliderElement
	 *
	 *	@method setup
	 *	@param {object} sliderContainerNode - the DOM node representing the slider container
	 *	@param {object} optionsOverride - optional parameters to override default values
	 *	@return {object} sliderElement - the sliderElement object 
	 */
	setup: function(sliderContainerNode, optionsOverride) {
		return new SliderElement(sliderContainerNode, optionsOverride);
	},

	/**
	 *	Function to initialise a new SliderElement and add it to the Slider
	 *	@param {object} sliderItem - slider dom element
	 *	@return undefined
	 */
	addSlide: function(sliderItem) {
		this.sliderElements.push(new SliderElement(sliderItem));
	}
};