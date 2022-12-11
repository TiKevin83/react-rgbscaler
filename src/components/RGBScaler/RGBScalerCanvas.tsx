import { ButtonHTMLAttributes, CanvasHTMLAttributes, memo, RefObject } from 'react';
import useRGBScalerCanvas from '../../hooks/useRGBScalerCanvas';

interface RGBScalerCanvasProps {
  videoRef: RefObject<HTMLVideoElement> | null,
  canvasProps?: CanvasHTMLAttributes<HTMLCanvasElement>,
  playPauseButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>,
  maxCanvasWidth: number,
  maxCanvasHeight: number,
  dar: number,
  par: number,
}

const RGBScalerCanvas = memo(function RGBScalerCanvas(props: RGBScalerCanvasProps)  {
  const { videoRef, canvasProps, playPauseButtonProps, maxCanvasHeight, maxCanvasWidth, dar, par } = props;
  const { isPlaying, handlePlayPauseClick, canvasRef } = useRGBScalerCanvas(videoRef, maxCanvasHeight, maxCanvasWidth, dar, par);
  
  return (
    <>
      <button onClick={handlePlayPauseClick} {...playPauseButtonProps}>{isPlaying ? "Pause" : "Play"}</button>
      <canvas ref={canvasRef} {...canvasProps} />
    </>
  )
});

export default RGBScalerCanvas;
