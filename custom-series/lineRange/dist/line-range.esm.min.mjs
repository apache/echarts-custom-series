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
import{zrUtil}from"echarts";var renderItem=function(e,o){var t={type:"group",children:[]},a=e.dataInsideLength;if(e.dataIndex===a-1){for(var r=e.itemPayload,i=1===e.encode.x.length,s=i?e.encode.y[0]:e.encode.x[0],l=i?e.encode.y[1]:e.encode.x[1],d=[],h="",n="",p=0;p<a;p++){var f=o.value(s,p),c=o.coord(i?[p,f]:[f,p]);d.push(c),h+=(0===p?"M":"L")+c[0]+","+c[1]+" "}for(p=a-1;p>=0;p--){var y=o.value(l,p),u=o.coord(i?[p,y]:[y,p]);d.push(u),n+=(p===a-1?"M":"L")+u[0]+","+u[1]+" "}if(r.areaStyle){var w=r.areaStyle;t.children.push({type:"polygon",shape:{points:d},style:{fill:w.color||o.visual("color"),opacity:zrUtil.retrieve2(w.opacity,.2),shadowBlur:w.shadowBlur,shadowColor:w.shadowColor,shadowOffsetX:w.shadowOffsetX,shadowOffsetY:w.shadowOffsetY},disableTooltip:!0})}var v=r.lineStyle||{},m={fill:"none",stroke:v.color||o.visual("color"),lineWidth:zrUtil.retrieve2(v.width,0),opacity:zrUtil.retrieve2(v.opacity,1),type:v.type,dashOffset:v.dashOffset,lineCap:v.cap,lineJoin:v.join,miterLimit:v.miterLimit,shadowBlur:v.shadowBlur,shadowColor:v.shadowColor,shadowOffsetX:v.shadowOffsetX,shadowOffsetY:v.shadowOffsetY};t.children.push({type:"path",shape:{pathData:h},style:m,disableTooltip:!0}),t.children.push({type:"path",shape:{pathData:n},style:m,disableTooltip:!0})}return t},index={install:function(e){e.registerCustomSeries("lineRange",renderItem)}};export{index as default};
//# sourceMappingURL=line-range.esm.min.mjs.map
