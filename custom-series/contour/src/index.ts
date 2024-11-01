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

import echarts, { zrUtil } from 'echarts';
import type {
  CustomRootElementOption,
  CustomElementOption,
  CustomSeriesRenderItem,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type { EChartsExtensionInstallRegisters } from 'echarts/src/extension.ts';
declare var d3: any;

type ContourItemPayload = {
  thresholds?: number;
  bandwidth?: number;
  itemStyle?: {
    color?: string[] | 'none';
    opacity?: number | number[];
  };
  lineStyle?: {
    color?: string;
    width?: number;
    opacity?: number;
  };
};

const blendColors = (colors: string[], dataLength: number, index: number) => {
  if (dataLength <= 1) {
    return colors[0];
  }
  const dataRatio = index / (dataLength - 1);
  const colorIndex = Math.floor(dataRatio * (colors.length - 1));
  if (colorIndex <= 0) {
    return colors[0]; // Return the first color directly
  } else if (colorIndex >= colors.length - 1) {
    return colors[colors.length - 1]; // Return the last color directly
  } else {
    const leftColor = d3.color(colors[colorIndex]);
    const rightColor = d3.color(colors[colorIndex + 1]);
    const ratio =
      (dataRatio - colorIndex / (colors.length - 1)) * (colors.length - 1);
    return d3.interpolate(leftColor, rightColor)(ratio);
  }
};

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  const cnt = params.dataInsideLength;
  if (params.dataIndex === cnt - 1) {
    const itemPayload = params.itemPayload as ContourItemPayload;
    const coordSys = params.coordSys as any;
    const data: { coord: number[]; value: number }[] = [];

    for (let i = 0; i < cnt; i++) {
      const xValue = api.value(0, i);
      const yValue = api.value(1, i);
      const value = api.value(2, i) as number;
      const coord = api.coord([xValue, yValue]);
      data.push({
        coord,
        value,
      });
    }

    // Specify the dimensions of the chart.
    const width = coordSys.width;
    const height = coordSys.height;
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.coord[0]))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.coord[1]))
      .range([0, height]);

    const thresholds = zrUtil.retrieve2(itemPayload.thresholds, 8) as number;
    const bandwidth = zrUtil.retrieve2(itemPayload.bandwidth, 20) as number;
    // Compute the density contours using value
    const contours = d3
      .contourDensity()
      .x((d) => x(d.coord[0]))
      .y((d) => y(d.coord[1]))
      .size([width, height])
      .bandwidth(bandwidth)
      .thresholds(thresholds)(
      data.map((d) => ({ coord: d.coord, value: d.value }))
    );

    // Append the contours.
    const paths = contours.map(d3.geoPath());

    const itemStyle = itemPayload.itemStyle || {};
    const colors = itemStyle.color || ([api.visual('color')] as string[]);
    let itemOpacity = zrUtil.retrieve2(itemStyle.opacity, [0.3, 1]) as
      | number
      | number[];
    if (typeof itemOpacity === 'number') {
      itemOpacity = [itemOpacity, itemOpacity];
    }

    const lineStyle = itemPayload.lineStyle || {};
    const stroke = lineStyle.color;
    const lineWidth = zrUtil.retrieve2(lineStyle.width, 1) as number;

    const children: CustomElementOption[] = [];
    paths.forEach((path, index) => {
      const fill =
        colors === 'none' ? 'none' : blendColors(colors, thresholds, index);
      if (colors !== 'none') {
        // fill shape
        children.push({
          type: 'path',
          shape: {
            pathData: path,
          },
          style: {
            fill,
            opacity:
              itemOpacity[0] +
              (itemOpacity[1] - itemOpacity[0]) * (index / (paths.length - 1)),
          },
          z2: -1,
          disableTooltip: true,
        } as CustomElementOption);
      }

      // stroke shape (due to stroke opacity)
      if (stroke !== 'none' && (stroke != null || colors !== 'none')) {
        children.push({
          type: 'path',
          shape: {
            pathData: path,
          },
          style: {
            fill: 'none',
            stroke: zrUtil.retrieve2(stroke, fill),
            lineWidth,
            opacity: zrUtil.retrieve2(lineStyle.opacity, 1),
          },
          z2: -1,
          disableTooltip: true,
        } as CustomElementOption);
      }
    });

    return {
      type: 'group',
      children,
      x: coordSys.x,
      y: coordSys.y,
    } as CustomRootElementOption;
  }
  return null;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'contour',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
};
