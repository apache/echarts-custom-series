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
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.stageCustomSeriesInstaller = factory(global.echarts));
})(this, (function (echarts) { 'use strict';

    var renderItem = function (params, api) {
        var _a;
        var start = api.value(0);
        var end = api.value(1);
        var stageIndex = api.value(2);
        var startCoord = api.coord([start, stageIndex]);
        var endCoord = api.coord([end, stageIndex]);
        var bandWidth = api.coord([0, 0])[1] - api.coord([0, 1])[1];
        var fontSize = 14;
        var textMargin = 5;
        var color = api.visual('color');
        var itemPayload = params.itemPayload;
        var itemStyle = itemPayload.itemStyle || {};
        var borderRadius = itemStyle.borderRadius || 8;
        var externalRadius = echarts.zrUtil.retrieve2((_a = itemPayload.envelope) === null || _a === void 0 ? void 0 : _a.externalRadius, 6);
        var barVerticalMargin = echarts.zrUtil.retrieve2(itemStyle.verticalMargin, 8);
        var barMinWidth = echarts.zrUtil.retrieve2(itemStyle.minHorizontalSize, 3);
        var children = [];
        var boxes = params.context.boxes || [];
        var span = endCoord[0] - startCoord[0];
        var height = Math.max(span, barMinWidth);
        var shape = {
            x: startCoord[0] - (height - span) / 2,
            y: startCoord[1] - bandWidth / 2 + textMargin + fontSize + barVerticalMargin,
            width: height,
            height: bandWidth - fontSize - textMargin - 2 * barVerticalMargin,
        };
        children.push({
            type: 'rect',
            shape: {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                r: borderRadius,
            },
            style: {
                fill: color,
            },
        });
        boxes.push(shape);
        params.context.boxes = boxes;
        if (!params.context.renderedStages) {
            params.context.renderedStages = [];
        }
        var renderedStages = params.context.renderedStages;
        if (!renderedStages[stageIndex]) {
            var axisLabel = itemPayload.axisLabel || {};
            var text = api.ordinalRawValue(2);
            if (typeof axisLabel.formatter === 'function') {
                text = axisLabel.formatter(text, stageIndex);
            }
            children.push({
                type: 'text',
                style: {
                    x: params.coordSys.x + textMargin,
                    y: startCoord[1] - bandWidth / 2 + textMargin + fontSize,
                    fill: axisLabel.color || '#8A8A8A',
                    text: text,
                    verticalAlign: 'bottom',
                },
            });
            renderedStages[stageIndex] = true;
        }
        if (params.dataIndex === params.dataInsideLength - 1) {
            var allColors = [];
            for (var i = 0; i < params.dataInsideLength; i++) {
                var color_1 = api.visual('color', i);
                if (allColors.indexOf(color_1) < 0) {
                    allColors.push(color_1);
                }
            }
            var envelope = itemPayload.envelope || {};
            if (envelope.show !== false && boxes.length > 1) {
                var margin = echarts.zrUtil.retrieve2(envelope.margin, 2);
                boxes.sort(function (a, b) { return a.x - b.x || a.y - b.y; });
                var coordSys = params.coordSys;
                var dpr = envelope.dpr == null ? 2 : envelope.dpr || 1;
                var canvasWidth = coordSys.width * dpr;
                var canvasHeight = coordSys.height * dpr;
                var canvas = createCanvas(canvasWidth, canvasHeight);
                var ox = coordSys.x;
                var oy = coordSys.y;
                var ctx = canvas.getContext('2d');
                if (allColors.length > 0 && !envelope.color) {
                    var gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
                    for (var i = 0; i < allColors.length; i++) {
                        gradient.addColorStop((i * 2 + 1) / (allColors.length * 2), allColors[i]);
                    }
                    ctx.fillStyle = gradient;
                }
                else {
                    ctx.fillStyle = envelope.color || '#888';
                }
                var opacity = echarts.zrUtil.retrieve2(envelope.opacity, 0.25);
                for (var i = 0; i < boxes.length; i++) {
                    var box = boxes[i];
                    drawRoundedRect(ctx, (box.x - margin - ox) * dpr, (box.y - margin - oy) * dpr, (box.width + margin * 2) * dpr, (box.height + margin * 2) * dpr, (Math.min(borderRadius, box.width / 2) + margin) * dpr);
                    if (i > 0) {
                        ctx.beginPath();
                        var prevBox = boxes[i - 1];
                        var isPrevLower = prevBox.y > box.y + box.height;
                        var height_1 = isPrevLower
                            ? prevBox.y - box.y - box.height + borderRadius * 2
                            : box.y - prevBox.y - prevBox.height + borderRadius * 2;
                        var y = isPrevLower
                            ? box.y + box.height - borderRadius
                            : prevBox.y + prevBox.height - borderRadius;
                        if (box.x - margin >= prevBox.x + prevBox.width + margin) {
                            continue;
                        }
                        if (isPrevLower) {
                            if (box.x - margin - prevBox.x > 0) {
                                var right = Math.ceil((box.x - margin - ox) * dpr);
                                var bottom = (prevBox.y - margin - oy) * dpr;
                                var r = Math.min((box.x - margin - prevBox.x) / 2, externalRadius) *
                                    dpr;
                                ctx.moveTo(right, bottom + r);
                                ctx.arc(right - r, bottom - r, r, 0, Math.PI / 2);
                                ctx.lineTo(right, bottom + margin * dpr);
                                ctx.lineTo(right, bottom - r);
                            }
                            if (box.x + box.width - prevBox.x - prevBox.width - margin > 0) {
                                var top_1 = (box.y + box.height + margin - oy) * dpr;
                                var left = Math.floor((prevBox.x + prevBox.width + margin - ox) * dpr);
                                var r = Math.min((box.x + box.width - prevBox.x - prevBox.width - margin) / 2, externalRadius) * dpr;
                                ctx.moveTo(left, top_1 + r);
                                ctx.arc(left + r, top_1 + r, r, Math.PI, Math.PI * 1.5);
                                ctx.lineTo(left, top_1 - margin * dpr);
                                ctx.lineTo(left, top_1);
                            }
                        }
                        else {
                            if (box.x - margin - prevBox.x > 0) {
                                var right = Math.ceil((box.x - margin - ox) * dpr);
                                var top_2 = (prevBox.y + prevBox.height + margin - oy) * dpr;
                                var r = Math.min((box.x - margin - prevBox.x) / 2, externalRadius) *
                                    dpr;
                                ctx.moveTo(right, top_2 + r);
                                ctx.arc(right - r, top_2 + r, r, -Math.PI / 2, 0);
                                ctx.lineTo(right, top_2 - margin * dpr);
                                ctx.lineTo(right - r, top_2);
                            }
                            if (box.x + box.width - prevBox.x - prevBox.width - margin > 0) {
                                var bottom = (box.y - margin - oy) * dpr;
                                var left = Math.floor((prevBox.x + prevBox.width + margin - ox) * dpr);
                                var r = Math.min((box.x + box.width - prevBox.x - prevBox.width - margin) / 2, externalRadius) * dpr;
                                ctx.moveTo(left + r, bottom);
                                ctx.arc(left + r, bottom - r, r, Math.PI / 2, Math.PI);
                                ctx.lineTo(left, bottom + (margin + borderRadius) * dpr);
                                ctx.lineTo(left + r, bottom);
                            }
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillRect((prevBox.x + prevBox.width + margin - ox) * dpr, (y - oy) * dpr, (box.x - prevBox.x - prevBox.width - margin * 2) * dpr, height_1 * dpr);
                    }
                }
                children.push({
                    type: 'image',
                    style: {
                        image: canvas,
                        x: coordSys.x * dpr,
                        y: coordSys.y * dpr,
                        opacity: opacity,
                    },
                    silent: true,
                    scaleX: 1 / dpr,
                    scaleY: 1 / dpr,
                });
            }
        }
        return {
            type: 'group',
            children: children,
        };
    };
    function createCanvas(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
        ctx.lineTo(x + radius, y + height);
        ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
        ctx.lineTo(x, y + radius);
        ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
        ctx.closePath();
        ctx.fill();
    }
    var index = {
        install: function (registers) {
            registers.registerCustomSeries('stage', renderItem);
        },
    };

    return index;

}));
