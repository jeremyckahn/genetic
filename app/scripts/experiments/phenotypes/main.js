define([

  'jquery'
  ,'lodash'
  ,'backbone'

  ,'./organism'

], function (

  $
  ,_
  ,Backbone

  ,Organism

) {
  'use strict';

  var $win = $(window);
  var MAX_ORGANISMS = 100;

  /**
   * @param  {Processing} processing
   */
  function Phenotypes (processing) {
    this.processing = processing;
    this.processing.noLoop();
    this.processing.ellipseMode(this.processing.CORNER);
    this.processing.draw = this.draw.bind(this);
    this.setup();
    this.organismCollection =
      new Backbone.Collection([
        new Organism({
          isOrigin: true
        }, {
          processing: this.processing
        })
      ]);
    this.organismCollection.on('add', this.onCollectionAdd.bind(this));
    this.scheduleUpdate();

    $win.on('resize', this.onWindowResize.bind(this));
  }

  _.extend(Phenotypes.prototype, {
    setup: function () {
      this.resizeCanvas();
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

    ,resizeCanvas: function () {
      this.processing.size(
        $win.width()
        ,$win.height()
      );
    }

    ,onCollectionAdd: function (organism, collection) {
      if (collection.length > MAX_ORGANISMS) {
        var difference = collection.length - MAX_ORGANISMS;
        _.range(difference).forEach(function (i) {
          collection.at(i).die();
        });
      }
    }

    ,onWindowResize: function () {
      this.resizeCanvas();
    }
  });

  return Phenotypes;
});
