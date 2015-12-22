define([

  'lateralus'
  ,'processing'

  ,'text!./template.mustache'

], function (

  Lateralus
  ,Processing

  ,template

) {
  'use strict';

  var Base = Lateralus.Component.View;
  var baseProto = Base.prototype;

  var CanvasComponentView = Base.extend({
    template: template

    /**
     * @param {Object} [options] See http://backbonejs.org/#View-constructor
     */
    ,initialize: function () {
      baseProto.initialize.apply(this, arguments);

      this.processing = new Processing(this.el, this.sketch.bind(this));
    }

    ,sketch: function (processing) {
      processing.size(300, 300);
      processing.background(128, 128, 128);
    }
  });

  return CanvasComponentView;
});
