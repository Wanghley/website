// ─── Ambient chamber shader ─────────────────────────────────────────────────
// A slow drifting nebula of fBm noise in the brand palette, with three
// vertical "light streams" advected by the noise field — the tenebrism
// falloff (bright accent → glass tint → void) is baked into the fragment
// shader itself, not layered on with CSS.
//
// Reactive to scroll: uVelocity (0..1, decays toward 0 as the user settles)
// widens/brightens the streams, smears the nebula, and cheaply separates the
// stream color into R/G/B samples offset in uv.x — a fast-scroll "chromatic
// fringe" that reads unmistakably as reactivity without real dispersion.

export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uMouse;      // damped, normalized [-1, 1]
  uniform vec2  uResolution;
  uniform vec3  uColorA;     // #3AAFF1 — accent blue
  uniform vec3  uColorB;     // #313131 — brand glass tint
  uniform vec3  uColorVoid;  // #06070e — absolute dark
  uniform float uIntensity;
  uniform float uVelocity;   // 0..1, current scroll speed (see lib/scrollSignal.js)
  uniform float uScroll;     // 0..1, page scroll progress

  varying vec2 vUv;

  // — Hash / simplex noise (Ashima-style, trimmed) —
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
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

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
      sum += amp * snoise(p * freq);
      freq *= 2.02;
      amp *= 0.52;
    }
    return sum;
  }

  // Vertical light stream: a soft band that drifts horizontally, its width
  // and brightness modulated by the noise field so it reads as volumetric
  // light rather than a flat gradient bar. xCenter is in uv-space [0,1] —
  // NOT clip space [-1,1] — this function is always evaluated against uv.
  float lightStream(vec2 uv, float xCenter, float t, float seed, float velBoost) {
    float drift = fbm(vec2(seed, uv.y * 1.4 + t * 0.05)) * 0.12;
    float x = xCenter + drift;
    float dist = abs(uv.x - x);
    float width = (0.045 + 0.02 * fbm(vec2(uv.y * 2.0 + seed, t * 0.08))) * velBoost;
    float band = smoothstep(width, 0.0, dist);
    float flicker = 0.85 + 0.15 * sin(t * 0.6 + seed * 10.0 + uv.y * 3.0);
    return band * flicker;
  }

  // Sum of all three streams at a given uv.x offset (used for the cheap
  // per-channel chromatic separation below).
  float streamsAt(vec2 uv, float t, float velBoost) {
    float s = 0.0;
    // uv-space centers spread across the full width — the pass-1 bug had
    // the first center authored in clip-space ([-1,1]) and evaluated here
    // in uv-space ([0,1]), so it rendered permanently off-canvas.
    s += lightStream(uv, 0.12, t, 1.0, velBoost);
    s += lightStream(uv, 0.46, t, 4.2, velBoost);
    s += lightStream(uv, 0.82, t, 7.7, velBoost);
    return clamp(s, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= aspect;

    float t = uTime * 0.05;

    // Slow nebula field, gently pulled toward the pointer; scroll speed
    // smears it vertically so fast scrolling reads as motion blur.
    vec2 driftUv = p * 1.15 + uMouse * 0.22;
    driftUv.y *= 1.0 + uVelocity * 0.35;
    float noise = fbm(driftUv + vec2(t, -t * 0.6));
    float noise2 = fbm(driftUv * 1.8 - vec2(t * 0.3, t * 0.2));
    float field = noise * 0.6 + noise2 * 0.4;

    // Base tenebrism falloff: a single light source, decaying to void.
    // Its vertical position drifts slightly with page scroll progress.
    float topLightY = 0.55 - uScroll * 0.4;
    float topLight = smoothstep(1.1, -0.3, distance(p, vec2(0.0, topLightY)));
    vec3 color = mix(uColorVoid, uColorB, clamp(field * 0.5 + 0.5, 0.0, 1.0) * 0.65);
    color = mix(color, uColorB, topLight * 0.35);

    // Three drifting light streams in the accent color, widened/brightened
    // by scroll velocity and sampled at three uv.x offsets for a cheap
    // chromatic fringe on fast scroll.
    float velBoost = 1.0 + uVelocity * 0.8;
    float chromaShift = uVelocity * 0.006;
    float streamsR = streamsAt(uv - vec2(chromaShift, 0.0), t * 20.0, velBoost);
    float streamsG = streamsAt(uv, t * 20.0, velBoost);
    float streamsB = streamsAt(uv + vec2(chromaShift, 0.0), t * 20.0, velBoost);
    vec3 streamsRGB = vec3(streamsR, streamsG, streamsB);
    float streamBrightness = 0.55 * (1.0 + uVelocity * 0.6) * uIntensity;

    color += uColorA * streamsRGB * streamBrightness;
    color += uColorA * streamsRGB * streamsRGB * 0.22 * uIntensity; // bloom-ish hot core

    // Pointer glow — a soft light-leak that follows the cursor.
    vec2 mouseP = uMouse;
    mouseP.x *= aspect;
    float pointerGlow = smoothstep(0.6, 0.0, distance(p, mouseP));
    color += uColorA * pointerGlow * 0.16;

    // Floor to void at the extreme edges so the canvas blends into the page.
    float edgeFalloff = smoothstep(1.35, 0.4, length(p));
    color = mix(uColorVoid, color, edgeFalloff);

    gl_FragColor = vec4(color, 1.0);
  }
`;
