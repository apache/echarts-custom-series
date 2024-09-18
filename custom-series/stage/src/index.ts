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

import echarts from 'echarts';
import type {
  CustomElementOption,
  CustomRootElementOption,
  CustomSeriesRenderItem,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type { EChartsExtensionInstallRegisters } from 'echarts/src/extension.ts';

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  const start = api.value(0);
  const end = api.value(1);
  const stageIndex = api.value(2);

  const startCoord = api.coord([start, stageIndex]);
  const endCoord = api.coord([end, stageIndex]);

  const stages = params.itemPayload.stages || [];
  const bandWidth = api.coord([0, 0])[1] - api.coord([0, 1])[1];
  const fontSize = 14;
  const textMargin = 5;
  const barMargin = 8;
  const seriesColor = api.visual('color');
  const borderRadius = (params.itemPayload.borderRadius as number) || 8;
  const isGrouping = params.itemPayload.grouping as boolean;

  const children: CustomElementOption[] = [];

  const stage = stages[stageIndex];
  if (stage && !isGrouping) {
    children.push({
      type: 'rect',
      shape: {
        x: startCoord[0],
        y: startCoord[1] - bandWidth / 2 + textMargin + fontSize + barMargin,
        width: endCoord[0] - startCoord[0],
        height: bandWidth - fontSize - textMargin - 2 * barMargin,
        r: borderRadius,
      },
      style: {
        fill: stage.color || seriesColor,
      },
    });
  }

  if (!params.context.renderedStages) {
    params.context.renderedStages = [];
  }
  const renderedStages = params.context.renderedStages as boolean[];
  if (stage && !renderedStages[stageIndex]) {
    // Each stage only render once as axis label
    children.push({
      type: 'text',
      style: {
        x: (params.coordSys as any).x + textMargin,
        y: startCoord[1] - bandWidth / 2 + textMargin + fontSize,
        fill: (params.itemPayload.axisLabelColor as string) || '#777',
        text: stage.name,
        verticalAlign: 'bottom',
      },
    });
    renderedStages[stageIndex] = true;
  }

  return {
    type: 'group',
    children,
  } as CustomRootElementOption;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'stage',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
};
