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
function epanechnikovKernel(e){return Math.abs(e)<=1?.75*(1-e*e):0}function kernelDensityEstimator(e,n,t){return function(a){for(var i=0,r=0;r<t.length;r++)i+=e((a-t[r])/n);return i/(t.length*n)}}var renderItem=function(e,n){var t={};if(null==e.context.violins){e.context.violins=[],t=e.context.violins;for(var a=e.dataInsideLength,i=0;i<a;++i){var r=n.value(0,i);null==t[r]&&(t[r]={firstDataIndex:i,data:[]}),t[r].data.push(n.value(1,i))}}else t=e.context.violins;e.itemPayload.symbolSize;var l=n.value(0),o=n.value(1),s=n.coord([l,o]),u=e.itemPayload.bandWidthScale,d=(n.coord([1,0])[0]-n.coord([0,0])[0])*(null==u?1:u),c=t[l],v=null;if(c&&c.firstDataIndex===e.dataIndexInside){for(var f=kernelDensityEstimator(epanechnikovKernel,1,c.data),h=e.itemPayload.binCount||100,p=[],y=0;y<h;y++)p.push(y*(10/(h-1)));for(var m=p.map((function(e){return[e,f(e)]})),g=[],x=[],I=function(){if(x.length>1){for(var t=x.length-1;t>=0;--t)x.push([2*s[0]-x[t][0],x[t][1]]);var a=e.itemPayload.areaOpacity;g.push({type:"polygon",shape:{points:x.slice()},style:{fill:n.visual("color"),opacity:null==a?.5:a}})}x.length=0},b=0;b<m.length;++b){var k=n.coord([l,m[b][0]]);m[b][1]<.001?I():x.push([k[0]+d/2*m[b][1],k[1]])}I(),v={type:"group",children:g,silent:!0}}return v},index={install:function(e){e.registerCustomSeries("violin",renderItem)}};export{index as default};
//# sourceMappingURL=violin.esm.min.mjs.map
