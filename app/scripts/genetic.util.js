define([

], function (

) {
  'use strict';

  var queryParams = (function () {
    var queryString = location.search.slice(1);
    var stringChunks = queryString.split('&');

    var accumulator = {};
    stringChunks.forEach(function (stringChunk) {
      var pair = stringChunk.split('=');
      accumulator[pair[0]] = pair[1];
    });

    return accumulator;
  })();

  var util = {
    /**
     * @param {string} param
     * @return {*}
     */
    getQueryParam: function (param) {
      return queryParams[param];
    }

    /**
     * @param  {Array} arr
     * @return {*}
     */
    ,pickRandomFrom: function (arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * @return {boolean} Either true or false (50% chance)
     */
    ,trueOrFalse: function () {
      return !!Math.round(Math.random());
    }

    /**
     * @param  {number} x1
     * @param  {number} y1
     * @param  {number} x2
     * @param  {number} y2
     * @return {number}
     */
    ,getDistance: function (x1, y1, x2, y2) {
      return Math.sqrt(
        Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)
      );
    }

    /**
     * @param  {Array.<number>} numbers
     * @return {number}
     */
    ,getIndexOfSmallest: function (numbers) {
      var smallestIndex = 0;
      var previousNumber = numbers[0];
      numbers.slice(1).forEach(function (number, i) {
        if (number < previousNumber) {
          smallestIndex = i + 1;
        }
      });

      return smallestIndex;
    }
  };

  return util;
});
