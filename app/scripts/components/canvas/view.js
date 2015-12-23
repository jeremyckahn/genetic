define([

  'lateralus'
  ,'processing'

  ,'text!./template.mustache'

  ,'phenotypes'

], function (

  Lateralus
  ,Processing

  ,template

  ,Phenotypes

) {
  'use strict';

  var Base = Lateralus.Component.View;
  var baseProto = Base.prototype;

  var CanvasComponentView = Base.extend({
    template: template

    ,provide: {
      /**
       * @return {Ojbect}
       */
      experiment: function () {
        return this.experiment;
      }
    }

    /**
     * @param {Object} [options] See http://backbonejs.org/#View-constructor
     */
    ,initialize: function () {
      baseProto.initialize.apply(this, arguments);

      this.experiment = null;
      this.processing = new Processing(this.el, this.initEperiment.bind(this));
    }

    /**
     * @param  {Processing} processing
     * @return {Phenotypes}
     */
    ,initEperiment: function (processing) {
      this.experiment = new Phenotypes(processing);
      return this.experiment;
    }
  });

  return CanvasComponentView;
});
