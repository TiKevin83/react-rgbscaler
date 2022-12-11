import { MouseEventHandler, RefObject, useCallback, useEffect, useState } from "react";
import { initShaderProgram, initBuffers, initTexture } from '../lib/WebGL2HelperFunctions';

const areaVertexShaderSource = `#version 300 es
precision highp float;

in vec4 aVertexPosition;
in vec2 aTextureCoord;

out highp vec2 vTextureCoord;

void main(void) {
  gl_Position = aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`

const areaFragmentShaderSource = `#version 300 es
precision highp float;

// Adapted from OBS Source code
// https://github.com/obsproject/obs-studio/blob/0729007f19f7bda9e9fb94b5cf5ed1d232e0792c/libobs/data/area.effect#L98

in vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D uSampler;
uniform vec2  uBaseDimension;
uniform vec2  uBaseDimensionI;

void main(void) {
  vec2 uv = vTextureCoord;
  vec2 uv_delta = vec2(dFdx(uv.x), dFdy(uv.y));

  vec2 uv_min = uv - 0.5 * uv_delta;
  vec2 uv_max = uv_min + uv_delta;

  vec2 load_index_first = floor(uv_min * uBaseDimension);
  vec2 load_index_last = ceil(uv_max * uBaseDimension) - 1.0;

  if (load_index_first.x < load_index_last.x) {
    float uv_boundary_x = load_index_last.x * uBaseDimensionI.x;
    uv.x = ((uv.x - uv_boundary_x) / uv_delta.x) * uBaseDimensionI.x + uv_boundary_x;
  } else {
    uv.x = (load_index_first.x + 0.5) * uBaseDimensionI.x;
  }
  if (load_index_first.y < load_index_last.y) {
    float uv_boundary_y = load_index_last.y * uBaseDimensionI.y;
    uv.y = ((uv.y - uv_boundary_y) / uv_delta.y) * uBaseDimensionI.y + uv_boundary_y;
  } else {
    uv.y = (load_index_first.y + 0.5) * uBaseDimensionI.y;
  }

  fragColor =  texture(uSampler, uv);
}
`

function useRGBScalerCanvas(
  videoRef: RefObject<HTMLVideoElement> | null,
  maxCanvasWidth: number,
  maxCanvasHeight: number,
  dar: number,
  par: number
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [handlePlayPauseClick, setHandlePlayPauseClick] = useState<MouseEventHandler<HTMLButtonElement>>(() => {() => {}});
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video || !canvas || !gl) {
      return;
    }
    const drawAreaHeight = maxCanvasHeight;
    const aspect = dar !== 1 ? dar : par * video.videoWidth / video.videoHeight;;
    const scaleFactor = Math.min(drawAreaHeight * devicePixelRatio / video.videoHeight, maxCanvasWidth * devicePixelRatio / (video.videoHeight * aspect));
    const newCanvasWidth = video.videoHeight * scaleFactor * aspect / devicePixelRatio;
    const newCanvasHeight = video.videoHeight * scaleFactor / devicePixelRatio ;
  
    canvas.width = Math.round(video.videoHeight * scaleFactor * aspect);
    canvas.height = Math.round(video.videoHeight * scaleFactor);
    canvas.style.width = Math.round(newCanvasWidth) + "px";
    canvas.style.height = Math.round(newCanvasHeight) + "px";
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }, [canvas, gl, maxCanvasHeight, maxCanvasWidth, videoRef]);

  const canvasRef = useCallback((canvas: HTMLCanvasElement) => {
    setCanvas(canvas);
    let animationFrame = 0;
    if (!canvas || !videoRef) {
      return;
    }
    const video = videoRef.current;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }
    setGl(gl);
    const shaderProgram = initShaderProgram(gl, areaVertexShaderSource, areaFragmentShaderSource);
    if (!shaderProgram) {
      return;
    }
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        uBaseDimension: gl.getUniformLocation(shaderProgram, 'uBaseDimension'),
        uBaseDimensionI: gl.getUniformLocation(shaderProgram, 'uBaseDimensionI'),
      }
    };
    const buffers = initBuffers(gl);
    const texture = initTexture(gl)!;

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    }
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
      gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (!video) {
      return;
    }

    function drawScene() {
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }
    
    function updateTexture() {
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, video!);
    }

    function render() {
      updateTexture();
      drawScene();
      animationFrame = requestAnimationFrame(render);
    }

    gl.uniform2f(programInfo.uniformLocations.uBaseDimension, video.videoWidth, video.videoHeight);
    gl.uniform2f(programInfo.uniformLocations.uBaseDimensionI, 1 / video.videoWidth, 1 / video.videoHeight);

    setHandlePlayPauseClick(() => {return () => {
      setIsPlaying(currentIsPlaying => {
        if (currentIsPlaying) {
          videoRef?.current?.pause();
          cancelAnimationFrame(animationFrame);
        } else {
          videoRef?.current?.play();
          animationFrame = requestAnimationFrame(render);
        }
        return !currentIsPlaying
      });
    }});
  }, [videoRef]);

  return {
    isPlaying,
    handlePlayPauseClick,
    canvasRef,
  }
}

export default useRGBScalerCanvas;