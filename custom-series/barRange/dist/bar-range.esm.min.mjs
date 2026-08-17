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
var renderItem=function(t,e){var r,l=e.value(0),a=e.value(1),i=e.coord([l,a]),o=e.value(2),n=e.coord([l,o]),d=e.coord([1,0])[0]-e.coord([0,0])[0],u=t.itemPayload.barWidth;null==u&&(u="70%");var c="string"==typeof u&&u.endsWith("%")?parseFloat(u)/100*d:u,y=t.itemPayload.borderRadius||0,s={type:"rect",shape:{x:i[0]-c/2,y:i[1],width:c,height:n[1]-i[1],r:y},style:{fill:e.visual("color")}},x=t.itemPayload.margin,g=null==x?10:x,m=null!==(r=t.itemPayload.valueFormatter)&&void 0!==r?r:function(t){return"".concat(t,"℃")};return{type:"group",children:[s,{type:"text",x:n[0],y:n[1]-g,style:{text:m(o),textAlign:"center",textVerticalAlign:"bottom",fill:"#333"}},{type:"text",x:i[0],y:i[1]+g,style:{text:m(a),textAlign:"center",textVerticalAlign:"top",fill:"#333"}}]}},index={install:function(t){t.registerCustomSeries("barRange",renderItem)}};export{index as default};
//# sourceMappingURL=bar-range.esm.min.mjs.map
