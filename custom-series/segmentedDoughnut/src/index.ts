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

import echarts, { zrUtil, number } from 'echarts';
import type {
  CustomRootElementOption,
  CustomSeriesRenderItem,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type { EChartsExtensionInstallRegisters } from 'echarts/src/extension.ts';
import type { CustomElementOption } from 'echarts/src/chart/custom/CustomSeries.ts';

type SegmentedDoughnutItemPayload = {
  center?: [number | string, number | string];
  radius?: [number | string, number | string];
  segmentCount?: number;
  padAngle?: number;
  backgroundStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    borderType?: string;
    opacity?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  }
};

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  const itemPayload = params.itemPayload as SegmentedDoughnutItemPayload;

  const cnt = params.dataInsideLength;
  if (params.dataIndex === cnt - 1) {
  }
  console.log(params, itemPayload);

  const segmentCount = Math.max(1, itemPayload.segmentCount || 1);
  const value = Math.min(segmentCount, api.value(0) as number || 0);

  const center = itemPayload.center || ['50%', '50%'];
  const radius = itemPayload.radius || ['50%', '60%'];
  const width = api.getWidth();
  const height = api.getHeight();
  const size = Math.min(width, height);
  const cx = number.parsePercent(center[0], api.getWidth());
  const cy = number.parsePercent(center[1], api.getHeight());
  const r = number.parsePercent(radius[1], size / 2);
  const r0 = number.parsePercent(radius[0], size / 2);

  const padAngle = (zrUtil.retrieve2(
    itemPayload.padAngle,
    2
  ) || 0) * Math.PI / 180;
  const pieceAngle = (Math.PI * 2 - padAngle * segmentCount) / segmentCount;

  const backgroundGroup = {
    type: 'group',
    children: [] as CustomElementOption[],
  };
  const bgStyle = itemPayload.backgroundStyle || {};
  const backgroundStyle = {
    fill: bgStyle.color || 'rgba(180, 180, 180, 0.2)',
    stroke: bgStyle.borderColor || 'none',
    lineWidth: bgStyle.borderWidth || 0,
    lineType: bgStyle.borderType || 'solid',
    opacity: bgStyle.opacity || 1,
    shadowBlur: bgStyle.shadowBlur || 0,
    shadowColor: bgStyle.shadowColor || 'rgba(0, 0, 0, 0)',
    shadowOffsetX: bgStyle.shadowOffsetX || 0,
    shadowOffsetY: bgStyle.shadowOffsetY || 0,
  }

  const itemGroup = {
    type: 'group',
    children: [] as CustomElementOption[],
  };
  const itemStyle = api.style();
  const itemStyleEmphasis = api.styleEmphasis();

  const startAngle = -Math.PI / 2;
  const cornerRadius = (r - r0) / 2;
  for (let i = 0; i < segmentCount; ++i) {
    const sAngle = startAngle + (pieceAngle + padAngle) * i;
    const eAngle = startAngle + (pieceAngle + padAngle) * i + pieceAngle;
    backgroundGroup.children.push({
      type: 'sector',
      shape: {
        cx,
        cy,
        r0,
        r,
        cornerRadius,
        startAngle: sAngle,
        endAngle: eAngle,
        clockwise: true,
      },
      style: backgroundStyle,
      silent: true
    });

    if (i < value) {
      itemGroup.children.push({
        type: 'sector',
        shape: {
          cx,
          cy,
          r0,
          r,
          cornerRadius,
          startAngle: sAngle,
          endAngle: eAngle,
          clockwise: true,
        },
        style: itemStyle,
        styleEmphasis: itemStyleEmphasis
      });
    }
  }

  return {
    type: 'group',
    children: [backgroundGroup, itemGroup],
  } as CustomRootElementOption;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'segmentedDoughnut',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
};
