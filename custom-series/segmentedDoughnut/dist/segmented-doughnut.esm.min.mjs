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
import{number,zrUtil,format}from"echarts";var renderItem=function(e,r){var t=[],s=e.itemPayload,a=Math.max(1,s.segmentCount||1),o=Math.max(0,r.value(0)||0),n=s.center||["50%","50%"],i=s.radius||["50%","60%"],l=r.getWidth(),d=r.getHeight(),h=Math.min(l,d),c=number.parsePercent(n[0],r.getWidth()),p=number.parsePercent(n[1],r.getHeight()),u=number.parsePercent(i[1],h/2),m=number.parsePercent(i[0],h/2),g=(zrUtil.retrieve2(s.padAngle,2)||0)*Math.PI/180,f=(2*Math.PI-g*a)/a,y={type:"group",children:[]};t.push(y);var b=s.backgroundStyle||{},w=!1!==b.show,x={fill:b.color||"rgba(180, 180, 180, 0.2)",stroke:b.borderColor||"none",lineWidth:b.borderWidth||0,lineType:b.borderType||"solid",opacity:b.opacity||1,shadowBlur:b.shadowBlur||0,shadowColor:b.shadowColor||"rgba(0, 0, 0, 0)",shadowOffsetX:b.shadowOffsetX||0,shadowOffsetY:b.shadowOffsetY||0},v={type:"group",children:[]};t.push(v);for(var P=r.style(),A=r.styleEmphasis(),M=-Math.PI/2,C=(u-m)/2,I=0;I<a;++I){var k=M+(f+g)*I,z=M+(f+g)*I+f;w&&y.children.push({type:"sector",shape:{cx:c,cy:p,r0:m,r:u,cornerRadius:C,startAngle:k,endAngle:z,clockwise:!0},style:x,silent:!0}),I<o&&v.children.push({type:"sector",shape:{cx:c,cy:p,r0:m,r:u,cornerRadius:C,startAngle:k,endAngle:z,clockwise:!0},style:P,styleEmphasis:A})}var O,S=s.label;S&&S.show&&(O={type:"text",style:{text:format.formatTpl(S.formatter||"{c}/{b}",{$vars:["seriesName","b","c","d"],seriesName:e.seriesName,b:a,c:o,d:Math.round(o/a*100)+"%"}),fontSize:S.fontSize||12,fill:S.color||"#000",textAlign:"center",textVerticalAlign:"middle"},x:c,y:p},t.push(O));return{type:"group",children:t}},index={install:function(e){e.registerCustomSeries("segmentedDoughnut",renderItem)}};export{index as default};
//# sourceMappingURL=segmented-doughnut.esm.min.mjs.map
