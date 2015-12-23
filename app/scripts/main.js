/*global require*/
'use strict';

require.config({
  baseUrl: '/'
  ,map: {
    '*': {
      underscore: 'lodash'
    }
  }
  ,shim: {
    bootstrap: {
      deps: ['jquery']
      ,exports: 'jquery'
    }
    ,processing: {
      exports: 'Processing'
    }
  }
  ,paths: {
    text: 'bower_components/requirejs-text/text'
    ,jquery: 'bower_components/jquery/dist/jquery'
    ,backbone: 'bower_components/backbone/backbone'
    ,lodash: 'bower_components/lodash/dist/lodash'
    ,mustache: 'bower_components/mustache/mustache'
    ,processing: 'bower_components/Processing.js/processing'
  }
  ,packages: [{
    name: 'lateralus'
    ,location: 'bower_components/lateralus/scripts'
    ,main: 'lateralus'
  }, {
    name: 'phenotypes'
    ,location: 'scripts/experiments/phenotypes'
  }, {
    name: 'genetic'
    ,location: 'scripts'
    ,main: 'genetic'
  }, {
    name: 'genetic.component.container'
    ,location: 'scripts/components/container'
  }, {
    name: 'genetic.component.canvas'
    ,location: 'scripts/components/canvas'
  }]
});

require([

  'genetic'

], function (

  Genetic

) {
  window.genetic = new Genetic(document.getElementById('genetic'));
});
