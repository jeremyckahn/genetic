define([

  'lateralus'

  ,'genetic.component.container'

], function (

  Lateralus

  ,ContainerComponent

) {
  'use strict';

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
