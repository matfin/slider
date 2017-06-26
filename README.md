Responsive Slider package 
=========================

## About
This is a simple slider plugin written in vanilla Javascript that is designed to be lightweight, fast and responsive.

## Installation
This package is published on [NPMJS](https://www.npmjs.com) and [Yarn](https://yarnpkg.com/en/docs/managing-dependencies) and can be installed with either package management tool.

To install via NPM:
```sh
$ cd /my-project-root
$ npm install matfin-slider
```

To install via Yarn:
```sh
$ cd /my-project-root
$ yarn add matfin-slider
```

This package has been written in Vanilla Javascript (ES2015) and is transpiled to ES5 using babel. The set up is as follows:

- `_src/slider.js` is the source code written in ES2015.
- `dist/slider.js` is the transpiled version unminified and converted to use the ES5 syntax of JS.
- `dist/slider.min.js` is the transpiled and minified version of the code.

## Usage

To use this package directly, simply include it as a script in your html source as follows:

```html
<script src="bower_components/matfin-slider/_dist/slider.js">
</script>
```

You will then need to set up the html for your slider as follows:

```html
<div class="slider">
	<div class="slides" style="width: 300%">
		<img src="this/is/slide/one.jpg" />
		<img src="this/is/slide/two.jpg" />
		<img src="this/is/slide/three.jpg" />
	</div>
</div>
```

The following CSS should apply:

```css
.slider {
	position: relative;
	overflow: hidden;
	transform: translate3d(0px, 0px, 0px);
}

.slider .slides {
	display: flex;
}

.slider .slides img {
	flex: 1
}
```

You will then need to add the following to your Javascript source:

```js
/**
 *	To set up all sliders on a page.
 */
onload = () => {
	let nodes = document.querySelectorAll('.slider');
	nodes.forEach((node) => {
		new Slider().setup(node);
	});
};
```

```js
/**
 *	To target an individual slider for set up.
 */
onload = () => {
	let node 	= document.querySelector('.slider'),
		slider 	= new Slider().setup(node);
};
```

Events can also be dispatched as needed:

```js

onload = () => {
	
	let node 	= document.querySelector('.slider'),
		slider 	= new Slider().setup(node);

	/**
	 *	This is fired when the slider has been let go.
	 */
	node.addEventListener('sliderdrop', (e) => {
		console.log(e);
		// your code here...
	});

	/**
	 *	This is fired when the slider animation has completed.
	 */
	node.addEventListener('slidecomplete', (e) => {
		console.log(e);
		// your code here...
	});

	/**
	 *	This is fired when the slider has reached the beginning or the end.
	 */
	node.addEventListener('sliderboundsreached', (e) => {
		console.log(e);
		// your code here...
	});

};

```

**Note:** 

When setting the width for the slide container (`.slides`), you need to set this as `100%` multiplied by the number of slides inside `slides`. 

The immediate children of `.slides` are regarded as a single slide. 

If you wanted to caclulate the number of slides correctly and apply the `width` style using Javascript, you could do as follows:

```
onload = () => {
	let slide_nodes = document.querySelectorAll('.slides');

	slide_nodes.forEach((slide_node) => {
		let count_children 		= slide_node.children.length;
		slide_node.style.width 	= `${count_children * 100}%`;
	});
};
```

## Features
- Fully responsive, meaning it will work on mobile and tablet devices just as well as desktop devices.
- Touch support, meaning the slider responds to touch events if supported, or normal mouse events.
- Responds well to window resize events and recalibrates itself.
- Makes use of requestAnimationFrame for smoother transitions.
- Fires custom events, so you can write your own code to handle these.

## Support 
- This plugin has been tested to work on the latest versions of most modern browsers, including the following
	- Internet Explorer
	- Microsoft Edge
	- Safari (Desktop and iOS)
	- Firefox 
	- Chrome (Desktop and Android)
	- Opera

- The following browsers are not fully supported so you may encounter issies with them.
	- Internet Explorer 10
	- Default Android Browser

## Troubleshooting
If you spot any issues, please add them to the issue tracker of this repository with the following information:

- Browser/Platform name and version number
- Description of what you would expect to be happening 
- Description of what is actually happening
- Optional example repository illustrating the issue

