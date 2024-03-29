import { useCallback, useEffect, useRef, useState } from 'react';
import { initShaderProgram, initBuffers, initTexture } from '../lib/WebGL2HelperFunctions';
import vertexShaderSource from '../shaders/all.vert';
import crtFragmentShaderSource from '../shaders/crt.frag';

function useRGBScalerCanvas(
  video: HTMLVideoElement | null,
  maxCanvasWidth: number,
  maxCanvasHeight: number,
  dar: number | undefined,
  par: number | undefined,
  integerScaling: boolean,
  maskIntensity: number,
  scanlineIntensity: number,
) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
  const [shaderProgram, setShaderProgram] = useState<WebGLProgram | null>(null);
  const animationFrame = useRef(0);

  function handleResize() {
    if (!video || !canvas || !gl || !shaderProgram) {
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
    gl.uniform2f(gl.getUniformLocation(shaderProgram, 'uBaseDimension'), video.videoWidth, video.videoHeight);
    gl.uniform2f(gl.getUniformLocation(shaderProgram, 'uBaseDimensionI'), 1 / video.videoWidth, 1 / video.videoHeight);
  }

  function fullscreenCanvas() {
    canvas?.requestFullscreen();
  }

  useEffect(() => {
    handleResize();
  }, [canvas, gl, maxCanvasHeight, maxCanvasWidth, dar, par, integerScaling, video]);

  useEffect(() => {
    if (!gl || !shaderProgram) {
      return;
    }
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'maskIntensity'), maskIntensity);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'scanlineIntensity'), scanlineIntensity);
  }, [maskIntensity, scanlineIntensity]);

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

      const currentShaderProgram = initShaderProgram(currentGl, vertexShaderSource, crtFragmentShaderSource);
      if (!currentShaderProgram) {
        return;
      }
      setShaderProgram(currentShaderProgram);
      const programInfo = {
        program: currentShaderProgram,
        attribLocations: {
          vertexPosition: currentGl.getAttribLocation(currentShaderProgram, 'aVertexPosition'),
          textureCoord: currentGl.getAttribLocation(currentShaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
          uSampler: currentGl.getUniformLocation(currentShaderProgram, 'uSampler'),
          uBaseDimension: currentGl.getUniformLocation(currentShaderProgram, 'uBaseDimension'),
          uBaseDimensionI: currentGl.getUniformLocation(currentShaderProgram, 'uBaseDimensionI'),
          maskIntensity: currentGl.getUniformLocation(currentShaderProgram, 'maskIntensity'),
          scanlineIntensity: currentGl.getUniformLocation(currentShaderProgram, 'scanlineIntensity'),
        },
      };
      const buffers = initBuffers(currentGl);
      initTexture(currentGl);
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
      currentGl.uniform1f(programInfo.uniformLocations.maskIntensity, maskIntensity);
      currentGl.uniform1f(programInfo.uniformLocations.scanlineIntensity, scanlineIntensity);
    },
    [video]
  );

  function render() {
    if (!video || !gl) {
      return;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    animationFrame.current = requestAnimationFrame(render);
  }

  function cancelRender() {
    cancelAnimationFrame(animationFrame.current);
  }

  return {
    canvasRef,
    render,
    cancelRender,
    handleResize,
    fullscreenCanvas,
  };
}

export default useRGBScalerCanvas;
