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
  CustomElementOption,
  CustomSeriesRenderItem,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type { EChartsExtensionInstallRegisters } from 'echarts/src/extension.ts';
import type { Polygon, Polyline } from 'echarts/src/util/graphic.ts';

type LineRangeItemPayload = {
  lineStyle?: {
    color?: string;
    opacity?: number;
    width?: number;
    type?: string;
    dashOffset?: number;
    cap?: 'butt' | 'round' | 'square';
    join?: 'bevel' | 'round' | 'miter';
    miterLimit?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  areaStyle?: {
    color?: string;
    opacity?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
};

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  const group = {
    type: 'group',
    children: [] as CustomElementOption[],
  };

  // If is the last item, render the line range
  const cnt = params.dataInsideLength;
  if (params.dataIndex === cnt - 1) {
    const itemPayload = params.itemPayload as LineRangeItemPayload;

    const points: number[][] = [];
    let pathDataStart: string = '';
    let pathDataEnd: string = '';
    for (let i = 0; i < cnt; i++) {
      const startValue = api.value(1, i);
      const startCoord = api.coord([i, startValue]);
      points.push(startCoord);
      pathDataStart +=
        (i === 0 ? 'M' : 'L') + startCoord[0] + ',' + startCoord[1] + ' ';
    }
    for (let i = cnt - 1; i >= 0; i--) {
      const endValue = api.value(2, i);
      const endCoord = api.coord([i, endValue]);
      points.push(endCoord);
      pathDataEnd +=
        (i === cnt - 1 ? 'M' : 'L') + endCoord[0] + ',' + endCoord[1] + ' ';
    }

    if (itemPayload.areaStyle) {
      const areaStyle = itemPayload.areaStyle;
      group.children.push({
        type: 'polygon',
        shape: {
          points,
        },
        style: {
          fill: areaStyle.color || api.visual('color'),
          opacity: zrUtil.retrieve2(areaStyle.opacity, 0.2),
        },
        silent: true,
      } as Polygon);
    }

    const lineStyle = itemPayload.lineStyle || {};
    const polylineStyle = {
      fill: 'none',
      stroke: lineStyle.color || api.visual('color'),
      lineWidth: zrUtil.retrieve2(lineStyle.width, 0),
      opacity: zrUtil.retrieve2(lineStyle.opacity, 1),
      type: lineStyle.type,
      dashOffset: lineStyle.dashOffset,
      lineCap: lineStyle.cap,
      lineJoin: lineStyle.join,
      miterLimit: lineStyle.miterLimit,
      shadowBlur: lineStyle.shadowBlur,
      shadowColor: lineStyle.shadowColor,
      shadowOffsetX: lineStyle.shadowOffsetX,
      shadowOffsetY: lineStyle.shadowOffsetY,
    };
    group.children.push({
      type: 'path',
      shape: {
        pathData: pathDataStart,
      },
      style: polylineStyle,
      silent: true,
    } as Polyline);
    group.children.push({
      type: 'path',
      shape: {
        pathData: pathDataEnd,
      },
      style: polylineStyle,
      silent: true,
    } as Polyline);
  }
  return group;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'lineRange',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
};
