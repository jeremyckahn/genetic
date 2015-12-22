define([

  'lateralus'

  ,'./model'
  ,'./view'
  ,'text!./template.mustache'

], function (

  Lateralus

  ,Model
  ,View
  ,template

) {
  'use strict';

  var Base = Lateralus.Component;

  var CanvasComponent = Base.extend({
    name: 'canvas'
    ,Model: Model
    ,View: View
    ,template: template
  });

  return CanvasComponent;
});
