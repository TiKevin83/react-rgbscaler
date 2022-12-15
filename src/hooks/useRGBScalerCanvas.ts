import { RefObject, useCallback, useEffect, useState } from "react";
import { initShaderProgram, initBuffers, initTexture } from '../lib/WebGL2HelperFunctions';
import areaVertexShaderSource from '../shaders/area.vert';
import areaFragmentShaderSource from '../shaders/area.frag';

function useRGBScalerCanvas(
  videoRef: RefObject<HTMLVideoElement> | null,
  maxCanvasWidth: number,
  maxCanvasHeight: number,
  dar: number | undefined,
  par: number | undefined,
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
  const [texture, setTexture] = useState<WebGLTexture | null>(null);
  let animationFrame: number;

  useEffect(() => {
    const video = videoRef?.current;
    if (!video || !canvas || !gl) {
      return;
    }
    const aspect = dar ? dar : (par ? par : 1) * video.videoWidth / video.videoHeight;
    console.log(aspect);
    console.log(maxCanvasWidth);
    console.log(maxCanvasHeight);
    console.log(video.videoWidth);
    console.log(video.videoHeight);
    const scaleFactor = Math.min(maxCanvasHeight / video.videoHeight, maxCanvasWidth / (video.videoHeight * aspect));
    canvas.width = Math.round(video.videoHeight * scaleFactor * aspect * devicePixelRatio);
    canvas.height = Math.round(video.videoHeight * scaleFactor * devicePixelRatio);
    canvas.style.width = Math.round(video.videoHeight * scaleFactor * aspect) + "px";
    canvas.style.height = Math.round(video.videoHeight * scaleFactor) + "px";
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }, [canvas, gl, maxCanvasHeight, maxCanvasWidth, videoRef]);

  const canvasRef = useCallback((currentCanvas: HTMLCanvasElement) => {
    setCanvas(currentCanvas);
    if (!currentCanvas || !videoRef) {
      return;
    }
    const video = videoRef.current;
    if (!video) {
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
      }
    };
    const buffers = initBuffers(currentGl);
    setTexture(initTexture(currentGl));

    {
      const numComponents = 3;
      const type = currentGl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      currentGl.bindBuffer(currentGl.ARRAY_BUFFER, buffers.position);
      currentGl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      currentGl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    }
    {
      const numComponents = 2;
      const type = currentGl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      currentGl.bindBuffer(currentGl.ARRAY_BUFFER, buffers.textureCoord);
      currentGl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      currentGl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
    }

    currentGl.bindBuffer(currentGl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    currentGl.useProgram(programInfo.program);
    currentGl.activeTexture(currentGl.TEXTURE0);
    currentGl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    currentGl.pixelStorei(currentGl.UNPACK_FLIP_Y_WEBGL, true);
    currentGl.uniform2f(programInfo.uniformLocations.uBaseDimension, video.videoWidth, video.videoHeight);
    currentGl.uniform2f(programInfo.uniformLocations.uBaseDimensionI, 1 / video.videoWidth, 1 / video.videoHeight);
  }, [videoRef]);

  function drawScene() {
    gl?.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
  
  function updateTexture() {
    gl?.bindTexture(gl.TEXTURE_2D, texture);
    if (!videoRef?.current) {
      return;
    }
    gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoRef.current);
  }

  function render() {
    updateTexture();
    drawScene();
    animationFrame = requestAnimationFrame(render);
  }

  function handlePlayPauseClick() {
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
  }

  return {
    isPlaying,
    handlePlayPauseClick,
    canvasRef,
  }
}

export default useRGBScalerCanvas;