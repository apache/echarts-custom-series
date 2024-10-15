/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.lineRangeCustomSeriesInstaller = factory());
})(this, (function () { 'use strict';

    var renderItem = function (params, api) {
        var group = {
            type: 'group',
            children: [],
        };
        var cnt = params.dataInsideLength;
        if (params.dataIndex === cnt - 1) {
            var points = [];
            for (var i = 0; i < cnt; i++) {
                var startValue = api.value(1, i);
                var startCoord = api.coord([i, startValue]);
                points.push(startCoord);
            }
            for (var i = cnt - 1; i >= 0; i--) {
                var endValue = api.value(2, i);
                var endCoord = api.coord([i, endValue]);
                points.push(endCoord);
            }
            var polygon = {
                type: 'polygon',
                shape: {
                    points: points,
                },
                style: {
                    fill: api.visual('color'),
                },
            };
            group.children.push(polygon);
        }
        return group;
    };
    var index = {
        install: function (registers) {
            registers.registerCustomSeries('lineRange', renderItem);
        },
    };

    return index;

}));
