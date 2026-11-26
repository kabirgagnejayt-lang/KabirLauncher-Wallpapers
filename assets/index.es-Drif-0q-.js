var e=Object.defineProperty,t=(t,n,r)=>n in t?e(t,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[n]=r,n=(e,n,r)=>t(e,typeof n==`symbol`?n:n+``,r),r=class e{static generateColor(t,n){let r,i;if(!(t.length>0))r=Math.random(),i=1;else{let n=t[Math.floor(Math.random()*t.length)],a=e.HEXtoHSV(n);r=a.h,i=a.s}let a=e.HSVtoRGB(r,i,n);return a.r*=.15,a.g*=.15,a.b*=.15,a}static HEXtoHSV(e){e=e.replace(`#`,``);let t=parseInt(e.substring(0,2),16)/255,n=parseInt(e.substring(2,4),16)/255,r=parseInt(e.substring(4,6),16)/255,i=Math.max(t,n,r),a=Math.min(t,n,r),o,s;return o=i===a?0:i===t?((n-r)/(i-a)+6)%6:i===n?(r-t)/(i-a)+2:(t-n)/(i-a)+4,o/=6,s=i===0?0:(i-a)/i,{h:o,s,v:i}}static HEXtoRGB(e){return e=e.replace(`#`,``),{r:parseInt(e.substring(0,2),16),g:parseInt(e.substring(2,4),16),b:parseInt(e.substring(4,6),16)}}static HSVtoRGB(e,t,n){let r=0,i=0,a=0,o=Math.floor(e*6),s=e*6-o,c=n*(1-t),l=n*(1-s*t),u=n*(1-(1-s)*t);switch(o%6){case 0:r=n,i=u,a=c;break;case 1:r=l,i=n,a=c;break;case 2:r=c,i=n,a=u;break;case 3:r=c,i=l,a=n;break;case 4:r=u,i=c,a=n;break;case 5:r=n,i=c,a=l}return{r,g:i,b:a}}static normalizeColor(e){return{r:e.r/255,g:e.g/255,b:e.b/255}}},i={simResolution:128,dyeResolution:1024,captureResolution:512,densityDissipation:1,velocityDissipation:.2,pressure:.8,pressureIterations:20,curl:30,splatRadius:.25,splatForce:6e3,shading:!0,colorful:!0,colorUpdateSpeed:10,colorPalette:[],hover:!0,inverted:!1,backgroundColor:`#000000`,transparent:!1,brightness:.5,bloom:!0,bloomIterations:8,bloomResolution:256,bloomIntensity:.8,bloomThreshold:.6,bloomSoftKnee:.7,sunrays:!0,sunraysResolution:196,sunraysWeight:1},a=class e{static getUniforms(e,t){let n={},r=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<r;i++){let r=t.getActiveUniform(e,i).name;n[r]=t.getUniformLocation(e,r)}return n}static createProgram(e,t,n){let r=n.createProgram();return n.attachShader(r,e),n.attachShader(r,t),n.linkProgram(r),n.getProgramParameter(r,n.LINK_STATUS)||console.trace(n.getProgramInfoLog(r)),r}static compileShader(t,n,r,i){r=e.addKeywords(r,i);let a=t.createShader(n);return t.shaderSource(a,r),t.compileShader(a),t.getShaderParameter(a,t.COMPILE_STATUS)?a:(console.trace(t.getShaderInfoLog(a)),null)}static addKeywords(e,t){if(t==null)return e;let n=``;return t.forEach(e=>{n+=`#define `+e+`
`}),n+e}},o=class{constructor(e,t,r){n(this,`gl`),n(this,`vertexShader`),n(this,`fragmentShaderSource`),n(this,`programs`),n(this,`activeProgram`),n(this,`uniforms`),this.gl=r,this.vertexShader=e,this.fragmentShaderSource=t,this.programs=[],this.activeProgram=null,this.uniforms={}}setKeywords(e){let t=0;for(let n of e)t+=this.hashCode(n);let n=this.programs[t];if(n==null){let r=a.compileShader(this.gl,this.gl.FRAGMENT_SHADER,this.fragmentShaderSource,e);n=a.createProgram(this.vertexShader,r,this.gl),this.programs[t]=n}n!=this.activeProgram&&(this.uniforms=a.getUniforms(n,this.gl),this.activeProgram=n)}hashCode(e){if(e.length===0)return 0;let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t|=0;return t}bind(){this.gl.useProgram(this.activeProgram)}},s=class{constructor(e,t){n(this,`id`,-1),n(this,`texcoordX`,0),n(this,`texcoordY`,0),n(this,`prevTexcoordX`,0),n(this,`prevTexcoordY`,0),n(this,`deltaX`,0),n(this,`deltaY`,0),n(this,`down`,!1),n(this,`moved`,!1),n(this,`color`),this.color=r.generateColor(e,t)}updatePointerDownData(e,t,n,i,a,o){this.id=e,this.down=!0,this.moved=!1,this.texcoordX=t/i.width,this.texcoordY=1-n/i.height,this.prevTexcoordX=this.texcoordX,this.prevTexcoordY=this.texcoordY,this.deltaX=0,this.deltaY=0,this.color=r.generateColor(a,o)}updatePointerMoveData(e,t,n,r){this.prevTexcoordX=this.texcoordX,this.prevTexcoordY=this.texcoordY,this.texcoordX=e/n.width,this.texcoordY=1-t/n.height,this.deltaX=this.correctDeltaX(this.texcoordX-this.prevTexcoordX,n),this.deltaY=this.correctDeltaY(this.texcoordY-this.prevTexcoordY,n),this.moved=r?Math.abs(this.deltaX)>0||Math.abs(this.deltaY)>0:this.down}updatePointerUpData(){this.down=!1}correctDeltaX(e,t){let n=t.width/t.height;return n<1&&(e*=n),e}correctDeltaY(e,t){let n=t.width/t.height;return n>1&&(e/=n),e}},c=class{constructor(e,t,r){n(this,`gl`),n(this,`program`),n(this,`uniforms`),this.gl=r,this.uniforms={},this.program=a.createProgram(e,t,r),this.uniforms=a.getUniforms(this.program,r)}bind(){this.gl.useProgram(this.program)}},l=class{constructor(e,t){n(this,`blurProgram`),n(this,`copyProgram`),n(this,`clearProgram`),n(this,`colorProgram`),n(this,`bloomPrefilterProgram`),n(this,`bloomBlurProgram`),n(this,`bloomFinalProgram`),n(this,`sunraysMaskProgram`),n(this,`sunraysProgram`),n(this,`splatProgram`),n(this,`advectionProgram`),n(this,`divergenceProgram`),n(this,`curlProgram`),n(this,`vorticityProgram`),n(this,`pressureProgram`),n(this,`gradienSubtractProgram`),this.blurProgram=new c(t.blurVertexShader,t.blurShader,e),this.copyProgram=new c(t.baseVertexShader,t.copyShader,e),this.clearProgram=new c(t.baseVertexShader,t.clearShader,e),this.colorProgram=new c(t.baseVertexShader,t.colorShader,e),this.bloomPrefilterProgram=new c(t.baseVertexShader,t.bloomPrefilterShader,e),this.bloomBlurProgram=new c(t.baseVertexShader,t.bloomBlurShader,e),this.bloomFinalProgram=new c(t.baseVertexShader,t.bloomFinalShader,e),this.sunraysMaskProgram=new c(t.baseVertexShader,t.sunraysMaskShader,e),this.sunraysProgram=new c(t.baseVertexShader,t.sunraysShader,e),this.splatProgram=new c(t.baseVertexShader,t.splatShader,e),this.advectionProgram=new c(t.baseVertexShader,t.advectionShader,e),this.divergenceProgram=new c(t.baseVertexShader,t.divergenceShader,e),this.curlProgram=new c(t.baseVertexShader,t.curlShader,e),this.vorticityProgram=new c(t.baseVertexShader,t.vorticityShader,e),this.pressureProgram=new c(t.baseVertexShader,t.pressureShader,e),this.gradienSubtractProgram=new c(t.baseVertexShader,t.gradientSubtractShader,e)}},u=class e{static normalizeTexture(t,n,r){let i=new Uint8Array(t.length),a=0;for(let o=r-1;o>=0;o--)for(let r=0;r<n;r++){let s=o*n*4+r*4;i[s+0]=e.clamp01(t[a+0])*255,i[s+1]=e.clamp01(t[a+1])*255,i[s+2]=e.clamp01(t[a+2])*255,i[s+3]=e.clamp01(t[a+3])*255,a+=4}return i}static clamp01(e){return Math.min(Math.max(e,0),1)}static framebufferToTexture(e,t){t.bindFramebuffer(t.FRAMEBUFFER,e.fbo);let n=e.width*e.height*4,r=new Float32Array(n);return t.readPixels(0,0,e.width,e.height,t.RGBA,t.FLOAT,r),r}static textureToCanvas(e,t,n){let r=document.createElement(`canvas`),i=r.getContext(`2d`);r.width=t,r.height=n;let a=i.createImageData(t,n);return a.data.set(e),i.putImageData(a,0,0),r}static invertImageColors(e){let t=e.getContext(`2d`),n=t.getImageData(0,0,e.width,e.height);for(let e=0;e<n.data.length;e+=4)n.data[e]=255-n.data[e],n.data[e+1]=255-n.data[e+1],n.data[e+2]=255-n.data[e+2];t.putImageData(n,0,0)}static downloadURI(e,t){let n=document.createElement(`a`);n.download=e,n.href=t,document.body.appendChild(n),n.click(),document.body.removeChild(n)}},d=class{constructor(e,t){n(this,`displayShaderSource`),n(this,`baseVertexShader`),n(this,`blurVertexShader`),n(this,`blurShader`),n(this,`copyShader`),n(this,`clearShader`),n(this,`colorShader`),n(this,`bloomPrefilterShader`),n(this,`bloomBlurShader`),n(this,`bloomFinalShader`),n(this,`sunraysMaskShader`),n(this,`sunraysShader`),n(this,`splatShader`),n(this,`advectionShader`),n(this,`divergenceShader`),n(this,`curlShader`),n(this,`vorticityShader`),n(this,`pressureShader`),n(this,`gradientSubtractShader`),this.displayShaderSource=`
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;

    vec3 linearToGamma (vec3 color) {
    color = max(color, vec3(0));
    return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
    vec3 lc = texture2D(uTexture, vL).rgb;
    vec3 rc = texture2D(uTexture, vR).rgb;
    vec3 tc = texture2D(uTexture, vT).rgb;
    vec3 bc = texture2D(uTexture, vB).rgb;

    float dx = length(rc) - length(lc);
    float dy = length(tc) - length(bc);

    vec3 n = normalize(vec3(dx, dy, length(texelSize)));
    vec3 l = vec3(0.0, 0.0, 1.0);

    float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
    c *= diffuse;
    #endif

    #ifdef BLOOM
    vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef SUNRAYS
    float sunrays = texture2D(uSunrays, vUv).r;
    c *= sunrays;
    #ifdef BLOOM
    bloom *= sunrays;
    #endif
    #endif

    #ifdef BLOOM
    float noise = texture2D(uDithering, vUv * ditherScale).r;
    noise = noise * 2.0 - 1.0;
    bloom += noise / 255.0;
    bloom = linearToGamma(bloom);
    c += bloom;
    #endif

    float a = max(c.r, max(c.g, c.b));
    gl_FragColor = vec4(c, a);
    }
    `,this.baseVertexShader=a.compileShader(e,e.VERTEX_SHADER,`
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`),this.blurVertexShader=a.compileShader(e,e.VERTEX_SHADER,`
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`),this.blurShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`),this.copyShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`),this.clearShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`),this.colorShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
    }
`),this.bloomPrefilterShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`),this.bloomBlurShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`),this.bloomFinalShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`),this.sunraysMaskShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`),this.sunraysShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;

    #define ITERATIONS 16

    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;

        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;

        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;

        float color = texture2D(uTexture, vUv).a;

        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }

        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`),this.splatShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`),this.advectionShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;

        vec2 iuv = floor(st);
        vec2 fuv = fract(st);

        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,t.supportLinearFiltering?null:[`MANUAL_FILTERING`]),this.divergenceShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;

        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`),this.curlShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`),this.vorticityShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`),this.pressureShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`),this.gradientSubtractShader=a.compileShader(e,e.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`)}},f=class e{static ditheringTexture(t){return e.createTextureAsync(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABGUUKwAAAeK0lEQVR4AT3aBbRuVdUG4HW5hNLdSHd3CyjdEtLd3Y1wKZHuLgFJRenuBqW7u7tTlu8zx//9ZwwG8J397b3WnG/NtU9bYokl+nfffdf//e9/96uuuqrPN998/ZRTTukbb7xxP/zww/u+++7bf/vb3/YddtihP/roo32SSSbpL7zwQj/99NP7Vltt1X/88ce+8sor13Vvv/12Hzp0aF999dX7Bx980P/617/2WWedtX/55Zd9++237zPMMEP/05/+1DfYYIP+0EMP9amnnrq/9957/ZZbbum//PJLf+yxx/pJJ53URxtttL7WWmv1P//5z/3bb7/t9913X63t9ddf7wsvvHBff/31+6GHHtovu+yyPuecc/YbbrihH3300fXshRZaqF900UW1zv/85z991FFHrfXce++9ffjhh+/nnXdeXe8e7tsuv/zy+vKEE07YDzzwwNpoz4/FPfnkk32VVVbpd911V7/66qv7Mccc0y+99NI+yiij9KWWWqoffPDB/frrr6+HWfjss8/e77jjju6ev/vd72ojNrfiiiv21lo98Pzzz6/fnXjiif0f//hH33rrrWujFr7JJpvU/d5///1+wQUX9N12261PNdVUfbnlluvDDTdc//TTT+vzW2+9tY844oj9q6++6i+++GKffPLJaz3W+fXXX1fx3N/6vv/++3rOG2+8Uc/66KOP+njjjVff22OPPXr7+OOPq4oqftZZZ3VdtLkxxhijX3zxxd0XFGeOOebof/zjH/tee+1VC7nnnnv6uuuuWwt55ZVXqurbbLNNH3fccdWv77333t0innrqqX7QQQf1tddeu3uWh88zzzz9m2++6WONNVZt7txzz61njDTSSP2AAw7oM888c1988cX77bffXgvdaKON+rBhw/oEE0xQKJltttn6Lrvs0k844YS+5ppr9i233LK/8847tTYo23bbbfurr75ahYYQaFUk9/Zd31twwQX7yCOP3JuO6cIzzzxTEJppppmqUzrrc50dMmRIf+211/rPP//cF1lkkeqKToK3ii+66KL98ccf74cddlhfZ511+gMPPNCnnXbavsACC9RGJ5tssv7Pf/6zFrLrrrvWxp5++ulC3DXXXFMFff7557uigjy6TTzxxP3zzz8vNM0999zVHDT6wx/+0H/44Yc+6aST1vXW869//aufccYZfZxxxql1oLIGQp/naQLaLbvssoVkdF9ttdUKTUPcaJZZZmnbbbddW2yxxVoW2rKolg0oTgtn0KTluvbggw+2VVddtWXxLbxvJ598cptuuulaqt/CxxZet2hHW2ONNdr444/fbrrpppYCtUCxhUr1WXShpRMtm2tZaJtxxhlbEFf3iP60LLq+Hzq18Lxlg/X9l156qT3yyCP17JtvvrmFw23eeedtvhO0tf3337+eEU1pKVRbYYUV2hZbbNGuu+46KG/Rl5ZN138HPW333Xdv1tJwRJfxjcDoIjHSAb9bb731+u9///uC0MMPP1y8JnogN+aYY5aYqSYhAm1dG3vssTtagPRRRx3VL7zwwu67BImwTTHFFP1vf/tbJ2r3339/T+H7lFNO+f/d9nkWXx3NQquDUObaaaaZpr/55pt9n332qa6iVZrQ05zSEDq133771f1Qw/OJIo2xt3POOafEkMin+L2BK9VNhfumm25am3rrrbf68ccf36effvp+2223lYh88sknxbtUvT7DJ4W54oor+tlnn103tWgLALt0qzaGYoR0zz337F988UUPKop/xx13XBXYIs8888wqqE0RS4JrU6eeempPt8shUIuKe4Zn0g+/41o777xzv+SSS+q7zz33XLmaooK6vaA1rXj55ZeLvhpMY9wHpDuOuRne/v3vfy9h2nHHHTue//rXv64v4h6r0TkbmWiiiTpx+u9//1uL9eC77767ukjEPJDlsUnCR5zYKx7TC87gc0oNGRBEYzbccMNyH88gnksuuSSKVhe5FEvlNoQN8o499tjSp2WWWaZ0gaYQa41TQAJ+5ZVXlk3TtBtvvLGa9Nlnn5VQN/bA71XYZiyanbAYAsOaQMoiRhhhhE683Cj873PNNVc93Pep/vLLL19dJXooQt0hhig9++yz5QTuwUp15c477ywnIcC+S4/cCxVlCcW3Ps2QP6i3Qi+99NKFsJ9++qlHa6rwHMyawZzS/+pXvypas1CiOfroo1c2WWmllaqAHAXyhqZDw6LmJWpZeEsh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`,t)}static getTextureScale(e,t,n){return{x:t/e.width,y:n/e.height}}static createTextureAsync(e,t){let n=t.createTexture();t.bindTexture(t.TEXTURE_2D,n),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.REPEAT),t.texImage2D(t.TEXTURE_2D,0,t.RGB,1,1,0,t.RGB,t.UNSIGNED_BYTE,new Uint8Array([255,255,255]));let r={texture:n,width:1,height:1,attach(e){return t.activeTexture(t.TEXTURE0+e),t.bindTexture(t.TEXTURE_2D,n),e}},i=new Image;return i.onload=()=>{r.width=i.width,r.height=i.height,t.bindTexture(t.TEXTURE_2D,n),t.texImage2D(t.TEXTURE_2D,0,t.RGB,t.RGB,t.UNSIGNED_BYTE,i)},i.src=e,r}},p=class{constructor(e){n(this,`hasStarted`,!1),n(this,`simResolution`,i.simResolution),n(this,`dyeResolution`,i.dyeResolution),n(this,`captureResolution`,i.captureResolution),n(this,`densityDissipation`,i.densityDissipation),n(this,`velocityDissipation`,i.velocityDissipation),n(this,`pressure`,i.pressure),n(this,`pressureIterations`,i.pressureIterations),n(this,`curl`,i.curl),n(this,`splatRadius`,i.splatRadius),n(this,`splatForce`,i.splatForce),n(this,`shading`,i.shading),n(this,`colorful`,i.colorful),n(this,`colorUpdateSpeed`,i.colorUpdateSpeed),n(this,`colorPalette`,i.colorPalette),n(this,`hover`,i.hover),n(this,`backgroundColor`,i.backgroundColor),n(this,`transparent`,i.transparent),n(this,`brightness`,i.brightness),n(this,`bloom`,i.bloom),n(this,`bloomIterations`,i.bloomIterations),n(this,`bloomResolution`,i.bloomResolution),n(this,`bloomIntensity`,i.bloomIntensity),n(this,`bloomThreshold`,i.bloomThreshold),n(this,`bloomSoftKnee`,i.bloomSoftKnee),n(this,`sunrays`,i.sunrays),n(this,`sunraysResolution`,i.sunraysResolution),n(this,`sunraysWeight`,i.sunraysWeight),n(this,`paused`,!1),n(this,`drawWhilePaused`,!1),n(this,`_inverted`,!1),n(this,`canvas`),n(this,`gl`),n(this,`ext`),n(this,`splatStack`,[]),n(this,`pointers`,[]),n(this,`programs`),n(this,`bloomFramebuffers`,[]),n(this,`ditheringTexture`),n(this,`displayMaterial`),n(this,`lastUpdateTime`,Date.now()),n(this,`colorUpdateTimer`,0),n(this,`_dye`),n(this,`_velocity`),n(this,`_divergence`),n(this,`_curl`),n(this,`_pressure`),n(this,`_bloom`),n(this,`_sunrays`),n(this,`_sunraysTemp`),n(this,`animationFrameID`),n(this,`handleMouseDown`,e=>{let t=this.scaleByPixelRatio(e.offsetX),n=this.scaleByPixelRatio(e.offsetY),r=this.pointers.find(e=>e.id==-1);r||=new s(this.colorPalette,this.brightness),r.updatePointerDownData(-1,t,n,this.canvas,this.colorPalette,this.brightness)}),n(this,`handleMouseMove`,e=>{let t=this.scaleByPixelRatio(e.offsetX),n=this.scaleByPixelRatio(e.offsetY),r=this.pointers.find(e=>e.id==-1);r||=new s(this.colorPalette,this.brightness),r.updatePointerMoveData(t,n,this.canvas,this.hover)}),n(this,`handleMouseUp`,()=>{this.hover||this.pointers[0].updatePointerUpData()}),n(this,`handleTouchStart`,e=>{let t=e.targetTouches;for(;t.length>=this.pointers.length;)this.pointers.push(new s(this.colorPalette,this.brightness));for(let e=0;e<t.length;e++){let n=this.scaleByPixelRatio(t[e].pageX),r=this.scaleByPixelRatio(t[e].pageY);this.pointers[e+1].updatePointerDownData(t[e].identifier,n,r,this.canvas,this.colorPalette,this.brightness)}}),n(this,`handleTouchMove`,e=>{let t=e.targetTouches;for(let e=0;e<t.length;e++){let n=this.pointers[e+1],r=this.scaleByPixelRatio(t[e].pageX),i=this.scaleByPixelRatio(t[e].pageY);n.updatePointerMoveData(r,i,this.canvas,this.hover)}}),n(this,`handleTouchEnd`,e=>{let t=e.changedTouches;for(let e of t){let t=this.pointers.find(t=>t.id===e.identifier);t&&t.updatePointerUpData()}});let t=e.querySelector(`canvas`);t||(t=document.createElement(`canvas`),e.appendChild(t)),this.canvas=t,this.canvas.style.width=`100%`,this.canvas.style.height=`100%`,this.resizeCanvas(),this.inverted=i.inverted;let{gl:r,ext:a}=this.getWebGLContext();this.gl=r,this.ext=a,this.isMobile()&&(this.dyeResolution/=2),this.ext.supportLinearFiltering||(this.dyeResolution/=2,this.shading=!1,this.bloom=!1,this.sunrays=!1);let c=new d(this.gl,this.ext);this.blitInit(),this.ditheringTexture=f.ditheringTexture(this.gl),this.programs=new l(this.gl,c),this.displayMaterial=new o(c.baseVertexShader,c.displayShaderSource,this.gl),this.update=this.update.bind(this)}start(){this.pointers.push(new s(this.colorPalette,this.brightness)),this.updateKeywords(),this.initFramebuffers(),this.update(),this.canvas.addEventListener(`mousedown`,this.handleMouseDown),this.canvas.addEventListener(`mousemove`,this.handleMouseMove),window.addEventListener(`mouseup`,this.handleMouseUp),this.canvas.addEventListener(`touchstart`,this.handleTouchStart,{passive:!1,capture:!0}),this.canvas.addEventListener(`touchmove`,this.handleTouchMove,{passive:!1,capture:!0}),window.addEventListener(`touchend`,this.handleTouchEnd),this.hasStarted=!0}stop(){this.pointers=[],cancelAnimationFrame(this.animationFrameID),this.canvas.removeEventListener(`mousedown`,this.handleMouseDown),this.canvas.removeEventListener(`mousemove`,this.handleMouseMove),window.removeEventListener(`mouseup`,this.handleMouseUp),this.canvas.removeEventListener(`touchstart`,this.handleTouchStart),this.canvas.removeEventListener(`touchmove`,this.handleTouchMove),window.removeEventListener(`touchend`,this.handleTouchEnd),this.hasStarted=!1}scaleByPixelRatio(e){let t=window.devicePixelRatio||1;return Math.floor(e*t)}resizeCanvas(){let e=this.scaleByPixelRatio(this.canvas.clientWidth),t=this.scaleByPixelRatio(this.canvas.clientHeight);return this.canvas.width!=e||this.canvas.height!=t?(this.canvas.width=e,this.canvas.height=t,!0):!1}supportRenderTextureFormat(e,t,n,r){let i=e.createTexture();e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,t,4,4,0,n,r,null);let a=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),e.checkFramebufferStatus(e.FRAMEBUFFER)==e.FRAMEBUFFER_COMPLETE}getSupportedFormat(e,t,n,r){if(!this.supportRenderTextureFormat(e,t,n,r))switch(t){case e.R16F:return this.getSupportedFormat(e,e.RG16F,e.RG,r);case e.RG16F:return this.getSupportedFormat(e,e.RGBA16F,e.RGBA,r);default:return null}return{internalFormat:t,format:n}}getWebGLContext(){let e={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1},t=this.canvas.getContext(`webgl2`,e),n=!!t;n||(t=this.canvas.getContext(`webgl`,e)??this.canvas.getContext(`experimental-webgl`,e));let r,i;n?(t.getExtension(`EXT_color_buffer_float`),i=t.getExtension(`OES_texture_float_linear`)):(r=t.getExtension(`OES_texture_half_float`),i=t.getExtension(`OES_texture_half_float_linear`)),t.clearColor(0,0,0,1);let a=n?t.HALF_FLOAT:r?r.HALF_FLOAT_OES:0,o,s,c;return n?(o=this.getSupportedFormat(t,t.RGBA16F,t.RGBA,a),s=this.getSupportedFormat(t,t.RG16F,t.RG,a),c=this.getSupportedFormat(t,t.R16F,t.RED,a)):(o=this.getSupportedFormat(t,t.RGBA,t.RGBA,a),s=this.getSupportedFormat(t,t.RGBA,t.RGBA,a),c=this.getSupportedFormat(t,t.RGBA,t.RGBA,a)),{gl:t,ext:{formatRGBA:o,formatRG:s,formatR:c,halfFloatTexType:a,supportLinearFiltering:i}}}isMobile(){return/Mobi|Android/i.test(navigator.userAgent)}updateKeywords(){let e=[];this.shading&&e.push(`SHADING`),this.bloom&&e.push(`BLOOM`),this.sunrays&&e.push(`SUNRAYS`),this.displayMaterial.setKeywords(e)}initFramebuffers(){let e=this.getResolution(this.simResolution),t=this.getResolution(this.dyeResolution),n=this.ext.halfFloatTexType,r=this.ext.formatRGBA,i=this.ext.formatRG,a=this.ext.formatR,o=this.ext.supportLinearFiltering?this.gl.LINEAR:this.gl.NEAREST;this.gl.disable(this.gl.BLEND),this._dye=this._dye?this.resizeDoubleFBO(this._dye,t.width,t.height,r.internalFormat,r.format,n,o):this.createDoubleFBO(t.width,t.height,r.internalFormat,r.format,n,o),this._velocity=this._velocity?this.resizeDoubleFBO(this._velocity,e.width,e.height,i.internalFormat,i.format,n,o):this.createDoubleFBO(e.width,e.height,i.internalFormat,i.format,n,o),this._divergence=this.createFBO(e.width,e.height,a.internalFormat,a.format,n,this.gl.NEAREST),this._curl=this.createFBO(e.width,e.height,a.internalFormat,a.format,n,this.gl.NEAREST),this._pressure=this.createDoubleFBO(e.width,e.height,a.internalFormat,a.format,n,this.gl.NEAREST),this.initBloomFramebuffers(),this.initSunraysFramebuffers()}getResolution(e){let t=this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;t<1&&(t=1/t);let n=Math.round(e),r=Math.round(e*t);return this.gl.drawingBufferWidth>this.gl.drawingBufferHeight?{width:r,height:n}:{width:n,height:r}}createDoubleFBO(e,t,n,r,i,a){let o=this.createFBO(e,t,n,r,i,a),s=this.createFBO(e,t,n,r,i,a);return{width:e,height:t,texelSizeX:o.texelSizeX,texelSizeY:o.texelSizeY,get read(){return o},set read(e){o=e},get write(){return s},set write(e){s=e},swap(){let e=o;o=s,s=e}}}resizeFBO(e,t,n,r,i,a,o){let s=this.createFBO(t,n,r,i,a,o);return this.programs.copyProgram.bind(),this.gl.uniform1i(this.programs.copyProgram.uniforms.uTexture,e.attach(0)),this.blit(s),s}resizeDoubleFBO(e,t,n,r,i,a,o){return e.width===t&&e.height===n||(e.read=this.resizeFBO(e.read,t,n,r,i,a,o),e.write=this.createFBO(t,n,r,i,a,o),e.width=t,e.height=n,e.texelSizeX=1/t,e.texelSizeY=1/n),e}createFBO(e,t,n,r,i,a){this.gl.activeTexture(this.gl.TEXTURE0);let o=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,o),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,a),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,a),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texImage2D(this.gl.TEXTURE_2D,0,n,e,t,0,r,i,null);let s=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,s),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,o,0),this.gl.viewport(0,0,e,t),this.gl.clear(this.gl.COLOR_BUFFER_BIT);let c=1/e,l=1/t,u=this.gl;return{texture:o,fbo:s,width:e,height:t,texelSizeX:c,texelSizeY:l,attach(e){return u.activeTexture(u.TEXTURE0+e),u.bindTexture(u.TEXTURE_2D,o),e}}}initBloomFramebuffers(){let e=this.getResolution(this.bloomResolution),t=this.ext.halfFloatTexType,n=this.ext.formatRGBA,r=this.ext.supportLinearFiltering?this.gl.LINEAR:this.gl.NEAREST;this._bloom=this.createFBO(e.width,e.height,n.internalFormat,n.format,t,r),this.bloomFramebuffers.length=0;for(let i=0;i<this.bloomIterations;i++){let a=e.width>>i+1,o=e.height>>i+1;if(a<2||o<2)break;let s=this.createFBO(a,o,n.internalFormat,n.format,t,r);this.bloomFramebuffers.push(s)}}initSunraysFramebuffers(){let e=this.getResolution(this.sunraysResolution),t=this.ext.halfFloatTexType,n=this.ext.formatR,r=this.ext.supportLinearFiltering?this.gl.LINEAR:this.gl.NEAREST;this._sunrays=this.createFBO(e.width,e.height,n.internalFormat,n.format,t,r),this._sunraysTemp=this.createFBO(e.width,e.height,n.internalFormat,n.format,t,r)}blitInit(){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.gl.createBuffer()),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),this.gl.STATIC_DRAW),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.gl.createBuffer()),this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),this.gl.STATIC_DRAW),this.gl.vertexAttribPointer(0,2,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(0)}blit(e,t=!1){e===null?(this.gl.viewport(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null)):(this.gl.viewport(0,0,e.width,e.height),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,e.fbo)),t&&(this.gl.clearColor(0,0,0,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT)),this.gl.drawElements(this.gl.TRIANGLES,6,this.gl.UNSIGNED_SHORT,0)}multipleSplats(e){for(let t=0;t<e;t++){let e=r.generateColor(this.colorPalette,this.brightness);e.r*=10,e.g*=10,e.b*=10;let t=Math.random(),n=Math.random(),i=1e3*(Math.random()-.5),a=1e3*(Math.random()-.5);this.splat(t,n,i,a,e)}}splat(e,t,n,r,i){this.programs.splatProgram.bind(),this.gl.uniform1i(this.programs.splatProgram.uniforms.uTarget,this._velocity.read.attach(0)),this.gl.uniform1f(this.programs.splatProgram.uniforms.aspectRatio,this.canvas.width/this.canvas.height),this.gl.uniform2f(this.programs.splatProgram.uniforms.point,e,t),this.gl.uniform3f(this.programs.splatProgram.uniforms.color,n,r,0),this.gl.uniform1f(this.programs.splatProgram.uniforms.radius,this.correctRadius(this.splatRadius/100)),this.blit(this._velocity.write),this._velocity.swap(),this.gl.uniform1i(this.programs.splatProgram.uniforms.uTarget,this._dye.read.attach(0)),this.gl.uniform3f(this.programs.splatProgram.uniforms.color,i.r,i.g,i.b),this.blit(this._dye.write),this._dye.swap()}correctRadius(e){let t=this.canvas.width/this.canvas.height;return t>1&&(e*=t),e}update(){let e=this.calcDeltaTime();this.resizeCanvas()&&this.initFramebuffers(),this.updateColors(e),this.applyInputs(),this.paused||this.step(e),this.render(null),this.animationFrameID=requestAnimationFrame(this.update)}calcDeltaTime(){let e=Date.now(),t=(e-this.lastUpdateTime)/1e3;return t=Math.min(t,.016666),this.lastUpdateTime=e,t}updateColors(e){this.colorful&&(this.colorUpdateTimer+=e*this.colorUpdateSpeed,this.colorUpdateTimer>=1&&(this.colorUpdateTimer=this.wrap(this.colorUpdateTimer,0,1),this.pointers.forEach(e=>{e.color=r.generateColor(this.colorPalette,this.brightness)})))}wrap(e,t,n){let r=n-t;return r==0?t:(e-t)%r+t}applyInputs(){this.splatStack.length>0&&this.multipleSplats(this.splatStack.pop()),this.pointers.forEach(e=>{e.moved&&(e.moved=!1,this.splatPointer(e))})}splatPointer(e){if(this.paused&&!this.drawWhilePaused)return;let t=e.deltaX*this.splatForce,n=e.deltaY*this.splatForce;this.splat(e.texcoordX,e.texcoordY,t,n,e.color)}step(e){this.gl.disable(this.gl.BLEND),this.programs.curlProgram.bind(),this.gl.uniform2f(this.programs.curlProgram.uniforms.texelSize,this._velocity.texelSizeX,this._velocity.texelSizeY),this.gl.uniform1i(this.programs.curlProgram.uniforms.uVelocity,this._velocity.read.attach(0)),this.blit(this._curl),this.programs.vorticityProgram.bind(),this.gl.uniform2f(this.programs.vorticityProgram.uniforms.texelSize,this._velocity.texelSizeX,this._velocity.texelSizeY),this.gl.uniform1i(this.programs.vorticityProgram.uniforms.uVelocity,this._velocity.read.attach(0)),this.gl.uniform1i(this.programs.vorticityProgram.uniforms.uCurl,this._curl.attach(1)),this.gl.uniform1f(this.programs.vorticityProgram.uniforms.curl,this.curl),this.gl.uniform1f(this.programs.vorticityProgram.uniforms.dt,e),this.blit(this._velocity.write),this._velocity.swap(),this.programs.divergenceProgram.bind(),this.gl.uniform2f(this.programs.divergenceProgram.uniforms.texelSize,this._velocity.texelSizeX,this._velocity.texelSizeY),this.gl.uniform1i(this.programs.divergenceProgram.uniforms.uVelocity,this._velocity.read.attach(0)),this.blit(this._divergence),this.programs.clearProgram.bind(),this.gl.uniform1i(this.programs.clearProgram.uniforms.uTexture,this._pressure.read.attach(0)),this.gl.uniform1f(this.programs.clearProgram.uniforms.value,this.pressure),this.blit(this._pressure.write),this._pressure.swap(),this.programs.pressureProgram.bind(),this.gl.uniform2f(this.programs.pressureProgram.uniforms.texelSize,this._velocity.texelSizeX,this._velocity.texelSizeY),this.gl.uniform1i(this.programs.pressureProgram.uniforms.uDivergence,this._divergence.attach(0));for(let e=0;e<this.pressureIterations;e++)this.gl.uniform1i(this.programs.pressureProgram.uniforms.uPressure,this._pressure.read.attach(1)),this.blit(this._pressure.write),this._pressure.swap();this.programs.gradienSubtractProgram.bind(),this.gl.uniform2f(this.programs.gradienSubtractProgram.uniforms.texelSize,this._velocity.texelSizeX,this._velocity.texelSizeY),this.gl.uniform1i(this.programs.gradienSubtractProgram.uniforms.uPressure,this._pressure.read.attach(0)),this.gl.uniform1i(this.programs.gradienSubtractProgram.uniforms.uVelocity,this._velocity.read.attach(1)),this.blit(this._velocity.write),this._velocity.swap(),this.programs.advectionProgram.bind(),this.gl.uniform2f(this.programs.advectionProgram.uniforms.texelSize,this._velocity.texelSizeX,this._velocity.texelSizeY),this.ext.supportLinearFiltering||this.gl.uniform2f(this.programs.advectionProgram.uniforms.dyeTexelSize,this._velocity.texelSizeX,this._velocity.texelSizeY);let t=this._velocity.read.attach(0);this.gl.uniform1i(this.programs.advectionProgram.uniforms.uVelocity,t),this.gl.uniform1i(this.programs.advectionProgram.uniforms.uSource,t),this.gl.uniform1f(this.programs.advectionProgram.uniforms.dt,e),this.gl.uniform1f(this.programs.advectionProgram.uniforms.dissipation,this.velocityDissipation),this.blit(this._velocity.write),this._velocity.swap(),this.ext.supportLinearFiltering||this.gl.uniform2f(this.programs.advectionProgram.uniforms.dyeTexelSize,this._dye.texelSizeX,this._dye.texelSizeY),this.gl.uniform1i(this.programs.advectionProgram.uniforms.uVelocity,this._velocity.read.attach(0)),this.gl.uniform1i(this.programs.advectionProgram.uniforms.uSource,this._dye.read.attach(1)),this.gl.uniform1f(this.programs.advectionProgram.uniforms.dissipation,this.densityDissipation),this.blit(this._dye.write),this._dye.swap()}render(e){this.bloom&&this.applyBloom(this._dye.read,this._bloom),this.sunrays&&(this.applySunrays(this._dye.read,this._dye.write,this._sunrays),this.blur(this._sunrays,this._sunraysTemp,1)),e===null||!this.transparent?(this.gl.blendFunc(this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.enable(this.gl.BLEND)):this.gl.disable(this.gl.BLEND),this.transparent||this.drawColor(e,r.normalizeColor(r.HEXtoRGB(this.backgroundColor))),this.drawDisplay(e)}drawColor(e,t){this.programs.colorProgram.bind(),this.gl.uniform4f(this.programs.colorProgram.uniforms.color,t.r,t.g,t.b,1),this.blit(e)}drawDisplay(e){let t=e===null?this.gl.drawingBufferWidth:e.width,n=e===null?this.gl.drawingBufferHeight:e.height;if(this.displayMaterial.bind(),this.shading&&this.gl.uniform2f(this.displayMaterial.uniforms.texelSize,1/t,1/n),this.gl.uniform1i(this.displayMaterial.uniforms.uTexture,this._dye.read.attach(0)),this.bloom){this.gl.uniform1i(this.displayMaterial.uniforms.uBloom,this._bloom.attach(1)),this.gl.uniform1i(this.displayMaterial.uniforms.uDithering,this.ditheringTexture.attach(2));let e=f.getTextureScale(this.ditheringTexture,t,n);this.gl.uniform2f(this.displayMaterial.uniforms.ditherScale,e.x,e.y)}this.sunrays&&this.gl.uniform1i(this.displayMaterial.uniforms.uSunrays,this._sunrays.attach(3)),this.blit(e)}applyBloom(e,t){if(this.bloomFramebuffers.length<2)return;let n=t;this.gl.disable(this.gl.BLEND),this.programs.bloomPrefilterProgram.bind();let r=this.bloomThreshold*this.bloomSoftKnee+1e-4,i=this.bloomThreshold-r,a=r*2,o=.25/r;this.gl.uniform3f(this.programs.bloomPrefilterProgram.uniforms.curve,i,a,o),this.gl.uniform1f(this.programs.bloomPrefilterProgram.uniforms.threshold,this.bloomThreshold),this.gl.uniform1i(this.programs.bloomPrefilterProgram.uniforms.uTexture,e.attach(0)),this.blit(n),this.programs.bloomBlurProgram.bind();for(let e of this.bloomFramebuffers)e&&(this.gl.uniform2f(this.programs.bloomBlurProgram.uniforms.texelSize,n.texelSizeX,n.texelSizeY),this.gl.uniform1i(this.programs.bloomBlurProgram.uniforms.uTexture,n.attach(0)),this.blit(e),n=e);this.gl.blendFunc(this.gl.ONE,this.gl.ONE),this.gl.enable(this.gl.BLEND);for(let e=this.bloomFramebuffers.length-2;e>=0;e--){let t=this.bloomFramebuffers[e];this.gl.uniform2f(this.programs.bloomBlurProgram.uniforms.texelSize,n.texelSizeX,n.texelSizeY),this.gl.uniform1i(this.programs.bloomBlurProgram.uniforms.uTexture,n.attach(0)),this.gl.viewport(0,0,t.width,t.height),this.blit(t),n=t}this.gl.disable(this.gl.BLEND),this.programs.bloomFinalProgram.bind(),this.gl.uniform2f(this.programs.bloomFinalProgram.uniforms.texelSize,n.texelSizeX,n.texelSizeY),this.gl.uniform1i(this.programs.bloomFinalProgram.uniforms.uTexture,n.attach(0)),this.gl.uniform1f(this.programs.bloomFinalProgram.uniforms.intensity,this.bloomIntensity),this.blit(t)}applySunrays(e,t,n){this.gl.disable(this.gl.BLEND),this.programs.sunraysMaskProgram.bind(),this.gl.uniform1i(this.programs.sunraysMaskProgram.uniforms.uTexture,e.attach(0)),this.blit(t),this.programs.sunraysProgram.bind(),this.gl.uniform1f(this.programs.sunraysProgram.uniforms.weight,this.sunraysWeight),this.gl.uniform1i(this.programs.sunraysProgram.uniforms.uTexture,t.attach(0)),this.blit(n)}blur(e,t,n){this.programs.blurProgram.bind();for(let r=0;r<n;r++)this.gl.uniform2f(this.programs.blurProgram.uniforms.texelSize,e.texelSizeX,0),this.gl.uniform1i(this.programs.blurProgram.uniforms.uTexture,e.attach(0)),this.blit(t),this.gl.uniform2f(this.programs.blurProgram.uniforms.texelSize,0,e.texelSizeY),this.gl.uniform1i(this.programs.blurProgram.uniforms.uTexture,t.attach(0)),this.blit(e)}captureScreenshot(){let e=this.getResolution(this.captureResolution),t=this.createFBO(e.width,e.height,this.ext.formatRGBA.internalFormat,this.ext.formatRGBA.format,this.ext.halfFloatTexType,this.gl.NEAREST);this.render(t);let n=u.framebufferToTexture(t,this.gl),r=u.normalizeTexture(n,t.width,t.height),i=u.textureToCanvas(r,t.width,t.height);this.inverted&&u.invertImageColors(i);let a=i.toDataURL();u.downloadURI(`fluid.png`,a),URL.revokeObjectURL(a)}get inverted(){return this._inverted}set inverted(e){this._inverted=e,this.canvas.style.filter=e?`invert(1)`:`none`}},m=class{constructor(e=document.body){n(this,`container`),n(this,`simulation`),this.container=e,this.container.style.outline=`none`,this.container.style.position=`relative`,this.container.style.display=`flex`,this.container.style.justifyContent=`center`,this.container.style.alignItems=`center`,this.simulation=new p(e)}start(){this.simulation.hasStarted||this.simulation.start()}stop(){this.simulation.hasStarted&&this.simulation.stop()}togglePause(e=!1){return this.simulation.hasStarted?(this.simulation.paused=!this.simulation.paused,this.simulation.paused&&(this.simulation.drawWhilePaused=e),this.simulation.paused):!1}multipleSplats(e){this.simulation.hasStarted&&this.simulation.multipleSplats(e)}splatAtLocation(e,t,n,i,a){if(!this.simulation.hasStarted)return;let o=e/this.simulation.canvas.width,s=1-t/this.simulation.canvas.clientHeight,c=a?r.HEXtoRGB(a):void 0;c||=r.generateColor(this.simulation.colorPalette,this.simulation.brightness),c.r*=10,c.g*=10,c.b*=10,this.simulation.splat(o,s,n,i,c)}downloadScreenshot(){this.simulation.hasStarted&&this.simulation.captureScreenshot()}setConfig(e){e.simResolution!==void 0&&(this.simulation.simResolution=e.simResolution),e.dyeResolution!==void 0&&(this.simulation.dyeResolution=e.dyeResolution),e.captureResolution!==void 0&&(this.simulation.captureResolution=e.captureResolution),e.densityDissipation!==void 0&&(this.simulation.densityDissipation=e.densityDissipation),e.velocityDissipation!==void 0&&(this.simulation.velocityDissipation=e.velocityDissipation),e.pressure!==void 0&&(this.simulation.pressure=e.pressure),e.pressureIterations!==void 0&&(this.simulation.pressureIterations=e.pressureIterations),e.curl!==void 0&&(this.simulation.curl=e.curl),e.splatRadius!==void 0&&(this.simulation.splatRadius=e.splatRadius),e.splatForce!==void 0&&(this.simulation.splatForce=e.splatForce),e.shading!==void 0&&(this.simulation.shading=e.shading),e.colorful!==void 0&&(this.simulation.colorful=e.colorful),e.colorUpdateSpeed!==void 0&&(this.simulation.colorUpdateSpeed=e.colorUpdateSpeed),e.colorPalette!==void 0&&(this.simulation.colorPalette=e.colorPalette),e.hover!==void 0&&(this.simulation.hover=e.hover),e.backgroundColor!==void 0&&(this.simulation.backgroundColor=e.backgroundColor),e.inverted!==void 0&&(this.simulation.inverted=e.inverted),e.transparent!==void 0&&(this.simulation.transparent=e.transparent),e.brightness!==void 0&&(this.simulation.brightness=e.brightness),e.bloom!==void 0&&(this.simulation.bloom=e.bloom),e.bloomIterations!==void 0&&(this.simulation.bloomIterations=e.bloomIterations),e.bloomResolution!==void 0&&(this.simulation.bloomResolution=e.bloomResolution),e.bloomIntensity!==void 0&&(this.simulation.bloomIntensity=e.bloomIntensity),e.bloomThreshold!==void 0&&(this.simulation.bloomThreshold=e.bloomThreshold),e.bloomSoftKnee!==void 0&&(this.simulation.bloomSoftKnee=e.bloomSoftKnee),e.sunrays!==void 0&&(this.simulation.sunrays=e.sunrays),e.sunraysResolution!==void 0&&(this.simulation.sunraysResolution=e.sunraysResolution),e.sunraysWeight!==void 0&&(this.simulation.sunraysWeight=e.sunraysWeight),this.simulation.hasStarted&&((e.dyeResolution!==void 0||e.simResolution!==void 0)&&this.simulation.initFramebuffers(),(e.shading!==void 0||e.bloom!==void 0||e.sunrays!==void 0)&&this.simulation.updateKeywords())}};export{m as default};