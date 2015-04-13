Package.describe({
    name: 'matfin:slider',
    version: '1.0.0',
    summary: 'This is a simple slider library built in pure Javascript and is designed to work with mouse and touch based devices.',
    git: 'https://github.com/matfin/slider.git',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    /**
     *  Minimum Meteor version requirement
     */
    api.versionsFrom('1.1.0.2');

    /** 
     *  Package source files
     */
    api.addFiles([
        '_src/customEvent.js',
        '_src/slider.js'
    ], 'client');

    /**
     *  Exporting the main package object, making it accessible from anywhere in the app
     */
    api.export('Slider');
});
