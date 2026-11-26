const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Globe3D-B3ACwmrl.js","assets/Chrome-CBQ1-X6E.js","assets/Chrome-BtScXFI8.css"])))=>i.map(i=>d[i]);
import{a as e,c as t,d as n,g as r,i,l as a,n as o,p as s,r as c,u as l}from"./Chrome-CBQ1-X6E.js";var u=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`,d=8294400,f=class{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=g();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(e,t,n,r,i=0,a=0,o=2,s=d,c=[]){if(e?.nodeType===1)this.parentElement=e;else throw Error(`Paper Shaders: parent element must be an HTMLElement`);if(this.ownerDocument=e.ownerDocument,!this.ownerDocument.querySelector(`style[data-paper-shader]`)){let e=this.ownerDocument.createElement(`style`);e.innerHTML=h,e.setAttribute(`data-paper-shader`,``),this.ownerDocument.head.prepend(e)}let l=this.ownerDocument.createElement(`canvas`);this.canvasElement=l,this.parentElement.prepend(l),this.fragmentShader=t,this.providedUniforms=n,this.mipmaps=c,this.currentFrame=a,this.minPixelRatio=o,this.maxPixelCount=s;let u=l.getContext(`webgl2`,{antialias:!1,depth:!1,stencil:!1,...r});if(!u)throw Error(`Paper Shaders: WebGL is not supported in this browser`);this.gl=u,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener(`resize`,this.handleVisualViewportChange),this.setupIntersectionObserver(),this.setSpeed(i),this.parentElement.setAttribute(`data-paper-shader`,``),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener(`visibilitychange`,this.handleDocumentVisibilityChange)}initProgram=()=>{let e=m(this.gl,u,this.fragmentShader);e&&(this.program=e,this.gl.useProgram(e))};setupPositionAttribute=()=>{let e=this.gl.getAttribLocation(this.program,`a_position`),t=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let e={u_time:this.gl.getUniformLocation(this.program,`u_time`),u_pixelRatio:this.gl.getUniformLocation(this.program,`u_pixelRatio`),u_resolution:this.gl.getUniformLocation(this.program,`u_resolution`)};Object.entries(this.providedUniforms).forEach(([t,n])=>{if(e[t]=this.gl.getUniformLocation(this.program,t),n instanceof HTMLImageElement){let n=`${t}AspectRatio`;e[n]=this.gl.getUniformLocation(this.program,n)}}),this.uniformLocations=e};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;intersectionObserver=null;isInViewport=!0;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([e])=>{if(e?.borderBoxSize[0]){let t=e.devicePixelContentBoxSize?.[0];t!==void 0&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=t.inlineSize,this.parentDevicePixelHeight=t.blockSize),this.parentWidth=e.borderBoxSize[0].inlineSize,this.parentHeight=e.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};setupIntersectionObserver=()=>{let e=this.ownerDocument.defaultView;e?.IntersectionObserver&&(this.intersectionObserver=new e.IntersectionObserver(([e])=>{this.isInViewport=e?.isIntersecting??!0,this.updateCurrentSpeed()}),this.intersectionObserver.observe(this.parentElement))};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let e=0,t=0,n=Math.max(1,window.devicePixelRatio),r=visualViewport?.scale??1;if(this.devicePixelsSupported){let i=Math.max(1,this.minPixelRatio/n);e=this.parentDevicePixelWidth*i*r,t=this.parentDevicePixelHeight*i*r}else{let i=Math.max(n,this.minPixelRatio)*r;if(this.isSafari){let e=_(this.ownerDocument);i*=Math.max(1,e)}e=Math.round(this.parentWidth)*i,t=Math.round(this.parentHeight)*i}let i=Math.sqrt(this.maxPixelCount)/Math.sqrt(e*t),a=Math.min(1,i),o=Math.round(e*a),s=Math.round(t*a),c=o/Math.round(this.parentWidth);(this.canvasElement.width!==o||this.canvasElement.height!==s||this.renderScale!==c)&&(this.renderScale=c,this.canvasElement.width=o,this.canvasElement.height=s,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=e=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn(`Tried to render before program or gl was initialized`);return}let t=e-this.lastRenderTime;this.lastRenderTime=e,this.currentSpeed!==0&&(this.currentFrame+=t*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*.001),this.resolutionChanged&&=(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed===0?this.rafId=null:this.requestRender()};requestRender=()=>{this.rafId!==null&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(e,t)=>{if(!t.complete||t.naturalWidth===0)throw Error(`Paper Shaders: image for uniform ${e} must be fully loaded`);let n=this.textures.get(e);n&&this.gl.deleteTexture(n),this.textureUnitMap.has(e)||this.textureUnitMap.set(e,this.textureUnitMap.size);let r=this.textureUnitMap.get(e);this.gl.activeTexture(this.gl.TEXTURE0+r);let i=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,i),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t),this.mipmaps.includes(e)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let a=this.gl.getError();if(a!==this.gl.NO_ERROR||i===null){console.error(`Paper Shaders: WebGL error when uploading texture:`,a);return}this.textures.set(e,i);let o=this.uniformLocations[e];if(o){this.gl.uniform1i(o,r);let n=`${e}AspectRatio`,i=this.uniformLocations[n];if(i){let e=t.naturalWidth/t.naturalHeight;this.gl.uniform1f(i,e)}}};areUniformValuesEqual=(e,t)=>e===t?!0:Array.isArray(e)&&Array.isArray(t)&&e.length===t.length?e.every((e,n)=>this.areUniformValuesEqual(e,t[n])):!1;setUniformValues=e=>{Object.entries(e).forEach(([e,t])=>{let n=t;if(t instanceof HTMLImageElement&&(n=`${t.src.slice(0,200)}|${t.naturalWidth}x${t.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[e],n))return;this.uniformCache[e]=n;let r=this.uniformLocations[e];if(!r)console.warn(`Uniform location for ${e} not found`);else if(t instanceof HTMLImageElement)this.setTextureUniform(e,t);else if(Array.isArray(t)){let n=null,i=null;if(t[0]!==void 0&&Array.isArray(t[0])){let r=t[0].length;if(t.every(e=>e.length===r))n=t.flat(),i=r;else{console.warn(`All child arrays must be the same length for ${e}`);return}}else n=t,i=n.length;switch(i){case 2:this.gl.uniform2fv(r,n);break;case 3:this.gl.uniform3fv(r,n);break;case 4:this.gl.uniform4fv(r,n);break;case 9:this.gl.uniformMatrix3fv(r,!1,n);break;case 16:this.gl.uniformMatrix4fv(r,!1,n);break;default:console.warn(`Unsupported uniform array length: ${i}`)}}else typeof t==`number`?this.gl.uniform1f(r,t):typeof t==`boolean`?this.gl.uniform1i(r,+!!t):console.warn(`Unsupported uniform type for ${e}: ${typeof t}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=e=>{this.currentFrame=e,this.lastRenderTime=performance.now(),this.renderUnlessAnimating()};setSpeed=(e=1)=>{this.speed=e,this.updateCurrentSpeed()};updateCurrentSpeed=()=>{this.setCurrentSpeed(this.ownerDocument.hidden||!this.isInViewport?0:this.speed)};setCurrentSpeed=e=>{this.currentSpeed=e,this.rafId===null&&e!==0&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),this.rafId!==null&&e===0&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(e=d)=>{this.maxPixelCount=e,this.handleResize()};setMinPixelRatio=(e=2)=>{this.minPixelRatio=e,this.handleResize()};setUniforms=e=>{this.setUniformValues(e),this.providedUniforms={...this.providedUniforms,...e},this.renderUnlessAnimating()};renderUnlessAnimating=()=>{this.rafId===null&&this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.updateCurrentSpeed()};dispose=()=>{this.hasBeenDisposed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(e=>{this.gl.deleteTexture(e)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.gl.getExtension(`WEBGL_lose_context`)?.loseContext(),this.resizeObserver&&=(this.resizeObserver.disconnect(),null),this.intersectionObserver&&=(this.intersectionObserver.disconnect(),null),visualViewport?.removeEventListener(`resize`,this.handleVisualViewportChange),this.ownerDocument.removeEventListener(`visibilitychange`,this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}};function p(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(`An error occurred compiling the shaders: `+e.getShaderInfoLog(r)),e.deleteShader(r),null)):null}function m(e,t,n){let r=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT),i=r?r.precision:null;i&&i<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,`precision highp float;`),n=n.replace(/precision\s+(lowp|mediump)\s+float/g,`precision highp float`).replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,`$1 highp $3`));let a=p(e,e.VERTEX_SHADER,t),o=p(e,e.FRAGMENT_SHADER,n);if(!a||!o)return null;let s=e.createProgram();return s?(e.attachShader(s,a),e.attachShader(s,o),e.linkProgram(s),e.getProgramParameter(s,e.LINK_STATUS)?(e.detachShader(s,a),e.detachShader(s,o),e.deleteShader(a),e.deleteShader(o),s):(console.error(`Unable to initialize the shader program: `+e.getProgramInfoLog(s)),e.deleteProgram(s),e.deleteShader(a),e.deleteShader(o),null)):null}var h=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function g(){let e=navigator.userAgent.toLowerCase();return e.includes(`safari`)&&!e.includes(`chrome`)&&!e.includes(`android`)}function _(e){let t=visualViewport?.scale??1,n=visualViewport?.width??window.innerWidth,r=window.innerWidth-e.documentElement.clientWidth,i=t*n+r,a=outerWidth/i,o=Math.round(100*a);return o%5==0?o/100:o===33?1/3:o===67?2/3:o===133?4/3:a}var v={fit:`contain`,scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},y={none:0,contain:1,cover:2},b=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,x=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,S=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`,C=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,w=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,T={maxColorCount:10},E=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${T.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;

in vec2 v_objectUV;
out vec4 fragColor;

${b}
${x}
${S}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + fract(float(i) / 3.) * .9;
  float c = .8 + fract(float(i + 1) / 4.);

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 uv = v_objectUV;
  uv += .5;
  vec2 grainUV = uv * 1000.;

  float mixerGrain = 0.;
  if (u_grainMixer > 0.) {
    mixerGrain = .4 * u_grainMixer * (noise(grainUV, vec2(0.)) - .5);
  }

  const float firstFrameOffset = 41.5;
  float t = .5 * (u_time + firstFrameOffset);

  float radius = smoothstep(0., 1., length(uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    uv.x += u_distortion * center / i * sin(t + i * .4 * smoothstep(.0, 1., uv.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., uv.y));
    uv.y += u_distortion * center / i * cos(t + i * 2. * smoothstep(.0, 1., uv.x));
  }

  vec2 uvRotated = uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  for (int i = 0; i < ${T.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, t) + mixerGrain;
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= max(1e-4, totalWeight);
  opacity /= max(1e-4, totalWeight);

  if (u_grainOverlay > 0.) {
    float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
    grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
    grainOverlay = pow(grainOverlay, 1.3);

    float grainOverlayV = grainOverlay * 2. - 1.;
    vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
    float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
    grainOverlayStrength = pow(grainOverlayStrength, .8);
    color = mix(color, grainOverlayColor, .35 * grainOverlayStrength);

    opacity += .5 * grainOverlayStrength;
  }
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`,D=`#version 300 es
precision mediump float;

uniform sampler2D u_image;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${b}
${x}
${w}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  // u_contour is applied in 2 separate ranges:
  // - 0 to .4 sets the edge hardness, saturated above .4 (both branches below)
  // - .5 to 1 warps the stripes direction along the edges, inactive below .5 (see u_contour range 2)
  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  // u_contour range 2
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${C}

  fragColor = vec4(color, opacity);
}
`,O={measurePerformance:!1,workingSize:512,iterations:40};function k(e){let t=document.createElement(`canvas`),n=t.getContext(`2d`),r=typeof e==`string`&&e.startsWith(`blob:`);return new Promise((i,a)=>{if(!e||!n){a(Error(`Invalid file or canvas context`));return}let o=r&&fetch(e).then(e=>e.headers.get(`Content-Type`)),s=new Image;s.crossOrigin=`anonymous`;let c=performance.now();s.onload=async()=>{let r,l=await o;r=l?l===`image/svg+xml`:typeof e==`string`?e.endsWith(`.svg`)||e.startsWith(`data:image/svg+xml`):e.type===`image/svg+xml`;let u=s.width||s.naturalWidth,d=s.height||s.naturalHeight;if(r){let e=4096,t=u/d;u>d?(u=e,d=e/t):(d=e,u=e*t),s.width=u,s.height=d}let f=Math.min(u,d),p=O.workingSize/f,m=Math.round(u*p),h=Math.round(d*p);O.measurePerformance&&(console.log(`[Processing Mode]`),console.log(`  Original: ${u}\xD7${d}`),console.log(`  Working: ${m}\xD7${h} (${(p*100).toFixed(1)}% scale)`),p<1&&console.log(`  Speedup: ~${Math.round(1/(p*p))}\xD7`)),t.width=u,t.height=d;let g=document.createElement(`canvas`);g.width=m,g.height=h;let _=g.getContext(`2d`);_.drawImage(s,0,0,m,h);let v=performance.now(),y=_.getImageData(0,0,m,h).data,b=new Uint8Array(m*h),x=new Uint8Array(m*h),S=0;for(let e=0,t=0;e<y.length;e+=4,t++){let n=y[e+3]===0?0:1;b[t]=n,S+=n}let C=[],w=[];for(let e=0;e<h;e++)for(let t=0;t<m;t++){let n=e*m+t;if(!b[n])continue;let r=!1;r=t===0||t===m-1||e===0||e===h-1||!b[n-1]||!b[n+1]||!b[n-m]||!b[n+m]||!b[n-m-1]||!b[n-m+1]||!b[n+m-1]||!b[n+m+1],r?(x[n]=1,C.push(n)):w.push(n)}O.measurePerformance&&(console.log(`[Mask Building] Time: ${(performance.now()-v).toFixed(2)}ms`),console.log(`  Shape pixels: ${S} / ${m*h} (${(S/(m*h)*100).toFixed(1)}%)`),console.log(`  Interior pixels: ${w.length}`),console.log(`  Boundary pixels: ${C.length}`));let T=A(b,x,new Uint32Array(w),new Uint32Array(C),m,h),E=performance.now(),D=j(T,b,x,m,h);O.measurePerformance&&console.log(`[Poisson Solve] Time: ${(performance.now()-E).toFixed(2)}ms`);let k=0,M;for(let e=0;e<w.length;e++){let t=w[e];D[t]>k&&(k=D[t])}let N=document.createElement(`canvas`);N.width=m,N.height=h;let P=N.getContext(`2d`),F=P.createImageData(m,h);for(let e=0;e<h;e++)for(let t=0;t<m;t++){let n=e*m+t,r=n*4;if(!b[n])F.data[r]=255,F.data[r+1]=255,F.data[r+2]=255,F.data[r+3]=0;else{let e=255*(1-D[n]/k);F.data[r]=e,F.data[r+1]=e,F.data[r+2]=e,F.data[r+3]=255}}P.putImageData(F,0,0),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality=`high`,n.drawImage(N,0,0,m,h,0,0,u,d);let I=n.getImageData(0,0,u,d),L=document.createElement(`canvas`);L.width=u,L.height=d;let R=L.getContext(`2d`);R.drawImage(s,0,0,u,d);let z=R.getImageData(0,0,u,d);for(let e=0;e<I.data.length;e+=4){let t=z.data[e+3],n=I.data[e+3];t===0?(I.data[e]=255,I.data[e+1]=0):(I.data[e]=n===0?0:I.data[e],I.data[e+1]=t),I.data[e+2]=255,I.data[e+3]=255}n.putImageData(I,0,0),M=I,t.toBlob(e=>{if(!e)a(Error(`Failed to create PNG blob`));else{if(O.measurePerformance){let e=performance.now()-c;if(console.log(`[Total Processing Time] ${e.toFixed(2)}ms`),p<1){let t=e*(u*d/(m*h))**1.5;console.log(`[Estimated time at full resolution] ~${t.toFixed(0)}ms`),console.log(`[Time saved] ~${(t-e).toFixed(0)}ms (${Math.round(t/e)}\xD7 faster)`)}}i({imageData:M,pngBlob:e})}},`image/png`)},s.onerror=()=>a(Error(`Failed to load image`)),s.src=typeof e==`string`?e:URL.createObjectURL(e)})}function A(e,t,n,r,i,a){let o=n.length,s=new Int32Array(o*4);for(let t=0;t<o;t++){let r=n[t],o=r%i,c=Math.floor(r/i);s[t*4+0]=o<i-1&&e[r+1]?r+1:-1,s[t*4+1]=o>0&&e[r-1]?r-1:-1,s[t*4+2]=c>0&&e[r-i]?r-i:-1,s[t*4+3]=c<a-1&&e[r+i]?r+i:-1}return{interiorPixels:n,boundaryPixels:r,pixelCount:o,neighborIndices:s}}function j(e,t,n,r,i){let a=O.iterations,o=.01,s=new Float32Array(r*i),{interiorPixels:c,neighborIndices:l,pixelCount:u}=e,d=performance.now(),f=1.9,p=[],m=[];for(let e=0;e<u;e++){let t=c[e];(t%r+Math.floor(t/r))%2==0?p.push(e):m.push(e)}for(let e=0;e<a;e++){for(let e of p){let t=c[e],n=l[e*4+0],r=l[e*4+1],i=l[e*4+2],a=l[e*4+3],u=0;n>=0&&(u+=s[n]),r>=0&&(u+=s[r]),i>=0&&(u+=s[i]),a>=0&&(u+=s[a]),s[t]=f*((o+u)/4)+-.8999999999999999*s[t]}for(let e of m){let t=c[e],n=l[e*4+0],r=l[e*4+1],i=l[e*4+2],a=l[e*4+3],u=0;n>=0&&(u+=s[n]),r>=0&&(u+=s[r]),i>=0&&(u+=s[i]),a>=0&&(u+=s[a]),s[t]=f*((o+u)/4)+-.8999999999999999*s[t]}}if(O.measurePerformance){let e=performance.now()-d;console.log(`[Optimized Poisson Solver (SOR \u03C9=${f})]`),console.log(`  Working size: ${r}\xD7${i}`),console.log(`  Iterations: ${a}`),console.log(`  Time: ${e.toFixed(2)}ms`),console.log(`  Interior pixels processed: ${u}`),console.log(`  Speed: ${(a*u/(e*1e3)).toFixed(2)} Mpixels/sec`)}return s}var M={none:0,circle:1,daisy:2,diamond:3,metaballs:4};function N(e){if(Array.isArray(e))return e.length===4?e:e.length===3?[...e,1]:z;if(typeof e!=`string`)return z;let t,n,r,i=1;if(e.startsWith(`#`))[t,n,r,i]=P(e);else if(e.startsWith(`rgb`)){let a=F(e);if(a===null)return z;[t,n,r,i]=a}else if(e.startsWith(`hsl`)){let a=I(e);if(a===null)return z;[t,n,r,i]=L(a)}else return console.error(`Unsupported color format`,e),z;return[R(t,0,1),R(n,0,1),R(r,0,1),R(i,0,1)]}function P(e){return e=e.replace(/^#/,``),(e.length===3||e.length===4)&&(e=e.split(``).map(e=>e+e).join(``)),e.length===6&&(e+=`ff`),/^[0-9a-f]{8}$/i.test(e)?[parseInt(e.slice(0,2),16)/255,parseInt(e.slice(2,4),16)/255,parseInt(e.slice(4,6),16)/255,parseInt(e.slice(6,8),16)/255]:(console.warn(`Invalid hex color`),z)}function F(e){let t=e.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??`0`)/255,parseInt(t[2]??`0`)/255,parseInt(t[3]??`0`)/255,t[4]===void 0?1:parseFloat(t[4])]:null}function I(e){let t=e.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??`0`),parseInt(t[2]??`0`),parseInt(t[3]??`0`),t[4]===void 0?1:parseFloat(t[4])]:null}function L(e){let[t,n,r,i]=e,a=t/360,o=n/100,s=r/100,c,l,u;if(n===0)c=l=u=s;else{let e=(e,t,n)=>(n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*(2/3-n)*6:e),t=s<.5?s*(1+o):s+o-s*o,n=2*s-t;c=e(n,t,a+1/3),l=e(n,t,a),u=e(n,t,a-1/3)}return[c,l,u,i]}var R=(e,t,n)=>Math.min(Math.max(e,t),n),z=[.5,.5,.5,1],B=r(s(),1);function ee(e){let t=B.useRef(void 0),n=B.useCallback(t=>{let n=e.map(e=>{if(e!=null){if(typeof e==`function`){let n=e,r=n(t);return typeof r==`function`?r:()=>{n(null)}}return e.current=t,()=>{e.current=null}}});return()=>{n.forEach(e=>e?.())}},e);return B.useMemo(()=>e.every(e=>e==null)?null:e=>{t.current&&=(t.current(),void 0),e!=null&&(t.current=n(e))},e)}function V(e){if(e.naturalWidth<1024&&e.naturalHeight<1024){if(e.naturalWidth<1||e.naturalHeight<1)return;let t=e.naturalWidth/e.naturalHeight;e.width=Math.round(t>1?1024*t:1024),e.height=Math.round(t>1?1024:1024/t)}}var H=l();async function U(e){let t={},n=[],r=e=>{try{return e.startsWith(`/`)||new URL(e),!0}catch{return!1}},i=e=>{try{return!e.startsWith(`/`)&&new URL(e,window.location.origin).origin!==window.location.origin}catch{return!1}};return Object.entries(e).forEach(([e,a])=>{if(typeof a==`string`){let o=a||`data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`;if(!r(o)){console.warn(`Uniform "${e}" has invalid URL "${o}". Skipping image loading.`);return}let s=new Promise((n,r)=>{let a=new Image;i(o)&&(a.crossOrigin=`anonymous`),a.onload=()=>{V(a),t[e]=a,n()},a.onerror=()=>{console.error(`Could not set uniforms. Failed to load image at ${o}`),r()},a.src=o});n.push(s)}else if(a instanceof HTMLImageElement){let r=a.decode().then(()=>{V(a),t[e]=a});n.push(r)}else t[e]=a}),await Promise.all(n),t}var W=(0,B.forwardRef)(function({fragmentShader:e,uniforms:t,webGlContextAttributes:n,speed:r=0,frame:i=0,width:a,height:o,minPixelRatio:s,maxPixelCount:c,mipmaps:l,style:u,...d},p){let[m,h]=(0,B.useState)(!1),g=(0,B.useRef)(null),_=(0,B.useRef)(null),v=(0,B.useRef)(n);(0,B.useEffect)(()=>((async()=>{let n=await U(t);g.current&&!_.current&&(_.current=new f(g.current,e,n,v.current,r,i,s,c,l),h(!0))})(),()=>{_.current?.dispose(),_.current=null}),[e]),(0,B.useEffect)(()=>{let e=!1;return(async()=>{let n=await U(t);e||_.current?.setUniforms(n)})(),()=>{e=!0}},[t,m]),(0,B.useEffect)(()=>{_.current?.setSpeed(r)},[r,m]),(0,B.useEffect)(()=>{_.current?.setMaxPixelCount(c)},[c,m]),(0,B.useEffect)(()=>{_.current?.setMinPixelRatio(s)},[s,m]),(0,B.useEffect)(()=>{_.current?.setFrame(i)},[i,m]);let y=ee([g,p]);return(0,H.jsx)(`div`,{ref:y,style:a!==void 0||o!==void 0?{width:typeof a==`string`&&isNaN(+a)===!1?+a:a,height:typeof o==`string`&&isNaN(+o)===!1?+o:o,...u}:u,...d})});W.displayName=`ShaderMount`;function te(e,t){if(Object.keys(e).length!==Object.keys(t).length)return!1;for(let n in e)if(n===`colors`){let n=Array.isArray(e.colors),r=Array.isArray(t.colors);if(!n||!r){if(Object.is(e.colors,t.colors)===!1)return!1;continue}if(e.colors?.length!==t.colors?.length||!e.colors?.every((e,n)=>e===t.colors?.[n]))return!1}else if(Object.is(e[n],t[n])===!1)return!1;return!0}var G={name:`Default`,params:{...v,speed:1,frame:0,colors:[`#e0eaff`,`#241d9a`,`#f75092`,`#9f50d3`],distortion:.8,swirl:.1,grainMixer:0,grainOverlay:0}};({...v}),{...v},{...v};var ne=(0,B.memo)(function({speed:e=G.params.speed,frame:t=G.params.frame,colors:n=G.params.colors,distortion:r=G.params.distortion,swirl:i=G.params.swirl,grainMixer:a=G.params.grainMixer,grainOverlay:o=G.params.grainOverlay,fit:s=G.params.fit,rotation:c=G.params.rotation,scale:l=G.params.scale,originX:u=G.params.originX,originY:d=G.params.originY,offsetX:f=G.params.offsetX,offsetY:p=G.params.offsetY,worldWidth:m=G.params.worldWidth,worldHeight:h=G.params.worldHeight,...g}){let _={u_colors:n.map(N),u_colorsCount:n.length,u_distortion:r,u_swirl:i,u_grainMixer:a,u_grainOverlay:o,u_fit:y[s],u_rotation:c,u_scale:l,u_offsetX:f,u_offsetY:p,u_originX:u,u_originY:d,u_worldWidth:m,u_worldHeight:h};return(0,H.jsx)(W,{...g,speed:e,frame:t,fragmentShader:E,uniforms:_})},te),K=`data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`,re=e=>typeof e==`object`&&typeof e.then==`function`,q=[];function ie(e,t){if(e===t)return!0;if(!e||!t)return!1;let n=e.length;if(t.length!==n)return!1;for(let r=0;r<n;r++)if(e[r]!==t[r])return!1;return!0}function ae(e,t=null){t===null&&(t=[e]);for(let e of q)if(ie(t,e.keys)){if(Object.prototype.hasOwnProperty.call(e,`error`))throw e.error;if(Object.prototype.hasOwnProperty.call(e,`response`))return e.response;throw e.promise}let n={keys:t,promise:(re(e)?e:e(...t)).then(e=>{n.response=e}).catch(e=>n.error=e)};throw q.push(n),n.promise}var oe=(e,t)=>ae(e,t),J={name:`Default`,params:{...v,scale:.6,speed:1,frame:0,colorBack:`#AAAAAC`,colorTint:`#ffffff`,distortion:.07,repetition:2,shiftRed:.3,shiftBlue:.3,contour:.4,softness:.1,angle:70,shape:`diamond`}};({...v}),{...v},{...v};var se=(0,B.memo)(function({colorBack:e=J.params.colorBack,colorTint:t=J.params.colorTint,speed:n=J.params.speed,frame:r=J.params.frame,image:i=``,contour:a=J.params.contour,distortion:o=J.params.distortion,softness:s=J.params.softness,repetition:c=J.params.repetition,shiftRed:l=J.params.shiftRed,shiftBlue:u=J.params.shiftBlue,angle:d=J.params.angle,shape:f=J.params.shape,suspendWhenProcessingImage:p=!1,fit:m=J.params.fit,scale:h=J.params.scale,rotation:g=J.params.rotation,originX:_=J.params.originX,originY:v=J.params.originY,offsetX:b=J.params.offsetX,offsetY:x=J.params.offsetY,worldWidth:S=J.params.worldWidth,worldHeight:C=J.params.worldHeight,...w}){let T=typeof i==`string`?i:i.src,[E,O]=(0,B.useState)(K),A;A=p&&typeof window<`u`&&T?oe(()=>k(T).then(e=>URL.createObjectURL(e.pngBlob)),[T,`liquid-metal`]):E,(0,B.useLayoutEffect)(()=>{if(p)return;if(!T){O(K);return}let e,t=!0;return k(T).then(n=>{t&&(e=URL.createObjectURL(n.pngBlob),O(e))}),()=>{t=!1}},[T,p]);let j={u_colorBack:N(e),u_colorTint:N(t),u_image:A,u_contour:a,u_distortion:o,u_softness:s,u_repetition:c,u_shiftRed:l,u_shiftBlue:u,u_angle:d,u_isImage:!!i,u_shape:M[f],u_fit:y[m],u_scale:h,u_rotation:g,u_offsetX:b,u_offsetY:x,u_originX:_,u_originY:v,u_worldWidth:S,u_worldHeight:C};return(0,H.jsx)(W,{...w,speed:n,frame:r,fragmentShader:D,mipmaps:[`u_image`],uniforms:j})}),ce=n(),le=`modulepreload`,ue=function(e){return`/`+e},de={},fe=function(e){return e.pathname.endsWith(`.css`)},pe=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},Y=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=ue(t,n);let r=s(t),i=fe(r);return pe(de,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:le,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},me=`Introducing`,he=`KabirUI`,ge=`5`;function X({text:e,start:t}){return(0,H.jsx)(H.Fragment,{children:e.split(``).map((e,n)=>(0,H.jsx)(`span`,{className:`letter`,style:{"--i":t+n},"aria-hidden":`true`,children:e},n))})}function _e(){let[e,n]=(0,B.useState)(!1),[r,i]=(0,B.useState)(null),a=(0,B.useRef)(null);return(0,B.useEffect)(()=>{let e=!1;return Y(async()=>{let{init:e}=await import(`./dist-B1mgVnU8.js`);return{init:e}},[]).then(({init:e})=>e()).then(()=>{e||i(`WebGPU ready`)}).catch(()=>{e||i(`WebGPU not available`)}),()=>{e=!0}},[]),(0,B.useEffect)(()=>{if(!e||!a.current)return;let t=a.current,n=null,r=0,i=!1;return Y(async()=>{let{default:e}=await import(`./index.es-Drif-0q-.js`);return{default:e}},[]).then(({default:e})=>{i||(n=new e(t),n.setConfig({colorful:!0,splatRadius:.2,bloom:!1}),n.start(),r=window.setInterval(()=>n?.multipleSplats(2),2500))}),()=>{i=!0,window.clearInterval(r),n?.stop(),t.querySelectorAll(`canvas`).forEach(e=>e.remove())}},[e]),(0,H.jsxs)(`section`,{className:`hero-section`,id:`launch`,"aria-labelledby":`hero-title`,children:[(0,H.jsx)(`div`,{className:`hero-aurora`,"aria-hidden":`true`}),(0,H.jsx)(`div`,{className:`hero-mesh`,"aria-hidden":`true`,children:(0,H.jsx)(ne,{colors:[`#ffb4c8`,`#b4dcff`,`#d5e8be`,`#ffe696`],style:{width:`100%`,height:`100%`}})}),e?(0,H.jsx)(`div`,{className:`hero-fluid`,ref:a,"aria-hidden":`true`}):null,(0,H.jsx)(`div`,{className:`hero-panel glass`,children:(0,H.jsxs)(`div`,{className:`hero-copy`,children:[(0,H.jsx)(`div`,{className:`hero-icon`,"aria-hidden":`true`,children:(0,H.jsx)(se,{image:`assets/kabirui-icon.png`,style:{width:88,height:88}})}),(0,H.jsxs)(`h1`,{id:`hero-title`,"aria-label":`Introducing KabirUI 5`,children:[(0,H.jsx)(`span`,{className:`hero-line`,children:(0,H.jsx)(X,{text:me,start:0})}),(0,H.jsx)(`br`,{}),(0,H.jsxs)(`span`,{className:`hero-line hero-name`,children:[(0,H.jsx)(X,{text:he,start:11}),` `,(0,H.jsx)(X,{text:ge,start:18})]})]}),(0,H.jsx)(`p`,{className:`hero-sub`,children:`Set up your wallpapers, widgets and layout with KabirUI. No ads or trackers.`}),(0,H.jsxs)(`div`,{className:`hero-actions`,children:[(0,H.jsxs)(`a`,{className:`btn-primary`,href:t,target:`_blank`,rel:`noopener`,children:[`Get it on Google Play`,` `,(0,H.jsx)(`svg`,{className:`link-icon`,width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,H.jsx)(`path`,{d:`M7 17 17 7M7 7h10v10`})})]}),(0,H.jsx)(`span`,{className:`hero-reassurance`,children:`Free. No ads. No trackers.`}),(0,H.jsxs)(`a`,{className:`hero-explore`,href:`#features`,children:[`Explore features`,` `,(0,H.jsx)(`svg`,{className:`link-icon`,width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,H.jsx)(`path`,{d:`M12 5v14m-6-6 6 6 6-6`})})]})]}),(0,H.jsxs)(`button`,{type:`button`,className:`fluid-toggle`,"aria-pressed":e,onClick:()=>n(e=>!e),children:[`Fluid background: `,e?`on`:`off`,r?` · ${r}`:``]})]})})]})}var ve=`https://kabirui.substack.com/api/v1/free`,Z=`kabirui-newsletter-popup-seen`;function Q(){return(0,H.jsxs)(`form`,{className:`newsletter-form`,action:ve,method:`post`,target:`_blank`,children:[(0,H.jsx)(`input`,{type:`email`,name:`email`,placeholder:`Your email address`,"aria-label":`Email address`,required:!0}),(0,H.jsx)(`button`,{className:`btn-primary`,type:`submit`,children:`Subscribe`})]})}function ye(){return(0,H.jsxs)(`section`,{className:`newsletter-section`,id:`newsletter`,"aria-labelledby":`newsletter-title`,children:[(0,H.jsx)(`h2`,{id:`newsletter-title`,children:`KabirUI newsletter`}),(0,H.jsx)(`p`,{children:`Get KabirUI updates in your email. New versions, new features, nothing else.`}),(0,H.jsx)(Q,{}),(0,H.jsx)(`p`,{className:`newsletter-note`,children:`Free, on Substack. Unsubscribe anytime.`})]})}function be(){let[e,t]=(0,B.useState)(!1),n=()=>{t(!1);try{localStorage.setItem(Z,`1`)}catch{}};return(0,B.useEffect)(()=>{try{if(localStorage.getItem(Z))return}catch{}let e=window.setTimeout(()=>t(!0),1e4);return()=>window.clearTimeout(e)},[]),(0,B.useEffect)(()=>{if(!e)return;let t=e=>{e.key===`Escape`&&n()};return document.addEventListener(`keydown`,t),()=>document.removeEventListener(`keydown`,t)},[e]),e?(0,H.jsx)(`div`,{className:`newsletter-popup open`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`newsletter-popup-title`,onClick:e=>{e.target===e.currentTarget&&n()},children:(0,H.jsxs)(`div`,{className:`newsletter-popup-card`,children:[(0,H.jsx)(`button`,{className:`newsletter-popup-close`,type:`button`,"aria-label":`Close`,onClick:n,children:`×`}),(0,H.jsx)(`h2`,{id:`newsletter-popup-title`,children:`KabirUI newsletter`}),(0,H.jsx)(`p`,{children:`Get KabirUI updates in your email. New versions, new features, nothing else.`}),(0,H.jsx)(Q,{})]})}):null}var xe=(0,B.lazy)(()=>Y(()=>import(`./Globe3D-B3ACwmrl.js`),__vite__mapDeps([0,1,2])));function $({className:e,...t}){let[n,r]=(0,B.useState)(!0);return(0,H.jsx)(`img`,{...t,"data-skeleton":!0,className:e?`${e}${n?` is-loading`:``}`:void 0,onLoad:()=>r(!1),onError:()=>r(!1)})}function Se(){return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(a,{}),(0,H.jsx)(e,{}),(0,H.jsx)(c,{}),(0,H.jsxs)(`main`,{id:`main-content`,children:[(0,H.jsx)(_e,{}),(0,H.jsxs)(`section`,{className:`preview-section`,"aria-label":`A closer look at KabirUI`,children:[(0,H.jsxs)(`div`,{className:`hero-stage`,children:[(0,H.jsx)($,{className:`preview-side preview-left`,src:`assets/launcher_live_drawer.png`,alt:`KabirUI app drawer`,loading:`lazy`,width:`1080`,height:`2340`}),(0,H.jsx)($,{className:`preview-side preview-right`,src:`assets/launcher_live_search.png`,alt:`KabirUI Quick Search`,loading:`lazy`,width:`1080`,height:`2340`}),(0,H.jsx)(`div`,{className:`phone-3d-wrapper`,children:(0,H.jsx)(`div`,{className:`phone-chassis`,children:(0,H.jsx)(`div`,{className:`phone-screen`,children:(0,H.jsx)($,{src:`assets/launcher_real_home.png`,alt:`KabirUI home screen with clock and battery widgets`,width:`1080`,height:`2340`})})})})]}),(0,H.jsxs)(`p`,{className:`preview-caption`,children:[(0,H.jsx)(`span`,{children:`58 clock faces`}),(0,H.jsx)(`span`,{children:`58 battery designs`})]})]}),(0,H.jsxs)(`section`,{className:`globe-section`,"aria-label":`Where KabirUI is made`,children:[(0,H.jsx)(B.Suspense,{fallback:null,children:(0,H.jsx)(xe,{})}),(0,H.jsxs)(`p`,{className:`preview-caption`,children:[(0,H.jsx)(`span`,{children:`Forest City, Johor`}),(0,H.jsx)(`span`,{children:`Drag to spin`})]})]}),(0,H.jsx)(`p`,{className:`home-screen-line`,children:`Your Android home screen`}),(0,H.jsxs)(`section`,{className:`features-section`,id:`features`,children:[(0,H.jsxs)(`div`,{className:`section-head`,children:[(0,H.jsx)(`h2`,{children:`Features`}),(0,H.jsx)(`p`,{children:`Choose your wallpapers, widgets and layout. Search locally on your phone.`})]}),(0,H.jsxs)(`section`,{className:`feature-block ui-card-3d`,children:[(0,H.jsx)(`div`,{className:`ui-card-phone`,children:(0,H.jsx)($,{src:`assets/launcher_real_home.png`,loading:`lazy`,alt:`KabirUI Home Screen with Clock and Battery Widgets`,width:`1080`,height:`2340`})}),(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{id:`wallpapers`,children:`Home & widgets`}),(0,H.jsx)(`p`,{children:`Choose from 58 clock faces and 58 battery designs. Change the colours and style to suit your home screen.`})]})]}),(0,H.jsxs)(`section`,{className:`feature-block ui-card-3d`,children:[(0,H.jsx)(`div`,{className:`ui-card-phone`,children:(0,H.jsx)($,{src:`assets/launcher_live_drawer.png`,loading:`lazy`,alt:`KabirUI app drawer`,width:`1080`,height:`2340`})}),(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Flexible layouts`}),(0,H.jsx)(`p`,{children:`Set up your home screen with a layout that works for you.`})]})]}),(0,H.jsxs)(`section`,{className:`feature-block ui-card-3d`,children:[(0,H.jsx)(`div`,{className:`ui-card-phone`,children:(0,H.jsx)($,{src:`assets/launcher_live_search.png`,loading:`lazy`,alt:`KabirUI Quick Search`,width:`1080`,height:`2340`})}),(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Search`}),(0,H.jsx)(`p`,{children:`Find apps, settings, and files. Call or message someone using Android’s contact picker without giving KabirUI access to your contacts. Local search stays on your phone. Web suggestions send your query to Google. They are on by default, and you can turn them off in Settings.`})]})]})]}),(0,H.jsxs)(`section`,{className:`features-section`,id:`whats-new`,"aria-labelledby":`whats-new-title`,children:[(0,H.jsxs)(`div`,{className:`section-head`,children:[(0,H.jsx)(`h2`,{id:`whats-new-title`,children:`In version 5.2.0`}),(0,H.jsx)(`p`,{children:`Your apps are easier to find, wallpapers are easier to browse, and optional features are easier to manage.`})]}),(0,H.jsxs)(`div`,{className:`ui-showcase-grid release-grid`,children:[(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Cleaner Quick Search`}),(0,H.jsx)(`p`,{children:`Search shows apps, contacts and files only when there is a match, so the screen stays clear. Web suggestions are easier to scan, and web links open in your own browser.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Your apps first`}),(0,H.jsx)(`p`,{children:`Your installed apps come first in the app drawer. KabirUI shortcuts sit behind one small group you can open when you need them.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Bigger wallpaper previews`}),(0,H.jsx)(`p`,{children:`Wallpaper Market gives the artwork more room. Tap a wallpaper to see it big, and set it right from the preview.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Settings → Features`}),(0,H.jsx)(`p`,{children:`KabirUI Market is now Settings → Features. Google News, Home Modes and Universal Font live there, each with a simple on and off switch.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`25 language choices`}),(0,H.jsx)(`p`,{children:`Pick from 25 languages during setup or in Settings, including seven kinds of English. Some packs are still partly in English while translations are checked.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`New logo and widget fixes`}),(0,H.jsx)(`p`,{children:`KabirUI has a new glass logo. Widgets from other apps now work again on One UI 9.`})]})})]})]}),(0,H.jsxs)(`section`,{className:`features-section`,id:`faq`,"aria-labelledby":`faq-title`,children:[(0,H.jsx)(`div`,{className:`section-head`,children:(0,H.jsx)(`h2`,{id:`faq-title`,children:`Questions`})}),(0,H.jsxs)(`div`,{className:`ui-showcase-grid release-grid`,children:[(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Is KabirUI free?`}),(0,H.jsx)(`p`,{children:`Yes, it is free on Google Play.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Does KabirUI track me or show ads?`}),(0,H.jsx)(`p`,{children:`No ads and no telemetry trackers. Local search stays on your phone.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`Does web search send my query anywhere?`}),(0,H.jsx)(`p`,{children:`Yes, web suggestions are on by default and send your query to Google. You can turn them off in Settings.`})]})}),(0,H.jsx)(`article`,{className:`ui-card-3d`,children:(0,H.jsxs)(`div`,{className:`ui-card-desc`,children:[(0,H.jsx)(`h3`,{children:`What Android version do I need?`}),(0,H.jsx)(`p`,{children:`Android 7.0 or newer.`})]})})]})]}),(0,H.jsxs)(`section`,{className:`support-section`,id:`support`,children:[(0,H.jsxs)(`div`,{className:`support-copy`,children:[(0,H.jsx)(`h2`,{children:`Support`}),(0,H.jsx)(`p`,{children:`KabirUI is made by Kabir Gagneja, an individual developer. It has no ads or trackers. You can support its development on Ko-fi.`}),(0,H.jsx)(`div`,{className:`support-links`,children:(0,H.jsx)(`a`,{className:`btn-glass`,href:`https://instagram.com/kabir_invents`,target:`_blank`,rel:`noopener noreferrer`,children:(0,H.jsx)(`span`,{children:`Follow @kabir_invents`})})})]}),(0,H.jsxs)(`div`,{className:`support-card`,"aria-labelledby":`support-card-title`,children:[(0,H.jsx)(`div`,{className:`support-card-brand`,children:(0,H.jsx)(`img`,{src:`assets/kabirui-icon.png`,alt:``,width:`512`,height:`512`})}),(0,H.jsx)(`h3`,{id:`support-card-title`,children:`Contribute`}),(0,H.jsx)(`p`,{children:`Donations are optional. Ko-fi handles them on its own website.`}),(0,H.jsxs)(`a`,{className:`btn-primary support-card-button`,href:i,target:`_blank`,rel:`noopener noreferrer`,children:[(0,H.jsx)(`span`,{children:`Open Kabir Invents on Ko-fi`}),(0,H.jsx)(`svg`,{className:`link-icon`,width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:(0,H.jsx)(`path`,{d:`M7 17 17 7M7 7h10v10`})})]}),(0,H.jsx)(`span`,{className:`support-card-note`,children:`Opens Ko-fi in a new tab`})]})]}),(0,H.jsx)(ye,{})]}),(0,H.jsx)(o,{}),(0,H.jsx)(be,{})]})}(0,ce.createRoot)(document.getElementById(`root`)).render((0,H.jsx)(B.StrictMode,{children:(0,H.jsx)(Se,{})}));