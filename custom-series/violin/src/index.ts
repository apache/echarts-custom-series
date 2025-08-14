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
  CustomPathOption,
  CustomRootElementOption,
  CustomSeriesRenderItem,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type {
  EChartsExtensionInstallRegisters,
  EChartsExtension,
} from 'echarts/types/src/extension.d.ts';

function epanechnikovKernel(u: number) {
  return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
}

function kernelDensityEstimator(
  kernel: (u: number) => number,
  bandwidth: number,
  data: number[]
) {
  return function (x: number) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += kernel((x - data[i]) / bandwidth);
    }
    return sum / (data.length * bandwidth);
  };
}

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  let violins: { [key: number]: { firstDataIndex: number; data: number[] } } =
    {};
  if (params.context.violins == null) {
    params.context.violins = [];
    violins = params.context.violins as any;
    const cnt = params.dataInsideLength;
    for (let i = 0; i < cnt; ++i) {
      const xIndex = api.value(0, i) as number;
      if (violins[xIndex] == null) {
        violins[xIndex] = {
          firstDataIndex: i,
          data: [],
        };
      }
      violins[xIndex].data.push(api.value(1, i) as number);
    }
  } else {
    violins = params.context.violins as any;
  }
  let symbolSize = params.itemPayload.symbolSize;
  if (symbolSize == null) {
    symbolSize = 12;
  }
  const xValue = api.value(0) as number;
  const yValue = api.value(1) as number;
  const coord = api.coord([xValue, yValue]);
  const bandWidthScale = params.itemPayload.bandWidthScale as number | null;
  const bandWidth =
    (api.coord([1, 0])[0] - api.coord([0, 0])[0]) *
    (bandWidthScale == null ? 1 : bandWidthScale);

  const violin = violins[xValue];
  let violinPath: CustomRootElementOption | null = null;
  if (violin && violin.firstDataIndex === params.dataIndexInside) {
    const kde = kernelDensityEstimator(epanechnikovKernel, 1, violin.data);
    const binCount = (params.itemPayload.binCount as number) || 100;
    const xRange: number[] = [];
    for (var i = 0; i < binCount; i++) {
      xRange.push(i * (10 / (binCount - 1)));
    }
    const density = xRange.map((x) => [x, kde(x)]);
    const epsilonDensity = 0.001;
    const polylines: CustomPathOption[] = [];
    const points: [number, number][] = [];

    const pushToPolylines = function () {
      if (points.length > 1) {
        for (let j = points.length - 1; j >= 0; --j) {
          points.push([coord[0] * 2 - points[j][0], points[j][1]]);
        }
        const areaOpacity = params.itemPayload.areaOpacity as number | null;
        polylines.push({
          type: 'polygon',
          shape: {
            points: points.slice(),
          },
          style: {
            fill: api.visual('color'),
            opacity: areaOpacity == null ? 0.5 : areaOpacity,
          },
        });
      }
      points.length = 0;
    };
    for (let i = 0; i < density.length; ++i) {
      const coord = api.coord([xValue, density[i][0]]);
      if (density[i][1] < epsilonDensity) {
        pushToPolylines();
        continue;
      }
      points.push([coord[0] + (bandWidth / 2) * density[i][1], coord[1]]);
    }
    pushToPolylines();

    violinPath = {
      type: 'group',
      children: polylines,
      silent: true,
    };
  }

  return violinPath;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'violin',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
} as EChartsExtension;
