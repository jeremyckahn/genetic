define([

  'lodash'
  ,'backbone'

  ,'./organism'

], function (

  _
  ,Backbone

  ,Organism

) {
  'use strict';

  /**
   * @param  {Processing} processing
   */
  function Phenotypes (processing) {
    this.processing = processing;
    this.processing.noLoop();
    this.processing.draw = this.draw.bind(this);
    this.setup();
    this.organismCollection =
      new Backbone.Collection([
        new Organism({}, { processing: this.processing })
      ]);
    this.tick();
  }

  _.extend(Phenotypes.prototype, {
    setup: function () {
      this.processing.size(500, 500);
      this.clearCanvas();
    }

    ,scheduleUpdate: function () {
      window.requestAnimationFrame(this.tick.bind(this));
    }

    ,tick: function () {
      this.updateState();
      this.renderState();
      this.scheduleUpdate();
    }

    ,renderState: function () {
      this.processing.redraw();
    }

    ,updateState: function () {
      this.organismCollection.invoke('updateState');
    }

    ,clearCanvas: function () {
      this.processing.background(128, 128, 128);
    }

    ,draw: function () {
      this.clearCanvas();
      this.organismCollection.invoke('renderState');
    }
  });

  return Phenotypes;
});
