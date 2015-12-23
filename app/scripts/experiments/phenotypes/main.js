define([

  'lodash'

  ,'./organism'

], function (

  _

  ,Organism

) {
  'use strict';

  /**
   * @param  {Processing} processing
   */
  function Phenotypes (processing) {
    this.processing = processing;
    this.organisms = [new Organism(this.processing)];

    this.processing.noLoop();
    this.processing.draw = this.draw;
    this.setup();
  }

  _.extend(Phenotypes.prototype, {
    setup: function () {
      this.processing.size(500, 500);
      this.processing.background(128, 128, 128);
      this.tick();
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
    }

    ,draw: function () {
      // Processing draw() operations go here
      // FYI: this == Processing.prototype
    }
  });

  return Phenotypes;
});
