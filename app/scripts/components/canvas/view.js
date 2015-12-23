define([

  'lateralus'
  ,'processing'

  ,'text!./template.mustache'

  ,'scripts/experiments/phenotypes'

], function (

  Lateralus
  ,Processing

  ,template

  ,phenotypes

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

    /**
     * @param  {Processing} processing
     */
    ,sketch: function (processing) {
      phenotypes(processing);
    }
  });

  return CanvasComponentView;
});
