/**
 *	CustomEvent class
 *
 *	@class 		CustomEvent
 */
class CustomEvent {
	constructor (name, params = {bubbles: false, cancelable: false, detail: null}) {
		this.event = new Event(name, params);
	}
}

/**
 *	SliderElement class, representing an individual DOM node for the sliders.
 *	This is so we can add sliders and attach events to them individually.
 *	
 *	@class 		SliderElement
 *	@param 		{Object} domNode - the individual DOM node representing the Slider Element
 *	@param 		{Object} optionsOverride - optional overrides to default values
 *	@constructor
 */
class SliderElement {
	/**
	 *	Slider constructor
	 *	
	 *	@constructor
	 *	@param 		{Object} - slider container dom node.
	 *	@param 		{Object} - optional override for default options.
	 */
	constructor(domNode, optionsOverride) {
		/**
		 *	The html dom element for the slider	
		 *
		 *	@property 	domNode
		 *	@type 		{Object}
		 */
		this.container = domNode;

		/**
		 *	Options override 
		 *
		 *	@property 	optionsOverride
		 *	@type 		{Object}
		 */
		this.optionsOverride = optionsOverride;

		/**
		 *	The slider that needs to be scrolled
		 *	
		 *	@property 	slider
		 *	@type 		{Object}
		 */
		this.slides = {};

		/**
		 *	Used to calculate the movement of the mouse along the x 
		 *	axis from when the mouse button was first held down
		 *	
		 *	@property 	dx
		 *	@type 		{Number}
		 *	@default 	0
		 */
		this.dx = 0;

		/**
		 *	Used to calculate the movement of the mouse along the x 
		 *	axis from when the mouse button was first held down
		 *	
		 *	@property 	dy
		 *	@type 		{Number}
		 *	@default 	0
		 */
		this.dy = 0;

		/**
		 *	Used to store the current translated X coordinate of the slider
		 *
		 *	@property 	sliderX
		 *	@type 		{Number}
		 *	@default 	0
		 */
		this.sliderX = 0;

		/**
		 *	Determine whether to start dragging the slider with this.
		 *
		 *	@property 	mousedown
		 *	@type 		{Object}
		 */
		this.mousedown = {
			x: 0,
			y: 0,
			active: false
		};

		/**
		 *	The slide children contained within the slider
		 *
		 *	@property 	children
		 *	@type 		{Object}
		 *	@default 	{}
		 */
		this.children = {};

		/**
		 *	The slider width, determined by the slider container width
		 *	
		 *	@property 	sliderWidth
		 *	@type 		{Number}
		 *	@default 	0
		 */
		this.sliderWidth = 0;

		/**
		 *	The events we need to attach to the slider, for mouse and touch events
		 *
		 *	@property 	events
		 *	@type 		{Object}
		 *	@default 	{}
		 */
		this.events = {};

		/**
		 *	The id associated with the repaint of the slider 
		 *	
		 *	@property 	animationFrameId
		 *	@type 		{Number}
		 */
		this.animationFrameId = 0;

		/**
		 *	Slider animation transition duration
		 *
		 *	@property 	transitionDuration
		 *	@type 		{Number}
		 *	@default 	350
		 */
		this.transitionDuration = 350;

		/**
		 *	Callback timeout to be used by functions spawned multiple times 
		 *	and that have callbacks that only need to be called once.
		 *	
		 *	@property 	callbackTimeout
		 *	@type 		{Number}
		 */
		this.callbackTimeout = 500;

		/**
		 *	Custom events: ie; for when the slider is dropped
		 *
		 *	@property 	customEvents
		 *	@type 		{Object}
		 *	@default 	{}
		 */
		this.customEvents = {};

		/**
		 *	Custom options for the slider
		 *
		 *	@property 	options
		 *	@type 		{Object}
		 *	@default 	{}
		 */
		this.options = {};

		/**
		 *	Current slider speed when it is snapping back to a position
		 *
		 *	@property 	currentSpeed
		 *	@type 		{Number}
		 *	@default 0
		 */
		this.currentSpeed = 0;

		/**
		 *	The current slide the slider is on
		 *
		 *	@property 	currentSlide
		 *	@type 		{Number}
		 *	@default 0
		 */
		this.currentSlide = 0;

		/**
		 *	Number of slide items to show at the same time.
		 *
		 *	@property 	concurrentSlides
		 *	@type 		{Number}
		 *	@default 1
		 */
		this.concurrentSlides = 1;

		/**
		 *	Slider is animating
		 *
		 *	@property 	isAnimating
		 *	@type 		{Boolean}
		 *	@default 	false
		 */
		this.isAnimating = false;

		/**
		 *	Slider image DOM nodes
		 *
		 *	@property 	images
		 *	@type 		{Array}
		 */
		this.images = [];

		/**
		 *	Finally, initialise the slider.
		 */
		this.init();
	}

	/**
	 * 	This sets up the slider and carries out some dom functions.
	 *	
	 *	@method 	init
	 */
	init () {
		/**
		 *	Setting up
		 */
		this.slides 		= this.container.querySelector('div.slides');
		this.children 		= this.slides.children;
		this.sliderWidth 	= this.container.offsetWidth;

		/**
		 *	Slider image DOM elements
		 */
		this.images = this.container.querySelectorAll('img');
	
		/**
		 *	Adding custom events
		 */
		this.customEvents = {
			sliderdrop: 	new CustomEvent('sliderdrop', {}),
			boundsreached: 	new CustomEvent('sliderboundsreached', {}),
			slidecomplete: 	new CustomEvent('slidecomplete', {})
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
		for (let property in this.optionsOverride) {
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
		this.images.forEach((imageObject) => {
			imageObject.addEventListener('load', () => {
				this.sliderWidth = this.container.offsetWidth;	
			});
		});

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
	}

	/**
	 *	Method to handle a window resize event, which will ultimately
	 *	have an effect on slider calculations.
	 *
	 *	@method 	onResize
	 */
	onWindowResize () {
		/**
		 *	Clear any queued timeouts 
		 */
		clearTimeout(this.callbackTimeout);

		/**
		 *	Then run this bound and throttled function
		 *	which resets the slider
		 */
		this.callbackTimeout = setTimeout(() => {
			this.sliderWidth = this.container.offsetWidth;
			this.goToSlide(this.currentSlide);
		}, 500);
	}

	/**
	 *	Method to set up the events for the SliderElement.
	 *	
	 *	@method 	setupEvents
	 */
	setupEvents () {
		/**
		 *	Loop through each event and set it up
		 */
		this.events.forEach((eventObject) => {
			/** 
			 *	Attach mouse events if this is not a touch device,
			 *	or add touch events. Note that we bind the current
			 *	instance of the sliderElement to the function call,
			 *	or we would be passing in the element in question.
			 */
			if(!this.isTouchCapable()) {
				eventObject.attachTo.addEventListener(
					eventObject.listeners.mouse,
					eventObject.functionCall.bind(this),
					false
				);
			}
			else {
				eventObject.attachTo.addEventListener(
					eventObject.listeners.touch,
					eventObject.functionCall.bind(this),
					false
				);
			}
		});
	}

	/**
	 *	Function to call on dragstart events for mouse and touch based devices.
	 *
	 *	@method 	onDragStart
	 *	@param 		{Object} 	e - the event
	 */
	onDragStart (e) {
		/**
		 *	Called on events 'touchdragstart' and 'dragstart'
		 */
		e.preventDefault();
	}

	/**
	 *	Function to call on mousedown and touchstart 
	 *	events for mouse and touch based devices.
	 *
	 *	@method 	onDown
	 *	@param 		{Object} 	e - the event
	 */
	onDown (e) {
		/**
		 *	Called on events 'touchstart' and 'mousedown'.
		 *	Set mousedown state and call the slider update function
		 *	to trigger a repaint on window repaint.
		 *
		 *	Important: Remember to kill all actively running animations
		 */
		this.cancelUpdate();
		this.update();
		this.mousedown = {
			x: e.pageX || e.touches[0].pageX,
			y: e.pageY || e.touches[0].pageY,
			active: true
		}; 
	}

	/**
	 *	Function to call on mousemove and touchmove 
	 *	events for mouse and touch based devices.
	 *
	 *	@method 	onMove
	 *	@param 		{Object} 	e - the event
	 */
	onMove (e) {
		/**
		 *	Called on events 'touchmove' and 'mousemove'.
		 *
		 *	Update the coordinates for the mouse direction.
		 *	This will be used to determine the translation
		 *	for the slider repaint function.
		 */
		e.preventDefault();

		if(this.mousedown.active) {
			let xCoord = e.pageX || e.touches[0].pageX,
				yCoord = e.clientY || e.touches[0].clientY;

			this.dx = 0 - (this.mousedown.x - xCoord);

			if(this.dy) {
				window.scrollBy(0, this.dy - yCoord);
			}

			this.dy =  yCoord;
		}
	}

	/**
	 *	Function to call on mouseup and touchend events 
	 *	for mouse and touch based devices.
	 *
	 *	@method 	onUp
	 *	@param 		{Object} 	e - the event
	 */
	onUp (e) {
		/**
		 *	Called on events 'touchend' and 'mouseup'.
		 *	Cancel the repaint of the slider and reset mouse diff
		 *	but first update the sliderX coordinates.
		 */
		this.mousedown = {
			x: 0, 
			y: 0,
			active: false
		};
		
		this.cancelUpdate();
		
		this.sliderX += this.dx;
		this.customEvents.sliderdrop.event.dx = this.dx;

		this.dx = 0;
		this.dy = false;

		/**
		 *	Finally, trigger the sliderdrop event
		 */
		this.container.dispatchEvent(this.customEvents.sliderdrop.event);
	}

	/**
	 *	Function to call on mouseleave and touchleave 
	 *	events for mouse and touch based devices.
	 *
	 *	@method 	onLeave
	 *	@param 		{Object} 	e - the event
	 */
	onLeave (e) {
		/**
		 *	Only dispatch the sliderDrop custom event to 
		 *	go to a slide if the mouse is down and the slider
		 *	is being dragged on mouse leave
		 */
		if(this.mousedown.active) {
			this.container.dispatchEvent(this.customEvents.sliderdrop.event);
		}

		/**
		 *	Called on events 'touchleave' and 'mouseleave'.
		 *	Cancel the repaint of the slider and reset mouse diff
		 */
		this.mousedown = {
			x: 0,
			y: 0,
			active: false
		};
		this.cancelUpdate();
		this.sliderX += this.dx;
		this.customEvents.sliderdrop.event.dx = this.dx;
		this.dx = 0;
	}

	/**
	 *	Function to call when the slider has been dropped, as in, 
	 *	when the mouse or touch leaves the slider area and it is 
	 *	no longer scrolling.
	 *
	 *	@method 	onSliderDrop
	 *	@param 		{Object} 	- custom event parameter containing the drop X coordinate {e.dx}
	 */
	onSliderDrop (e) {
		/**
		 *	Function carrying out calculations helping to decide whether to 
		 *	move the slider and if so, in which direction.
		 *
		 *	If it has moved more than 16% in any direction, then the threshhold 
		 *	has been met and we should move to the nexr/prev slide.
		 *
		 *	If the direction the slider was pulled was negative, then move it to 
		 *	the left, ot move it to the right, if the threshhold has been met.
		 *
		 *	This is a self-executing function, whose values are assigned to movement.
		 */
		let movement = ((dx) => {
			let amount 				= e.dx < 0 ? 0 - e.dx:e.dx,
				threshholdCrossed 	= amount % this.sliderWidth > (this.sliderWidth / 6),
				direction 			= e.dx < 0 ? 'left':'right';

			return {
				amount: amount,
				threshholdCrossed: threshholdCrossed,
				direction: direction
			};
		})();

		/**
		 *	Snap the slider back into position only if this has been specified 
		 *	as an option and the slider is not already in an animating state.
		 */
		if(this.options.snapToNearest && !this.isAnimating) {

			let slideNumber = this.currentSlide;

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
	}
	
	/**
	 *	Method to push the slider to the next/prev slide
	 *	
	 *	@method 	go
	 *	@param 		{String} direction 	- can be either 'next' or 'previous'
	 */
	go (direction) {
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
	}

	/**
	 *	Function to move to a numbered slide
	 *
	 *	@method 	goToSlide
	 *	@param 		{Number} slideNumber 	- the slide number to go to
	 */
	goToSlide (slideNumber) {

		/**
		 *	Set slider animating state to true and add CSS animation
		 *	properties to the slider.
		 *	We also reset the properties on the boundsReached event,
		 *	only needing it when we hit the beginning or end of the 
		 *	slider.
		 */
		this.isAnimating = true;
		this.toggleSmoothAnimation(true);
		let sliderBounds = {},
			numberOfSlides = this.children.length / this.concurrentSlides;

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
		let translateToX = 0 - (slideNumber * this.sliderWidth);

		/**
		 *	Then calling the transform function, resetting states with a callback
		 *	once the animation has completed.
		 */
		this.transform(translateToX, (x) => {
			this.callbackTimeout = setTimeout(() => {
				this.sliderX 		= x;
				this.isAnimating 	= false;
				this.currentSlide 	= slideNumber;

				this.toggleSmoothAnimation(false);

				/**
				 *	If we hit either end of the slider, dispatch the event
				 */
				if(sliderBounds.direction != null) {
					this.customEvents.boundsreached.event.data = sliderBounds;
					this.container.dispatchEvent(this.customEvents.boundsreached.event);
				}

				/**
				 *	Fire of the slidecomplete custom event 
				 */
				this.customEvents.slidecomplete.event.data = {
					currentSlide: this.currentSlide 
				};

				this.container.dispatchEvent(this.customEvents.slidecomplete.event);

			}, this.transitionDuration);
		});
	}

	/**
	 *	Function to toggle CSS smooth transition on or off 
	 *	
	 *	@method 	toggleSmoothAnimation
	 *	@param 		{Boolean} on 	- whether to apply or remove this property
	 */
	toggleSmoothAnimation (on) {
		if(on) {
			this.slides.style.transitionDuration = this.slides.style.WebkitTransitionDuration = this.transitionDuration + 'ms';
			this.slides.style.transitionProperty = this.slides.style.WebkitTransitionProperty = 'transform';
		}
		else {
			this.slides.style.transitionDuration = this.slides.style.WebkitTransitionDuration = 'initial';
			this.slides.style.transitionProperty = this.slides.style.WebkitTransitionProperty = 'initial';
		}
	}

	/**
	 *	Function to detect touch or mouse based devices
	 *	
	 *	@method 	isTouchCapable
	 *	@return 	{Boolean} 	- true if this is a touch device or false if not
	 *	
	 */
	isTouchCapable () {
		return 'ontouchstart' in document.documentElement;
	}

	/**
	 *	Function to repaint the slider when needed	
	 *
	 *	@method 	update
	 *	@param  	{Number} movementMultiplier 	- how many pixels to move per mouse pixel moved
	 */
	update () {

		/**
		 *	By calling this binding, this function will continuously run
		 *	each time an animation frame is requested, effectively giving 
		 *	us a nicely timed loop so we can update the UI for the slider.
		 *
		 */
		this.animationFrameId 	= this.requestAnimationFrame(this.update.bind(this));
		let translateX 			= this.sliderX + this.dx;
		this.transform(translateX);
	}

	/**
	 *	Function to apply CSS transforms for the slider
	 *
	 *	@method 	transform
	 *	@param 		{Number} 	translateX 	- the CSS transform translateX property
	 *	@param 		{Function} 	callback 	- optional callback to execute when done
	 */
	transform (translateX, callback) {
		if(typeof translateX !== 'number') {
			throw {
				error: 'Not a number',
				message: `translateX parameter needs to be a number. You passed in:  $(typeof translateX)`
			};
		}

		this.slides.style.transform = this.slides.style.webkitTransform = `translate3d(${translateX}px,0,0)`;

		if(typeof callback != null && typeof callback === 'function') {
			callback(translateX);
		}
	}

	/**
	 *	Function to cancel repainting of the slider
	 *	
	 *	@method 	cancelUpdate
	 */
	cancelUpdate () {
		window.cancelAnimationFrame(this.animationFrameId);
		this.animationFrameId = 0;
	}

	/**
	 *	Method to request animation tick for the slider (cross-browser)
	 *	
	 *	@method 	requestAnimationFrame
	 *	@param 		{Function} 	callback 	- the callback to execute 
	 *	@return 	{Object} 	the executed callback
	 */
	requestAnimationFrame (callback) {

		return	window.requestAnimationFrame(callback)			||
				window.webkitRequestAnimationFrame(callback)	||
				window.mozRequestAnimationFrame(callback)		||
				window.oRequestAnimationFrame(callback)			||
				window.msRequestAnimationFrame(callback)		||
				window.setTimeout(callback, 1000 / 60);
	}
}

/** 
 *	The slider class, which acts upon one or more slider elements
 *
 *	@class Slider
 */
class Slider {

	constructor () {
		/**
		 *	The slider elements selected by class name, for which 
		 *	we can have none or more.
		 *
		 *	@property 	sliderElements
		 *	@type 		{Array}
		 */
		this.sliderElements = [];
	}

	/**
	 *	Function to set up all slider elements on a page.
	 *
	 *	@method 	setupAll
	 *	@param 		{String} sliderSelectorContainer 	- A string representing the selector for the slider container(s)
	 */
	setupAll (sliderContainerSelector) {
		let	sliderContainers = document.querySelectorAll(sliderContainerSelector);
		sliderContainers.forEach((sliderContainer) => {
			this.addSlide(sliderContainer);
		});
	}	

	/**
	 *	Function to set up a targeted slider element on a page and return it 
	 *	as a single instance of a SliderElement.
	 *
	 *	@method 	setup
	 *	@param 		{Object} sliderContainerNode 	- the DOM node representing the slider container
	 *	@param 		{Object} optionsOverride 		- optional parameters to override default values
	 *	@return 	{Object} sliderElement 			- instance of a SliderElement
	 */
	setup(sliderContainerNode, optionsOverride) {
		return new SliderElement(sliderContainerNode, optionsOverride);
	}

	/**
	 *	Function to initialise a new SliderElement and add it to the Slider.
	 *
	 *	@param 		{Object} sliderItem 	- slider dom element
	 */
	addSlide (sliderItem) {
		this.sliderElements.push(new SliderElement(sliderItem));
	}
}