import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------
   Atmosphère : une lumière liquide derrière toute la page.
   Un shader WebGL rendu à demi-résolution (le dégradé est doux, donc
   invisible à l'oeil et presque gratuit pour le GPU). Les nappes de couleur
   dérivent seules, suivent le pointeur et se déplacent avec le scroll.
   Repli : dégradés CSS statiques (pas de WebGL, mouvement réduit).
------------------------------------------------ */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
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

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.04;
  float s = uScroll;

  /* le pointeur plie doucement le champ */
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  vec2 toMouse = p - m;
  float near = exp(-dot(toMouse, toMouse) * 3.2);
  p += toMouse * near * 0.22;

  vec2 warp = vec2(
    snoise(p * 0.62 + vec2(t, s * 0.16)),
    snoise(p * 0.62 + vec2(-t, 3.7 + s * 0.12))
  );
  vec2 q = p + 0.3 * warp;

  float n1 = snoise(q * 0.8 + vec2(0.0, t * 1.2 + s * 0.42)) * 0.5 + 0.5;
  float n2 = snoise(q * 1.0 + vec2(4.3, -t - s * 0.3)) * 0.5 + 0.5;
  float n3 = snoise(q * 0.58 + vec2(-2.1, t * 0.7 + s * 0.24)) * 0.5 + 0.5;

  vec3 paper = vec3(0.957, 0.949, 0.929);
  vec3 lilac = vec3(0.776, 0.612, 0.933);
  vec3 sky = vec3(0.545, 0.808, 0.969);
  vec3 peach = vec3(1.0, 0.816, 0.69);

  /* la colonne de lecture reste calme : la couleur vit vers les bords */
  float edge = smoothstep(0.08, 0.72, distance(uv, vec2(0.4, 0.5)));
  float calm = mix(0.42, 1.0, edge);

  /* la teinte dominante tourne lentement avec le scroll */
  float ph = s * 0.55;
  float wL = 0.62 + 0.2 * sin(ph);
  float wS = 0.6 + 0.2 * sin(ph + 2.1);
  float wP = 0.5 + 0.2 * sin(ph + 4.2);

  vec3 col = paper;
  col = mix(col, lilac, smoothstep(0.5, 0.93, n1) * wL * calm);
  col = mix(col, sky, smoothstep(0.52, 0.95, n2) * wS * calm);
  col = mix(col, peach, smoothstep(0.58, 0.98, n3) * wP * calm);

  /* halo qui suit le pointeur */
  col = mix(col, mix(lilac, sky, uv.x), near * 0.3);

  /* tramage : évite les bandes dans les dégradés */
  float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (d - 0.5) * 0.014;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl && vs && fs ? gl.createProgram() : null;
    if (!gl || !vs || !fs || !program) {
      setFallback(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uScroll = gl.getUniformLocation(program, "uScroll");

    /* demi-résolution, plafonnée : le dégradé n'a pas besoin de plus */
    const resize = () => {
      const scale = Math.min(0.5, 900 / Math.max(1, window.innerWidth));
      const w = Math.max(160, Math.round(window.innerWidth * scale));
      const h = Math.max(160, Math.round(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    let mx = 0.72;
    let my = 0.7;
    let tx = mx;
    let ty = my;
    let scroll = window.scrollY / Math.max(1, window.innerHeight);
    let raf = 0;
    let frame = 0;
    let running = true;
    const t0 = performance.now();

    const draw = (now: number) => {
      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;
      const target = window.scrollY / Math.max(1, window.innerHeight);
      scroll += (target - scroll) * 0.08;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      /* tactile : 30 images/s suffisent, la batterie dit merci */
      if (coarse && frame++ % 2 === 1) return;
      draw(now);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / Math.max(1, window.innerWidth);
      ty = 1 - e.clientY / Math.max(1, window.innerHeight);
    };
    const onVisibility = () => {
      const visible = !document.hidden;
      if (visible && !running && !reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    const onResize = () => {
      resize();
      if (reduced) draw(performance.now());
    };
    const onScrollStatic = () => {
      scroll = window.scrollY / Math.max(1, window.innerHeight);
      draw(t0);
    };

    draw(performance.now());
    canvas.classList.add("is-ready");

    if (reduced) {
      running = false;
      window.addEventListener("scroll", onScrollStatic, { passive: true });
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
    }
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScrollStatic);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      {fallback ? (
        <div aria-hidden className="atmosphere-fallback" />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="atmosphere" />
      )}
      <div aria-hidden className="paper-grain" />
    </>
  );
}
