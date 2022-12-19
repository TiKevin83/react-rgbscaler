import { useCallback, useEffect, useState } from 'react';
import { initShaderProgram, initBuffers, initTexture } from '../lib/WebGL2HelperFunctions';
import areaVertexShaderSource from '../shaders/area.vert';
import areaFragmentShaderSource from '../shaders/area.frag';

function useRGBScalerCanvas(
  video: HTMLVideoElement | null,
  maxCanvasWidth: number,
  maxCanvasHeight: number,
  dar: number | undefined,
  par: number | undefined,
  integerScaling: boolean
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
  const [texture, setTexture] = useState<WebGLTexture | null>(null);
  let animationFrame: number;

  useEffect(() => {
    if (!video || !canvas || !gl) {
      return;
    }
    const aspect = dar ?? (((par || 1) * video.videoWidth) / video.videoHeight);
    let scaleFactor = Math.min(
      (maxCanvasHeight * devicePixelRatio) / video.videoHeight,
      (maxCanvasWidth * devicePixelRatio) / (video.videoHeight * aspect)
    );
    scaleFactor = integerScaling ? Math.floor(scaleFactor) : scaleFactor;
    const cssPixelHeight = video.videoHeight * scaleFactor;
    const cssPixelWidth = cssPixelHeight * aspect;
    canvas.width = Math.round(cssPixelWidth);
    canvas.height = Math.round(cssPixelHeight);
    canvas.style.width = `${Math.round(cssPixelWidth / devicePixelRatio)}px`;
    canvas.style.height = `${Math.round(cssPixelHeight / devicePixelRatio)}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }, [canvas, gl, maxCanvasHeight, maxCanvasWidth, dar, par, integerScaling, video]);

  const canvasRef = useCallback(
    (currentCanvas: HTMLCanvasElement) => {
      setCanvas(currentCanvas);
      if (!currentCanvas || !video) {
        return;
      }
      const currentGl = currentCanvas.getContext('webgl2');
      if (!currentGl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
      }
      setGl(currentGl);

      const shaderProgram = initShaderProgram(currentGl, areaVertexShaderSource, areaFragmentShaderSource);
      if (!shaderProgram) {
        return;
      }
      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: currentGl.getAttribLocation(shaderProgram, 'aVertexPosition'),
          textureCoord: currentGl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
          uSampler: currentGl.getUniformLocation(shaderProgram, 'uSampler'),
          uBaseDimension: currentGl.getUniformLocation(shaderProgram, 'uBaseDimension'),
          uBaseDimensionI: currentGl.getUniformLocation(shaderProgram, 'uBaseDimensionI'),
        },
      };
      const buffers = initBuffers(currentGl);
      setTexture(initTexture(currentGl));
      currentGl.bindBuffer(currentGl.ARRAY_BUFFER, buffers.position);
      currentGl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        currentGl.FLOAT,
        false,
        0,
        0
      );
      currentGl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      currentGl.bindBuffer(currentGl.ARRAY_BUFFER, buffers.textureCoord);
      currentGl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        2,
        currentGl.FLOAT,
        false,
        0,
        0
      );
      currentGl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
      currentGl.bindBuffer(currentGl.ELEMENT_ARRAY_BUFFER, buffers.indices);
      currentGl.useProgram(programInfo.program);
      currentGl.activeTexture(currentGl.TEXTURE0);
      currentGl.uniform1i(programInfo.uniformLocations.uSampler, 0);
      currentGl.pixelStorei(currentGl.UNPACK_FLIP_Y_WEBGL, true);
      currentGl.uniform2f(programInfo.uniformLocations.uBaseDimension, video.videoWidth, video.videoHeight);
      currentGl.uniform2f(programInfo.uniformLocations.uBaseDimensionI, 1 / video.videoWidth, 1 / video.videoHeight);
    },
    [video]
  );

  function render() {
    if (!video || !gl) {
      return;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    animationFrame = requestAnimationFrame(render);
  }

  function handlePlayPauseClick() {
    setIsPlaying((currentIsPlaying) => {
      if (currentIsPlaying) {
        video?.pause();
        cancelAnimationFrame(animationFrame);
      } else {
        video?.play();
        animationFrame = requestAnimationFrame(render);
      }
      return !currentIsPlaying;
    });
  }

  return {
    isPlaying,
    handlePlayPauseClick,
    canvasRef,
  };
}

export default useRGBScalerCanvas;
