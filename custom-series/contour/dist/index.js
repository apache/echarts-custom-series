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
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('echarts')) :
    typeof define === 'function' && define.amd ? define(['echarts'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.contourCustomSeriesInstaller = factory(global.echarts));
})(this, (function (echarts) { 'use strict';

    var blendColors = function (colors, dataLength, index) {
        if (dataLength <= 1) {
            return colors[0];
        }
        var dataRatio = index / (dataLength - 1);
        var colorIndex = Math.floor(dataRatio * (colors.length - 1));
        if (colorIndex <= 0) {
            return colors[0];
        }
        else if (colorIndex >= colors.length - 1) {
            return colors[colors.length - 1];
        }
        else {
            var leftColor = d3.color(colors[colorIndex]);
            var rightColor = d3.color(colors[colorIndex + 1]);
            var ratio = (dataRatio - colorIndex / (colors.length - 1)) * (colors.length - 1);
            return d3.interpolate(leftColor, rightColor)(ratio);
        }
    };
    var renderItem = function (params, api) {
        var cnt = params.dataInsideLength;
        if (params.dataIndex === cnt - 1) {
            var itemPayload = params.itemPayload;
            var coordSys = params.coordSys;
            var data = [];
            for (var i = 0; i < cnt; i++) {
                var xValue = api.value(0, i);
                var yValue = api.value(1, i);
                var value = api.value(2, i);
                var coord = api.coord([xValue, yValue]);
                data.push({
                    coord: coord,
                    value: value,
                });
            }
            var width = coordSys.width;
            var height = coordSys.height;
            var x_1 = d3
                .scaleLinear()
                .domain(d3.extent(data, function (d) { return d.coord[0]; }))
                .range([0, width]);
            var y_1 = d3
                .scaleLinear()
                .domain(d3.extent(data, function (d) { return d.coord[1]; }))
                .range([0, height]);
            var thresholds_1 = echarts.zrUtil.retrieve2(itemPayload.thresholds, 8);
            var bandwidth = echarts.zrUtil.retrieve2(itemPayload.bandwidth, 20);
            var contours = d3
                .contourDensity()
                .x(function (d) { return x_1(d.coord[0]); })
                .y(function (d) { return y_1(d.coord[1]); })
                .size([width, height])
                .bandwidth(bandwidth)
                .thresholds(thresholds_1)(data.map(function (d) { return ({ coord: d.coord, value: d.value }); }));
            var paths_1 = contours.map(d3.geoPath());
            var itemStyle = itemPayload.itemStyle || {};
            var colors_1 = itemStyle.color || [api.visual('color')];
            var itemOpacity_1 = echarts.zrUtil.retrieve2(itemStyle.opacity, [0.3, 1]);
            if (typeof itemOpacity_1 === 'number') {
                itemOpacity_1 = [itemOpacity_1, itemOpacity_1];
            }
            var lineStyle_1 = itemPayload.lineStyle || {};
            var stroke_1 = lineStyle_1.color;
            var lineWidth_1 = echarts.zrUtil.retrieve2(lineStyle_1.width, 1);
            var children_1 = [];
            paths_1.forEach(function (path, index) {
                var fill = blendColors(colors_1, thresholds_1, index);
                children_1.push({
                    type: 'path',
                    shape: {
                        pathData: path,
                    },
                    style: {
                        fill: fill,
                        opacity: itemOpacity_1[0] +
                            (itemOpacity_1[1] - itemOpacity_1[0]) * (index / (paths_1.length - 1)),
                    },
                    z2: -1,
                    disableTooltip: true,
                });
                children_1.push({
                    type: 'path',
                    shape: {
                        pathData: path,
                    },
                    style: {
                        fill: 'none',
                        stroke: echarts.zrUtil.retrieve2(stroke_1, fill),
                        lineWidth: lineWidth_1,
                        opacity: echarts.zrUtil.retrieve2(lineStyle_1.opacity, 1),
                    },
                    z2: -1,
                    disableTooltip: true,
                });
            });
            return {
                type: 'group',
                children: children_1,
                x: coordSys.x,
                y: coordSys.y,
            };
        }
        return null;
    };
    var index = {
        install: function (registers) {
            registers.registerCustomSeries('contour', renderItem);
        },
    };

    return index;

}));
