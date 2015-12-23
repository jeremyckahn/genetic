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
  };

  return util;
});
