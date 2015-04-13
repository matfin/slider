Responsive Slider package 
=========================

## About

This is a simple slider plugin written in pure Javascript that is designed to be lightweight, fast and responsive.

## Installation

This is a published meteor package and can be installed using the commands: 

```sh
$ cd /my-meteor-project
$ meteor add matfin:slider
$ meteor
```

Given that this has been written in pure JS, there are no additional package requirements.

## Usage

Please see the README.md for the sample Meteor project, which can be found [https://github.com/matfin/slider-example](here). This includes all the code needed to get up and running.

## Why this slider ?

I have written this slider to be as small and fast as possible, and tried to keep it doing very simple things that work well, instead of creating something large, complicated and bulky.

The aim is to minimise the number of recalculations required on interaction, use the hardware acceleration features of modern browsers, and deliver a smooth user experience even on low powered devices.

## Features

- Fully responsive, meaning it will work on mobile and tablet devices just as well as desktop devices.
- Touch support, meaning the slider responds to touch events if supported, or normal mouse events.
- Responds well to window resize events and recalibrates itself.
- Makes use of requestAnimationFrame, for smoother transitions.
- Fires custom events, so you can write your own code to handle these.

## Support 

- This plugin has been tested to work on the latest two versions of most modern browsers, including the following
	- Internet Explorer >= 10
	- Safari (Desktop and iOS)
	- Firefox 
	- Chrome (Desktop and Android)
	- Opera

## Known issues

- Swipe to scroll does not work for the default Android browser, as the touchmove event behaves in an unusual way. There is no immediate plan to address this issue, given the fact that Chrome is starting to replace this browser.

## Examples of this running

I have created a very simple Meteor project with an example of this slider running, with the templates set up and some basic CSS added. You can find it at [https://github.com/matfin/slider-example](https://github.com/matfin/slider-example)

Other live websites using this package include

- [http://annachristoffer.com](Anna Claire Christoffer - Conceptual Design)
- [http://crymonstercry.com](Cry Monster Cry - Official Website)


## Troubleshooting

If you spot any issues, please add them to the issue tracker of this repository with the following information:

- Browser/Platform name and version number
- Description of what you would expect to be happening 
- Description of what is actually happening
- Optional example repository illustrating the issue

