import {
  ButtonHTMLAttributes,
  CanvasHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";
import MuteButton from "../controls/MuteButton";
import SeekBar from "../controls/SeekBar";
import VolumeBar from "../controls/VolumeBar";
import RGBScalerCanvas from "./RGBScalerCanvas";

interface customVolumeBarProps extends InputHTMLAttributes<HTMLInputElement> {
  volume: number;
}

interface RGBScalerProps extends HTMLAttributes<HTMLDivElement> {
  playPauseButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  seekBarProps?: InputHTMLAttributes<HTMLInputElement>;
  muteButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  volumeBarProps?: customVolumeBarProps;
  videoProps?: VideoHTMLAttributes<HTMLVideoElement>;
  canvasProps?: CanvasHTMLAttributes<HTMLCanvasElement>;
  maxCanvasWidth: number;
  maxCanvasHeight: number;
  dar?: number;
  par?: number;
}

function RGBScaler(props: RGBScalerProps) {
  const {
    playPauseButtonProps,
    seekBarProps,
    muteButtonProps,
    volumeBarProps,
    canvasProps,
    videoProps,
    maxCanvasWidth,
    maxCanvasHeight,
    dar,
    par,
    style,
    ...rest
  } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [seekTime, setSeekTime] = useState(0);

  const onVideoTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = (
    event
  ) => {
    setSeekTime(
      (event.currentTarget.currentTime * 100) / event.currentTarget.duration
    );
  };

  return (
    <div style={{ display: "inline-block", ...style }} {...rest}>
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        playsInline={true}
        style={{ display: "none" }}
        onTimeUpdate={onVideoTimeUpdate}
        {...videoProps}
      />
      <SeekBar
        videoRef={videoRef}
        seekTime={seekTime}
        {...seekBarProps}
      ></SeekBar>
      <MuteButton videoRef={videoRef} {...muteButtonProps}></MuteButton>
      <VolumeBar videoRef={videoRef} {...volumeBarProps}></VolumeBar>
      <RGBScalerCanvas
        videoRef={videoRef}
        playPauseButtonProps={playPauseButtonProps}
        canvasProps={canvasProps}
        maxCanvasWidth={maxCanvasWidth}
        maxCanvasHeight={maxCanvasHeight}
        dar={dar}
        par={par}
      />
    </div>
  );
}

export default RGBScaler;
