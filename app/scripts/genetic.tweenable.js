define([

  'lodash'
  ,'shifty'

], function (

  _
  ,Tweenable

) {
  'use strict';

  /**
   * @extends {Tweenable}
   */
  function GeneticTweenable () {
    Tweenable.apply(this, arguments);
    this.tickQueue = [];

    this.setScheduleFunction(function (fn) {
      this.tickQueue.push(fn);
    }.bind(this));

    this.tick();
  }

  GeneticTweenable.prototype = new Tweenable();

  _.extend(GeneticTweenable.prototype, {
    tick: function () {
      var queueClone = this.tickQueue.slice();
      this.tickQueue.length = 0;

      queueClone.forEach(function (fn) {
        fn();
      }.bind(this));

      setTimeout(this.tick.bind(this), 1000 / 60);
    }
  });

  return GeneticTweenable;
});
