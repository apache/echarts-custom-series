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
import{zrUtil}from"echarts";import*as d3 from"d3";var blendColors=function(e,r,t){if(r<=1)return e[0];var o=t/(r-1),n=Math.floor(o*(e.length-1));if(n<=0)return e[0];if(n>=e.length-1)return e[e.length-1];var i=d3.color(e[n]),a=d3.color(e[n+1]),l=(o-n/(e.length-1))*(e.length-1);return d3.interpolate(i,a)(l)},renderItem=function(e,r){var t=e.dataInsideLength;if(e.dataIndex===t-1){for(var o=e.itemPayload,n=e.coordSys,i=[],a=0;a<t;a++){var l=r.value(0,a),d=r.value(1,a),u=r.value(2,a),c=r.coord([l,d]);i.push({coord:c,value:u})}var h=n.width,s=n.height,p=d3.scaleLinear().domain(d3.extent(i,(function(e){return e.coord[0]}))).range([0,h]),f=d3.scaleLinear().domain(d3.extent(i,(function(e){return e.coord[1]}))).range([0,s]),v=zrUtil.retrieve2(o.thresholds,8),y=zrUtil.retrieve2(o.bandwidth,20),m=d3.contourDensity().x((function(e){return p(e.coord[0])})).y((function(e){return f(e.coord[1])})).size([h,s]).bandwidth(y).thresholds(v)(i.map((function(e){return{coord:e.coord,value:e.value}}))).map(d3.geoPath()),g=o.itemStyle||{},z=g.color||[r.visual("color")],x=zrUtil.retrieve2(g.opacity,[.3,1]);"number"==typeof x&&(x=[x,x]);var b=o.lineStyle||{},U=b.color,w=zrUtil.retrieve2(b.width,1),I=[];return m.forEach((function(e,r){var t="none"===z?"none":blendColors(z,v,r);"none"!==z&&I.push({type:"path",shape:{pathData:e},style:{fill:t,opacity:x[0]+(x[1]-x[0])*(r/(m.length-1))},z2:-1,disableTooltip:!0}),"none"===U||null==U&&"none"===z||I.push({type:"path",shape:{pathData:e},style:{fill:"none",stroke:zrUtil.retrieve2(U,t),lineWidth:w,opacity:zrUtil.retrieve2(b.opacity,1)},z2:-1,disableTooltip:!0})})),{type:"group",children:I,x:n.x,y:n.y}}return null},index={install:function(e){e.registerCustomSeries("contour",renderItem)}};export{index as default};
//# sourceMappingURL=index.esm.min.mjs.map
