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
      ,renderSize: 0
      ,growSpeed: 1000 * 2
      ,x: 0
      ,y: 0
      ,stepsTillReproduction: 3
      ,stepsTaken: 0
      ,isDying: false
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
          (Math.random() * this.get('stepsTillReproduction')) + 2
        )
      }));

      this.motion = new Tweenable();
      this.motion.setScheduleFunction(setTimeout);
      this.tweenToNewCoordinates();
      this.growToFullSize();
    }

    ,updateState: function () {
    }

    ,growToFullSize: function () {
      var growth = new Tweenable();
      growth.tween({
        from: { size: 0 }
        ,to: { size: this.get('size') }
        ,duration: this.get('growSpeed')
        ,step: function (state) {
          this.set('renderSize', state.size);
        }.bind(this)
      });
    }

    ,tweenToNewCoordinates: function () {
      var x = Math.random() * this.processing.width;
      var y = Math.random() * this.processing.height;

      this.currentTween = this.motion.tween({
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
        ,this.get('renderSize')
        ,this.get('renderSize')
      );
    }

    ,reproduce: function () {
      this.collection.add(
        new Organism(this.pick('x', 'y'), { processing: this.processing }));
    }

    ,die: function () {
      if (this.get('isDying')) {
        return;
      }

      this.set('isDying', true);
      var death = new Tweenable();
      death.tween({
        from: { size: this.get('size') }
        ,to: { size: 0 }
        ,duration: this.get('growSpeed')
        ,step: function (state) {
          this.set('renderSize', state.size);
        }.bind(this)
        ,finish: function () {
          this.collection.remove(this);
        }.bind(this)
      });
    }
  });

  return Organism;
});
