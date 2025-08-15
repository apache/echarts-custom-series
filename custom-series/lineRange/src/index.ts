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

import * as echarts from 'echarts';
import type {
  CustomRootElementOption,
  CustomSeriesRenderItem,
  CustomElementOption,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type {
  EChartsExtensionInstallRegisters,
  EChartsExtension,
} from 'echarts/types/src/extension.d.ts';
import { zrUtil } from 'echarts';

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
    const isHorizontal = params.encode.x.length === 1;
    const startDim = isHorizontal ? params.encode.y[0] : params.encode.x[0];
    const endDim = isHorizontal ? params.encode.y[1] : params.encode.x[1];

    const points: number[][] = [];
    let pathDataStart: string = '';
    let pathDataEnd: string = '';
    for (let i = 0; i < cnt; i++) {
      const startValue = api.value(startDim, i);
      const startCoord = api.coord(
        isHorizontal ? [i, startValue] : [startValue, i]
      );
      points.push(startCoord);
      pathDataStart +=
        (i === 0 ? 'M' : 'L') + startCoord[0] + ',' + startCoord[1] + ' ';
    }
    for (let i = cnt - 1; i >= 0; i--) {
      const endValue = api.value(endDim, i);
      const endCoord = api.coord(isHorizontal ? [i, endValue] : [endValue, i]);
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
          shadowBlur: areaStyle.shadowBlur,
          shadowColor: areaStyle.shadowColor,
          shadowOffsetX: areaStyle.shadowOffsetX,
          shadowOffsetY: areaStyle.shadowOffsetY,
        },
        disableTooltip: true,
      } as CustomElementOption);
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
      disableTooltip: true,
    } as CustomElementOption);
    group.children.push({
      type: 'path',
      shape: {
        pathData: pathDataEnd,
      },
      style: polylineStyle,
      disableTooltip: true,
    } as CustomElementOption);
  }
  return group as CustomRootElementOption;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'lineRange',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
} as EChartsExtension;
