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
var renderItem=function(t,e){var r=e.value(0),l=e.value(1),i=e.coord([r,l]),a=e.value(2),o=e.coord([r,a]),n=e.coord([1,0])[0]-e.coord([0,0])[0],d=t.itemPayload.barWidth;null==d&&(d="70%");var s="string"==typeof d&&d.endsWith("%")?parseFloat(d)/100*n:d,x=t.itemPayload.borderRadius||0,y={type:"rect",shape:{x:i[0]-s/2,y:i[1],width:s,height:o[1]-i[1],r:x},style:{fill:e.visual("color")}},c=t.itemPayload.margin,u=null==c?10:c;return{type:"group",children:[y,{type:"text",x:o[0],y:o[1]-u,style:{text:a.toString()+"℃",textAlign:"center",textVerticalAlign:"bottom",fill:"#333"}},{type:"text",x:i[0],y:i[1]+u,style:{text:l.toString()+"℃",textAlign:"center",textVerticalAlign:"top",fill:"#333"}}]}},index={install:function(t){t.registerCustomSeries("barRange",renderItem)}};export{index as default};
//# sourceMappingURL=bar-range.esm.min.mjs.map
