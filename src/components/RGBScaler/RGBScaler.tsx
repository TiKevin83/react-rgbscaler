import { ButtonHTMLAttributes, CanvasHTMLAttributes, useRef, VideoHTMLAttributes } from "react";
import RGBScalerCanvas from "./RGBScalerCanvas";

interface RGBScalerProps {
  playPauseButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>,
  videoProps?: VideoHTMLAttributes<HTMLVideoElement>,
  canvasProps?: CanvasHTMLAttributes<HTMLCanvasElement>,
  maxCanvasWidth: number,
  maxCanvasHeight: number,
  dar?: number,
  par?: number
}

function RGBScaler(props: RGBScalerProps) {
  const { playPauseButtonProps, canvasProps, videoProps, maxCanvasWidth, maxCanvasHeight, dar = 1, par = 1 } = props;
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <video
        ref={videoRef}
        crossOrigin='anonymous'
        playsInline={true}
        style={{display: "none"}}
        {...videoProps}
      />
      <RGBScalerCanvas
        videoRef={videoRef}
        playPauseButtonProps={playPauseButtonProps}
        canvasProps={canvasProps}
        maxCanvasWidth={maxCanvasWidth}
        maxCanvasHeight={maxCanvasHeight}
        dar={dar}
        par={par}
      />
    </>
  )
}

export default RGBScaler;