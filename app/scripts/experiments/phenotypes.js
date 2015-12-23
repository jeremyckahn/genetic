define([

], function (

) {
  'use strict';

  /**
   * @param  {Processing} processing
   */
  function Phenotypes (processing) {
    this.processing = processing;

    this.processing.size(500, 500);
    this.processing.background(128, 128, 128);
  }

  return Phenotypes;
});
