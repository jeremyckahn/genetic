define([

  'lateralus'

  ,'./model'
  ,'./view'
  ,'text!./template.mustache'

  ,'genetic.component.canvas'

], function (

  Lateralus

  ,Model
  ,View
  ,template

  ,CanvasComponent

) {
  'use strict';

  var Base = Lateralus.Component;

  var ContainerComponent = Base.extend({
    name: 'container'
    ,Model: Model
    ,View: View
    ,template: template

    ,initialize: function () {
      this.canvasComponent = this.addComponent(CanvasComponent, {
        el: this.view.$canvas[0]
      });
    }
  });

  return ContainerComponent;
});
