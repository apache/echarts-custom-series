// Tricky: use1 and use2 are incompatible.
import type {use as use1} from 'echarts/core';
import type {use as use2} from 'echarts';
declare const _default: Parameters<typeof use1>[0] & Parameters<typeof use2>[0];
export default _default;
