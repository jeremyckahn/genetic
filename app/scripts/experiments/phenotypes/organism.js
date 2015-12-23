define([

  'lodash'
  ,'backbone'
  ,'shifty'

], function (

  _
  ,Backbone
  ,Tweenable

) {
  'use strict';

  var Organism = Backbone.Model.extend({
    defaults: {
      speed: 5
      ,size: 20
      ,x: 0
      ,y: 0
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

      this.set(_.defaults(_.clone(attrs), {
        speed: Math.random() * this.get('speed')
        ,size: Math.random() * this.get('size')
        ,x: Math.random() * processing.width
        ,y: Math.random() * processing.height
      }));
    }

    ,updateState: function () {
      var speed = this.get('speed');

      ['x', 'y'].forEach(function (dim) {
        var rawValue = this.get(dim);
        rawValue += ((speed * 2) * Math.random()) - speed;
        this.set(dim, rawValue);
      }.bind(this));
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
  });

  var duplicateMethodNames = _.intersection(
    _.keys(Tweenable.prototype)
    ,_.keys(Backbone.Model.prototype)
  );
  _.extend(
    Organism.prototype
    ,_.omit.apply(_, [Tweenable.prototype].concat(duplicateMethodNames))
  );

  return Organism;
});
