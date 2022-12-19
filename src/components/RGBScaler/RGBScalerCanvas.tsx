import { ButtonHTMLAttributes, CanvasHTMLAttributes, memo, RefObject } from 'react';
import useRGBScalerCanvas from '../../hooks/useRGBScalerCanvas';

interface RGBScalerCanvasProps {
  video: HTMLVideoElement | null;
  canvasProps?: CanvasHTMLAttributes<HTMLCanvasElement>;
  playPauseButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  maxCanvasWidth: number;
  maxCanvasHeight: number;
  dar?: number;
  par?: number;
  integerScaling: boolean;
}

const RGBScalerCanvas = memo((props: RGBScalerCanvasProps) => {
  const { video, canvasProps, playPauseButtonProps, maxCanvasWidth, maxCanvasHeight, dar, par, integerScaling } =
    props;
  const { isPlaying, handlePlayPauseClick, canvasRef } = useRGBScalerCanvas(
    video,
    maxCanvasWidth,
    maxCanvasHeight,
    dar,
    par,
    integerScaling
  );

  return (
    <>
      <button type="button" onClick={handlePlayPauseClick} {...playPauseButtonProps}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <canvas ref={canvasRef} style={{ display: 'block' }} {...canvasProps} />
    </>
  );
});

export default RGBScalerCanvas;
