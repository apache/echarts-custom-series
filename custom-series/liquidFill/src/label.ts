import type {
  CustomElementOption,
  CustomSeriesRenderItemAPI,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';

export type RenderItemStyle = ReturnType<CustomSeriesRenderItemAPI['style']>;

interface CreateLabelParams {
  style?: RenderItemStyle;
  cx: number;
  cy: number;
  innerRadius: number;
  boundingLeft: number;
  boundingTop: number;
  boundingWidth: number;
  boundingHeight: number;
  wavePathData: string;
  waveInitialX: number;
  waveAnimation?: CustomElementOption['keyframeAnimation'];
  defaultColor: string;
  insideColorOverride?: string;
}

export function createLabelGroup({
  style,
  cx,
  cy,
  innerRadius,
  boundingLeft,
  boundingTop,
  boundingWidth,
  boundingHeight,
  wavePathData,
  waveInitialX,
  waveAnimation,
  defaultColor,
  insideColorOverride,
}: CreateLabelParams): CustomElementOption | undefined {
  if (!style) {
    return undefined;
  }

  const styleAny = style as Record<string, any>;
  const textContent = styleAny.text;
  if (textContent == null || `${textContent}` === '') {
    return undefined;
  }

  const position = resolvePosition(
    styleAny.textPosition,
    cx,
    cy,
    innerRadius,
    boundingLeft,
    boundingTop,
    boundingWidth,
    boundingHeight
  );

  const baseStyle = buildBaseTextStyle(styleAny, position.x, position.y);
  const resolvedAlign =
    (styleAny.textAlign ?? styleAny.align ?? position.align) as
      | 'left'
      | 'center'
      | 'right';
  const resolvedVerticalAlign =
    (resolveVerticalAlign(styleAny) ?? position.verticalAlign) as
      | 'top'
      | 'middle'
      | 'bottom';
  baseStyle.align = resolvedAlign;
  baseStyle.textAlign = resolvedAlign;
  baseStyle.verticalAlign = resolvedVerticalAlign;
  baseStyle.textVerticalAlign = resolvedVerticalAlign;
  baseStyle.text = String(textContent);

  const outsideFill =
    (styleAny.textFill as string | undefined) ??
    (styleAny.fill as string | undefined) ??
    defaultColor;

  const insideFill =
    insideColorOverride ??
    (styleAny.textInsideColor as string | undefined) ??
    (styleAny.insideColor as string | undefined) ??
    outsideFill;

  const outsideText: CustomElementOption = {
    type: 'text',
    silent: true,
    z2: 40,
    style: Object.assign({}, baseStyle, { fill: outsideFill }),
  };

  const insideText: CustomElementOption = {
    type: 'text',
    silent: true,
    z2: 41,
    style: Object.assign({}, baseStyle, { fill: insideFill }),
  };

  const waveClipPath: CustomElementOption = {
    type: 'path',
    shape: {
      pathData: wavePathData,
    },
    x: waveInitialX,
    clipPath: {
      type: 'circle',
      shape: {
        cx,
        cy,
        r: innerRadius,
      },
    },
  };

  if (waveAnimation) {
    (waveClipPath as any).keyframeAnimation = cloneAnimation(waveAnimation);
  }

  (insideText as any).clipPath = waveClipPath;

  return {
    type: 'group',
    silent: true,
    children: [outsideText, insideText],
  };
}

function buildBaseTextStyle(
  styleAny: Record<string, any>,
  x: number,
  y: number
) {
  const result: Record<string, unknown> = {
    x,
    y,
  };

  assignIfDefined(result, 'fontSize', styleAny.fontSize);
  assignIfDefined(result, 'fontFamily', styleAny.fontFamily);
  assignIfDefined(result, 'fontWeight', styleAny.fontWeight);
  assignIfDefined(result, 'fontStyle', styleAny.fontStyle);
  assignIfDefined(result, 'lineHeight', styleAny.lineHeight);
  assignIfDefined(result, 'rich', styleAny.rich);
  assignIfDefined(result, 'backgroundColor', styleAny.backgroundColor);
  assignIfDefined(result, 'borderColor', styleAny.borderColor);
  assignIfDefined(result, 'borderWidth', styleAny.borderWidth);
  assignIfDefined(result, 'borderRadius', styleAny.borderRadius);
  assignIfDefined(result, 'padding', styleAny.padding);

  const shadowBlur =
    styleAny.textShadowBlur != null ? styleAny.textShadowBlur : styleAny.shadowBlur;
  const shadowColor =
    styleAny.textShadowColor != null
      ? styleAny.textShadowColor
      : styleAny.shadowColor;
  const shadowOffsetX =
    styleAny.textShadowOffsetX != null
      ? styleAny.textShadowOffsetX
      : styleAny.shadowOffsetX;
  const shadowOffsetY =
    styleAny.textShadowOffsetY != null
      ? styleAny.textShadowOffsetY
      : styleAny.shadowOffsetY;

  assignIfDefined(result, 'shadowBlur', shadowBlur);
  assignIfDefined(result, 'shadowColor', shadowColor);
  assignIfDefined(result, 'shadowOffsetX', shadowOffsetX);
  assignIfDefined(result, 'shadowOffsetY', shadowOffsetY);

  const stroke =
    styleAny.textStroke != null ? styleAny.textStroke : styleAny.stroke;
  const strokeWidth =
    styleAny.textStrokeWidth != null
      ? styleAny.textStrokeWidth
      : styleAny.lineWidth ?? styleAny.strokeWidth;

  assignIfDefined(result, 'stroke', stroke);
  assignIfDefined(result, 'lineWidth', strokeWidth);

  return result;
}

function resolveVerticalAlign(style: Record<string, any>) {
  const direct = style.textVerticalAlign ?? style.verticalAlign;
  if (direct === 'top' || direct === 'middle' || direct === 'bottom') {
    return direct;
  }
  if (direct === 'center') {
    return 'middle';
  }

  const baseline = style.textBaseline ?? style.baseline;
  if (baseline === 'top') {
    return 'top';
  }
  if (baseline === 'middle' || baseline === 'center') {
    return 'middle';
  }
  if (baseline === 'bottom' || baseline === 'baseline') {
    return 'bottom';
  }

  return undefined;
}

function resolvePosition(
  position: unknown,
  cx: number,
  cy: number,
  radius: number,
  left: number,
  top: number,
  width: number,
  height: number
) {
  if (Array.isArray(position)) {
    return {
      x: parseCoordinate(position[0], width, cx - left) + left,
      y: parseCoordinate(position[1], height, cy - top) + top,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
    };
  }

  switch (position) {
    case 'inside':
      return {
        x: cx,
        y: cy,
        align: 'center' as const,
        verticalAlign: 'middle' as const,
      };
    case 'left':
    case 'insideLeft':
      return {
        x: cx - radius * 0.6,
        y: cy,
        align: 'left' as const,
        verticalAlign: 'middle' as const,
      };
    case 'right':
    case 'insideRight':
      return {
        x: cx + radius * 0.6,
        y: cy,
        align: 'right' as const,
        verticalAlign: 'middle' as const,
      };
    case 'top':
    case 'insideTop':
      return {
        x: cx,
        y: cy - radius * 0.6,
        align: 'center' as const,
        verticalAlign: 'top' as const,
      };
    case 'bottom':
    case 'insideBottom':
      return {
        x: cx,
        y: cy + radius * 0.6,
        align: 'center' as const,
        verticalAlign: 'bottom' as const,
      };
    default:
      return {
        x: cx,
        y: cy,
        align: 'center' as const,
        verticalAlign: 'middle' as const,
      };
  }
}

function parseCoordinate(value: unknown, size: number, fallback: number) {
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const percent = parsePercent(value);
    if (percent != null) {
      return percent * size;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return fallback;
}

function parsePercent(value: string): number | null {
  const match = value.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) {
    return null;
  }
  return parseFloat(match[1]) / 100;
}

function assignIfDefined(
  target: Record<string, unknown>,
  key: string,
  value: unknown
) {
  if (value !== undefined && value !== null) {
    target[key] = value;
  }
}

function cloneAnimation(
  animation: CustomElementOption['keyframeAnimation']
): CustomElementOption['keyframeAnimation'] {
  if (!animation) {
    return animation;
  }
  if (Array.isArray(animation)) {
    return animation.map((item) => cloneAnimation(item)) as typeof animation;
  }

  const cloned: Record<string, unknown> = {};
  for (const key in animation) {
    if (Object.prototype.hasOwnProperty.call(animation, key)) {
      cloned[key] = (animation as Record<string, unknown>)[key];
    }
  }

  if (Array.isArray(animation.keyframes)) {
    cloned.keyframes = animation.keyframes.map((frame) => {
      const frameCopy: Record<string, unknown> = {};
      for (const key in frame) {
        if (Object.prototype.hasOwnProperty.call(frame, key)) {
          frameCopy[key] = (frame as Record<string, unknown>)[key];
        }
      }
      return frameCopy;
    });
  }

  return cloned as CustomElementOption['keyframeAnimation'];
}
