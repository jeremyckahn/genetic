define([

  'lateralus'

  ,'./genetic.util'

  ,'genetic.component.container'

  // Silent import
  ,'seedrandom'

], function (

  Lateralus

  ,util

  ,ContainerComponent

) {
  'use strict';

  if (util.getQueryParam('seed')) {
    Math.seedrandom(util.getQueryParam('seed'));
  }

  /**
   * @param {Element} el
   * @extends {Lateralus}
   * @constructor
   */
  var Genetic = Lateralus.beget(function () {
    Lateralus.apply(this, arguments);
    this.containerComponent = this.addComponent(ContainerComponent);
  });

  return Genetic;
});
