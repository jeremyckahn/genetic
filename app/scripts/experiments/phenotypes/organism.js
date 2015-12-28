define([

  'lodash'
  ,'backbone'
  ,'shifty'

  ,'genetic/genetic.tweenable'
  ,'genetic/genetic.util'

], function (

  _
  ,Backbone
  ,Tweenable

  ,GeneticTweenable
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
      ,visionRange: 300
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
        ,visionRange: Math.random() * this.get('visionRange')
        ,x: Math.random() * processing.width
        ,y: Math.random() * processing.height
      }));

      if (!this.get('isOrigin')) {
        this.maybeAssignGender();
      }

      this.setStepsUntilReproduction();
      this.motion = new GeneticTweenable();
      this.tweenToRandomCoordinates();
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

    ,setStepsUntilReproduction: function () {
      if (this.get('gender') === null) {
        this.set(
          'stepsTillReproduction'
          ,Math.floor(
            (Math.random() * this.get('stepsTillReproduction')) + 2)
        );
      } else {
        // Nulling this value will prevent reproduction based on the number of
        // steps taken
        this.set('stepsTillReproduction', null);
      }
    }

    ,growToFullSize: function () {
      var growth = new GeneticTweenable();
      growth.tween({
        from: { size: 0 }
        ,to: { size: this.get('size') }
        ,duration: this.get('growSpeed')
        ,step: function (state) {
          this.set('renderSize', state.size);
        }.bind(this)
      });
    }

    ,tweenToRandomCoordinates: function () {
      var x = Math.random() * this.processing.width;
      var y = Math.random() * this.processing.height;

      this.currentTween = this.motion.tween({
        duration: this.get('speed')
        ,from: { x: this.get('x'), y: this.get('y') }
        ,to: { x: x, y: y }
        ,step: this.onTweenStep.bind(this)
        ,finish: this.tweenToRandomCoordinates.bind(this)
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
      this.attributes.x = state.x;
      this.attributes.y = state.y;
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

      var x = this.get('x');
      var y = this.get('y');

      var pursueeId = this.get('pursueeId');
      if (pursueeId) {
        var pursuee = this.collection.get(pursueeId);
        var pursueeX = pursuee.get('x');
        var pursueeY = pursuee.get('y');
        var pursueeRenderSizeHalf = pursuee.get('renderSize') / 2;
        var renderSizeHalf = this.get('renderSize') / 2;
        processing.stroke(255, 255, 128);
        processing.line(
          x + renderSizeHalf
          ,y + renderSizeHalf
          ,pursueeX + pursueeRenderSizeHalf
          ,pursueeY + pursueeRenderSizeHalf
        );
      }

      processing.ellipse(
        x
        ,y
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

      if (this.get('gender') === GENDER.FEMALE) {
        this.set('isReproducing', false);
        this.setStepsUntilReproduction();
      }
    }

    ,die: function () {
      if (this.get('isDying')) {
        return;
      }

      this.set('isDying', true);
      var death = new GeneticTweenable();
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
      var nonReproducingFemales = this.collection.where({
        gender: GENDER.FEMALE
        ,isReproducing: false
      });

      var thisCoords = this.pick('x', 'y');
      var femaleDistances = nonReproducingFemales.map(function (female) {
        var femaleCoords = female.pick('x', 'y');
        return util.getDistance(
          thisCoords.x
          ,thisCoords.y
          ,femaleCoords.x
          ,femaleCoords.y
        );
      });

      var indexOfClosestFemale = util.getIndexOfSmallest(femaleDistances);
      var closestFemale = nonReproducingFemales[indexOfClosestFemale];

      return femaleDistances[indexOfClosestFemale] <= this.get('visionRange') ?
        closestFemale : undefined;
    }

    /**
     * @param {Organism} mate
     */
    ,pursueMate: function (mate) {
      this.set('pursueeId', mate.cid);
      this.pursuee = mate;

      if (this.currentTween) {
        this.currentTween.stop();
        this.currentTween = null;
      }

      this.moveTowardsOrganism(mate);

      this.listenToOnce(
        mate
        ,'change:isReproducing'
        ,this.onChangePursueeIsReproducing.bind(this)
      );

      this.listenToOnce(
        mate
        ,'remove'
        ,this.onPursueeRemoved.bind(this)
      );
    }

    /**
     * @param  {Organism} organism
     */
    ,moveTowardsOrganism: function (organism) {
      var startingX = this.get('x');
      var startingY = this.get('y');
      var xCurve = util.pickRandomFrom(VALID_EASING_CURVES);
      var yCurve = util.pickRandomFrom(VALID_EASING_CURVES);

      this.currentTween = this.motion.tween({
        duration: this.get('speed')
        ,from: { d: 0 }
        ,to: { d: 1 }
        ,step: function (state) {
          var newCoords = Tweenable.interpolate(
            { x: startingX, y: startingY }
            ,{ x: organism.get('x'), y: organism.get('y') }
            ,state.d
            ,{ x: xCurve, y: yCurve }
          );
          this.attributes.x = newCoords.x;
          this.attributes.y = newCoords.y;
        }.bind(this)
        ,finish: this.impregnateMate.bind(this, organism)
      });
    }

    /**
     * @param  {Organism} organism
     */
    ,impregnateMate: function (organism) {
      organism.impregnate(this);
    }

    /**
     * @param  {Organism} byMate
     */
    ,impregnate: function (/*byMate*/) {
      this.set('isReproducing', true);
      this.setStepsUntilReproduction();
    }

    ,onChangePursueeIsReproducing: function () {
      this.set('pursueeId', null);
      this.currentTween.stop();
      this.tweenToRandomCoordinates();
    }

    ,onPursueeRemoved: function () {
      this.set('pursueeId', null);
    }
  });

  return Organism;
});
