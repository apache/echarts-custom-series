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
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type {
  EChartsExtensionInstallRegisters,
  EChartsExtension,
} from 'echarts/types/src/extension.d.ts';

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  const x = api.value(0);
  const valueStart = api.value(1);
  const coordStart = api.coord([x, valueStart]);
  const valueEnd = api.value(2);
  const coordEnd = api.coord([x, valueEnd]);
  const bandWidth = api.coord([1, 0])[0] - api.coord([0, 0])[0];

  let barWidthRaw = params.itemPayload.barWidth as number | string;
  if (barWidthRaw == null) {
    barWidthRaw = '70%';
  }
  const barWidth: number =
    typeof barWidthRaw === 'string' && barWidthRaw.endsWith('%')
      ? (parseFloat(barWidthRaw) / 100) * bandWidth
      : (barWidthRaw as number);
  const borderRadius = (params.itemPayload.borderRadius as number) || 0;

  const bar = {
    type: 'rect',
    shape: {
      x: coordStart[0] - barWidth / 2,
      y: coordStart[1],
      width: barWidth,
      height: coordEnd[1] - coordStart[1],
      r: borderRadius,
    },
    style: {
      fill: api.visual('color'),
    },
  };

  const marginRaw = params.itemPayload.margin as number;
  const margin = marginRaw == null ? 10 : marginRaw;
  const textTop = {
    type: 'text',
    x: coordEnd[0],
    y: coordEnd[1] - margin,
    style: {
      text: valueEnd.toString() + '℃',
      textAlign: 'center',
      textVerticalAlign: 'bottom',
      fill: '#333',
    },
  };

  const textBottom = {
    type: 'text',
    x: coordStart[0],
    y: coordStart[1] + margin,
    style: {
      text: valueStart.toString() + '℃',
      textAlign: 'center',
      textVerticalAlign: 'top',
      fill: '#333',
    },
  };

  return {
    type: 'group',
    children: [bar, textTop, textBottom],
  } as CustomRootElementOption;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'barRange',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
} as EChartsExtension;
