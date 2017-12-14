module.exports = function (grunt) {
    grunt.initConfig({
        browserify: {
            vendor: {
                src: [],
                dest: 'public/vendor.js',
                options: {}
            },
            client: {
                src: ['public/*.js'],
                dest: 'public/libs/client.js',
                options: {}
            }
        },
    });

    grunt.loadTasks('./node_modules/grunt-browserify/tasks/');
    grunt.registerTask('default', ['browserify']);

};