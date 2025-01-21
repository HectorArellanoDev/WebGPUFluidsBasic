var Dr=Object.defineProperty;var Rr=(n,e,t)=>e in n?Dr(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var gn=(n,e,t)=>Rr(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();function Zn(n,e){n=n.split(";");let t=[];const i=/group\(([^)]+)\)/,r=/binding\(([^)]+)\)/;return n.forEach((o,a)=>{if(o.includes("@group")){const s=Number(i.exec(o)[1]),u=Number(r.exec(o)[1]);if(t[s]==null&&(t[s]=[]),o.includes("uniform")||o.includes("storage")){let f="";o.includes("storage")&&(f=o.includes("read_write")?"storage":"read-only-storage"),o.includes("uniform")&&(f="uniform"),t[s][u]={binding:u,visibility:e,buffer:{type:f}}}if(o.includes("texture_")){let f="2d";if(o.includes("_3d")&&(f="3d"),o.includes("_1d")&&(f="1d"),o.includes("_2d")&&o.includes("array")&&(f="2d-array"),o.includes("texture_storage"))t[s][u]={binding:u,visibility:e,storageTexture:{format:o.includes("unorm")?"rgba8unorm":"rgba32float",viewDimension:f}};else{let m="float",d="2d";o.includes("texture_3d")&&(d="3d"),o.includes("texture_1d")&&(d="1d"),o.includes("_2d")&&o.includes("array")&&(d="2d-array"),t[s][u]={binding:u,visibility:e,texture:{sampleType:m,viewDimension:d}}}}o.includes("sampler")&&(t[s][u]={binding:u,visibility:e,sampler:{type:"filtering"}})}}),t}Promise.create=function(){const n=new Promise((e,t)=>{this.temp_resolve=e,this.temp_reject=t});return n.resolve=this.temp_resolve,n.reject=this.temp_reject,delete this.temp_resolve,delete this.temp_reject,n};var R=null;let Gr=async n=>{var t;const e=await((t=navigator.gpu)==null?void 0:t.requestAdapter());return R=await(e==null?void 0:e.requestDevice({requiredFeatures:["float32-filterable"]})),R||(console.log("error finding device"),null)},Qn=async n=>{try{return await(await fetch(n)).text()}catch{return n}},Ee=async n=>{const e=await Qn(n),t=R.createShaderModule({label:`${n} module`,code:e}),r=Zn(e,GPUShaderStage.COMPUTE).map(s=>R.createBindGroupLayout({entries:s})),o=R.createPipelineLayout({bindGroupLayouts:r});return{pipeline:R.createComputePipeline({label:`${n} pipeline`,layout:o,compute:{module:t,entryPoint:"main"}})}};class er{constructor(){gn(this,"setBindGroup",e=>{this.bindGroup=R.createBindGroup({label:`${this.label} bind group`,layout:this.pipeline.getBindGroupLayout(0),entries:e})});this.label=null,this.passDescriptor=null,this.pipeline=null,this.bindGroup=null,this.uniformsData=null,this.uniformsBuffer=null}}async function cn(n,e,t=1,i,r=!0){let o=new er;const a=await Qn(e),s=R.createShaderModule({label:`${n} module`,code:a}),f=Zn(a,GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT).map(h=>R.createBindGroupLayout({entries:h})),m=R.createPipelineLayout({bindGroupLayouts:f});let d={label:`${n} pipeline`,layout:m,vertex:{module:s,entryPoint:"vs"},fragment:{module:s,entryPoint:"fs",targets:i},primitive:{topology:"triangle-list",cullMode:"none"},multisample:{count:t}};const p={label:`${n} rendering pass descriptor`,colorAttachments:[]};r&&(d.depthStencil={depthWriteEnabled:!0,depthCompare:"less",format:"depth32float"},p.depthStencilAttachment={depthClearValue:1,depthStoreOp:"store"});const g=R.createRenderPipeline(d);return i.map(h=>{p.colorAttachments.push({clearValue:[0,0,0,0],storeOp:"store"})}),o.label=n,o.pipeline=g,o.passDescriptor=p,o}async function ne(n,e,t=null,i=null){let r=new er,o=Promise.create();if(Ee(e).then(a=>{r.pipeline=a.pipeline,o.resolve()}),await o,r.label=n,t&&(r.uniformsData=new Float32Array(t),r.uniformsBuffer=R.createBuffer({label:`${n} uniforms buffer`,size:r.uniformsData.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),R.queue.writeBuffer(r.uniformsBuffer,0,r.uniformsData)),i){let a=i.map((s,u)=>({binding:u,resource:{buffer:s=="uniforms"?r.uniformsBuffer:s}}));r.bindGroup=R.createBindGroup({label:`${n} bind group`,layout:r.pipeline.getBindGroupLayout(0),entries:a})}return console.log(`${n} ready`),r}const kr=`
struct Uniforms {
    axis: vec3f,
    steps: f32
}

@group(0) @binding(0) var textureRead: texture_3d<f32>;
@group(0) @binding(1) var textureSave: texture_storage_3d<rgba32float, write>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;


@compute @workgroup_size(1) fn main( @builtin(global_invocation_id) ud: vec3<u32> ) {
    

    var tSize = vec3f(textureDimensions(textureRead));
    var id = ud + vec3u( u32(tSize.x * 0.1), 0, 0);


    var blend = vec4f(0.);
    var blend2 = vec4f(0.);
    var sum = 1.;
    var sum2 = 0.;
    var m = 1.;
    var n = uniforms.steps;
    for(var i = 0.; i < uniforms.steps; i += 1.) {
        var j = i - 0.5 * uniforms.steps;
        var tRead = textureLoad(textureRead, vec3<i32>(id) + vec3<i32>(j * uniforms.axis), 0);
        blend += m * tRead;
        blend2 += tRead;
        m *= (n - i) / (i + 1.);
        sum += m;
        sum2 += 1.;
    }    

    blend /= sum;
    blend2 /= sum2;

    var mixer = 1.;
    blend = mixer * blend + (1. - mixer) * blend2;
    
    textureStore(textureSave, id, blend );

}

`;let hn=!1,Ct,Yt=[];const Lr=n=>{let e=[[1,0,0,1],[0,0,1,1],[0,1,0,1]];for(let t=0;t<3;t++){let i=new Float32Array(e[t]),r=n.createBuffer({label:"uniforms buffer",size:i.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});n.queue.writeBuffer(r,0,i),Yt.push(r)}};async function zr(n,e,t){let i=R;if(!hn){Lr(i);let p=Promise.create();Ee(kr).then(g=>{Ct=g.pipeline,p.resolve()}),await p,hn=!0}let r=t*2,o=[[1,0,0,r],[0,0,1,r],[0,1,0,r]];for(let p=0;p<3;p++){let g=new Float32Array(o[p]);i.queue.writeBuffer(Yt[p],0,g)}const a=i.createCommandEncoder({label:"encoder"}),s=a.beginComputePass({label:"blur3D pass"});s.setPipeline(Ct);let u=n.width,f,m;for(let p=0;p<3;p++){let g=p%2==0;f=g?n:e,m=g?e:n;const h=i.createBindGroup({label:"bind group for blur3D",layout:Ct.getBindGroupLayout(0),entries:[{binding:0,resource:f.createView({baseMipLevel:0,mipLevelCount:1})},{binding:1,resource:m.createView({baseMipLevel:0,mipLevelCount:1})},{binding:2,resource:{buffer:Yt[p]}}]});s.setBindGroup(0,h),s.dispatchWorkgroups(u*.6,u,u)}s.end();const d=a.finish();i.queue.submit([d])}var ot=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var n=0,e=arguments.length;e--;)n+=arguments[e]*arguments[e];return Math.sqrt(n)});function $(){var n=new ot(16);return ot!=Float32Array&&(n[1]=0,n[2]=0,n[3]=0,n[4]=0,n[6]=0,n[7]=0,n[8]=0,n[9]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0),n[0]=1,n[5]=1,n[10]=1,n[15]=1,n}function _n(n,e){var t=e[0],i=e[1],r=e[2],o=e[3],a=e[4],s=e[5],u=e[6],f=e[7],m=e[8],d=e[9],p=e[10],g=e[11],h=e[12],v=e[13],w=e[14],E=e[15],L=t*s-i*a,b=t*u-r*a,x=t*f-o*a,y=i*u-r*s,T=i*f-o*s,Re=r*f-o*u,Ge=m*v-d*h,ke=m*w-p*h,Le=m*E-g*h,ze=d*w-p*v,Me=d*E-g*v,Ie=p*E-g*w,O=L*Ie-b*Me+x*ze+y*Le-T*ke+Re*Ge;return O?(O=1/O,n[0]=(s*Ie-u*Me+f*ze)*O,n[1]=(r*Me-i*Ie-o*ze)*O,n[2]=(v*Re-w*T+E*y)*O,n[3]=(p*T-d*Re-g*y)*O,n[4]=(u*Le-a*Ie-f*ke)*O,n[5]=(t*Ie-r*Le+o*ke)*O,n[6]=(w*x-h*Re-E*b)*O,n[7]=(m*Re-p*x+g*b)*O,n[8]=(a*Me-s*Le+f*Ge)*O,n[9]=(i*Le-t*Me-o*Ge)*O,n[10]=(h*T-v*x+E*L)*O,n[11]=(d*x-m*T-g*L)*O,n[12]=(s*ke-a*ze-u*Ge)*O,n[13]=(t*ze-i*ke+r*Ge)*O,n[14]=(v*b-h*y-w*L)*O,n[15]=(m*y-d*b+p*L)*O,n):null}function $t(n,e,t){var i=e[0],r=e[1],o=e[2],a=e[3],s=e[4],u=e[5],f=e[6],m=e[7],d=e[8],p=e[9],g=e[10],h=e[11],v=e[12],w=e[13],E=e[14],L=e[15],b=t[0],x=t[1],y=t[2],T=t[3];return n[0]=b*i+x*s+y*d+T*v,n[1]=b*r+x*u+y*p+T*w,n[2]=b*o+x*f+y*g+T*E,n[3]=b*a+x*m+y*h+T*L,b=t[4],x=t[5],y=t[6],T=t[7],n[4]=b*i+x*s+y*d+T*v,n[5]=b*r+x*u+y*p+T*w,n[6]=b*o+x*f+y*g+T*E,n[7]=b*a+x*m+y*h+T*L,b=t[8],x=t[9],y=t[10],T=t[11],n[8]=b*i+x*s+y*d+T*v,n[9]=b*r+x*u+y*p+T*w,n[10]=b*o+x*f+y*g+T*E,n[11]=b*a+x*m+y*h+T*L,b=t[12],x=t[13],y=t[14],T=t[15],n[12]=b*i+x*s+y*d+T*v,n[13]=b*r+x*u+y*p+T*w,n[14]=b*o+x*f+y*g+T*E,n[15]=b*a+x*m+y*h+T*L,n}function Mr(n,e,t,i,r){var o=1/Math.tan(e/2),a;return n[0]=o/t,n[1]=0,n[2]=0,n[3]=0,n[4]=0,n[5]=o,n[6]=0,n[7]=0,n[8]=0,n[9]=0,n[11]=-1,n[12]=0,n[13]=0,n[15]=0,r!=null&&r!==1/0?(a=1/(i-r),n[10]=(r+i)*a,n[14]=2*r*i*a):(n[10]=-1,n[14]=-2*i),n}var Ir=Mr;function U(){var n=new ot(3);return ot!=Float32Array&&(n[0]=0,n[1]=0,n[2]=0),n}function ae(n,e,t){var i=new ot(3);return i[0]=n,i[1]=e,i[2]=t,i}function Xt(n,e,t){return n[0]=e[0]+t[0],n[1]=e[1]+t[1],n[2]=e[2]+t[2],n}function Ye(n,e,t){return n[0]=e[0]-t[0],n[1]=e[1]-t[1],n[2]=e[2]-t[2],n}function ge(n,e,t){return n[0]=e[0]*t,n[1]=e[1]*t,n[2]=e[2]*t,n}function bn(n,e){return n[0]=-e[0],n[1]=-e[1],n[2]=-e[2],n}function $e(n,e){var t=e[0],i=e[1],r=e[2],o=t*t+i*i+r*r;return o>0&&(o=1/Math.sqrt(o)),n[0]=e[0]*o,n[1]=e[1]*o,n[2]=e[2]*o,n}function I(n,e){return n[0]*e[0]+n[1]*e[1]+n[2]*e[2]}function xn(n,e,t){var i=e[0],r=e[1],o=e[2],a=t[0],s=t[1],u=t[2];return n[0]=r*u-o*s,n[1]=o*a-i*u,n[2]=i*s-r*a,n}function st(n,e,t){var i=e[0],r=e[1],o=e[2],a=t[3]*i+t[7]*r+t[11]*o+t[15];return a=a||1,n[0]=(t[0]*i+t[4]*r+t[8]*o+t[12])/a,n[1]=(t[1]*i+t[5]*r+t[9]*o+t[13])/a,n[2]=(t[2]*i+t[6]*r+t[10]*o+t[14])/a,n}var he=Ye;(function(){var n=U();return function(e,t,i,r,o,a){var s,u;for(t||(t=3),i||(i=0),r?u=Math.min(r*t+i,e.length):u=e.length,s=i;s<u;s+=t)n[0]=e[s],n[1]=e[s+1],n[2]=e[s+2],o(n,n,a),e[s]=n[0],e[s+1]=n[1],e[s+2]=n[2];return e}})();class Nr{constructor(e){this.block=!1,this.position=U(),this.down=!1,this.prevMouseX=0,this.prevMouseY=0,this.currentMouseX=0,this.currentMouseY=0,this.alpha=Math.PI*.5,this.beta=-Math.PI*.5,this._alpha=this.alpha,this._beta=this.beta,this._alpha2=this.alpha,this._beta2=this.beta,this.gaze=!0,this.ratio=1,this.init=!0,this.target=[.5,.35,.5],this.lerp=.1,this.lerp2=.1,this.perspectiveMatrix=$(),this.cameraTransformMatrix=$(),this.orientationMatrix=$(),this.transformMatrix=$(),this.transformMatrixReflection=$(),e.style.cursor="-moz-grab",e.style.cursor=" -webkit-grab",document.addEventListener("mousemove",t=>{this.currentMouseX=t.clientX,this.currentMouseY=t.clientY},!1),document.addEventListener("mousedown",t=>{e.style.cursor="-moz-grabbing",e.style.cursor=" -webkit-grabbing",this.down=!0},!1),document.addEventListener("mouseup",t=>{e.style.cursor="-moz-grab",e.style.cursor=" -webkit-grab",this.down=!1},!1)}updateCamera(e,t,i){if(this.ratio=i,Ir(this.perspectiveMatrix,e*Math.PI/180,t,.01,1e3),this.block||(this.down&&(this.alpha-=.1*(this.currentMouseY-this.prevMouseY)*Math.PI/180,this.beta+=.1*(this.currentMouseX-this.prevMouseX)*Math.PI/180),this.alpha<=.3*Math.PI&&(this.alpha=.3*Math.PI),this.alpha>=.52*Math.PI&&(this.alpha=.52*Math.PI),this.beta>-.1*Math.PI&&(this.beta=-.1*Math.PI),this.beta<-.9*Math.PI&&(this.beta=-.9*Math.PI)),this.lerp=this.down?.2:.05,this.lerp2+=(this.lerp-this.lerp2)*.15,this._alpha!=this.alpha||this._beta!=this.beta||this.init){this._alpha+=(this.alpha-this._alpha)*this.lerp2,this._beta+=(this.beta-this._beta)*this.lerp2,this._alpha2+=(this._alpha-this._alpha2)*this.lerp2,this._beta2+=(this._beta-this._beta2)*this.lerp2,this.position[0]=this.ratio*Math.sin(this._alpha2)*Math.sin(this._beta2)+this.target[0],this.position[1]=this.ratio*Math.cos(this._alpha2)+this.target[1],this.position[2]=this.ratio*Math.sin(this._alpha2)*Math.cos(this._beta2)+this.target[2],this.cameraTransformMatrix=this.defineTransformMatrix(this.position,this.target,[0,1,0]);for(let r=0;r<16;r++)this.orientationMatrix[r]=this.cameraTransformMatrix[r];this.orientationMatrix[12]=0,this.orientationMatrix[13]=0,this.orientationMatrix[14]=0}this.prevMouseX=this.currentMouseX,this.prevMouseY=this.currentMouseY,$t(this.transformMatrix,this.perspectiveMatrix,this.cameraTransformMatrix)}calculateReflection(e,t){let i=ae(e[0],e[1],e[2]);he(i,i,this.position);let r=U();ge(r,t,2*I(i,t)),he(i,i,r),bn(i,i),Xt(i,i,e);let o=ae(e[0],e[1],e[2]);he(o,o,this.target),ge(r,t,2*I(o,t)),he(o,o,r),bn(o,o),Xt(o,o,e);let a=ae(0,-1,0);this.reflectionPosition=i,this.cameraReflectionMatrix=this.defineTransformMatrix2(i,o,a),$t(this.transformMatrixReflection,this.perspectiveMatrix,this.cameraReflectionMatrix)}defineTransformMatrix(e,t,i){let r=$(),o=U(),a=U(),s=U(),u=U(),f=U();f[0]=i[0],f[1]=i[1],f[2]=i[2],Ye(o,e,t),$e(a,o);let m=I(a,f),d=U();return ge(d,a,m),Ye(s,f,d),$e(s,s),xn(u,a,s),r[0]=u[0],r[1]=s[0],r[2]=a[0],r[3]=0,r[4]=u[1],r[5]=s[1],r[6]=a[1],r[7]=0,r[8]=u[2],r[9]=s[2],r[10]=a[2],r[11]=0,r[12]=-I(e,u),r[13]=-I(e,s),r[14]=-I(e,a),r[15]=1,r}defineTransformMatrix2(e,t,i){let r=$(),o=U(),a=U(),s=U(),u=U(),f=U();f[0]=i[0],f[1]=i[1],f[2]=i[2],Ye(o,e,t),$e(a,o);let m=I(a,f),d=U();return ge(d,a,m),Ye(s,f,d),$e(s,s),xn(u,s,a),r[0]=u[0],r[1]=s[0],r[2]=a[0],r[3]=0,r[4]=u[1],r[5]=s[1],r[6]=a[1],r[7]=0,r[8]=u[2],r[9]=s[2],r[10]=a[2],r[11]=0,r[12]=-I(e,u),r[13]=-I(e,s),r[14]=-I(e,a),r[15]=1,r}}var K=document.createElement("canvas"),re=K.getContext("2d",{willReadFrequently:!0});K.style.position="absolute";K.style.top="0px";function Fr(n,e,t,i=.56,r=null){return K.width=t,K.height=t,K.style.width=`${t}px`,K.style.height=`${t}px`,r==null?(re.fillStyle="black",re.fillRect(0,0,K.width,K.height),re.fillStyle="white",re.textAlign="center",re.font=`${e}px codrops`,re.fillText(n,t*.5,t*.5+e*i)):re.drawImage(r,0,0),re.getImageData(0,0,t,t).data}const Vr=`struct Uniforms {
    cameraOrientation: mat4x4f,

    acceleration: vec3f,
    deltaTime: f32,

    mousePosition: vec3f,
    gridResolution: f32,

    mouseDirection: vec3f,
    currentFrame: f32,

    transition: f32,
    totalParticles: f32
}

@group(0) @binding(0) var<storage, read_write>  resetBuffer: array<vec4f>;
@group(0) @binding(1) var<storage, read_write>  positionBuffer: array<vec4f>;
@group(0) @binding(2) var<storage, read>  velocityBuffer: array<vec4f>;
@group(0) @binding(3) var<storage, read_write>  counterBuffer:    array<atomic<u32>>;
@group(0) @binding(4) var<storage, read_write>  indicesBuffer:    array<u32>;
@group(0) @binding(5) var<uniform>  uniforms: Uniforms;


//Analitic derivatives of the potentials for the curl noise, based on: http://weber.itn.liu.se/~stegu/TNM084-2019/bridson-siggraph2007-curlnoise.pdf

fn t1() -> f32 {
    return uniforms.currentFrame * 10.5432895;
}

fn t2() -> f32 {
    return uniforms.currentFrame * 20.5432895;
}

fn t3() -> f32 {
    return uniforms.currentFrame * 5.535463;
}

fn t4() -> f32 {
    return -uniforms.currentFrame * 13.534534;
}

fn t5() -> f32 {
    return uniforms.currentFrame * 54.42345;
}

fn t6() -> f32 {
    return - uniforms.currentFrame * 23.53450;
}

fn t7() -> f32 {
    return - uniforms.currentFrame * 45.5345354313;
}

fn t8() -> f32 {
    return uniforms.currentFrame * 23.4234521243;
}

fn dP3dY( v: vec3<f32>) -> f32 {
    var noise = 0.0;
    noise += 3. * cos(v.z * 1.8 + v.y * 3. - 194.58 + t1() ) + 4.5 * cos(v.z * 4.8 + v.y * 4.5 - 83.13 + t2() ) + 1.2 * cos(v.z * -7.0 + v.y * 1.2 -845.2 + t3() ) + 2.13 * cos(v.z * -5.0 + v.y * 2.13 - 762.185 + t4() );
    noise += 5.4 * cos(v.x * -0.48 + v.y * 5.4 - 707.916 + t5() ) + 5.4 * cos(v.x * 2.56 + v.y * 5.4 + -482.348 + t6() ) + 2.4 * cos(v.x * 4.16 + v.y * 2.4 + 9.872 + t7() ) + 1.35 * cos(v.x * -4.16 + v.y * 1.35 - 476.747 + t8() );
    return noise;
}

fn dP2dZ( v: vec3<f32>) -> f32 {
    return -0.48 * cos(v.z * -0.48 + v.x * 5.4 -125.796 + t5() ) + 2.56 * cos(v.z * 2.56 + v.x * 5.4 + 17.692 + t6() ) + 4.16 * cos(v.z * 4.16 + v.x * 2.4 + 150.512 + t7() ) -4.16 * cos(v.z * -4.16 + v.x * 1.35 - 222.137 + t8() );
}

fn dP1dZ( v: vec3<f32>) -> f32 {
    var noise = 0.0;
    noise += 3. * cos(v.x * 1.8 + v.z * 3. + t1() ) + 4.5 * cos(v.x * 4.8 + v.z * 4.5 + t2() ) + 1.2 * cos(v.x * -7.0 + v.z * 1.2 + t3() ) + 2.13 * cos(v.x * -5.0 + v.z * 2.13 + t4() );
    noise += 5.4 * cos(v.y * -0.48 + v.z * 5.4 + t5() ) + 5.4 * cos(v.y * 2.56 + v.z * 5.4 + t6() ) + 2.4 * cos(v.y * 4.16 + v.z * 2.4 + t7() ) + 1.35 * cos(v.y * -4.16 + v.z * 1.35 + t8() );
    return noise;
}

fn dP3dX( v: vec3<f32>) -> f32 {
    return -0.48 * cos(v.x * -0.48 + v.y * 5.4 - 707.916 + t5() ) + 2.56 * cos(v.x * 2.56 + v.y * 5.4 + -482.348 + t6() ) + 4.16 * cos(v.x * 4.16 + v.y * 2.4 + 9.872 + t7() ) -4.16 * cos(v.x * -4.16 + v.y * 1.35 - 476.747 + t8() );
}

fn dP2dX( v: vec3<f32>) -> f32 {
    var noise = 0.0;
    noise += 3. * cos(v.y * 1.8 + v.x * 3. - 2.82 + t1() ) + 4.5 * cos(v.y * 4.8 + v.x * 4.5 + 74.37 + t2() ) + 1.2 * cos(v.y * -7.0 + v.x * 1.2 - 256.72 + t3() ) + 2.13 * cos(v.y * -5.0 + v.x * 2.13 - 207.683 + t4() );
    noise += 5.4 * cos(v.z * -0.48 + v.x * 5.4 -125.796 + t5() ) + 5.4 * cos(v.z * 2.56 + v.x * 5.4 + 17.692 + t6() ) + 2.4 * cos(v.z * 4.16 + v.x * 2.4 + 150.512 + t7() ) + 1.35 * cos(v.z * -4.16 + v.x * 1.35 - 222.137 + t8() );
    return noise;
}

fn dP1dY( v: vec3<f32>) -> f32 {
    return -0.48 * cos(v.y * -0.48 + v.z * 5.4 + t5() ) + 2.56 * cos(v.y * 2.56 + v.z * 5.4 + t6() ) +  4.16 * cos(v.y * 4.16 + v.z * 2.4 + t7() ) -4.16 * cos(v.y * -4.16 + v.z * 1.35 + t8());
}

fn curlNoise(p : vec3<f32> ) -> vec3<f32> {
    let x = dP3dY(p) - dP2dZ(p);
    let y = dP1dZ(p) - dP3dX(p);
    let z = dP2dX(p) - dP1dY(p);
    return normalize(vec3<f32>(x, y, z));
}


@compute @workgroup_size(256) fn main( @builtin(global_invocation_id) id: vec3<u32> ) {

    let i = id.x;
    var ii = id.x;
    let tt = u32(uniforms.totalParticles);
    if(ii >= tt) {
        ii = tt - i % tt;
    }

    //Apply the forces
    var planeIndex = positionBuffer[i].a;
    var position = positionBuffer[i].rgb;
    var velocity = velocityBuffer[i].rgb;
    var origin = resetBuffer[ii].rgb;

    //Apply different noise function
    //position -= vec3f(0.16) * curlNoise( .0125 * pos );
    var dt = uniforms.deltaTime;
    var acceleration = vec3f(0.);
    var noiseAcceleration = uniforms.acceleration;
    var transition = uniforms.transition * 3.;
    var delta = 1.;

    var amp = 150.;
    var freq = .01;
    for(var k = 0; k < 2; k ++) {
        var c = curlNoise(freq * position );
        // c.x *= 0.1;
        noiseAcceleration += amp * c;
        amp /= 2.;
        freq *= 2.;
    } 

    // noiseAcceleration += .01 * (vec3(uniforms.gridResolution * 0.5) - position);

    var resetAcceleration = 20. * (origin - position);

    if(transition < 1.) {
        acceleration = noiseAcceleration;
    } else {
        var transitionIndex = min(max(transition - planeIndex / uniforms.gridResolution - 1., 0.), 1.);
        // transitionIndex = pow(transitionIndex, 4.);
        acceleration = mix(noiseAcceleration, resetAcceleration + noiseAcceleration * (1. - transitionIndex), vec3f(transitionIndex));
    }

    var p1 = uniforms.cameraOrientation * vec4f(position, 1.);
    var p2 = uniforms.cameraOrientation * vec4f(uniforms.mousePosition, 1.);
    var intensity = 1. - length(p2.xy - p1.xy) / (5. + 10. * clamp(length(uniforms.mouseDirection), 0, 1) );
    intensity = clamp(intensity, 0., 1.);
    acceleration +=  0.1 * uniforms.mouseDirection * intensity / (dt * dt);


    position = position + dt * (velocity + dt * acceleration);


    //Save back the position
    positionBuffer[i] = vec4f(position, planeIndex);

    //Place particles inside the grid acceleration

    let textureSize = u32(uniforms.gridResolution);

    //3d index for the grid acceleration
    let voxelPosition = vec3<u32>( floor(position) );

    //1d index for the atomic buffer
    let index1D = voxelPosition.x + textureSize * voxelPosition.y + textureSize * textureSize * voxelPosition.z;

    //Increase the counter and set the index for the 3d indices buffer
    let amountOfParticlesInVoxel = atomicAdd(&counterBuffer[index1D], 1);
    if(amountOfParticlesInVoxel < 4) {
        indicesBuffer[ u32( u32(4 * index1D) + u32(amountOfParticlesInVoxel) )] = i;
    }

}`,Hr=`struct Uniforms {
    uResolution: f32,
    uSearchRadius: f32,
    separation: f32
}

var<private> deltaPosition: vec3<f32> = vec3f(0.);
var<private> h2: f32 = 0.;

@group(0) @binding(0) var<storage, read>  positionBufferIN: array<vec4f>;
@group(0) @binding(1) var<storage, read_write> positionBufferOUT: array<vec4f>;
@group(0) @binding(2) var<storage, read>  indicesBuffer: array<vec4<u32>>;
@group(0) @binding(3) var<uniform>  uniforms: Uniforms;

fn addToSum(particlePosition: vec3f, nParticlePosition: vec3f) {

    let distance = (particlePosition - nParticlePosition) ;
    let r = length(distance);

    let separation = 1. + uniforms.separation;

    if(r > 0. && r < separation) {

        deltaPosition -= 0.5 * (r - separation) * normalize(distance) ;
    }

}

@compute @workgroup_size(256) fn main( @builtin(global_invocation_id) id: vec3<u32> ) {

    var index1D = id.x;

    h2 = uniforms.uSearchRadius * uniforms.uSearchRadius;

    let particlePosition = positionBufferIN[index1D].rgb;
    let lambdaPressure = positionBufferIN[index1D].a;
    let gridPosition = vec3<i32>(floor(particlePosition));
    let resolution = i32(uniforms.uResolution);

    var neighborsVoxel = gridPosition ;
    var voxelIndex = neighborsVoxel.x + neighborsVoxel.y * resolution + neighborsVoxel.z * resolution * resolution;
    var indices = indicesBuffer[u32(voxelIndex)];
    if(indices.x > 0) {addToSum(particlePosition, positionBufferIN[indices.x].rgb);}
    if(indices.y > 0) {addToSum(particlePosition, positionBufferIN[indices.y].rgb);}
    if(indices.z > 0) {addToSum(particlePosition, positionBufferIN[indices.z].rgb);}
    if(indices.w > 0) {addToSum(particlePosition, positionBufferIN[indices.w].rgb);}

    var offsets = array<vec3<i32>, 26>();

    //Faces
    offsets[0] = vec3<i32>(0, 0, 1);
    offsets[1] = vec3<i32>(0, 0, -1);
    offsets[2] = vec3<i32>(0, 1, 0);
    offsets[3] = vec3<i32>(0, -1, 0);
    offsets[4] = vec3<i32>(1, 0, 0);
    offsets[5] = vec3<i32>(-1, 0, 0);

    //Aristas
    offsets[6] = vec3<i32>(0, 1, 1);
    offsets[7] = vec3<i32>(1, 0, 1);
    offsets[8] = vec3<i32>(1, 1, 0);
    offsets[9] = vec3<i32>(0, 1, -1);
    offsets[10] = vec3<i32>(1, 0, -1);
    offsets[11] = vec3<i32>(1, -1, 0);
    offsets[12] = vec3<i32>(0, -1, 1);
    offsets[13] = vec3<i32>(-1, 0, 1);
    offsets[14] = vec3<i32>(-1, 1, 0);
    offsets[15] = vec3<i32>(0, -1, -1);
    offsets[16] = vec3<i32>(-1, 0, -1);
    offsets[17] = vec3<i32>(-1, -1, 0);

    //Corners
    offsets[18] = vec3<i32>(1, 1, 1);
    offsets[19] = vec3<i32>(1, 1, -1);
    offsets[20] = vec3<i32>(1, -1, 1);
    offsets[21] = vec3<i32>(-1, 1, 1);
    offsets[22] = vec3<i32>(1, -1, -1);
    offsets[23] = vec3<i32>(-1, -1, 1);
    offsets[24] = vec3<i32>(-1, 1, -1);
    offsets[25] = vec3<i32>(-1, -1, -1);



    for(var i = 0; i < 26; i ++) {

        var average = vec3f(0);
        var counter = 0.;
        let neighborsVoxel = gridPosition + offsets[i];
        let voxelIndex = neighborsVoxel.x + neighborsVoxel.y * resolution + neighborsVoxel.z * resolution * resolution;
        let indices = indicesBuffer[u32(voxelIndex)];

        if(indices.x > 0) {addToSum(particlePosition, positionBufferIN[indices.x].rgb);}
        if(indices.y > 0) {addToSum(particlePosition, positionBufferIN[indices.y].rgb);}
        if(indices.z > 0) {addToSum(particlePosition, positionBufferIN[indices.z].rgb);}
        if(indices.w > 0) {addToSum(particlePosition, positionBufferIN[indices.w].rgb);}
        
    }

    var endPosition = particlePosition + deltaPosition;

    //Collision handling
    let center = uniforms.uResolution * vec3f(0.5, 0.5, 0.5);
    let boxSize = uniforms.uResolution * vec3f(0.1, 0.48, 0.48);
    let xLocal = endPosition - center;
    let contactPointLocal = min(boxSize, max(-boxSize, xLocal));
    let contactPoint = contactPointLocal + center;
    let distance = length(contactPoint - particlePosition);

    if(distance > 0.0) {endPosition = contactPoint;};

    positionBufferOUT[index1D] = vec4f(endPosition, lambdaPressure);
}
`,Yr=`struct Uniforms {
    deltaTime: f32,
    textureSize: f32,
    scatter: f32,
    dampening: f32
}

const EPSILON: f32 = 0.001;
 

@group(0) @binding(0) var<storage, read>  positionBufferOLD: array<vec4f>;
@group(0) @binding(1) var<storage, read>  positionBufferUPDATED: array<vec4f>;
@group(0) @binding(2) var<storage, read_write>  velocityBuffer: array<vec4f>;
@group(0) @binding(3) var<uniform>  uniforms: Uniforms;
@group(0) @binding(4) var texture3D: texture_storage_3d<rgba32float, write>;


@compute @workgroup_size(256) fn main( @builtin(global_invocation_id) id: vec3<u32> ) {

    let index1D = id.x;

    var velocity = positionBufferUPDATED[index1D].rgb - positionBufferOLD[index1D].rgb;
    velocity /= (max(uniforms.deltaTime, EPSILON));
    var speed = length(velocity);
    if(speed > 0.) {
        speed = min(40., speed);
        velocity = speed  * normalize(velocity);
    }

    var dampening = 3. * uniforms.dampening;
    if(dampening > 2.) {
        velocity *= 1. - 0.8 * fract(dampening);
    }

    

    velocityBuffer[index1D] = vec4f(velocity, 1.);
      
    //Filling the information of the texture3D
    var tSize = f32(textureDimensions(texture3D).x);
    var normalizedPosition = positionBufferUPDATED[index1D].rgb / uniforms.textureSize;
    normalizedPosition *= tSize;

    let size: u32 = 2;
    for(var i: u32 = 0; i < size; i ++) {
        for(var j: u32 = 0; j < size; j ++) {
            for(var k: u32 = 0; k < size; k ++) {
                textureStore(texture3D, vec3<u32>(floor(normalizedPosition)) + vec3u(i, j , k), vec4f(1., velocity) );
            }
        }
    }
    
}`,$r=`

struct Uniforms {
    lightIntensity: f32
}

@group(0) @binding(0) var texture3D: texture_storage_3d<rgba32float, write>;
@group(0) @binding(1) var<uniform>  uniforms: Uniforms;


@compute @workgroup_size(1, 1, 1) fn main( @builtin(global_invocation_id) id: vec3<u32> ) {

    textureStore(texture3D, id, vec4f(0.));

}

`,Xr=120;let qr=1.8,Wr=1,S=null,k=null,te=null,Xe,ut=0,Oe,Ae,bt,qt,fn,xt,A,qe,J,Z,Ue,Te,_e=U(),jr=U(),lt=U(),q=U(),yt=[];const Kr=window.location.search,tr=new URLSearchParams(Kr),Jr=tr.get("word")||"CODROPS";let yn=Jr.toUpperCase().split(""),Zr=[.57,.56,.583,.59,.56,.59,.56],Q=0,gt=0,wn=0,nr=0,Wt=new Image,Sn=Promise.create();function jt(){Q>yn.length-1&&(Q=tr.get("word")?0:-1);let n=yn[Math.max(Q,0)],e=Zr[Math.max(Q,0)],t=[];var i=0;let r=new Float32Array(Xe*4);const o=Fr(n,S*.8,S,e,Q==-1?Wt:null);let a=0,s=0,u=.43*S;if(Q>-1)for(;s<Xe;){a=0;for(let d=0;d<S;d++){a=0;for(let p=0;p<S;p++){let g=S-p+S*S-d*S;if(o[4*g]>10&&s<Xe){var f=[u+Math.random()*i,d+Math.random()*i,p+Math.random()*i,a];t.push(f),s++}a++}}u++}else for(let d=0;d<S;d++)for(let p=0;p<S;p++){for(let g=0;g<S;g++){let h=Math.abs(p-S*.5),v=Math.abs(g-S*.5),w=S*.5-Math.floor(Math.sqrt(h*h+v*v)),E=S-w+S*S-d*S;if(o[4*E]>10&&s<Xe){var f=[g+Math.random()*i+0*S,d+Math.random()*i,p+Math.random()*i,a];t.push(f),s++,a++}}a=0}function m(d,p){return d[3]-p[3]}return t=t.sort(m),t=t.flat(1/0),gt=t.length/4,nr=Math.max(gt,wn),wn=gt,r.set(t,0),r}function Qr(){let n=jt();Oe=k.createBuffer({label:"position buffer",size:te,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),k.queue.writeBuffer(Oe,0,n),yt=k.createBuffer({label:"next letter buffer",size:te,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),Q++;let e=jt();k.queue.writeBuffer(yt,0,e),Ae=k.createBuffer({label:"position buffer 1",size:te,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),bt=k.createBuffer({label:"position buffer 2",size:te,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),qt=k.createBuffer({label:"velocity buffer 1",size:te,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),xt=k.createBuffer({label:"indices buffer data",size:Math.pow(S,3)*4*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),fn=k.createBuffer({label:"counterBuffer buffer",size:Math.pow(S,3)*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC})}async function ei(n,e,t,i){return S=n,Xe=e,te=e*4*4,k=R,Ue=t,Te=i,Wt.addEventListener("load",r=>{console.log("image loaded"),Sn.resolve()}),Wt.src="./assets/drop120.png",await Sn,Qr(),A=await ne("forces",Vr,new Array(80).fill(0)),qe=await ne("displacement",Hr,[S,qr,0],[Ae,bt,xt,"uniforms"]),J=await ne("velocity",Yr,[0,S,0,1]),A.setBindGroup([{binding:0,resource:{buffer:yt}},{binding:1,resource:{buffer:Ae}},{binding:2,resource:{buffer:qt}},{binding:3,resource:{buffer:fn}},{binding:4,resource:{buffer:xt}},{binding:5,resource:{buffer:A.uniformsBuffer}}]),J.setBindGroup([{binding:0,resource:{buffer:Oe}},{binding:1,resource:{buffer:bt}},{binding:2,resource:{buffer:qt}},{binding:3,resource:{buffer:J.uniformsBuffer}},{binding:4,resource:Ue.createView({baseMipLevel:0,mipLevelCount:1})}]),Z=await ne("fill texture",$r,[0]),Z.setBindGroup([{binding:0,resource:Ue.createView({baseMipLevel:0,mipLevelCount:1})},{binding:1,resource:{buffer:Z.uniformsBuffer}}]),document.addEventListener("mousemove",ti),Oe}function ti(n){let e=2*n.clientX/window.innerWidth-1,t=1-2*n.clientY/window.innerHeight,i=ae(e,t,0),r=ae(e,t,1),o=$(),a=$();_n(o,Te.cameraTransformMatrix),_n(a,Te.perspectiveMatrix);let s=$();$t(s,o,a),st(i,i,s),st(r,r,s),ge(i,i,S),ge(r,r,S);let u=U();he(u,r,i),$e(u,u);let f=ae(0,0,-1),m=ae(0,0,.35*S);st(f,f,Te.orientationMatrix),st(m,m,Te.orientationMatrix);let d=0;const p=I(u,f);p>1e-4&&(he(m,m,i),d=I(m,f)/p),ge(u,u,d),Xt(i,i,u),_e[0]=i[0],_e[1]=i[1],_e[2]=i[2]}function ni(n={x:0,y:-10,z:0},e=.01,t,i,r){var o=Xr,a=ut%o;const s=k.createCommandEncoder({label:"encoder"});if(a==0&&ut>10){Q++;let p=jt();k.queue.writeBuffer(yt,0,p),r.down||(r.alpha=Math.PI*.5-Math.random()*.1*Math.PI,r.beta=-Math.PI*.5+(2*Math.random()-1)*Math.PI*.4)}var u=a/o;function f(p){const g=s.beginComputePass({label:p.label});g.setPipeline(p.pipeline),g.setBindGroup(0,p.bindGroup),g.dispatchWorkgroups(nr/256),g.end()}he(lt,_e,jr),q[0]+=(lt[0]-q[0])*.1,q[1]+=(lt[1]-q[1])*.1,q[2]+=(lt[2]-q[2])*.1;for(let p=0;p<16;p++)A.uniformsData[p]=Te.orientationMatrix[p];A.uniformsData[16]=n.x,A.uniformsData[17]=n.y,A.uniformsData[18]=n.z,A.uniformsData[19]=e,A.uniformsData[20]=_e[0],A.uniformsData[21]=_e[1],A.uniformsData[22]=_e[2],A.uniformsData[23]=S,A.uniformsData[24]=q[0],A.uniformsData[25]=q[1],A.uniformsData[26]=q[2],A.uniformsData[27]=ut,A.uniformsData[28]=u,A.uniformsData[29]=gt,k.queue.writeBuffer(A.uniformsBuffer,0,A.uniformsData),ut+=1,J.uniformsData[0]=e,J.uniformsData[2]=t,J.uniformsData[3]=u,k.queue.writeBuffer(J.uniformsBuffer,0,J.uniformsData),qe.uniformsData[2]=i,k.queue.writeBuffer(qe.uniformsBuffer,0,qe.uniformsData),s.copyBufferToBuffer(Oe,0,Ae,0,te),s.clearBuffer(fn),s.clearBuffer(xt),Z.uniformsData[0]=t,k.queue.writeBuffer(Z.uniformsBuffer,0,Z.uniformsData);const m=s.beginComputePass({label:Z.label});m.setPipeline(Z.pipeline),m.setBindGroup(0,Z.bindGroup),m.dispatchWorkgroups(Ue.width,Ue.width,Ue.width),m.end(),f(A);for(let p=0;p<Wr;p++)f(qe),s.copyBufferToBuffer(bt,0,Ae,0,te);f(J),s.copyBufferToBuffer(Ae,0,Oe,0,te);const d=s.finish();return k.queue.submit([d]),{animationFrame:a,relativeFrame:u,currentLetter:Q}}const ri=`
@group(0) @binding(0) var textureRead: texture_3d<f32>;
@group(0) @binding(1) var textureSave: texture_storage_3d<rgba32float, write>;

@compute @workgroup_size(1) fn main( @builtin(global_invocation_id) id: vec3<u32> ) {

    var result = vec4f(0., 0., 0., 0.);
    
    for(var i = 0; i < 2; i ++) {
        for(var j = 0; j < 2; j ++) {
            for(var k = 0; k < 2; k ++) {
                result += textureLoad(textureRead, 2 * vec3<i32>(id) + vec3<i32>(i, j, k), 0);
            }
        }
    }

    result.x /= 8.;
    result.y /= 8.;
    result.z /= 8.;
    result.w /= 8.;
    
    let tSize = f32(textureDimensions(textureSave).x);
    textureStore(textureSave, id, result );

}

`;Promise.create();let Bn=!1,Et,At;async function ii(n,e){if(!Bn){let o=Promise.create();Ee(ri).then(a=>{Et=a.pipeline,o.resolve()}),await o,At=[];for(let a=0;a<n.mipLevelCount-1;a++){const s=e.createBindGroup({label:"bind group for mipmap",layout:Et.getBindGroupLayout(0),entries:[{binding:0,resource:n.createView({baseMipLevel:a,mipLevelCount:1})},{binding:1,resource:n.createView({baseMipLevel:a+1,mipLevelCount:1})}]});At.push(s)}Bn=!0}const t=e.createCommandEncoder({label:"encoder"}),i=t.beginComputePass({label:"mipmap pass"});i.setPipeline(Et);for(let o=0;o<n.mipLevelCount-1;o++){let a=Math.pow(2,n.mipLevelCount-o-1);i.setBindGroup(0,At[o]),i.dispatchWorkgroups(a,a,a)}i.end();const r=t.finish();e.queue.submit([r])}const oi=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,8,3,9,8,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,2,10,0,2,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,8,3,2,10,8,10,9,8,-1,-1,-1,-1,-1,-1,3,11,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,11,2,8,11,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,9,0,2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,11,2,1,9,11,9,8,11,-1,-1,-1,-1,-1,-1,3,10,1,11,10,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,10,1,0,8,10,8,11,10,-1,-1,-1,-1,-1,-1,3,9,0,3,11,9,11,10,9,-1,-1,-1,-1,-1,-1,9,8,10,10,8,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,3,0,7,3,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,9,8,4,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,1,9,4,7,1,7,3,1,-1,-1,-1,-1,-1,-1,1,2,10,8,4,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,4,7,3,0,4,1,2,10,-1,-1,-1,-1,-1,-1,9,2,10,9,0,2,8,4,7,-1,-1,-1,-1,-1,-1,2,10,9,2,9,7,2,7,3,7,9,4,-1,-1,-1,8,4,7,3,11,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,4,7,11,2,4,2,0,4,-1,-1,-1,-1,-1,-1,9,0,1,8,4,7,2,3,11,-1,-1,-1,-1,-1,-1,4,7,11,9,4,11,9,11,2,9,2,1,-1,-1,-1,3,10,1,3,11,10,7,8,4,-1,-1,-1,-1,-1,-1,1,11,10,1,4,11,1,0,4,7,11,4,-1,-1,-1,4,7,8,9,0,11,9,11,10,11,0,3,-1,-1,-1,4,7,11,4,11,9,9,11,10,-1,-1,-1,-1,-1,-1,9,5,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,5,4,0,8,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,5,4,1,5,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,5,4,8,3,5,3,1,5,-1,-1,-1,-1,-1,-1,1,2,10,9,5,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,8,1,2,10,4,9,5,-1,-1,-1,-1,-1,-1,5,2,10,5,4,2,4,0,2,-1,-1,-1,-1,-1,-1,2,10,5,3,2,5,3,5,4,3,4,8,-1,-1,-1,9,5,4,2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,11,2,0,8,11,4,9,5,-1,-1,-1,-1,-1,-1,0,5,4,0,1,5,2,3,11,-1,-1,-1,-1,-1,-1,2,1,5,2,5,8,2,8,11,4,8,5,-1,-1,-1,10,3,11,10,1,3,9,5,4,-1,-1,-1,-1,-1,-1,4,9,5,0,8,1,8,10,1,8,11,10,-1,-1,-1,5,4,0,5,0,11,5,11,10,11,0,3,-1,-1,-1,5,4,8,5,8,10,10,8,11,-1,-1,-1,-1,-1,-1,9,7,8,5,7,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,3,0,9,5,3,5,7,3,-1,-1,-1,-1,-1,-1,0,7,8,0,1,7,1,5,7,-1,-1,-1,-1,-1,-1,1,5,3,3,5,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,7,8,9,5,7,10,1,2,-1,-1,-1,-1,-1,-1,10,1,2,9,5,0,5,3,0,5,7,3,-1,-1,-1,8,0,2,8,2,5,8,5,7,10,5,2,-1,-1,-1,2,10,5,2,5,3,3,5,7,-1,-1,-1,-1,-1,-1,7,9,5,7,8,9,3,11,2,-1,-1,-1,-1,-1,-1,9,5,7,9,7,2,9,2,0,2,7,11,-1,-1,-1,2,3,11,0,1,8,1,7,8,1,5,7,-1,-1,-1,11,2,1,11,1,7,7,1,5,-1,-1,-1,-1,-1,-1,9,5,8,8,5,7,10,1,3,10,3,11,-1,-1,-1,5,7,0,5,0,9,7,11,0,1,0,10,11,10,0,11,10,0,11,0,3,10,5,0,8,0,7,5,7,0,11,10,5,7,11,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,10,6,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,5,10,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,0,1,5,10,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,8,3,1,9,8,5,10,6,-1,-1,-1,-1,-1,-1,1,6,5,2,6,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,6,5,1,2,6,3,0,8,-1,-1,-1,-1,-1,-1,9,6,5,9,0,6,0,2,6,-1,-1,-1,-1,-1,-1,5,9,8,5,8,2,5,2,6,3,2,8,-1,-1,-1,2,3,11,10,6,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,0,8,11,2,0,10,6,5,-1,-1,-1,-1,-1,-1,0,1,9,2,3,11,5,10,6,-1,-1,-1,-1,-1,-1,5,10,6,1,9,2,9,11,2,9,8,11,-1,-1,-1,6,3,11,6,5,3,5,1,3,-1,-1,-1,-1,-1,-1,0,8,11,0,11,5,0,5,1,5,11,6,-1,-1,-1,3,11,6,0,3,6,0,6,5,0,5,9,-1,-1,-1,6,5,9,6,9,11,11,9,8,-1,-1,-1,-1,-1,-1,5,10,6,4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,3,0,4,7,3,6,5,10,-1,-1,-1,-1,-1,-1,1,9,0,5,10,6,8,4,7,-1,-1,-1,-1,-1,-1,10,6,5,1,9,7,1,7,3,7,9,4,-1,-1,-1,6,1,2,6,5,1,4,7,8,-1,-1,-1,-1,-1,-1,1,2,5,5,2,6,3,0,4,3,4,7,-1,-1,-1,8,4,7,9,0,5,0,6,5,0,2,6,-1,-1,-1,7,3,9,7,9,4,3,2,9,5,9,6,2,6,9,3,11,2,7,8,4,10,6,5,-1,-1,-1,-1,-1,-1,5,10,6,4,7,2,4,2,0,2,7,11,-1,-1,-1,0,1,9,4,7,8,2,3,11,5,10,6,-1,-1,-1,9,2,1,9,11,2,9,4,11,7,11,4,5,10,6,8,4,7,3,11,5,3,5,1,5,11,6,-1,-1,-1,5,1,11,5,11,6,1,0,11,7,11,4,0,4,11,0,5,9,0,6,5,0,3,6,11,6,3,8,4,7,6,5,9,6,9,11,4,7,9,7,11,9,-1,-1,-1,10,4,9,6,4,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,10,6,4,9,10,0,8,3,-1,-1,-1,-1,-1,-1,10,0,1,10,6,0,6,4,0,-1,-1,-1,-1,-1,-1,8,3,1,8,1,6,8,6,4,6,1,10,-1,-1,-1,1,4,9,1,2,4,2,6,4,-1,-1,-1,-1,-1,-1,3,0,8,1,2,9,2,4,9,2,6,4,-1,-1,-1,0,2,4,4,2,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,3,2,8,2,4,4,2,6,-1,-1,-1,-1,-1,-1,10,4,9,10,6,4,11,2,3,-1,-1,-1,-1,-1,-1,0,8,2,2,8,11,4,9,10,4,10,6,-1,-1,-1,3,11,2,0,1,6,0,6,4,6,1,10,-1,-1,-1,6,4,1,6,1,10,4,8,1,2,1,11,8,11,1,9,6,4,9,3,6,9,1,3,11,6,3,-1,-1,-1,8,11,1,8,1,0,11,6,1,9,1,4,6,4,1,3,11,6,3,6,0,0,6,4,-1,-1,-1,-1,-1,-1,6,4,8,11,6,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,10,6,7,8,10,8,9,10,-1,-1,-1,-1,-1,-1,0,7,3,0,10,7,0,9,10,6,7,10,-1,-1,-1,10,6,7,1,10,7,1,7,8,1,8,0,-1,-1,-1,10,6,7,10,7,1,1,7,3,-1,-1,-1,-1,-1,-1,1,2,6,1,6,8,1,8,9,8,6,7,-1,-1,-1,2,6,9,2,9,1,6,7,9,0,9,3,7,3,9,7,8,0,7,0,6,6,0,2,-1,-1,-1,-1,-1,-1,7,3,2,6,7,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,11,10,6,8,10,8,9,8,6,7,-1,-1,-1,2,0,7,2,7,11,0,9,7,6,7,10,9,10,7,1,8,0,1,7,8,1,10,7,6,7,10,2,3,11,11,2,1,11,1,7,10,6,1,6,7,1,-1,-1,-1,8,9,6,8,6,7,9,1,6,11,6,3,1,3,6,0,9,1,11,6,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,8,0,7,0,6,3,11,0,11,6,0,-1,-1,-1,7,11,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,6,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,8,11,7,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,9,11,7,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,1,9,8,3,1,11,7,6,-1,-1,-1,-1,-1,-1,10,1,2,6,11,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,2,10,3,0,8,6,11,7,-1,-1,-1,-1,-1,-1,2,9,0,2,10,9,6,11,7,-1,-1,-1,-1,-1,-1,6,11,7,2,10,3,10,8,3,10,9,8,-1,-1,-1,7,2,3,6,2,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,0,8,7,6,0,6,2,0,-1,-1,-1,-1,-1,-1,2,7,6,2,3,7,0,1,9,-1,-1,-1,-1,-1,-1,1,6,2,1,8,6,1,9,8,8,7,6,-1,-1,-1,10,7,6,10,1,7,1,3,7,-1,-1,-1,-1,-1,-1,10,7,6,1,7,10,1,8,7,1,0,8,-1,-1,-1,0,3,7,0,7,10,0,10,9,6,10,7,-1,-1,-1,7,6,10,7,10,8,8,10,9,-1,-1,-1,-1,-1,-1,6,8,4,11,8,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,6,11,3,0,6,0,4,6,-1,-1,-1,-1,-1,-1,8,6,11,8,4,6,9,0,1,-1,-1,-1,-1,-1,-1,9,4,6,9,6,3,9,3,1,11,3,6,-1,-1,-1,6,8,4,6,11,8,2,10,1,-1,-1,-1,-1,-1,-1,1,2,10,3,0,11,0,6,11,0,4,6,-1,-1,-1,4,11,8,4,6,11,0,2,9,2,10,9,-1,-1,-1,10,9,3,10,3,2,9,4,3,11,3,6,4,6,3,8,2,3,8,4,2,4,6,2,-1,-1,-1,-1,-1,-1,0,4,2,4,6,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,9,0,2,3,4,2,4,6,4,3,8,-1,-1,-1,1,9,4,1,4,2,2,4,6,-1,-1,-1,-1,-1,-1,8,1,3,8,6,1,8,4,6,6,10,1,-1,-1,-1,10,1,0,10,0,6,6,0,4,-1,-1,-1,-1,-1,-1,4,6,3,4,3,8,6,10,3,0,3,9,10,9,3,10,9,4,6,10,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,9,5,7,6,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,4,9,5,11,7,6,-1,-1,-1,-1,-1,-1,5,0,1,5,4,0,7,6,11,-1,-1,-1,-1,-1,-1,11,7,6,8,3,4,3,5,4,3,1,5,-1,-1,-1,9,5,4,10,1,2,7,6,11,-1,-1,-1,-1,-1,-1,6,11,7,1,2,10,0,8,3,4,9,5,-1,-1,-1,7,6,11,5,4,10,4,2,10,4,0,2,-1,-1,-1,3,4,8,3,5,4,3,2,5,10,5,2,11,7,6,7,2,3,7,6,2,5,4,9,-1,-1,-1,-1,-1,-1,9,5,4,0,8,6,0,6,2,6,8,7,-1,-1,-1,3,6,2,3,7,6,1,5,0,5,4,0,-1,-1,-1,6,2,8,6,8,7,2,1,8,4,8,5,1,5,8,9,5,4,10,1,6,1,7,6,1,3,7,-1,-1,-1,1,6,10,1,7,6,1,0,7,8,7,0,9,5,4,4,0,10,4,10,5,0,3,10,6,10,7,3,7,10,7,6,10,7,10,8,5,4,10,4,8,10,-1,-1,-1,6,9,5,6,11,9,11,8,9,-1,-1,-1,-1,-1,-1,3,6,11,0,6,3,0,5,6,0,9,5,-1,-1,-1,0,11,8,0,5,11,0,1,5,5,6,11,-1,-1,-1,6,11,3,6,3,5,5,3,1,-1,-1,-1,-1,-1,-1,1,2,10,9,5,11,9,11,8,11,5,6,-1,-1,-1,0,11,3,0,6,11,0,9,6,5,6,9,1,2,10,11,8,5,11,5,6,8,0,5,10,5,2,0,2,5,6,11,3,6,3,5,2,10,3,10,5,3,-1,-1,-1,5,8,9,5,2,8,5,6,2,3,8,2,-1,-1,-1,9,5,6,9,6,0,0,6,2,-1,-1,-1,-1,-1,-1,1,5,8,1,8,0,5,6,8,3,8,2,6,2,8,1,5,6,2,1,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,3,6,1,6,10,3,8,6,5,6,9,8,9,6,10,1,0,10,0,6,9,5,0,5,6,0,-1,-1,-1,0,3,8,5,6,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,10,5,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,5,10,7,5,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,5,10,11,7,5,8,3,0,-1,-1,-1,-1,-1,-1,5,11,7,5,10,11,1,9,0,-1,-1,-1,-1,-1,-1,10,7,5,10,11,7,9,8,1,8,3,1,-1,-1,-1,11,1,2,11,7,1,7,5,1,-1,-1,-1,-1,-1,-1,0,8,3,1,2,7,1,7,5,7,2,11,-1,-1,-1,9,7,5,9,2,7,9,0,2,2,11,7,-1,-1,-1,7,5,2,7,2,11,5,9,2,3,2,8,9,8,2,2,5,10,2,3,5,3,7,5,-1,-1,-1,-1,-1,-1,8,2,0,8,5,2,8,7,5,10,2,5,-1,-1,-1,9,0,1,5,10,3,5,3,7,3,10,2,-1,-1,-1,9,8,2,9,2,1,8,7,2,10,2,5,7,5,2,1,3,5,3,7,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,7,0,7,1,1,7,5,-1,-1,-1,-1,-1,-1,9,0,3,9,3,5,5,3,7,-1,-1,-1,-1,-1,-1,9,8,7,5,9,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,5,8,4,5,10,8,10,11,8,-1,-1,-1,-1,-1,-1,5,0,4,5,11,0,5,10,11,11,3,0,-1,-1,-1,0,1,9,8,4,10,8,10,11,10,4,5,-1,-1,-1,10,11,4,10,4,5,11,3,4,9,4,1,3,1,4,2,5,1,2,8,5,2,11,8,4,5,8,-1,-1,-1,0,4,11,0,11,3,4,5,11,2,11,1,5,1,11,0,2,5,0,5,9,2,11,5,4,5,8,11,8,5,9,4,5,2,11,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,5,10,3,5,2,3,4,5,3,8,4,-1,-1,-1,5,10,2,5,2,4,4,2,0,-1,-1,-1,-1,-1,-1,3,10,2,3,5,10,3,8,5,4,5,8,0,1,9,5,10,2,5,2,4,1,9,2,9,4,2,-1,-1,-1,8,4,5,8,5,3,3,5,1,-1,-1,-1,-1,-1,-1,0,4,5,1,0,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,4,5,8,5,3,9,0,5,0,3,5,-1,-1,-1,9,4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,11,7,4,9,11,9,10,11,-1,-1,-1,-1,-1,-1,0,8,3,4,9,7,9,11,7,9,10,11,-1,-1,-1,1,10,11,1,11,4,1,4,0,7,4,11,-1,-1,-1,3,1,4,3,4,8,1,10,4,7,4,11,10,11,4,4,11,7,9,11,4,9,2,11,9,1,2,-1,-1,-1,9,7,4,9,11,7,9,1,11,2,11,1,0,8,3,11,7,4,11,4,2,2,4,0,-1,-1,-1,-1,-1,-1,11,7,4,11,4,2,8,3,4,3,2,4,-1,-1,-1,2,9,10,2,7,9,2,3,7,7,4,9,-1,-1,-1,9,10,7,9,7,4,10,2,7,8,7,0,2,0,7,3,7,10,3,10,2,7,4,10,1,10,0,4,0,10,1,10,2,8,7,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,9,1,4,1,7,7,1,3,-1,-1,-1,-1,-1,-1,4,9,1,4,1,7,0,8,1,8,7,1,-1,-1,-1,4,0,3,7,4,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,8,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,10,8,10,11,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,9,3,9,11,11,9,10,-1,-1,-1,-1,-1,-1,0,1,10,0,10,8,8,10,11,-1,-1,-1,-1,-1,-1,3,1,10,11,3,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,2,11,1,11,9,9,11,8,-1,-1,-1,-1,-1,-1,3,0,9,3,9,11,1,2,9,2,11,9,-1,-1,-1,0,2,11,8,0,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,2,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,8,2,8,10,10,8,9,-1,-1,-1,-1,-1,-1,9,10,2,0,9,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,8,2,8,10,0,1,8,1,10,8,-1,-1,-1,1,10,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,3,8,9,1,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,9,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,3,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],Tn=[[],[0,8,3],[0,1,9],[1,8,3,9,8,1],[1,2,10],[0,8,3,1,2,10],[9,2,10,0,2,9],[2,8,3,2,10,8,10,9,8],[3,11,2],[0,11,2,8,11,0],[1,9,0,2,3,11],[1,11,2,1,9,11,9,8,11],[3,10,1,11,10,3],[0,10,1,0,8,10,8,11,10],[3,9,0,3,11,9,11,10,9],[9,8,10,10,8,11],[4,7,8],[4,3,0,7,3,4],[0,1,9,8,4,7],[4,1,9,4,7,1,7,3,1],[1,2,10,8,4,7],[3,4,7,3,0,4,1,2,10],[9,2,10,9,0,2,8,4,7],[2,10,9,2,9,7,2,7,3,7,9,4],[8,4,7,3,11,2],[11,4,7,11,2,4,2,0,4],[9,0,1,8,4,7,2,3,11],[4,7,11,9,4,11,9,11,2,9,2,1],[3,10,1,3,11,10,7,8,4],[1,11,10,1,4,11,1,0,4,7,11,4],[4,7,8,9,0,11,9,11,10,11,0,3],[4,7,11,4,11,9,9,11,10],[9,5,4],[9,5,4,0,8,3],[0,5,4,1,5,0],[8,5,4,8,3,5,3,1,5],[1,2,10,9,5,4],[3,0,8,1,2,10,4,9,5],[5,2,10,5,4,2,4,0,2],[2,10,5,3,2,5,3,5,4,3,4,8],[9,5,4,2,3,11],[0,11,2,0,8,11,4,9,5],[0,5,4,0,1,5,2,3,11],[2,1,5,2,5,8,2,8,11,4,8,5],[10,3,11,10,1,3,9,5,4],[4,9,5,0,8,1,8,10,1,8,11,10],[5,4,0,5,0,11,5,11,10,11,0,3],[5,4,8,5,8,10,10,8,11],[9,7,8,5,7,9],[9,3,0,9,5,3,5,7,3],[0,7,8,0,1,7,1,5,7],[1,5,3,3,5,7],[9,7,8,9,5,7,10,1,2],[10,1,2,9,5,0,5,3,0,5,7,3],[8,0,2,8,2,5,8,5,7,10,5,2],[2,10,5,2,5,3,3,5,7],[7,9,5,7,8,9,3,11,2],[9,5,7,9,7,2,9,2,0,2,7,11],[2,3,11,0,1,8,1,7,8,1,5,7],[11,2,1,11,1,7,7,1,5],[9,5,8,8,5,7,10,1,3,10,3,11],[5,7,0,5,0,9,7,11,0,1,0,10,11,10,0],[11,10,0,11,0,3,10,5,0,8,0,7,5,7,0],[11,10,5,7,11,5],[10,6,5],[0,8,3,5,10,6],[9,0,1,5,10,6],[1,8,3,1,9,8,5,10,6],[1,6,5,2,6,1],[1,6,5,1,2,6,3,0,8],[9,6,5,9,0,6,0,2,6],[5,9,8,5,8,2,5,2,6,3,2,8],[2,3,11,10,6,5],[11,0,8,11,2,0,10,6,5],[0,1,9,2,3,11,5,10,6],[5,10,6,1,9,2,9,11,2,9,8,11],[6,3,11,6,5,3,5,1,3],[0,8,11,0,11,5,0,5,1,5,11,6],[3,11,6,0,3,6,0,6,5,0,5,9],[6,5,9,6,9,11,11,9,8],[5,10,6,4,7,8],[4,3,0,4,7,3,6,5,10],[1,9,0,5,10,6,8,4,7],[10,6,5,1,9,7,1,7,3,7,9,4],[6,1,2,6,5,1,4,7,8],[1,2,5,5,2,6,3,0,4,3,4,7],[8,4,7,9,0,5,0,6,5,0,2,6],[7,3,9,7,9,4,3,2,9,5,9,6,2,6,9],[3,11,2,7,8,4,10,6,5],[5,10,6,4,7,2,4,2,0,2,7,11],[0,1,9,4,7,8,2,3,11,5,10,6],[9,2,1,9,11,2,9,4,11,7,11,4,5,10,6],[8,4,7,3,11,5,3,5,1,5,11,6],[5,1,11,5,11,6,1,0,11,7,11,4,0,4,11],[0,5,9,0,6,5,0,3,6,11,6,3,8,4,7],[6,5,9,6,9,11,4,7,9,7,11,9],[10,4,9,6,4,10],[4,10,6,4,9,10,0,8,3],[10,0,1,10,6,0,6,4,0],[8,3,1,8,1,6,8,6,4,6,1,10],[1,4,9,1,2,4,2,6,4],[3,0,8,1,2,9,2,4,9,2,6,4],[0,2,4,4,2,6],[8,3,2,8,2,4,4,2,6],[10,4,9,10,6,4,11,2,3],[0,8,2,2,8,11,4,9,10,4,10,6],[3,11,2,0,1,6,0,6,4,6,1,10],[6,4,1,6,1,10,4,8,1,2,1,11,8,11,1],[9,6,4,9,3,6,9,1,3,11,6,3],[8,11,1,8,1,0,11,6,1,9,1,4,6,4,1],[3,11,6,3,6,0,0,6,4],[6,4,8,11,6,8],[7,10,6,7,8,10,8,9,10],[0,7,3,0,10,7,0,9,10,6,7,10],[10,6,7,1,10,7,1,7,8,1,8,0],[10,6,7,10,7,1,1,7,3],[1,2,6,1,6,8,1,8,9,8,6,7],[2,6,9,2,9,1,6,7,9,0,9,3,7,3,9],[7,8,0,7,0,6,6,0,2],[7,3,2,6,7,2],[2,3,11,10,6,8,10,8,9,8,6,7],[2,0,7,2,7,11,0,9,7,6,7,10,9,10,7],[1,8,0,1,7,8,1,10,7,6,7,10,2,3,11],[11,2,1,11,1,7,10,6,1,6,7,1],[8,9,6,8,6,7,9,1,6,11,6,3,1,3,6],[0,9,1,11,6,7],[7,8,0,7,0,6,3,11,0,11,6,0],[7,11,6],[7,6,11],[3,0,8,11,7,6],[0,1,9,11,7,6],[8,1,9,8,3,1,11,7,6],[10,1,2,6,11,7],[1,2,10,3,0,8,6,11,7],[2,9,0,2,10,9,6,11,7],[6,11,7,2,10,3,10,8,3,10,9,8],[7,2,3,6,2,7],[7,0,8,7,6,0,6,2,0],[2,7,6,2,3,7,0,1,9],[1,6,2,1,8,6,1,9,8,8,7,6],[10,7,6,10,1,7,1,3,7],[10,7,6,1,7,10,1,8,7,1,0,8],[0,3,7,0,7,10,0,10,9,6,10,7],[7,6,10,7,10,8,8,10,9],[6,8,4,11,8,6],[3,6,11,3,0,6,0,4,6],[8,6,11,8,4,6,9,0,1],[9,4,6,9,6,3,9,3,1,11,3,6],[6,8,4,6,11,8,2,10,1],[1,2,10,3,0,11,0,6,11,0,4,6],[4,11,8,4,6,11,0,2,9,2,10,9],[10,9,3,10,3,2,9,4,3,11,3,6,4,6,3],[8,2,3,8,4,2,4,6,2],[0,4,2,4,6,2],[1,9,0,2,3,4,2,4,6,4,3,8],[1,9,4,1,4,2,2,4,6],[8,1,3,8,6,1,8,4,6,6,10,1],[10,1,0,10,0,6,6,0,4],[4,6,3,4,3,8,6,10,3,0,3,9,10,9,3],[10,9,4,6,10,4],[4,9,5,7,6,11],[0,8,3,4,9,5,11,7,6],[5,0,1,5,4,0,7,6,11],[11,7,6,8,3,4,3,5,4,3,1,5],[9,5,4,10,1,2,7,6,11],[6,11,7,1,2,10,0,8,3,4,9,5],[7,6,11,5,4,10,4,2,10,4,0,2],[3,4,8,3,5,4,3,2,5,10,5,2,11,7,6],[7,2,3,7,6,2,5,4,9],[9,5,4,0,8,6,0,6,2,6,8,7],[3,6,2,3,7,6,1,5,0,5,4,0],[6,2,8,6,8,7,2,1,8,4,8,5,1,5,8],[9,5,4,10,1,6,1,7,6,1,3,7],[1,6,10,1,7,6,1,0,7,8,7,0,9,5,4],[4,0,10,4,10,5,0,3,10,6,10,7,3,7,10],[7,6,10,7,10,8,5,4,10,4,8,10],[6,9,5,6,11,9,11,8,9],[3,6,11,0,6,3,0,5,6,0,9,5],[0,11,8,0,5,11,0,1,5,5,6,11],[6,11,3,6,3,5,5,3,1],[1,2,10,9,5,11,9,11,8,11,5,6],[0,11,3,0,6,11,0,9,6,5,6,9,1,2,10],[11,8,5,11,5,6,8,0,5,10,5,2,0,2,5],[6,11,3,6,3,5,2,10,3,10,5,3],[5,8,9,5,2,8,5,6,2,3,8,2],[9,5,6,9,6,0,0,6,2],[1,5,8,1,8,0,5,6,8,3,8,2,6,2,8],[1,5,6,2,1,6],[1,3,6,1,6,10,3,8,6,5,6,9,8,9,6],[10,1,0,10,0,6,9,5,0,5,6,0],[0,3,8,5,6,10],[10,5,6],[11,5,10,7,5,11],[11,5,10,11,7,5,8,3,0],[5,11,7,5,10,11,1,9,0],[10,7,5,10,11,7,9,8,1,8,3,1],[11,1,2,11,7,1,7,5,1],[0,8,3,1,2,7,1,7,5,7,2,11],[9,7,5,9,2,7,9,0,2,2,11,7],[7,5,2,7,2,11,5,9,2,3,2,8,9,8,2],[2,5,10,2,3,5,3,7,5],[8,2,0,8,5,2,8,7,5,10,2,5],[9,0,1,5,10,3,5,3,7,3,10,2],[9,8,2,9,2,1,8,7,2,10,2,5,7,5,2],[1,3,5,3,7,5],[0,8,7,0,7,1,1,7,5],[9,0,3,9,3,5,5,3,7],[9,8,7,5,9,7],[5,8,4,5,10,8,10,11,8],[5,0,4,5,11,0,5,10,11,11,3,0],[0,1,9,8,4,10,8,10,11,10,4,5],[10,11,4,10,4,5,11,3,4,9,4,1,3,1,4],[2,5,1,2,8,5,2,11,8,4,5,8],[0,4,11,0,11,3,4,5,11,2,11,1,5,1,11],[0,2,5,0,5,9,2,11,5,4,5,8,11,8,5],[9,4,5,2,11,3],[2,5,10,3,5,2,3,4,5,3,8,4],[5,10,2,5,2,4,4,2,0],[3,10,2,3,5,10,3,8,5,4,5,8,0,1,9],[5,10,2,5,2,4,1,9,2,9,4,2],[8,4,5,8,5,3,3,5,1],[0,4,5,1,0,5],[8,4,5,8,5,3,9,0,5,0,3,5],[9,4,5],[4,11,7,4,9,11,9,10,11],[0,8,3,4,9,7,9,11,7,9,10,11],[1,10,11,1,11,4,1,4,0,7,4,11],[3,1,4,3,4,8,1,10,4,7,4,11,10,11,4],[4,11,7,9,11,4,9,2,11,9,1,2],[9,7,4,9,11,7,9,1,11,2,11,1,0,8,3],[11,7,4,11,4,2,2,4,0],[11,7,4,11,4,2,8,3,4,3,2,4],[2,9,10,2,7,9,2,3,7,7,4,9],[9,10,7,9,7,4,10,2,7,8,7,0,2,0,7],[3,7,10,3,10,2,7,4,10,1,10,0,4,0,10],[1,10,2,8,7,4],[4,9,1,4,1,7,7,1,3],[4,9,1,4,1,7,0,8,1,8,7,1],[4,0,3,7,4,3],[4,8,7],[9,10,8,10,11,8],[3,0,9,3,9,11,11,9,10],[0,1,10,0,10,8,8,10,11],[3,1,10,11,3,10],[1,2,11,1,11,9,9,11,8],[3,0,9,3,9,11,1,2,9,2,11,9],[0,2,11,8,0,11],[3,2,11],[2,3,8,2,8,10,10,8,9],[9,10,2,0,9,2],[2,3,8,2,8,10,0,1,8,1,10,8],[1,10,2],[1,3,8,9,1,8],[0,9,1],[0,3,8],[]],ai=`struct Uniforms {
    texture3DSize: f32,
    texture2DSize: f32,
    mipmapLevels: f32,
    range: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureRead: texture_3d<f32>;
@group(0) @binding(2) var<storage, read> amountOfTriangles: array<f32>;
@group(0) @binding(3) var texture_vct: texture_storage_3d<rgba32float, write>;

@group(0) @binding(4) var<storage, read_write> voxelsEnabled:array <vec4f>;
@group(0) @binding(5) var<storage, read_write> voxelsIndex: array<atomic<i32>>;


const HIGH_TO_LOW = 4;

@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) ud: vec3<u32>) {

    var tSize = vec3f(textureDimensions(textureRead));
    var id = ud + vec3u( u32(tSize.x * 0.3), 0, 0);

    var range = uniforms.range;
    var center = textureLoad(textureRead, id + vec3u(0, 0, 0), 0).r;
    var c = step(center, range);
    var vct = c;
    c += 2. * step(textureLoad(textureRead, id + vec3u(1, 0, 0), 0).r, range);
    c += 4. * step(textureLoad(textureRead, id + vec3u(1, 1, 0), 0).r, range);
    c += 8. * step(textureLoad(textureRead, id + vec3u(0, 1, 0), 0).r, range);
    c += 16. * step(textureLoad(textureRead, id + vec3u(0, 0, 1), 0).r, range);
    c += 32. * step(textureLoad(textureRead, id + vec3u(1, 0, 1), 0).r, range);
    c += 64. * step(textureLoad(textureRead, id + vec3u(1, 1, 1), 0).r, range);
    c += 128. * step(textureLoad(textureRead, id + vec3u(0, 1, 1), 0).r, range);
    c *= step(c, 254.);
    var totalTriangles = amountOfTriangles[i32(c)];
    var value = f32(totalTriangles > 0.);

    //For the voxel cone tracing
    textureStore(texture_vct, id, vec4f(vec3(0., 0., 0.), value));

    if(id.y < 3) {
        textureStore(texture_vct, id, vec4f(vec3f(.0), .5));
    }

    //To group the voxels together
    if(value > 0.) {
        var index = atomicAdd(&voxelsIndex[0], 1);
        voxelsEnabled[index] = vec4f(vec3f(id), c);
    }
}`,si=`@group(0) @binding(0) var<storage, read> voxelsBufferInput: array<i32>;
@group(0) @binding(1) var<storage, read_write> voxelsBuffer: array<i32>;

@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {

    let totalVoxels = f32(voxelsBufferInput[0]);
    voxelsBuffer[0] = i32(ceil( totalVoxels / 15. ));
    voxelsBuffer[1] = 1;
    voxelsBuffer[2] = 1;

    voxelsBuffer[3] = i32(15. * totalVoxels);
    voxelsBuffer[4] = 1;
    voxelsBuffer[5] = 0;
    voxelsBuffer[6] = 0;
}`,ui=`struct Uniforms {
    texture3DSize: f32,
    texture2DSize: f32,
    mipmapLevels: f32,
    range: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> voxelsBuffer: array<vec4f>;
@group(0) @binding(2) var<storage, read> indicesBuffer:array<f32>;
@group(0) @binding(3) var potentialTexture: texture_3d<f32>;
@group(0) @binding(4) var<storage, read_write> positionBuffer: array<vec4f>;
@group(0) @binding(5) var<storage, read_write> normalBuffer: array<vec4f>;
@group(0) @binding(6) var<storage, read_write> velocityBuffer: array<vec4f>;


@compute @workgroup_size(225, 1, 1) fn main( @builtin(local_invocation_id) l_id: vec3<u32>,
                                      @builtin(workgroup_id) workgroup_id: vec3<u32>,
                                      @builtin(local_invocation_index) local_invocation_index: u32,
                                      @builtin(num_workgroups) num_workgroups: vec3<u32>
                                      ) {

    let workgroup_index = workgroup_id.x + workgroup_id.y * num_workgroups.x + workgroup_id.z * num_workgroups.x * num_workgroups.y;
    let global_invocation_index = workgroup_index * 225 + local_invocation_index;

    var p0 = vec3i(1, 0, 0);
    var p1 = vec3i(1, 1, 0);
    var p2 = vec3i(0, 1, 0);
    var p3 = vec3i(0, 0, 1);
    var p4 = vec3i(1, 0, 1);
    var p5 = vec3i(1, 1, 1);
    var p6 = vec3i(0, 1, 1);

    var currentVoxel = floor(f32(global_invocation_index) / 15.);
    var currentIndex = global_invocation_index % 15;

    var voxelData = voxelsBuffer[i32(currentVoxel)];
    var position3D = voxelData.xyz;

    //Marching cubes case * 15 indices + local index
    var currentVertex = indicesBuffer[i32(voxelData.w) * 15 + i32(currentIndex)];

    if(currentVertex == -1.) {
        positionBuffer[global_invocation_index] = vec4f(0, 0, 0, 0);
        return;
    }
    
    var m0 = vec4f(currentVertex, currentVertex, currentVertex, currentVertex);
    var m1 = vec4i(m0 == vec4f(0, 1, 2, 3));
    var m2 = vec4i(m0 == vec4f(4, 5, 6, 7));
    var m3 = vec4i(m0 == vec4f(8, 9, 10, 11));

    //Get the corners for the edge where the vertex is allocated
    var corner0 = vec3i(position3D) + m1.y * p0 + m1.z * p1 + m1.w * p2 + m2.x * p3 + m2.y * p4 + m2.z * p5 + m2.w * p6 + m3.y * p0 + m3.z * p1 + m3.w * p2;
    var corner1 = vec3i(position3D) + m1.x * p0 + m1.y * p1 + m1.z * p2 + m2.x * p4 + m2.y * p5 + m2.z * p6 + m2.w * p3 + m3.x * p3 + m3.y * p4 + m3.z * p5 + m3.w * p6;

    var b0 = vec3f(corner0);
    var b1 = vec3f(corner1);    

    //Potential values in the corresponding corners
    var n0 = textureLoad(potentialTexture, corner0, 0).r;
    var n1 = textureLoad(potentialTexture, corner1, 0).r;

    //Define the position of the corresponding vertex
    var diff = vec2f(uniforms.range - n0, n1 - n0);
    var vertexPosition = b0 + diff.x * (b1 - b0) / diff.y;

    //Define the normal
    var plusX = corner0 + vec3i(1, 0, 0);
    var plusY = corner0 + vec3i(0, 1, 0);
    var plusZ = corner0 + vec3i(0, 0, 1);

    var minusX = corner0 - vec3i(1, 0, 0);
    var minusY = corner0 - vec3i(0, 1, 0);
    var minusZ = corner0 - vec3i(0, 0, 1);

    var normal0 = vec3f(textureLoad(potentialTexture, plusX, 0).r - textureLoad(potentialTexture, minusX, 0).r,
                        textureLoad(potentialTexture, plusY, 0).r - textureLoad(potentialTexture, minusY, 0).r, 
                        textureLoad(potentialTexture, plusZ, 0).r - textureLoad(potentialTexture, minusZ, 0).r);

    normal0 = normalize(normal0);

    plusX = corner1 + vec3i(1, 0, 0);
    plusY = corner1 + vec3i(0, 1, 0);
    plusZ = corner1 + vec3i(0, 0, 1);

    minusX = corner1 - vec3i(1, 0, 0);
    minusY = corner1 - vec3i(0, 1, 0);
    minusZ = corner1 - vec3i(0, 0, 1);

    var normal1 = vec3f(textureLoad(potentialTexture, plusX, 0).r - textureLoad(potentialTexture, minusX, 0).r,
                        textureLoad(potentialTexture, plusY, 0).r - textureLoad(potentialTexture, minusY, 0).r, 
                        textureLoad(potentialTexture, plusZ, 0).r - textureLoad(potentialTexture, minusZ, 0).r);    
    
    normal1 = normalize(normal1);

    var normal = normal0 + diff.x * (normal1 - normal0) / diff.y;

    //velocities values in the corresponding corners
    var vel0 = textureLoad(potentialTexture, corner0, 0).gba;
    var vel1 = textureLoad(potentialTexture, corner1, 0).gba;
    var velocity = vel0 + diff.x * (vel1 - vel0) / diff.y;

    positionBuffer[global_invocation_index] = vec4f( vertexPosition / uniforms.texture3DSize, 1.);
    normalBuffer[global_invocation_index] = vec4f(-normal, 1.);
    velocityBuffer[global_invocation_index] = vec4f(velocity, 1.);

}`;let Kt,rr,Jt,ir,Zt,or,ct,xe,Ut,Ot,Dt,Pn=Promise.create(),Cn=Promise.create(),En=Promise.create(),me,An,Je,Ze,Rt,ht,Qe,et,tt,We,D;async function li(n,e,t){D=R,me=e,An=t,Math.pow(me.width,3),Je=D.createBuffer({label:"vertices buffer",size:4*n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),Ze=D.createBuffer({label:"normals buffer",size:4*n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),Rt=D.createBuffer({label:"velocity buffer",size:4*n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),ht=D.createBuffer({label:"check buffer",size:4*7,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC|GPUBufferUsage.INDIRECT}),Qe=D.createBuffer({label:"test buffer",size:4*n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),et=D.createBuffer({label:"test 2 buffer",size:4*7,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC|GPUBufferUsage.INDIRECT}),xe=[];for(let r=0;r<Tn.length;r++){let o=Tn[r].length/3;xe.push(o)}xe=new Float32Array(xe),Ut=D.createBuffer({label:"uniforms buffer",size:xe.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),D.queue.writeBuffer(Ut,0,xe),Ot=new Float32Array(oi),Dt=D.createBuffer({label:"indices buffer",size:Ot.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),D.queue.writeBuffer(Dt,0,Ot),ct=Math.ceil(Math.sqrt(Math.pow(me.width,3)));let i=Math.ceil(Math.log2(ct));return ct=Math.pow(2,i),i+=1,Ee(ai).then(r=>{Kt=r.pipeline,Pn.resolve()}),Ee(si).then(r=>{Jt=r.pipeline,Cn.resolve()}),Ee(ui).then(r=>{Zt=r.pipeline,En.resolve()}),await Pn,await Cn,await En,tt=new Float32Array([me.width,ct,i,.5]),We=D.createBuffer({label:"uniforms buffer",size:tt.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),D.queue.writeBuffer(We,0,tt),rr=D.createBindGroup({label:"bind group for march case",layout:Kt.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:We}},{binding:1,resource:me.createView({baseMipLevel:0,mipLevelCount:1})},{binding:2,resource:{buffer:Ut}},{binding:3,resource:An.createView({baseMipLevel:0,mipLevelCount:1})},{binding:4,resource:{buffer:Qe}},{binding:5,resource:{buffer:et}}]}),ir=D.createBindGroup({label:"bind group for check case",layout:Jt.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:et}},{binding:1,resource:{buffer:ht}}]}),or=D.createBindGroup({label:"bind group for pyramid parsing",layout:Zt.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:We}},{binding:1,resource:{buffer:Qe}},{binding:2,resource:{buffer:Dt}},{binding:3,resource:me.createView({baseMipLevel:0,mipLevelCount:1})},{binding:4,resource:{buffer:Je}},{binding:5,resource:{buffer:Ze}},{binding:6,resource:{buffer:Rt}}]}),[Je,Ze,Rt,ht]}function ci(n){tt[3]=n,D.queue.writeBuffer(We,0,tt);const e=D.createCommandEncoder({label:"encoder"});e.clearBuffer(Je,0,Je.size),e.clearBuffer(Ze,0,Ze.size),e.clearBuffer(Qe,0,Qe.size),e.clearBuffer(et,0,et.size);let t=me.width;const i=e.beginComputePass({label:"march case pass"});i.setPipeline(Kt),i.setBindGroup(0,rr),i.dispatchWorkgroups(t*.2,t,t),i.end();const r=e.beginComputePass({label:"check pass"});r.setPipeline(Jt),r.setBindGroup(0,ir),r.dispatchWorkgroups(1),r.end();const o=e.beginComputePass({label:"parse pass"});o.setPipeline(Zt),o.setBindGroup(0,or),o.dispatchWorkgroupsIndirect(ht,0*4),o.end();const a=e.finish();D.queue.submit([a])}const fi=`
struct Uniforms {
    defaultColor: vec3f,
    defaultOpacity: f32,
    luminosityThreshold: f32,
    smoothWidth: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var tDiffuse: texture_2d<f32>;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var outputTexture: texture_storage_2d<rgba8unorm, write>;

fn luma(color: vec3f) -> f32 {
    return dot(color, vec3f(0.299, 0.587, 0.114));
}

@compute @workgroup_size(1, 1) fn main(@builtin(global_invocation_id) id: vec3u) {

    var textDim = textureDimensions(tDiffuse).xy;
    var st = vec2f(id.xy) / vec2f(textDim);
    var texel = textureSampleLevel(tDiffuse, textureSampler, st, 0);
    var v = luma(texel.xyz);
    var outputColor = vec4f(uniforms.defaultColor, uniforms.defaultOpacity);
    var alpha = smoothstep(uniforms.luminosityThreshold, uniforms.luminosityThreshold + uniforms.smoothWidth, v);
    
    textureStore(outputTexture, id.xy, mix(outputColor, texel, vec4f(alpha)));
    
}



`,di=`
struct Uniforms {
    textSize: vec2f,
    direction: vec2f,
    sigma: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var colorTexture: texture_2d<f32>;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var outputTexture: texture_storage_2d<rgba8unorm, write>;


fn gaussianPdf(x: f32, sigma: f32) -> f32{
    return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

@compute @workgroup_size(1, 1) fn main(@builtin(global_invocation_id) id: vec3u) {

    var st = vec2f(id.xy) / uniforms.textSize;

    var invSize = 1.0 / uniforms.textSize;
    var fSigma = uniforms.sigma;
    var weightSum = gaussianPdf(0.0, fSigma);
    var  diffuseSum = textureSampleLevel( colorTexture, textureSampler, st, 0).rgb * weightSum;
    
    for(var i = 1; i < i32(uniforms.sigma); i ++) {
        var x = f32(i);
        var w = gaussianPdf(x, fSigma);
        var uvOffset = uniforms.direction * invSize * x;
        var sample1 = textureSampleLevel( colorTexture, textureSampler, st + uvOffset, 0).rgb;
        var sample2 = textureSampleLevel( colorTexture, textureSampler, st - uvOffset, 0).rgb;
        diffuseSum += (sample1 + sample2) * w;
        weightSum += 2.0 * w;
    }

    textureStore(outputTexture, id.xy, vec4f(diffuseSum / weightSum, 1.0) );
    
}
`,pi=`struct Uniforms {
    bloomTintColor: vec3f,
    bloomStrength: f32,
    bloomRadius: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureSampler: sampler;

//Depends on the NMips...
@group(0) @binding(2) var blurTexture1: texture_2d<f32>;
@group(0) @binding(3) var blurTexture2: texture_2d<f32>;
@group(0) @binding(4) var blurTexture3: texture_2d<f32>;

@group(0) @binding(5) var inputTexture: texture_2d<f32>;
@group(0) @binding(6) var outputTexture: texture_storage_2d<rgba8unorm, write>;


fn lerpBloomFactor(factor: f32) -> f32 {
    var mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, uniforms.bloomRadius);
}

@compute @workgroup_size(1, 1) fn main(@builtin(global_invocation_id) id: vec3u) {

    var textDim = textureDimensions(outputTexture).xy;
    var uv = vec2f(id.xy) / vec2f(textDim);
    var color = vec4f(0.); 

    color += vec4f(uniforms.bloomTintColor, 1.) * lerpBloomFactor(1.0) * uniforms.bloomStrength * textureSampleLevel(blurTexture1, textureSampler, uv, 0);
    color += vec4f(uniforms.bloomTintColor, 1.) * lerpBloomFactor(0.8) * uniforms.bloomStrength * textureSampleLevel(blurTexture2, textureSampler, uv, 0);
    color += vec4f(uniforms.bloomTintColor, 1.) * lerpBloomFactor(0.6) * uniforms.bloomStrength * textureSampleLevel(blurTexture3, textureSampler, uv, 0);
    color = max(color, vec4f(0.));
    color += textureSampleLevel(inputTexture, textureSampler, uv, 0);

    textureStore(outputTexture, id.xy, color );
    
}



`;var ie=[],ft=[],Gt=3,Un=[3,5,7,9,11],Ne,M,ar,Qt,sr,ur,lr,kt,On,Dn=!1,ce=null;async function mi(){kt=new Float32Array(8),ur=M.createBuffer({label:"luminosity buffer",size:kt.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),ar=await ne("luminosity",fi),Qt=await ne("gaussian blur",di),lr=M.createBuffer({label:"blur buffer",size:kt.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),sr=await ne("gaussian blur",pi)}async function vi(n,e,t,i,r){if(M=R,Ne={x:n,y:e},!Dn){if(await mi(),ce==null){ce=[];for(let u=0;u<Gt;u++){let f=M.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),m=M.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});ce.push([f,m])}}Dn=!0}ie[0]!=null&&(ie.map(u=>u.destroy()),ft.map(u=>u.destroy()));let o=Math.round(Ne.x/2),a=Math.round(Ne.y/2);for(let u=0;u<Gt;u++){let f=M.createTexture({label:`mip horizontal ${u}`,size:[o,a],format:"rgba8unorm",dimension:"2d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING});ie[u]=f;let m=M.createTexture({label:`mip vertical ${u}`,size:[o,a],format:"rgba8unorm",dimension:"2d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING});ft[u]=m,o=Math.round(o/2),a=Math.round(a/2)}M.createBindGroup({label:"luminosity bind group",layout:ar.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:ur}},{binding:1,resource:t.createView()},{binding:2,resource:r},{binding:3,resource:i.createView()}]}),o=Math.round(Ne.x/2),a=Math.round(Ne.y/2),On=[];var s=i;for(let u=0;u<Gt;u++){let f=new Float32Array([o,a,1,0,Un[u],0,0,0]);M.queue.writeBuffer(ce[u][0],0,f),f=new Float32Array([o,a,0,1,Un[u],0,0,0]),M.queue.writeBuffer(ce[u][1],0,f);let m=M.createBindGroup({layout:Qt.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:ce[u][0]}},{binding:1,resource:s.createView()},{binding:2,resource:r},{binding:3,resource:ft[u].createView()}]}),d=M.createBindGroup({layout:Qt.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:ce[u][1]}},{binding:1,resource:ft[u].createView()},{binding:2,resource:r},{binding:3,resource:ie[u].createView()}]});s=ie[u],On.push([m,d]),o=Math.round(o/2),a=Math.round(a/2)}M.createBindGroup({label:"bind group for composite",layout:sr.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:lr}},{binding:1,resource:r},{binding:2,resource:ie[0].createView()},{binding:3,resource:ie[1].createView()},{binding:4,resource:ie[2].createView()},{binding:5,resource:t.createView()},{binding:6,resource:i.createView()}]})}function gi(n){if(!(typeof window>"u")){var e=document.createElement("style");return e.setAttribute("type","text/css"),e.innerHTML=n,document.head.appendChild(e),n}}function Pe(n,e){var t=n.__state.conversionName.toString(),i=Math.round(n.r),r=Math.round(n.g),o=Math.round(n.b),a=n.a,s=Math.round(n.h),u=n.s.toFixed(1),f=n.v.toFixed(1);if(e||t==="THREE_CHAR_HEX"||t==="SIX_CHAR_HEX"){for(var m=n.hex.toString(16);m.length<6;)m="0"+m;return"#"+m}else{if(t==="CSS_RGB")return"rgb("+i+","+r+","+o+")";if(t==="CSS_RGBA")return"rgba("+i+","+r+","+o+","+a+")";if(t==="HEX")return"0x"+n.hex.toString(16);if(t==="RGB_ARRAY")return"["+i+","+r+","+o+"]";if(t==="RGBA_ARRAY")return"["+i+","+r+","+o+","+a+"]";if(t==="RGB_OBJ")return"{r:"+i+",g:"+r+",b:"+o+"}";if(t==="RGBA_OBJ")return"{r:"+i+",g:"+r+",b:"+o+",a:"+a+"}";if(t==="HSV_OBJ")return"{h:"+s+",s:"+u+",v:"+f+"}";if(t==="HSVA_OBJ")return"{h:"+s+",s:"+u+",v:"+f+",a:"+a+"}"}return"unknown format"}var Rn=Array.prototype.forEach,Fe=Array.prototype.slice,c={BREAK:{},extend:function(e){return this.each(Fe.call(arguments,1),function(t){var i=this.isObject(t)?Object.keys(t):[];i.forEach((function(r){this.isUndefined(t[r])||(e[r]=t[r])}).bind(this))},this),e},defaults:function(e){return this.each(Fe.call(arguments,1),function(t){var i=this.isObject(t)?Object.keys(t):[];i.forEach((function(r){this.isUndefined(e[r])&&(e[r]=t[r])}).bind(this))},this),e},compose:function(){var e=Fe.call(arguments);return function(){for(var t=Fe.call(arguments),i=e.length-1;i>=0;i--)t=[e[i].apply(this,t)];return t[0]}},each:function(e,t,i){if(e){if(Rn&&e.forEach&&e.forEach===Rn)e.forEach(t,i);else if(e.length===e.length+0){var r=void 0,o=void 0;for(r=0,o=e.length;r<o;r++)if(r in e&&t.call(i,e[r],r)===this.BREAK)return}else for(var a in e)if(t.call(i,e[a],a)===this.BREAK)return}},defer:function(e){setTimeout(e,0)},debounce:function(e,t,i){var r=void 0;return function(){var o=this,a=arguments;function s(){r=null,i||e.apply(o,a)}var u=i||!r;clearTimeout(r),r=setTimeout(s,t),u&&e.apply(o,a)}},toArray:function(e){return e.toArray?e.toArray():Fe.call(e)},isUndefined:function(e){return e===void 0},isNull:function(e){return e===null},isNaN:function(n){function e(t){return n.apply(this,arguments)}return e.toString=function(){return n.toString()},e}(function(n){return isNaN(n)}),isArray:Array.isArray||function(n){return n.constructor===Array},isObject:function(e){return e===Object(e)},isNumber:function(e){return e===e+0},isString:function(e){return e===e+""},isBoolean:function(e){return e===!1||e===!0},isFunction:function(e){return e instanceof Function}},hi=[{litmus:c.isString,conversions:{THREE_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return t===null?!1:{space:"HEX",hex:parseInt("0x"+t[1].toString()+t[1].toString()+t[2].toString()+t[2].toString()+t[3].toString()+t[3].toString(),0)}},write:Pe},SIX_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9]{6})$/i);return t===null?!1:{space:"HEX",hex:parseInt("0x"+t[1].toString(),0)}},write:Pe},CSS_RGB:{read:function(e){var t=e.match(/^rgb\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);return t===null?!1:{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3])}},write:Pe},CSS_RGBA:{read:function(e){var t=e.match(/^rgba\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);return t===null?!1:{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3]),a:parseFloat(t[4])}},write:Pe}}},{litmus:c.isNumber,conversions:{HEX:{read:function(e){return{space:"HEX",hex:e,conversionName:"HEX"}},write:function(e){return e.hex}}}},{litmus:c.isArray,conversions:{RGB_ARRAY:{read:function(e){return e.length!==3?!1:{space:"RGB",r:e[0],g:e[1],b:e[2]}},write:function(e){return[e.r,e.g,e.b]}},RGBA_ARRAY:{read:function(e){return e.length!==4?!1:{space:"RGB",r:e[0],g:e[1],b:e[2],a:e[3]}},write:function(e){return[e.r,e.g,e.b,e.a]}}}},{litmus:c.isObject,conversions:{RGBA_OBJ:{read:function(e){return c.isNumber(e.r)&&c.isNumber(e.g)&&c.isNumber(e.b)&&c.isNumber(e.a)?{space:"RGB",r:e.r,g:e.g,b:e.b,a:e.a}:!1},write:function(e){return{r:e.r,g:e.g,b:e.b,a:e.a}}},RGB_OBJ:{read:function(e){return c.isNumber(e.r)&&c.isNumber(e.g)&&c.isNumber(e.b)?{space:"RGB",r:e.r,g:e.g,b:e.b}:!1},write:function(e){return{r:e.r,g:e.g,b:e.b}}},HSVA_OBJ:{read:function(e){return c.isNumber(e.h)&&c.isNumber(e.s)&&c.isNumber(e.v)&&c.isNumber(e.a)?{space:"HSV",h:e.h,s:e.s,v:e.v,a:e.a}:!1},write:function(e){return{h:e.h,s:e.s,v:e.v,a:e.a}}},HSV_OBJ:{read:function(e){return c.isNumber(e.h)&&c.isNumber(e.s)&&c.isNumber(e.v)?{space:"HSV",h:e.h,s:e.s,v:e.v}:!1},write:function(e){return{h:e.h,s:e.s,v:e.v}}}}}],Ve=void 0,dt=void 0,en=function(){dt=!1;var e=arguments.length>1?c.toArray(arguments):arguments[0];return c.each(hi,function(t){if(t.litmus(e))return c.each(t.conversions,function(i,r){if(Ve=i.read(e),dt===!1&&Ve!==!1)return dt=Ve,Ve.conversionName=r,Ve.conversion=i,c.BREAK}),c.BREAK}),dt},Gn=void 0,wt={hsv_to_rgb:function(e,t,i){var r=Math.floor(e/60)%6,o=e/60-Math.floor(e/60),a=i*(1-t),s=i*(1-o*t),u=i*(1-(1-o)*t),f=[[i,u,a],[s,i,a],[a,i,u],[a,s,i],[u,a,i],[i,a,s]][r];return{r:f[0]*255,g:f[1]*255,b:f[2]*255}},rgb_to_hsv:function(e,t,i){var r=Math.min(e,t,i),o=Math.max(e,t,i),a=o-r,s=void 0,u=void 0;if(o!==0)u=a/o;else return{h:NaN,s:0,v:0};return e===o?s=(t-i)/a:t===o?s=2+(i-e)/a:s=4+(e-t)/a,s/=6,s<0&&(s+=1),{h:s*360,s:u,v:o/255}},rgb_to_hex:function(e,t,i){var r=this.hex_with_component(0,2,e);return r=this.hex_with_component(r,1,t),r=this.hex_with_component(r,0,i),r},component_from_hex:function(e,t){return e>>t*8&255},hex_with_component:function(e,t,i){return i<<(Gn=t*8)|e&~(255<<Gn)}},_i=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},N=function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")},F=function(){function n(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,i){return t&&n(e.prototype,t),i&&n(e,i),e}}(),se=function n(e,t,i){e===null&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,t);if(r===void 0){var o=Object.getPrototypeOf(e);return o===null?void 0:n(o,t,i)}else{if("value"in r)return r.value;var a=r.get;return a===void 0?void 0:a.call(i)}},ue=function(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)},le=function(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n},G=function(){function n(){if(N(this,n),this.__state=en.apply(this,arguments),this.__state===!1)throw new Error("Failed to interpret color arguments");this.__state.a=this.__state.a||1}return F(n,[{key:"toString",value:function(){return Pe(this)}},{key:"toHexString",value:function(){return Pe(this,!0)}},{key:"toOriginal",value:function(){return this.__state.conversion.write(this)}}]),n}();function dn(n,e,t){Object.defineProperty(n,e,{get:function(){return this.__state.space==="RGB"?this.__state[e]:(G.recalculateRGB(this,e,t),this.__state[e])},set:function(r){this.__state.space!=="RGB"&&(G.recalculateRGB(this,e,t),this.__state.space="RGB"),this.__state[e]=r}})}function pn(n,e){Object.defineProperty(n,e,{get:function(){return this.__state.space==="HSV"?this.__state[e]:(G.recalculateHSV(this),this.__state[e])},set:function(i){this.__state.space!=="HSV"&&(G.recalculateHSV(this),this.__state.space="HSV"),this.__state[e]=i}})}G.recalculateRGB=function(n,e,t){if(n.__state.space==="HEX")n.__state[e]=wt.component_from_hex(n.__state.hex,t);else if(n.__state.space==="HSV")c.extend(n.__state,wt.hsv_to_rgb(n.__state.h,n.__state.s,n.__state.v));else throw new Error("Corrupted color state")};G.recalculateHSV=function(n){var e=wt.rgb_to_hsv(n.r,n.g,n.b);c.extend(n.__state,{s:e.s,v:e.v}),c.isNaN(e.h)?c.isUndefined(n.__state.h)&&(n.__state.h=0):n.__state.h=e.h};G.COMPONENTS=["r","g","b","h","s","v","hex","a"];dn(G.prototype,"r",2);dn(G.prototype,"g",1);dn(G.prototype,"b",0);pn(G.prototype,"h");pn(G.prototype,"s");pn(G.prototype,"v");Object.defineProperty(G.prototype,"a",{get:function(){return this.__state.a},set:function(e){this.__state.a=e}});Object.defineProperty(G.prototype,"hex",{get:function(){return this.__state.space!=="HEX"&&(this.__state.hex=wt.rgb_to_hex(this.r,this.g,this.b),this.__state.space="HEX"),this.__state.hex},set:function(e){this.__state.space="HEX",this.__state.hex=e}});var be=function(){function n(e,t){N(this,n),this.initialValue=e[t],this.domElement=document.createElement("div"),this.object=e,this.property=t,this.__onChange=void 0,this.__onFinishChange=void 0}return F(n,[{key:"onChange",value:function(t){return this.__onChange=t,this}},{key:"onFinishChange",value:function(t){return this.__onFinishChange=t,this}},{key:"setValue",value:function(t){return this.object[this.property]=t,this.__onChange&&this.__onChange.call(this,t),this.updateDisplay(),this}},{key:"getValue",value:function(){return this.object[this.property]}},{key:"updateDisplay",value:function(){return this}},{key:"isModified",value:function(){return this.initialValue!==this.getValue()}}]),n}(),bi={HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},cr={};c.each(bi,function(n,e){c.each(n,function(t){cr[t]=e})});var xi=/(\d+(\.\d+)?)px/;function V(n){if(n==="0"||c.isUndefined(n))return 0;var e=n.match(xi);return c.isNull(e)?0:parseFloat(e[1])}var l={makeSelectable:function(e,t){e===void 0||e.style===void 0||(e.onselectstart=t?function(){return!1}:function(){},e.style.MozUserSelect=t?"auto":"none",e.style.KhtmlUserSelect=t?"auto":"none",e.unselectable=t?"on":"off")},makeFullscreen:function(e,t,i){var r=i,o=t;c.isUndefined(o)&&(o=!0),c.isUndefined(r)&&(r=!0),e.style.position="absolute",o&&(e.style.left=0,e.style.right=0),r&&(e.style.top=0,e.style.bottom=0)},fakeEvent:function(e,t,i,r){var o=i||{},a=cr[t];if(!a)throw new Error("Event type "+t+" not supported.");var s=document.createEvent(a);switch(a){case"MouseEvents":{var u=o.x||o.clientX||0,f=o.y||o.clientY||0;s.initMouseEvent(t,o.bubbles||!1,o.cancelable||!0,window,o.clickCount||1,0,0,u,f,!1,!1,!1,!1,0,null);break}case"KeyboardEvents":{var m=s.initKeyboardEvent||s.initKeyEvent;c.defaults(o,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0}),m(t,o.bubbles||!1,o.cancelable,window,o.ctrlKey,o.altKey,o.shiftKey,o.metaKey,o.keyCode,o.charCode);break}default:{s.initEvent(t,o.bubbles||!1,o.cancelable||!0);break}}c.defaults(s,r),e.dispatchEvent(s)},bind:function(e,t,i,r){var o=r||!1;return e.addEventListener?e.addEventListener(t,i,o):e.attachEvent&&e.attachEvent("on"+t,i),l},unbind:function(e,t,i,r){var o=r||!1;return e.removeEventListener?e.removeEventListener(t,i,o):e.detachEvent&&e.detachEvent("on"+t,i),l},addClass:function(e,t){if(e.className===void 0)e.className=t;else if(e.className!==t){var i=e.className.split(/ +/);i.indexOf(t)===-1&&(i.push(t),e.className=i.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return l},removeClass:function(e,t){if(t)if(e.className===t)e.removeAttribute("class");else{var i=e.className.split(/ +/),r=i.indexOf(t);r!==-1&&(i.splice(r,1),e.className=i.join(" "))}else e.className=void 0;return l},hasClass:function(e,t){return new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)").test(e.className)||!1},getWidth:function(e){var t=getComputedStyle(e);return V(t["border-left-width"])+V(t["border-right-width"])+V(t["padding-left"])+V(t["padding-right"])+V(t.width)},getHeight:function(e){var t=getComputedStyle(e);return V(t["border-top-width"])+V(t["border-bottom-width"])+V(t["padding-top"])+V(t["padding-bottom"])+V(t.height)},getOffset:function(e){var t=e,i={left:0,top:0};if(t.offsetParent)do i.left+=t.offsetLeft,i.top+=t.offsetTop,t=t.offsetParent;while(t);return i},isActive:function(e){return e===document.activeElement&&(e.type||e.href)}},fr=function(n){ue(e,n);function e(t,i){N(this,e);var r=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),o=r;r.__prev=r.getValue(),r.__checkbox=document.createElement("input"),r.__checkbox.setAttribute("type","checkbox");function a(){o.setValue(!o.__prev)}return l.bind(r.__checkbox,"change",a,!1),r.domElement.appendChild(r.__checkbox),r.updateDisplay(),r}return F(e,[{key:"setValue",value:function(i){var r=se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,i);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),this.__prev=this.getValue(),r}},{key:"updateDisplay",value:function(){return this.getValue()===!0?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0,this.__prev=!0):(this.__checkbox.checked=!1,this.__prev=!1),se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(be),yi=function(n){ue(e,n);function e(t,i,r){N(this,e);var o=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),a=r,s=o;if(o.__select=document.createElement("select"),c.isArray(a)){var u={};c.each(a,function(f){u[f]=f}),a=u}return c.each(a,function(f,m){var d=document.createElement("option");d.innerHTML=m,d.setAttribute("value",f),s.__select.appendChild(d)}),o.updateDisplay(),l.bind(o.__select,"change",function(){var f=this.options[this.selectedIndex].value;s.setValue(f)}),o.domElement.appendChild(o.__select),o}return F(e,[{key:"setValue",value:function(i){var r=se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,i);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),r}},{key:"updateDisplay",value:function(){return l.isActive(this.__select)?this:(this.__select.value=this.getValue(),se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this))}}]),e}(be),wi=function(n){ue(e,n);function e(t,i){N(this,e);var r=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),o=r;function a(){o.setValue(o.__input.value)}function s(){o.__onFinishChange&&o.__onFinishChange.call(o,o.getValue())}return r.__input=document.createElement("input"),r.__input.setAttribute("type","text"),l.bind(r.__input,"keyup",a),l.bind(r.__input,"change",a),l.bind(r.__input,"blur",s),l.bind(r.__input,"keydown",function(u){u.keyCode===13&&this.blur()}),r.updateDisplay(),r.domElement.appendChild(r.__input),r}return F(e,[{key:"updateDisplay",value:function(){return l.isActive(this.__input)||(this.__input.value=this.getValue()),se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(be);function kn(n){var e=n.toString();return e.indexOf(".")>-1?e.length-e.indexOf(".")-1:0}var dr=function(n){ue(e,n);function e(t,i,r){N(this,e);var o=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),a=r||{};return o.__min=a.min,o.__max=a.max,o.__step=a.step,c.isUndefined(o.__step)?o.initialValue===0?o.__impliedStep=1:o.__impliedStep=Math.pow(10,Math.floor(Math.log(Math.abs(o.initialValue))/Math.LN10))/10:o.__impliedStep=o.__step,o.__precision=kn(o.__impliedStep),o}return F(e,[{key:"setValue",value:function(i){var r=i;return this.__min!==void 0&&r<this.__min?r=this.__min:this.__max!==void 0&&r>this.__max&&(r=this.__max),this.__step!==void 0&&r%this.__step!==0&&(r=Math.round(r/this.__step)*this.__step),se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,r)}},{key:"min",value:function(i){return this.__min=i,this}},{key:"max",value:function(i){return this.__max=i,this}},{key:"step",value:function(i){return this.__step=i,this.__impliedStep=i,this.__precision=kn(i),this}}]),e}(be);function Si(n,e){var t=Math.pow(10,e);return Math.round(n*t)/t}var St=function(n){ue(e,n);function e(t,i,r){N(this,e);var o=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i,r));o.__truncationSuspended=!1;var a=o,s=void 0;function u(){var h=parseFloat(a.__input.value);c.isNaN(h)||a.setValue(h)}function f(){a.__onFinishChange&&a.__onFinishChange.call(a,a.getValue())}function m(){f()}function d(h){var v=s-h.clientY;a.setValue(a.getValue()+v*a.__impliedStep),s=h.clientY}function p(){l.unbind(window,"mousemove",d),l.unbind(window,"mouseup",p),f()}function g(h){l.bind(window,"mousemove",d),l.bind(window,"mouseup",p),s=h.clientY}return o.__input=document.createElement("input"),o.__input.setAttribute("type","text"),l.bind(o.__input,"change",u),l.bind(o.__input,"blur",m),l.bind(o.__input,"mousedown",g),l.bind(o.__input,"keydown",function(h){h.keyCode===13&&(a.__truncationSuspended=!0,this.blur(),a.__truncationSuspended=!1,f())}),o.updateDisplay(),o.domElement.appendChild(o.__input),o}return F(e,[{key:"updateDisplay",value:function(){return this.__input.value=this.__truncationSuspended?this.getValue():Si(this.getValue(),this.__precision),se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(dr);function Ln(n,e,t,i,r){return i+(r-i)*((n-e)/(t-e))}var tn=function(n){ue(e,n);function e(t,i,r,o,a){N(this,e);var s=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i,{min:r,max:o,step:a})),u=s;s.__background=document.createElement("div"),s.__foreground=document.createElement("div"),l.bind(s.__background,"mousedown",f),l.bind(s.__background,"touchstart",p),l.addClass(s.__background,"slider"),l.addClass(s.__foreground,"slider-fg");function f(v){document.activeElement.blur(),l.bind(window,"mousemove",m),l.bind(window,"mouseup",d),m(v)}function m(v){v.preventDefault();var w=u.__background.getBoundingClientRect();return u.setValue(Ln(v.clientX,w.left,w.right,u.__min,u.__max)),!1}function d(){l.unbind(window,"mousemove",m),l.unbind(window,"mouseup",d),u.__onFinishChange&&u.__onFinishChange.call(u,u.getValue())}function p(v){v.touches.length===1&&(l.bind(window,"touchmove",g),l.bind(window,"touchend",h),g(v))}function g(v){var w=v.touches[0].clientX,E=u.__background.getBoundingClientRect();u.setValue(Ln(w,E.left,E.right,u.__min,u.__max))}function h(){l.unbind(window,"touchmove",g),l.unbind(window,"touchend",h),u.__onFinishChange&&u.__onFinishChange.call(u,u.getValue())}return s.updateDisplay(),s.__background.appendChild(s.__foreground),s.domElement.appendChild(s.__background),s}return F(e,[{key:"updateDisplay",value:function(){var i=(this.getValue()-this.__min)/(this.__max-this.__min);return this.__foreground.style.width=i*100+"%",se(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(dr),pr=function(n){ue(e,n);function e(t,i,r){N(this,e);var o=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),a=o;return o.__button=document.createElement("div"),o.__button.innerHTML=r===void 0?"Fire":r,l.bind(o.__button,"click",function(s){return s.preventDefault(),a.fire(),!1}),l.addClass(o.__button,"button"),o.domElement.appendChild(o.__button),o}return F(e,[{key:"fire",value:function(){this.__onChange&&this.__onChange.call(this),this.getValue().call(this.object),this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue())}}]),e}(be),nn=function(n){ue(e,n);function e(t,i){N(this,e);var r=le(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i));r.__color=new G(r.getValue()),r.__temp=new G(0);var o=r;r.domElement=document.createElement("div"),l.makeSelectable(r.domElement,!1),r.__selector=document.createElement("div"),r.__selector.className="selector",r.__saturation_field=document.createElement("div"),r.__saturation_field.className="saturation-field",r.__field_knob=document.createElement("div"),r.__field_knob.className="field-knob",r.__field_knob_border="2px solid ",r.__hue_knob=document.createElement("div"),r.__hue_knob.className="hue-knob",r.__hue_field=document.createElement("div"),r.__hue_field.className="hue-field",r.__input=document.createElement("input"),r.__input.type="text",r.__input_textShadow="0 1px 1px ",l.bind(r.__input,"keydown",function(v){v.keyCode===13&&d.call(this)}),l.bind(r.__input,"blur",d),l.bind(r.__selector,"mousedown",function(){l.addClass(this,"drag").bind(window,"mouseup",function(){l.removeClass(o.__selector,"drag")})}),l.bind(r.__selector,"touchstart",function(){l.addClass(this,"drag").bind(window,"touchend",function(){l.removeClass(o.__selector,"drag")})});var a=document.createElement("div");c.extend(r.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"}),c.extend(r.__field_knob.style,{position:"absolute",width:"12px",height:"12px",border:r.__field_knob_border+(r.__color.v<.5?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1}),c.extend(r.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1}),c.extend(r.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"}),c.extend(a.style,{width:"100%",height:"100%",background:"none"}),zn(a,"top","rgba(0,0,0,0)","#000"),c.extend(r.__hue_field.style,{width:"15px",height:"100px",border:"1px solid #555",cursor:"ns-resize",position:"absolute",top:"3px",right:"3px"}),Ti(r.__hue_field),c.extend(r.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:r.__input_textShadow+"rgba(0,0,0,0.7)"}),l.bind(r.__saturation_field,"mousedown",s),l.bind(r.__saturation_field,"touchstart",s),l.bind(r.__field_knob,"mousedown",s),l.bind(r.__field_knob,"touchstart",s),l.bind(r.__hue_field,"mousedown",u),l.bind(r.__hue_field,"touchstart",u);function s(v){g(v),l.bind(window,"mousemove",g),l.bind(window,"touchmove",g),l.bind(window,"mouseup",f),l.bind(window,"touchend",f)}function u(v){h(v),l.bind(window,"mousemove",h),l.bind(window,"touchmove",h),l.bind(window,"mouseup",m),l.bind(window,"touchend",m)}function f(){l.unbind(window,"mousemove",g),l.unbind(window,"touchmove",g),l.unbind(window,"mouseup",f),l.unbind(window,"touchend",f),p()}function m(){l.unbind(window,"mousemove",h),l.unbind(window,"touchmove",h),l.unbind(window,"mouseup",m),l.unbind(window,"touchend",m),p()}function d(){var v=en(this.value);v!==!1?(o.__color.__state=v,o.setValue(o.__color.toOriginal())):this.value=o.__color.toString()}function p(){o.__onFinishChange&&o.__onFinishChange.call(o,o.__color.toOriginal())}r.__saturation_field.appendChild(a),r.__selector.appendChild(r.__field_knob),r.__selector.appendChild(r.__saturation_field),r.__selector.appendChild(r.__hue_field),r.__hue_field.appendChild(r.__hue_knob),r.domElement.appendChild(r.__input),r.domElement.appendChild(r.__selector),r.updateDisplay();function g(v){v.type.indexOf("touch")===-1&&v.preventDefault();var w=o.__saturation_field.getBoundingClientRect(),E=v.touches&&v.touches[0]||v,L=E.clientX,b=E.clientY,x=(L-w.left)/(w.right-w.left),y=1-(b-w.top)/(w.bottom-w.top);return y>1?y=1:y<0&&(y=0),x>1?x=1:x<0&&(x=0),o.__color.v=y,o.__color.s=x,o.setValue(o.__color.toOriginal()),!1}function h(v){v.type.indexOf("touch")===-1&&v.preventDefault();var w=o.__hue_field.getBoundingClientRect(),E=v.touches&&v.touches[0]||v,L=E.clientY,b=1-(L-w.top)/(w.bottom-w.top);return b>1?b=1:b<0&&(b=0),o.__color.h=b*360,o.setValue(o.__color.toOriginal()),!1}return r}return F(e,[{key:"updateDisplay",value:function(){var i=en(this.getValue());if(i!==!1){var r=!1;c.each(G.COMPONENTS,function(s){if(!c.isUndefined(i[s])&&!c.isUndefined(this.__color.__state[s])&&i[s]!==this.__color.__state[s])return r=!0,{}},this),r&&c.extend(this.__color.__state,i)}c.extend(this.__temp.__state,this.__color.__state),this.__temp.a=1;var o=this.__color.v<.5||this.__color.s>.5?255:0,a=255-o;c.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toHexString(),border:this.__field_knob_border+"rgb("+o+","+o+","+o+")"}),this.__hue_knob.style.marginTop=(1-this.__color.h/360)*100+"px",this.__temp.s=1,this.__temp.v=1,zn(this.__saturation_field,"left","#fff",this.__temp.toHexString()),this.__input.value=this.__color.toString(),c.extend(this.__input.style,{backgroundColor:this.__color.toHexString(),color:"rgb("+o+","+o+","+o+")",textShadow:this.__input_textShadow+"rgba("+a+","+a+","+a+",.7)"})}}]),e}(be),Bi=["-moz-","-o-","-webkit-","-ms-",""];function zn(n,e,t,i){n.style.background="",c.each(Bi,function(r){n.style.cssText+="background: "+r+"linear-gradient("+e+", "+t+" 0%, "+i+" 100%); "})}function Ti(n){n.style.background="",n.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);",n.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",n.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",n.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",n.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}var Pi={load:function(e,t){var i=t||document,r=i.createElement("link");r.type="text/css",r.rel="stylesheet",r.href=e,i.getElementsByTagName("head")[0].appendChild(r)},inject:function(e,t){var i=t||document,r=document.createElement("style");r.type="text/css",r.innerHTML=e;var o=i.getElementsByTagName("head")[0];try{o.appendChild(r)}catch{}}},Ci=`<div id="dg-save" class="dg dialogue">

  Here's the new load parameter for your <code>GUI</code>'s constructor:

  <textarea id="dg-new-constructor"></textarea>

  <div id="dg-save-locally">

    <input id="dg-local-storage" type="checkbox"/> Automatically save
    values to <code>localStorage</code> on exit.

    <div id="dg-local-explain">The values saved to <code>localStorage</code> will
      override those passed to <code>dat.GUI</code>'s constructor. This makes it
      easier to work incrementally, but <code>localStorage</code> is fragile,
      and your friends may not see the same values you do.

    </div>

  </div>

</div>`,Ei=function(e,t){var i=e[t];return c.isArray(arguments[2])||c.isObject(arguments[2])?new yi(e,t,arguments[2]):c.isNumber(i)?c.isNumber(arguments[2])&&c.isNumber(arguments[3])?c.isNumber(arguments[4])?new tn(e,t,arguments[2],arguments[3],arguments[4]):new tn(e,t,arguments[2],arguments[3]):c.isNumber(arguments[4])?new St(e,t,{min:arguments[2],max:arguments[3],step:arguments[4]}):new St(e,t,{min:arguments[2],max:arguments[3]}):c.isString(i)?new wi(e,t):c.isFunction(i)?new pr(e,t,""):c.isBoolean(i)?new fr(e,t):null};function Ai(n){setTimeout(n,1e3/60)}var Ui=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||Ai,Oi=function(){function n(){N(this,n),this.backgroundElement=document.createElement("div"),c.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear",transition:"opacity 0.2s linear"}),l.makeFullscreen(this.backgroundElement),this.backgroundElement.style.position="fixed",this.domElement=document.createElement("div"),c.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear",transition:"transform 0.2s ease-out, opacity 0.2s linear"}),document.body.appendChild(this.backgroundElement),document.body.appendChild(this.domElement);var e=this;l.bind(this.backgroundElement,"click",function(){e.hide()})}return F(n,[{key:"show",value:function(){var t=this;this.backgroundElement.style.display="block",this.domElement.style.display="block",this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)",this.layout(),c.defer(function(){t.backgroundElement.style.opacity=1,t.domElement.style.opacity=1,t.domElement.style.webkitTransform="scale(1)"})}},{key:"hide",value:function(){var t=this,i=function r(){t.domElement.style.display="none",t.backgroundElement.style.display="none",l.unbind(t.domElement,"webkitTransitionEnd",r),l.unbind(t.domElement,"transitionend",r),l.unbind(t.domElement,"oTransitionEnd",r)};l.bind(this.domElement,"webkitTransitionEnd",i),l.bind(this.domElement,"transitionend",i),l.bind(this.domElement,"oTransitionEnd",i),this.backgroundElement.style.opacity=0,this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)"}},{key:"layout",value:function(){this.domElement.style.left=window.innerWidth/2-l.getWidth(this.domElement)/2+"px",this.domElement.style.top=window.innerHeight/2-l.getHeight(this.domElement)/2+"px"}}]),n}(),Di=gi(`.dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .cr.function .property-name{width:100%}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}
`);Pi.inject(Di);var Mn="dg",In=72,Nn=20,at="Default",je=function(){try{return!!window.localStorage}catch{return!1}}(),nt=void 0,Fn=!0,we=void 0,Lt=!1,mr=[],B=function n(e){var t=this,i=e||{};this.domElement=document.createElement("div"),this.__ul=document.createElement("ul"),this.domElement.appendChild(this.__ul),l.addClass(this.domElement,Mn),this.__folders={},this.__controllers=[],this.__rememberedObjects=[],this.__rememberedObjectIndecesToControllers=[],this.__listening=[],i=c.defaults(i,{closeOnTop:!1,autoPlace:!0,width:n.DEFAULT_WIDTH}),i=c.defaults(i,{resizable:i.autoPlace,hideable:i.autoPlace}),c.isUndefined(i.load)?i.load={preset:at}:i.preset&&(i.load.preset=i.preset),c.isUndefined(i.parent)&&i.hideable&&mr.push(this),i.resizable=c.isUndefined(i.parent)&&i.resizable,i.autoPlace&&c.isUndefined(i.scrollable)&&(i.scrollable=!0);var r=je&&localStorage.getItem(Se(this,"isLocal"))==="true",o=void 0,a=void 0;if(Object.defineProperties(this,{parent:{get:function(){return i.parent}},scrollable:{get:function(){return i.scrollable}},autoPlace:{get:function(){return i.autoPlace}},closeOnTop:{get:function(){return i.closeOnTop}},preset:{get:function(){return t.parent?t.getRoot().preset:i.load.preset},set:function(p){t.parent?t.getRoot().preset=p:i.load.preset=p,Li(this),t.revert()}},width:{get:function(){return i.width},set:function(p){i.width=p,an(t,p)}},name:{get:function(){return i.name},set:function(p){i.name=p,a&&(a.innerHTML=i.name)}},closed:{get:function(){return i.closed},set:function(p){i.closed=p,i.closed?l.addClass(t.__ul,n.CLASS_CLOSED):l.removeClass(t.__ul,n.CLASS_CLOSED),this.onResize(),t.__closeButton&&(t.__closeButton.innerHTML=p?n.TEXT_OPEN:n.TEXT_CLOSED)}},load:{get:function(){return i.load}},useLocalStorage:{get:function(){return r},set:function(p){je&&(r=p,p?l.bind(window,"unload",o):l.unbind(window,"unload",o),localStorage.setItem(Se(t,"isLocal"),p))}}}),c.isUndefined(i.parent)){if(this.closed=i.closed||!1,l.addClass(this.domElement,n.CLASS_MAIN),l.makeSelectable(this.domElement,!1),je&&r){t.useLocalStorage=!0;var s=localStorage.getItem(Se(this,"gui"));s&&(i.load=JSON.parse(s))}this.__closeButton=document.createElement("div"),this.__closeButton.innerHTML=n.TEXT_CLOSED,l.addClass(this.__closeButton,n.CLASS_CLOSE_BUTTON),i.closeOnTop?(l.addClass(this.__closeButton,n.CLASS_CLOSE_TOP),this.domElement.insertBefore(this.__closeButton,this.domElement.childNodes[0])):(l.addClass(this.__closeButton,n.CLASS_CLOSE_BOTTOM),this.domElement.appendChild(this.__closeButton)),l.bind(this.__closeButton,"click",function(){t.closed=!t.closed})}else{i.closed===void 0&&(i.closed=!0);var u=document.createTextNode(i.name);l.addClass(u,"controller-name"),a=mn(t,u);var f=function(p){return p.preventDefault(),t.closed=!t.closed,!1};l.addClass(this.__ul,n.CLASS_CLOSED),l.addClass(a,"title"),l.bind(a,"click",f),i.closed||(this.closed=!1)}i.autoPlace&&(c.isUndefined(i.parent)&&(Fn&&(we=document.createElement("div"),l.addClass(we,Mn),l.addClass(we,n.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(we),Fn=!1),we.appendChild(this.domElement),l.addClass(this.domElement,n.CLASS_AUTO_PLACE)),this.parent||an(t,i.width)),this.__resizeHandler=function(){t.onResizeDebounced()},l.bind(window,"resize",this.__resizeHandler),l.bind(this.__ul,"webkitTransitionEnd",this.__resizeHandler),l.bind(this.__ul,"transitionend",this.__resizeHandler),l.bind(this.__ul,"oTransitionEnd",this.__resizeHandler),this.onResize(),i.resizable&&ki(this),o=function(){je&&localStorage.getItem(Se(t,"isLocal"))==="true"&&localStorage.setItem(Se(t,"gui"),JSON.stringify(t.getSaveObject()))},this.saveToLocalStorageIfPossible=o;function m(){var d=t.getRoot();d.width+=1,c.defer(function(){d.width-=1})}i.parent||m()};B.toggleHide=function(){Lt=!Lt,c.each(mr,function(n){n.domElement.style.display=Lt?"none":""})};B.CLASS_AUTO_PLACE="a";B.CLASS_AUTO_PLACE_CONTAINER="ac";B.CLASS_MAIN="main";B.CLASS_CONTROLLER_ROW="cr";B.CLASS_TOO_TALL="taller-than-window";B.CLASS_CLOSED="closed";B.CLASS_CLOSE_BUTTON="close-button";B.CLASS_CLOSE_TOP="close-top";B.CLASS_CLOSE_BOTTOM="close-bottom";B.CLASS_DRAG="drag";B.DEFAULT_WIDTH=245;B.TEXT_CLOSED="Close Controls";B.TEXT_OPEN="Open Controls";B._keydownHandler=function(n){document.activeElement.type!=="text"&&(n.which===In||n.keyCode===In)&&B.toggleHide()};l.bind(window,"keydown",B._keydownHandler,!1);c.extend(B.prototype,{add:function(e,t){return rt(this,e,t,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(e,t){return rt(this,e,t,{color:!0})},remove:function(e){this.__ul.removeChild(e.__li),this.__controllers.splice(this.__controllers.indexOf(e),1);var t=this;c.defer(function(){t.onResize()})},destroy:function(){if(this.parent)throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");this.autoPlace&&we.removeChild(this.domElement);var e=this;c.each(this.__folders,function(t){e.removeFolder(t)}),l.unbind(window,"keydown",B._keydownHandler,!1),Vn(this)},addFolder:function(e){if(this.__folders[e]!==void 0)throw new Error('You already have a folder in this GUI by the name "'+e+'"');var t={name:e,parent:this};t.autoPlace=this.autoPlace,this.load&&this.load.folders&&this.load.folders[e]&&(t.closed=this.load.folders[e].closed,t.load=this.load.folders[e]);var i=new B(t);this.__folders[e]=i;var r=mn(this,i.domElement);return l.addClass(r,"folder"),i},removeFolder:function(e){this.__ul.removeChild(e.domElement.parentElement),delete this.__folders[e.name],this.load&&this.load.folders&&this.load.folders[e.name]&&delete this.load.folders[e.name],Vn(e);var t=this;c.each(e.__folders,function(i){e.removeFolder(i)}),c.defer(function(){t.onResize()})},open:function(){this.closed=!1},close:function(){this.closed=!0},hide:function(){this.domElement.style.display="none"},show:function(){this.domElement.style.display=""},onResize:function(){var e=this.getRoot();if(e.scrollable){var t=l.getOffset(e.__ul).top,i=0;c.each(e.__ul.childNodes,function(r){e.autoPlace&&r===e.__save_row||(i+=l.getHeight(r))}),window.innerHeight-t-Nn<i?(l.addClass(e.domElement,B.CLASS_TOO_TALL),e.__ul.style.height=window.innerHeight-t-Nn+"px"):(l.removeClass(e.domElement,B.CLASS_TOO_TALL),e.__ul.style.height="auto")}e.__resize_handle&&c.defer(function(){e.__resize_handle.style.height=e.__ul.offsetHeight+"px"}),e.__closeButton&&(e.__closeButton.style.width=e.width+"px")},onResizeDebounced:c.debounce(function(){this.onResize()},50),remember:function(){if(c.isUndefined(nt)&&(nt=new Oi,nt.domElement.innerHTML=Ci),this.parent)throw new Error("You can only call remember on a top level GUI.");var e=this;c.each(Array.prototype.slice.call(arguments),function(t){e.__rememberedObjects.length===0&&Gi(e),e.__rememberedObjects.indexOf(t)===-1&&e.__rememberedObjects.push(t)}),this.autoPlace&&an(this,this.width)},getRoot:function(){for(var e=this;e.parent;)e=e.parent;return e},getSaveObject:function(){var e=this.load;return e.closed=this.closed,this.__rememberedObjects.length>0&&(e.preset=this.preset,e.remembered||(e.remembered={}),e.remembered[this.preset]=pt(this)),e.folders={},c.each(this.__folders,function(t,i){e.folders[i]=t.getSaveObject()}),e},save:function(){this.load.remembered||(this.load.remembered={}),this.load.remembered[this.preset]=pt(this),rn(this,!1),this.saveToLocalStorageIfPossible()},saveAs:function(e){this.load.remembered||(this.load.remembered={},this.load.remembered[at]=pt(this,!0)),this.load.remembered[e]=pt(this),this.preset=e,on(this,e,!0),this.saveToLocalStorageIfPossible()},revert:function(e){c.each(this.__controllers,function(t){this.getRoot().load.remembered?vr(e||this.getRoot(),t):t.setValue(t.initialValue),t.__onFinishChange&&t.__onFinishChange.call(t,t.getValue())},this),c.each(this.__folders,function(t){t.revert(t)}),e||rn(this.getRoot(),!1)},listen:function(e){var t=this.__listening.length===0;this.__listening.push(e),t&&gr(this.__listening)},updateDisplay:function(){c.each(this.__controllers,function(e){e.updateDisplay()}),c.each(this.__folders,function(e){e.updateDisplay()})}});function mn(n,e,t){var i=document.createElement("li");return e&&i.appendChild(e),t?n.__ul.insertBefore(i,t):n.__ul.appendChild(i),n.onResize(),i}function Vn(n){l.unbind(window,"resize",n.__resizeHandler),n.saveToLocalStorageIfPossible&&l.unbind(window,"unload",n.saveToLocalStorageIfPossible)}function rn(n,e){var t=n.__preset_select[n.__preset_select.selectedIndex];e?t.innerHTML=t.value+"*":t.innerHTML=t.value}function Ri(n,e,t){if(t.__li=e,t.__gui=n,c.extend(t,{options:function(a){if(arguments.length>1){var s=t.__li.nextElementSibling;return t.remove(),rt(n,t.object,t.property,{before:s,factoryArgs:[c.toArray(arguments)]})}if(c.isArray(a)||c.isObject(a)){var u=t.__li.nextElementSibling;return t.remove(),rt(n,t.object,t.property,{before:u,factoryArgs:[a]})}},name:function(a){return t.__li.firstElementChild.firstElementChild.innerHTML=a,t},listen:function(){return t.__gui.listen(t),t},remove:function(){return t.__gui.remove(t),t}}),t instanceof tn){var i=new St(t.object,t.property,{min:t.__min,max:t.__max,step:t.__step});c.each(["updateDisplay","onChange","onFinishChange","step","min","max"],function(o){var a=t[o],s=i[o];t[o]=i[o]=function(){var u=Array.prototype.slice.call(arguments);return s.apply(i,u),a.apply(t,u)}}),l.addClass(e,"has-slider"),t.domElement.insertBefore(i.domElement,t.domElement.firstElementChild)}else if(t instanceof St){var r=function(a){if(c.isNumber(t.__min)&&c.isNumber(t.__max)){var s=t.__li.firstElementChild.firstElementChild.innerHTML,u=t.__gui.__listening.indexOf(t)>-1;t.remove();var f=rt(n,t.object,t.property,{before:t.__li.nextElementSibling,factoryArgs:[t.__min,t.__max,t.__step]});return f.name(s),u&&f.listen(),f}return a};t.min=c.compose(r,t.min),t.max=c.compose(r,t.max)}else t instanceof fr?(l.bind(e,"click",function(){l.fakeEvent(t.__checkbox,"click")}),l.bind(t.__checkbox,"click",function(o){o.stopPropagation()})):t instanceof pr?(l.bind(e,"click",function(){l.fakeEvent(t.__button,"click")}),l.bind(e,"mouseover",function(){l.addClass(t.__button,"hover")}),l.bind(e,"mouseout",function(){l.removeClass(t.__button,"hover")})):t instanceof nn&&(l.addClass(e,"color"),t.updateDisplay=c.compose(function(o){return e.style.borderLeftColor=t.__color.toString(),o},t.updateDisplay),t.updateDisplay());t.setValue=c.compose(function(o){return n.getRoot().__preset_select&&t.isModified()&&rn(n.getRoot(),!0),o},t.setValue)}function vr(n,e){var t=n.getRoot(),i=t.__rememberedObjects.indexOf(e.object);if(i!==-1){var r=t.__rememberedObjectIndecesToControllers[i];if(r===void 0&&(r={},t.__rememberedObjectIndecesToControllers[i]=r),r[e.property]=e,t.load&&t.load.remembered){var o=t.load.remembered,a=void 0;if(o[n.preset])a=o[n.preset];else if(o[at])a=o[at];else return;if(a[i]&&a[i][e.property]!==void 0){var s=a[i][e.property];e.initialValue=s,e.setValue(s)}}}}function rt(n,e,t,i){if(e[t]===void 0)throw new Error('Object "'+e+'" has no property "'+t+'"');var r=void 0;if(i.color)r=new nn(e,t);else{var o=[e,t].concat(i.factoryArgs);r=Ei.apply(n,o)}i.before instanceof be&&(i.before=i.before.__li),vr(n,r),l.addClass(r.domElement,"c");var a=document.createElement("span");l.addClass(a,"property-name"),a.innerHTML=r.property;var s=document.createElement("div");s.appendChild(a),s.appendChild(r.domElement);var u=mn(n,s,i.before);return l.addClass(u,B.CLASS_CONTROLLER_ROW),r instanceof nn?l.addClass(u,"color"):l.addClass(u,_i(r.getValue())),Ri(n,u,r),n.__controllers.push(r),r}function Se(n,e){return document.location.href+"."+e}function on(n,e,t){var i=document.createElement("option");i.innerHTML=e,i.value=e,n.__preset_select.appendChild(i),t&&(n.__preset_select.selectedIndex=n.__preset_select.length-1)}function Hn(n,e){e.style.display=n.useLocalStorage?"block":"none"}function Gi(n){var e=n.__save_row=document.createElement("li");l.addClass(n.domElement,"has-save"),n.__ul.insertBefore(e,n.__ul.firstChild),l.addClass(e,"save-row");var t=document.createElement("span");t.innerHTML="&nbsp;",l.addClass(t,"button gears");var i=document.createElement("span");i.innerHTML="Save",l.addClass(i,"button"),l.addClass(i,"save");var r=document.createElement("span");r.innerHTML="New",l.addClass(r,"button"),l.addClass(r,"save-as");var o=document.createElement("span");o.innerHTML="Revert",l.addClass(o,"button"),l.addClass(o,"revert");var a=n.__preset_select=document.createElement("select");if(n.load&&n.load.remembered?c.each(n.load.remembered,function(d,p){on(n,p,p===n.preset)}):on(n,at,!1),l.bind(a,"change",function(){for(var d=0;d<n.__preset_select.length;d++)n.__preset_select[d].innerHTML=n.__preset_select[d].value;n.preset=this.value}),e.appendChild(a),e.appendChild(t),e.appendChild(i),e.appendChild(r),e.appendChild(o),je){var s=document.getElementById("dg-local-explain"),u=document.getElementById("dg-local-storage"),f=document.getElementById("dg-save-locally");f.style.display="block",localStorage.getItem(Se(n,"isLocal"))==="true"&&u.setAttribute("checked","checked"),Hn(n,s),l.bind(u,"change",function(){n.useLocalStorage=!n.useLocalStorage,Hn(n,s)})}var m=document.getElementById("dg-new-constructor");l.bind(m,"keydown",function(d){d.metaKey&&(d.which===67||d.keyCode===67)&&nt.hide()}),l.bind(t,"click",function(){m.innerHTML=JSON.stringify(n.getSaveObject(),void 0,2),nt.show(),m.focus(),m.select()}),l.bind(i,"click",function(){n.save()}),l.bind(r,"click",function(){var d=prompt("Enter a new preset name.");d&&n.saveAs(d)}),l.bind(o,"click",function(){n.revert()})}function ki(n){var e=void 0;n.__resize_handle=document.createElement("div"),c.extend(n.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"});function t(o){return o.preventDefault(),n.width+=e-o.clientX,n.onResize(),e=o.clientX,!1}function i(){l.removeClass(n.__closeButton,B.CLASS_DRAG),l.unbind(window,"mousemove",t),l.unbind(window,"mouseup",i)}function r(o){return o.preventDefault(),e=o.clientX,l.addClass(n.__closeButton,B.CLASS_DRAG),l.bind(window,"mousemove",t),l.bind(window,"mouseup",i),!1}l.bind(n.__resize_handle,"mousedown",r),l.bind(n.__closeButton,"mousedown",r),n.domElement.insertBefore(n.__resize_handle,n.domElement.firstElementChild)}function an(n,e){n.domElement.style.width=e+"px",n.__save_row&&n.autoPlace&&(n.__save_row.style.width=e+"px"),n.__closeButton&&(n.__closeButton.style.width=e+"px")}function pt(n,e){var t={};return c.each(n.__rememberedObjects,function(i,r){var o={},a=n.__rememberedObjectIndecesToControllers[r];c.each(a,function(s,u){o[u]=e?s.initialValue:s.getValue()}),t[r]=o}),t}function Li(n){for(var e=0;e<n.__preset_select.length;e++)n.__preset_select[e].value===n.preset&&(n.__preset_select.selectedIndex=e)}function gr(n){n.length!==0&&Ui.call(window,function(){gr(n)}),c.each(n,function(e){e.updateDisplay()})}var zi=B;const Mi=`struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) position3D: vec3f,
  @location(1) normal: vec3f,
  @location(2) velocity: vec3f,
  @location(3) position2D: vec2f
};

struct Uniforms {
    perspectiveMatrix: mat4x4<f32>,
    cameraPosition: vec3f,
    voxelsSize: f32,

    coneAngle: f32,
    coneRotation: f32,
    currentFrame: f32,
    voxelWorldSize: f32,

    inColor: vec3f,
    mirror: f32,

    outColor: vec3f,
    thickness: f32
};


@group(0) @binding(0) var<storage, read>  positionBuffer: array<vec4f>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var<storage, read>  normalBuffer: array<vec4f>;
@group(0) @binding(3) var texture3D: texture_3d<f32>;
@group(0) @binding(4) var textureSampler: sampler;
@group(0) @binding(5) var<storage, read> velocityBuffer: array<vec4f>;
@group(0) @binding(6) var potentialTexture: texture_3d<f32>;


@vertex fn vs( @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    
    var position3D = positionBuffer[vertexIndex].rgb;
    var thickness = 0.01 * (1 - clamp(uniforms.thickness, 0., 1.));
    var pos = position3D - thickness * normalBuffer[vertexIndex].rgb ;
    var projection = uniforms.perspectiveMatrix * vec4f(pos, 1.);
    var output: VertexOutput;
    output.position = projection;
    output.position3D = position3D;
    output.normal = normalBuffer[vertexIndex].rgb; 
    output.velocity = velocityBuffer[vertexIndex].rgb; 
    output.position2D = 0.5 * projection.xy / projection.w + 0.5;
    return output;
}

const MAX_DISTANCE = 1.0;
const MAX_ALPHA = 0.95;

fn sampleVoxels(pos: vec3<f32>, lod: f32) -> vec4<f32> {
    return textureSampleLevel(texture3D, textureSampler, pos, lod);
}

fn voxelConeTracing(startPos: vec3f, direction: vec3f, tanHalfAngle: f32) -> vec4<f32> {
    var lod = 0.;
    var color = vec3f(0.);
    var alpha = 0.;
    var occlusion = 0.;

    var voxelWorldSize = uniforms.voxelWorldSize;
    var dist = voxelWorldSize;

    while(dist < MAX_DISTANCE && alpha < MAX_ALPHA) {
        let diameter = max(voxelWorldSize, 2. * tanHalfAngle * dist);
        let lodLevel = log2( diameter / voxelWorldSize);
        var voxelColor = sampleVoxels(startPos + dist * direction, lodLevel);
        var sub = 1. - alpha;
        var aa = voxelColor.a;
        alpha += sub * aa;
        occlusion += sub * aa / (1. + 0.03 * diameter);
        color += sub * voxelColor.rgb;
        dist += diameter;
    }

    return vec4f(color, clamp(1. - occlusion, 0., 1.) );
}

fn getOcclusion(ro: vec3f, rd: vec3f, scaler: f32) -> vec4f{
    var totao = vec4f(0.);
    var sca = 1.;
    var steps = 100.;
    for(var aoi = 1.; aoi < steps; aoi+= 1.) {
        var hr = 0.03 + 2. * aoi * aoi / (steps * steps);
        var p = ro + rd * hr;
        var dd = textureSampleLevel(potentialTexture, textureSampler, p, 0).x;
        var ao = 0.;
        if(dd <= hr) {
            ao = clamp((hr - dd), 0., 1.);
        }
        totao += ao * sca * vec4(1.);
        sca *= scaler;
    }
    var aoCoef = 1.;
    totao = vec4f(totao.rgb, clamp(aoCoef * totao.w, 0., 1.));
    return totao;
}


struct FragmentOutput {
    @location(0) color: vec4f,
    @location(1) velocity: vec4f,
}


@fragment fn fs(input: VertexOutput) -> FragmentOutput {
    
    var eye = normalize(input.position3D - uniforms.cameraPosition);

    var pp = input.position3D; 
    var direction = input.normal;

    var ang = radians(uniforms.coneRotation);
    let s = sin(ang);
    let c = cos(ang);

    var dir1 = vec3f(0, 0, 1);
    var dir2 = vec3f(c, 0, s);
    var dir3 = vec3f(-c, 0, s);
    var dir4 = vec3f(0, c, s);
    var dir5 = vec3f(0, -c, s);

    var zAxis = normalize(direction);
    var xAxis = vec3f(1, 0, 0);
    var yAxis = vec3f(0, 1, 0);
    var UP = vec3f(0, 1, 0);
    var rot = mat3x3f(0, 0, 0, 0, 0, 0, 0, 0, 0);

    if( abs(dot(direction, UP)) > 0.9 ) {

        UP = vec3f(1, 0, 0);

    }

    xAxis = normalize(cross(UP, zAxis));
    yAxis = normalize(cross(zAxis, xAxis));
    rot = mat3x3f(xAxis, yAxis, zAxis);


    dir1 = rot * dir1;
    dir2 = rot * dir2;
    dir3 = rot * dir3;
    dir4 = rot * dir4;
    dir5 = rot * dir5;

    var cone = voxelConeTracing(pp, dir1, uniforms.coneAngle);
    var color =  cone.rgba;

    // cone = voxelConeTracing(pp, dir2, uniforms.coneAngle);
    // color += cone.rgba;

    // cone = voxelConeTracing(pp, dir3, uniforms.coneAngle);
    // color += cone.rgba;

    // cone = voxelConeTracing(pp, dir4, uniforms.coneAngle);
    // color += cone.rgba;

    // cone = voxelConeTracing(pp, dir5, uniforms.coneAngle);
    // color += cone.rgba;

    // color /= 5.;
    color = pow(color, vec4f(0.4545));

    var thicknessPower = 1.;
    var thicknessScale = 1.;

    var transition = uniforms.currentFrame * 2.;
    transition = pow(min(max(0., transition - .6), 1.), 2.);
    var bars = 10.;
    var _x = (floor(bars * pow(input.position2D.x, .8) )) % bars;

    var thicknessAmbient = 1.1 * mix(uniforms.inColor, uniforms.outColor, vec3f(transition));
    
    var specular = pow(max(dot(reflect(input.normal, normalize(vec3(-1., 1., 0.))), eye), 0.), 3.);

    var output: FragmentOutput;
    var decay = max(pow(max(1. - input.position3D.y, 1. - uniforms.mirror), 2.), 0.);

    output.color = vec4( pow((vec3f(specular) * vec3f(0.1) + thicknessAmbient + color.rgb), vec3(1.)) * color.a, 1.);  
    output.velocity = vec4(pow(input.position3D.y, 2.), uniforms.mirror, 0., 1.);

    return output;

}`,Ii=`struct Uniforms {
  direction: vec2f,
  deltaTime: f32,
  motionBlur: f32
}

@group(0) @binding(0) var texture: texture_2d<f32>;
@group(0) @binding(1) var textureVel: texture_2d<f32>;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var<uniform> uniforms: Uniforms;
@group(0) @binding(4) var outputTexture: texture_storage_2d<rgba8unorm, write>;


@compute @workgroup_size(16, 16) fn main(@builtin(global_invocation_id) id: vec3u) {

    var dimensions = textureDimensions(texture).xy;
    var tSize = vec2f(f32(dimensions.x), f32(dimensions.y));
    var uv = vec2f(id.xy) / tSize;

    var data = textureSampleLevel(textureVel, textureSampler, uv, 0);
    var color = vec4(0.);
    var color2 = vec4(0.);
    var sum = 1.;
    var sum2 = 0.;
    var m = 1.;
    var n = 2. + data.g * min(floor(200. * data.r), 100.);
    var steps = i32(n);
    
    for(var i = 0; i <= steps; i ++) {
        var k = f32(i);
        var j = k - 0.5 * f32(steps);
        var tRead = textureSampleLevel(texture, textureSampler, uv + uniforms.direction * j / tSize, 0);
        color += m * tRead;
        color2 += tRead;
        m *= (n - k) / (k + 1.);
        sum += m;
        sum2 += 1.;
    } 

    color /= sum;
    color2 /= sum2;

    var mixer = select(.1, 0.5, data.g > 0.);
    color = mixer * color + (1. - mixer) * color2;

    textureStore(outputTexture, id.xy, color );
}`,Ni=`struct Uniforms {
    inColor: vec3f,
    currentFrame: f32,
    outColor: vec3f
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex fn vs( @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {

  let pos = array(
    // 1st triangle
    vec2f( -1,  1),  // center
    vec2f( 1,  -1),  // right, center
    vec2f( -1,  -1),  // center, top
 
    // 2st triangle
      // center, top
    vec2f( -1,  1),
    vec2f( 1,  1),  // right, center
    vec2f( 1, -1)  // right, top
  );

  var output: VertexOutput;
  output.position = vec4(pos[vertexIndex], 0., 1.);
  output.uv = 0.5 * pos[vertexIndex] + 0.5;
  return output;
}

struct FragmentOutput {
    @location(0) color1: vec4f,
    @location(1) color2: vec4f
}

fn lowerBound(t: f32) -> f32 {

  var amp = 1.;
  var freq = t;
  var output = 0.;

  for(var i = 0; i < 2; i ++) {
    output += amp * cos(freq);
    freq *= 2.;
    amp /= 2.;
  }

  return output;

}

@fragment fn fs(input: VertexOutput) -> FragmentOutput {

    var uv = vec2f(input.uv.x, input.uv.y);

    var transition = uniforms.currentFrame * 2.;
    transition = pow(min(max(0., transition - 0.6), 1.), 2.);
    var bars = 10.;
    var _x = (floor(bars * pow(uv.x, .8) )) % bars;

    var color = mix(uniforms.inColor, uniforms.outColor, vec3f(transition));
    
    
    color += vec3(.4) * clamp(1. - length(uv - 0.5), 0., 1.);

    var output: FragmentOutput;
    output.color1 = vec4f(color, 1.);
    output.color2 = vec4f(0.);

    return output;

}



`,Fi=`struct Uniforms {
  direction: vec2f
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureBase: texture_2d<f32>;
@group(0) @binding(2) var textureIn: texture_2d<f32>;
@group(0) @binding(3) var textureOut: texture_storage_2d<rgba8unorm, write>;


@compute @workgroup_size(16, 16) fn main(@builtin(global_invocation_id) id: vec3u) {

    var data = textureLoad(textureIn, id.xy, 0);
    
    if(length(data.rgb) == 0.) {

        var h = 0.;
        var mirror = 0.;
        for(var i : u32 = 1; i <= 40; i ++) {

            var data1 = textureLoad(textureIn, id.xy + vec2u(uniforms.direction) * i, 0);
            var data2 = textureLoad(textureIn, id.xy - vec2u(uniforms.direction) * i, 0);
            
            if((data1.r > 0. || data2.r > 0.) && (data1.g > 0. || data2.g > 0.) && i32(id.y) - i32(i) > 0) {
                h = max(data1.r, data2.r);
                mirror = 1.;
                break;
            }
        } 

        textureStore(textureOut, id.xy, vec4f(h, mirror, 0., 1.) );

    } else {

        textureStore(textureOut, id.xy, data );

    }
    

}`,Vi=`
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f
};

struct Uniforms {
    resolution: vec2f,
    relativeFrame: f32,
    animationFrame: f32,

    currentLetter: f32,
    brightness: f32,
    contrast: f32,
    gamma: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var inputTexture: texture_2d<f32>;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var logoTexture: texture_2d<f32>;


@vertex fn vs( @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {

  let pos = array(
    // 1st triangle
    vec2f( -1,  1),  // center
    vec2f( 1,  -1),  // right, center
    vec2f( -1,  -1),  // center, top
 
    // 2st triangle
      // center, top
    vec2f( -1,  1),
    vec2f( 1,  1),  // right, center
    vec2f( 1, -1)  // right, top
  );

  var output: VertexOutput;
  output.position = vec4(pos[vertexIndex], 0., 1.);
  output.uv = 0.5 * pos[vertexIndex] + 0.5;
  return output;
}

@fragment fn fs(input: VertexOutput) -> @location(0) vec4f {

    var uv = vec2f(input.uv.x, 1. - input.uv.y);
    var tDim = vec2f(textureDimensions(logoTexture));
    var tAspectRatio = tDim.y / tDim.x;

    var st = 2. * uv - 1.;
    st *= 10. * vec2f(tAspectRatio * uniforms.resolution.x / uniforms.resolution.y, 1.);
    st = 0.5 * st + 0.5;

    var logo = textureSampleLevel(logoTexture, textureSampler, st, 0.);
    var colorLogo = vec4(logo.a);

    //Apply the gamma correction, brightness and contrast
    var color = textureSampleLevel(inputTexture, textureSampler, uv, 0);

    //brightness
    color = color + vec4f(uniforms.brightness);

    //contrast
    var t = (1. - uniforms.contrast) / 2.; 
    color = color * uniforms.contrast + vec4(t);

    //gamma
    color = pow(color, vec4(uniforms.gamma));

    color = vec4f(color.rgb, 1.);

    // var transition = 2.5 * uniforms.relativeFrame;
    // transition = pow(min(max(0., transition - 1.), 1.), 2.);

    // if(uniforms.currentLetter == -2.) {

    //     var transition2 = pow(min(max(0., transition + 0.1), 1.), 2.);

    //     colorLogo = select(colorLogo, vec4(0.), uv.x > transition2);

    //     color = select(colorLogo, color, uv.y > transition);

    // }

    // if(uniforms.currentLetter == -1.) {
    //     color = select(color, colorLogo, uv.y > transition);
    // }
    
    return color;


}



`,_=await Gr(),Bt=120,Hi=Bt,Yi=2e7,hr=4e4,it=1;async function $i(n){const t=await(await fetch(n)).blob();return await createImageBitmap(t,{colorSpaceConversion:"none"})}let Yn=document.body.querySelectorAll(".letter");Yn=Array.from(Yn);const Xi=await $i("./assets/codrops.png"),_t=_.createTexture({size:[1650,200],format:"rgba8unorm",dimension:"2d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});_.queue.copyExternalImageToTexture({source:Xi},{texture:_t},{width:_t.width,height:_t.height});const De=document.querySelector("canvas");De.width=window.innerWidth;De.height=window.innerHeight;const _r=De.getContext("webgpu"),qi=navigator.gpu.getPreferredCanvasFormat();_r.configure({device:_,format:qi});let X=Hi,zt=0,z=[[18,97,115],[78,157,166],[217,166,121],[191,116,73],[140,68,42]],Mt=0,fe=0,de=0,pe;var P={depthTest:1,mixAlpha:1,size:5,deltaTime:.05,coneAngle:.83,coneRotation:45,coneAngle2:.76,coneRotation2:64,gridRadius:5,lightIntensity:14,separation:0,voxelWorldSize:.022,smoothness:12,mc_range:.6,thickness:.5,gamma:1,brightness:0,contrast:1};const Wi=window.location.search,br=new URLSearchParams(Wi),ji=br.get("ui")=="true",mt=br.get("split")=="true"||!1;if(ji){var It=new zi,Nt=It.addFolder("postprocessing");Nt.add(P,"gamma",-1,1).name("gamma").step(.01),Nt.add(P,"brightness",-1,1).name("brightness").step(.01),Nt.add(P,"contrast",-1,3).name("contrast").step(.01);var ye=It.addFolder("marchingCubes");ye.add(P,"smoothness",1,30).name("smoothness").step(1),ye.add(P,"mc_range",.001,1).name("range").step(.001),ye.add(P,"thickness",.001,1).name("thickness").step(.001),ye.add(P,"voxelWorldSize",.001,.1).name("voxel size ").step(1e-4),ye.add(P,"coneAngle2",.1,1,1).name("cone angle ").step(.01),ye.add(P,"coneRotation2",0,90,1).name("cone rotation ").step(1);var $n=It.addFolder("simulation");$n.add(P,"deltaTime",0,.05,0).name("delta time").step(.001),$n.add(P,"separation",0,.4,0).name("separation").step(.01)}const xr=_.createTexture({size:[X,X,X],format:"rgba32float",dimension:"3d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),Tt=_.createTexture({size:[X,X,X],format:"rgba32float",dimension:"3d",mipLevelCount:Math.ceil(Math.log2(X)),usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),Pt=_.createTexture({size:[X,X,X],format:"rgba32float",dimension:"3d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),Ce=_.createSampler({magFilter:"linear",minFilter:"linear",mipmapFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",addressModeW:"clamp-to-edge"});console.log("the PBF resolution is: "+Bt);console.log("the amount of parrticles are: "+hr);let W=new Nr(De),Ki=3,Ji=30;await ei(Bt,hr,xr,W);const[yr,wr,Sr,Zi]=await li(Yi,Pt,Tt);let Qi=new Array(64).fill(0),C=new Float32Array(Qi);const Br=_.createBuffer({label:"uniforms buffer",size:C.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),Tr=_.createBuffer({label:"uniforms mirror buffer",size:C.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),Y=await cn("marching cubes",Mi,it,[{format:"rgba8unorm"},{format:"rgba8unorm"}]),vn=[];vn[0]=_.createBindGroup({label:"binding for non reflective shape",layout:Y.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:yr}},{binding:1,resource:{buffer:Br}},{binding:2,resource:{buffer:wr}},{binding:3,resource:Tt.createView()},{binding:4,resource:Ce},{binding:5,resource:{buffer:Sr}},{binding:6,resource:Pt.createView()}]});vn[1]=_.createBindGroup({label:"binding for reflective shape",layout:Y.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:yr}},{binding:1,resource:{buffer:Tr}},{binding:2,resource:{buffer:wr}},{binding:3,resource:Tt.createView()},{binding:4,resource:Ce},{binding:5,resource:{buffer:Sr}},{binding:6,resource:Pt.createView()}]});const Xn=await ne("post processing",Ii),Pr=new Float32Array([0,1,P.deltaTime,1]),Cr=new Float32Array([1,0,P.deltaTime,1]),sn=_.createBuffer({label:"uniforms X buffer",size:Pr.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),un=_.createBuffer({label:"uniforms Y buffer",size:Cr.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});_.queue.writeBuffer(sn,0,Pr);_.queue.writeBuffer(un,0,Cr);const ve=await cn("background quad",Ni,it,[{format:"rgba8unorm"},{format:"rgba8unorm"}],!1),j=new Float32Array(8),Er=_.createBuffer({label:"background buffer",size:j.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),eo=_.createBindGroup({label:"background bind group",layout:ve.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:Er}}]}),qn=await ne("offset pass",Fi),H=new Float32Array(8),Ar=_.createBuffer({label:"quad buffer",size:H.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),Be=await cn("screen quad",Vi,1,[{format:navigator.gpu.getPreferredCanvasFormat()}],!1);let Ft,oe,ee,He,vt,Ke,Wn,jn,ln;function Ur(){Ft!=null&&(Ft.destroy(),oe.destroy(),ee.destroy(),vt.destroy(),Ke.destroy(),He.destroy(),Wn.destroy(),jn.destroy(),ln.destroy()),Ft=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:1,format:"depth32float",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),ln=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:it,format:"depth32float",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),oe=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:1,format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING}),ee=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:1,format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_SRC}),Wn=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:it,format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),jn=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:it,format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC}),vt=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:1,format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING}),Ke=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:1,format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.COPY_DST}),He=_.createTexture({size:[window.innerWidth,window.innerHeight],sampleCount:1,format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING}),vi(window.innerWidth,window.innerHeight,oe,He,Ce),_.createBindGroup({label:"post processing pass X bind group",layout:Xn.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:oe.createView()},{binding:1,resource:ee.createView()},{binding:2,resource:Ce},{binding:3,resource:{buffer:sn}},{binding:4,resource:He.createView()}]}),_.createBindGroup({label:"post processing pass Y bind group",layout:Xn.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:He.createView()},{binding:1,resource:ee.createView()},{binding:2,resource:Ce},{binding:3,resource:{buffer:un}},{binding:4,resource:oe.createView()}]}),_.createBindGroup({label:"offset X bind group",layout:qn.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:sn}},{binding:1,resource:Ke.createView()},{binding:2,resource:ee.createView()},{binding:3,resource:vt.createView()}]}),_.createBindGroup({label:"offset Y bind group",layout:qn.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:un}},{binding:1,resource:Ke.createView()},{binding:2,resource:vt.createView()},{binding:3,resource:ee.createView()}]}),Be.setBindGroup([{binding:0,resource:{buffer:Ar}},{binding:1,resource:oe.createView()},{binding:2,resource:Ce},{binding:3,resource:_t.createView()}])}window.onresize=Ur;Ur();async function to(){De.width=window.innerWidth,De.height=window.innerHeight,(mt&&zt%2==0||!mt)&&(pe=ni({x:0,y:-18,z:0},P.deltaTime,P.lightIntensity,P.separation,W),pe.relativeFrame==0&&(de=Mt%z.length,fe=(Mt+1)%z.length,Mt++),zr(xr,Pt,P.smoothness)),(mt&&zt%2!=0||!mt)&&(ci(P.mc_range),ii(Tt,_)),W.updateCamera(Ji,window.innerWidth/window.innerHeight,Ki);var n=ae(0,1,0);W.calculateReflection([0,.03,0],n);const e=_.createCommandEncoder({label:"rendering encoder"});j[0]=z[de][0]/255,j[1]=z[de][1]/255,j[2]=z[de][2]/255,j[3]=pe.relativeFrame,j[4]=z[fe][0]/255,j[5]=z[fe][1]/255,j[6]=z[fe][2]/255,_.queue.writeBuffer(Er,0,j),ve.passDescriptor.colorAttachments[0].view=oe.createView(),ve.passDescriptor.colorAttachments[0].loadOp="clear",ve.passDescriptor.colorAttachments[1].view=ee.createView(),ve.passDescriptor.colorAttachments[1].loadOp="clear";const t=e.beginRenderPass(ve.passDescriptor);t.setPipeline(ve.pipeline),t.setBindGroup(0,eo),t.draw(6,1),t.end();const i=16;for(let s=0;s<16;s++)C[s]=W.transformMatrix[s];C[i]=W.position[0],C[i+1]=W.position[1],C[i+2]=W.position[2],C[i+3]=Bt,C[i+4]=P.coneAngle2,C[i+5]=P.coneRotation2,C[i+6]=pe.relativeFrame,C[i+7]=P.voxelWorldSize,C[i+8]=z[de][0]/255,C[i+9]=z[de][1]/255,C[i+10]=z[de][2]/255,C[i+11]=0,C[i+12]=z[fe][0]/255,C[i+13]=z[fe][1]/255,C[i+14]=z[fe][2]/255,C[i+15]=P.thickness,_.queue.writeBuffer(Br,0,C);for(let s=0;s<16;s++)C[s]=W.transformMatrixReflection[s];C[i+11]=1,_.queue.writeBuffer(Tr,0,C),Y.passDescriptor.colorAttachments[0].view=oe.createView(),Y.passDescriptor.colorAttachments[0].loadOp="load",Y.passDescriptor.colorAttachments[1].view=ee.createView(),Y.passDescriptor.colorAttachments[1].loadOp="load",Y.passDescriptor.depthStencilAttachment.view=ln.createView(),Y.passDescriptor.depthStencilAttachment.depthLoadOp="clear";const r=e.beginRenderPass(Y.passDescriptor);r.setPipeline(Y.pipeline),vn.map(s=>{r.setBindGroup(0,s),r.drawIndirect(Zi,4*3)}),r.end(),e.copyTextureToTexture({texture:ee},{texture:Ke},{width:window.innerWidth,height:window.innerHeight}),Be.passDescriptor.colorAttachments[0].view=_r.getCurrentTexture().createView(),Be.passDescriptor.colorAttachments[0].loadOp="clear",H[0]=window.innerWidth,H[1]=window.innerHeight,H[2]=pe.relativeFrame,H[3]=pe.animationFrame,H[4]=pe.currentLetter,H[5]=P.brightness,H[6]=P.contrast,H[7]=P.gamma,_.queue.writeBuffer(Ar,0,H);const o=e.beginRenderPass(Be.passDescriptor);o.setPipeline(Be.pipeline),o.setBindGroup(0,Be.bindGroup),o.draw(6,1),o.end();const a=e.finish();_.queue.submit([a]),zt++}let no=60,Kn=Math.floor(1e3/no),ro=performance.now(),Jn=ro,Vt=0,Ht=0;function Or(n){Vt=n,Ht=Vt-Jn,Ht>Kn&&(Jn=Vt-Ht%Kn,to()),requestAnimationFrame(Or)}requestAnimationFrame(Or);
