'use client'

import { useEffect, useRef } from 'react'

const VERT = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_resolution;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t  = u_time * 0.22;

    // Layered wave noise
    float w1 = sin(uv.x * 2.4 + t * 0.9  + cos(uv.y * 1.7 + t * 0.5)) * 0.5 + 0.5;
    float w2 = sin(uv.y * 2.0 + t * 0.65 + sin(uv.x * 2.6 + t * 0.4)) * 0.5 + 0.5;
    float w3 = sin((uv.x - uv.y) * 1.8 + t * 1.1
                   + sin(uv.x * 1.3 + uv.y * 0.9 + t * 0.7)) * 0.5 + 0.5;

    // Palette from reference: cream-white · soft lavender · hot magenta
    vec3 c1 = vec3(1.000, 0.945, 0.973); // #fff1f8 cream-white
    vec3 c2 = vec3(0.906, 0.816, 0.984); // #e7d0fb soft lavender
    vec3 c3 = vec3(1.000, 0.239, 0.808); // #ff3dcf hot magenta

    vec3 col = mix(c1, c2, w1);
    col      = mix(col, c3, clamp(w2 * 0.55 + w3 * 0.45, 0.0, 1.0));

    // Subtle luminance pulse
    col *= 0.88 + 0.12 * sin(t * 1.3 + uv.x * 1.1 + uv.y * 0.8);

    gl_FragColor = vec4(col, 1.0);
  }
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    // Build program
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER,   VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes  = gl.getUniformLocation(prog, 'u_resolution')

    // Resize handler
    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas!.width  = window.innerWidth  * dpr
      canvas!.height = window.innerHeight * dpr
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Render loop
    let id: number
    const start = performance.now()
    function render() {
      gl!.uniform1f(uTime, (performance.now() - start) / 1000)
      gl!.drawArrays(gl!.TRIANGLES, 0, 6)
      id = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}
