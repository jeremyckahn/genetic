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
  var MIN_SIZE = 10;
  var VISION_RANGE_MULTIPLIER = 30;
  var MOVEMENT_RANGE_MULTIPLIER = 40;
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
      speed: 1000 * 6
      ,minSpeed: 1000
      ,size: 10
      ,visionRange: 0
      ,movementRange: 0
      ,renderSize: 0
      ,x: 0
      ,y: 0
      ,stepsTillReproduction: 3
      ,stepCounter: 0
      ,isDying: false
      ,isOrigin: false
      ,isReproducing: false
      ,pursueeId: null
      ,gender: null
      ,offspringGenes: '{}'
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

      var baseSize = (Math.random() * this.get('size'));

      this.set(_.defaults(_.clone(attrs), {
        speed: this.get('minSpeed') + (Math.random() * this.get('speed'))
        ,size: MIN_SIZE + baseSize
        ,visionRange: baseSize * VISION_RANGE_MULTIPLIER
        ,movementRange: baseSize * MOVEMENT_RANGE_MULTIPLIER
        ,x: Math.random() * processing.width
        ,y: Math.random() * processing.height
      }));

      if (!this.get('isOrigin')) {
        this.assignGender();
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
      this.set(
        'stepsTillReproduction'
        ,2 + Math.ceil(
          Math.random() * this.get('stepsTillReproduction')
        )
      );
    }

    ,growToFullSize: function () {
      var growth = new GeneticTweenable();
      growth.tween({
        from: { size: 0 }
        ,to: { size: this.get('size') }
        ,duration: this.get('speed')
        ,step: function (state) {
          this.set('renderSize', state.size);
        }.bind(this)
      });
    }

    ,tweenToRandomCoordinates: function () {
      var currentX = this.get('x');
      var currentY = this.get('y');
      var movementRange = this.get('movementRange');

      var x = currentX +
        (-movementRange + (Math.random() * (2 * movementRange)));
      x = Math.min(Math.max(0, x), this.processing.width);

      var y = currentY +
        (-movementRange + (Math.random() * (2 * movementRange)));
      y = Math.min(Math.max(0, y), this.processing.height);

      this.currentTween = this.motion.tween({
        duration: this.get('speed')
        ,from: { x: currentX, y: currentY }
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

      if (stepCounter === this.get('stepsTillReproduction') && (
          (this.get('gender') === GENDER.FEMALE && this.get('isReproducing')) ||
            this.get('gender') === null
          )
        ) {
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

      var attrs = _.extend(
        this.pick('x', 'y')
        ,JSON.parse(this.get('offspringGenes'))
      );

      this.collection.add(
        new Organism(attrs, { processing: this.processing }));

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
        ,duration: this.get('speed')
        ,step: function (state) {
          this.set('renderSize', state.size);
        }.bind(this)
        ,finish: function () {
          this.collection.remove(this);
        }.bind(this)
      });
    }

    ,assignGender: function () {
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
     * @param  {Organism} byFather
     */
    ,impregnate: function (byFather) {
      this.set({
        isReproducing: true
        ,stepCounter: 0
        ,offspringGenes: JSON.stringify(this.getOffspringGenes(byFather, this))
      });

      this.setStepsUntilReproduction();
    }

    /**
     * @param  {Organism} mother
     * @param  {Organism} father
     * @return {Object}
     */
    ,getOffspringGenes: function (mother, father) {
      var genes = {};
      [
        'speed'
        ,'size'
        ,'stepsTillReproduction'
      ].forEach(function (property) {
        var random = Math.round(10 * Math.random());

        if (random < 3) {
          genes[property] = mother.get(property);
        } else if (random < 6) {
          genes[property] = father.get(property);
        } else {
          genes[property] = Math.round(
            (mother.get(property) + father.get(property)) / 2
          );
        }
      });

      return genes;
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
