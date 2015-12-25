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

  /**
   * @enum {number}
   */
  var GENDER = {
    MALE: 0
    ,FEMALE: 1
  };

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
      ,stepCounter: 0
      ,isDying: false
      ,isOrigin: false
      ,isReproducing: false
      ,pursueeId: null
      ,gender: null
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
      // Cached reference to another Organism for improved performance.
      // this.get('pursueeId') should be used to maintain state instead of this.
      this.pursuee = null;

      this.set(_.defaults(_.clone(attrs), {
        speed: this.get('minSpeed') + (Math.random() * this.get('speed'))
        ,size: Math.random() * this.get('size')
        ,x: Math.random() * processing.width
        ,y: Math.random() * processing.height
        ,stepsTillReproduction: Math.floor(
          (Math.random() * this.get('stepsTillReproduction')) + 2
        )
      }));

      if (!this.get('isOrigin')) {
        this.maybeAssignGender();
      }

      if (this.get('gender') !== null) {
        // Nulling this value will prevent reproduction based on the number of
        // steps taken
        this.set('stepsTillReproduction', null);
      }

      this.motion = new Tweenable();
      this.motion.setScheduleFunction(setTimeout);
      this.tweenToNewCoordinates();
      this.growToFullSize();
    }

    ,updateState: function () {
      if (this.get('gender') === GENDER.MALE && !this.get('pursueeId')) {
        var foundMate = this.findEligibleFemale();

        if (foundMate) {
          this.pursueMate(foundMate);
        }
      }
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

      var stepCounter = this.get('stepCounter') + 1;
      this.set('stepCounter', stepCounter);

      if (stepCounter === this.get('stepsTillReproduction')) {
        this.reproduce();
        this.set('stepCounter', 0);
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

      var genderColor = this.get('gender') === null ? 128 : (
        this.get('gender') === GENDER.MALE ? 0 : 255
      );
      // FIXME: Make this a function of the organisms' attributes
      var color = [
        genderColor
        ,0
        ,255
      ];

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
      if (this.get('isDying')) {
        return;
      }

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

    ,maybeAssignGender: function () {
      if (!util.trueOrFalse()) {
        return;
      }

      this.set('gender', util.trueOrFalse() ? GENDER.MALE : GENDER.FEMALE);
    }

    /**
     * @return {Organism|undefined}
     */
    ,findEligibleFemale: function () {
      // TODO: Constrain the search to the male's local area (this current
      // approach is global)
      var nonReproducingFemale = this.collection.findWhere({
        gender: GENDER.FEMALE
        ,isReproducing: false
      });

      return nonReproducingFemale;
    }

    /**
     * @param {Organism} organism
     */
    ,pursueMate: function (organism) {
      this.set('pursueeId', organism.cid);
      this.pursuee = organism;

      if (this.currentTween) {
        this.currentTween.stop();
        this.currentTween = null;
      }

      this.moveTowardsOrganism(this.pursuee);
    }

    /**
     * @param  {Organism} organism
     */
    ,moveTowardsOrganism: function (organism) {
      var startingX = this.get('x');
      var startingY = this.get('y');

      this.currentTween = this.motion.tween({
        from: { d: 0 }
        ,to: { d: 1 }
        ,duration: this.get('speed')
        ,step: function (state) {
          var newCoords = Tweenable.interpolate(
            { x: startingX, y: startingY }
            ,{ x: organism.get('x'), y: organism.get('y') }
            ,state.d
          );

          this.set(newCoords);
        }.bind(this)
        ,finish: function () {
          this.moveTowardsOrganism(organism);
        }.bind(this)
      });
    }
  });

  return Organism;
});
