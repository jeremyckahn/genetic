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
    this.scheduleUpdate();
  }

  _.extend(Phenotypes.prototype, {
    setup: function () {
      this.processing.size(500, 500);
      this.clearCanvas();
    }

    ,scheduleUpdate: function () {
      // Schedule updateState with setTimeout so all state updates occur
      setTimeout(function () {
        this.updateState();
        this.scheduleUpdate();
      }.bind(this), 1000 / 60);

      // Schedule renderState with rAF so the browser can optimize render calls
      window.requestAnimationFrame(this.renderState.bind(this));
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
