define([

  'lodash'

], function (

  _

) {
  'use strict';

  /**
   * @param {Processing} env
   * @param {Object} [attrs]
   * @param {number} [attrs.speed]
   * @param {number} [attrs.x]
   * @param {number} [attrs.y]
   */
  function Organism (env, attrs) {
    var opts = _.defaults(_.clone(attrs || {}), {
      speed: Math.random() * 10
      ,x: Math.random() * env.width
      ,y: Math.random() * env.height
    });

    _.extend(this, opts);
  }

  _.extend(Organism.prototype, {

  });

  return Organism;
});
