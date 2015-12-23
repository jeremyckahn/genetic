define([

  'lodash'
  ,'backbone'
  ,'shifty'

  ,'genetic/genetic.util'

], function (

  _
  ,Backbone
  ,Tweenable

  ,util

) {
  'use strict';

  // CONSTANTS
  var VALID_EASING_CURVES = Object.keys(Tweenable.prototype.formula)
    .filter(function (formulaName) {
      return formulaName.match(/InOut/);
    });

  var Organism = Backbone.Model.extend({
    defaults: {
      speed: 1000 * 10
      ,minSpeed: 1000
      ,size: 20
      ,x: 0
      ,y: 0
      ,stepsTillReproduction: 3
      ,stepsTaken: 0
    }

    /**
     * @param {Object} attrs
     * @param {number} [attrs.speed]
     * @param {number} [attrs.x]
     * @param {number} [attrs.y]
     * @param {Object} opts
     * @param {Processing} opts.processing
     */
    ,initialize: function (attrs, opts) {
      var processing = opts.processing;
      this.processing = processing;
      this.currentTween = null;

      this.set(_.defaults(_.clone(attrs), {
        speed: this.get('minSpeed') + (Math.random() * this.get('speed'))
        ,size: Math.random() * this.get('size')
        ,x: Math.random() * processing.width
        ,y: Math.random() * processing.height
        ,stepsTillReproduction: Math.floor(
          (Math.random() * this.get('stepsTillReproduction')) + 1
        )
      }));

      this.tweenable = new Tweenable();
      this.tweenable.setScheduleFunction(setTimeout);
      this.tweenToNewCoordinates();
    }

    ,updateState: function () {
    }

    ,tweenToNewCoordinates: function () {
      var x = Math.random() * this.processing.width;
      var y = Math.random() * this.processing.height;

      this.currentTween = this.tweenable.tween({
        duration: this.get('speed')
        ,from: { x: this.get('x'), y: this.get('y') }
        ,to: { x: x, y: y }
        ,step: this.onTweenStep.bind(this)
        ,finish: this.tweenToNewCoordinates.bind(this)
        ,easing: {
          x: util.pickRandomFrom(VALID_EASING_CURVES)
          ,y: util.pickRandomFrom(VALID_EASING_CURVES)
        }
      });

      var stepsTaken = this.get('stepsTaken') + 1;
      this.set('stepsTaken', stepsTaken);

      if (stepsTaken === this.get('stepsTillReproduction')) {
        this.reproduce();
      }
    }

    /**
     * @param  {{x: number, y: number}} state
     */
    ,onTweenStep: function (state) {
      this.set(state);
    }

    ,renderState: function () {
      var processing = this.processing;

      // FIXME: Make this a function of the organisms' attributes
      var color = [255, 0, 255];

      processing.fill.apply(processing, color);
      processing.stroke.apply(processing, color);

      processing.ellipse(
        this.get('x')
        ,this.get('y')
        ,this.get('size')
        ,this.get('size')
      );
    }

    ,reproduce: function () {
      this.collection.add(
        new Organism(this.pick('x', 'y'), { processing: this.processing }));
    }
  });

  return Organism;
});
