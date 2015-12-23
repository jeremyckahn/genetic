define([

  'lodash'
  ,'backbone'

], function (

  _
  ,Backbone

) {
  'use strict';

  var Organism = Backbone.Model.extend({
    /**
     * @param {Object} attrs
     * @param {number} [attrs.speed]
     * @param {number} [attrs.x]
     * @param {number} [attrs.y]
     * @param {Object} opts
     * @param {Processing} opts.env
     */
    initialize: function (attrs, opts) {
      var env = opts.env;
      this.set(_.defaults(_.clone(attrs || {}), {
        speed: Math.random() * 10
        ,x: Math.random() * env.width
        ,y: Math.random() * env.height
      }));
    }
  });

  _.extend(Organism.prototype, {

  });

  return Organism;
});
