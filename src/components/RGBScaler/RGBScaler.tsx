import {
  ButtonHTMLAttributes,
  CanvasHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  useRef,
  useState,
  VideoHTMLAttributes,
} from 'react';
import useRGBScaler from '../../hooks/useRGBScaler';
import MuteButton from '../controls/MuteButton';
import SeekBar from '../controls/SeekBar';
import VolumeBar from '../controls/VolumeBar';

interface CustomVolumeBarProps extends InputHTMLAttributes<HTMLInputElement> {
  volume: number;
}

interface RGBScalerProps extends HTMLAttributes<HTMLDivElement> {
  playPauseButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  seekBarProps?: InputHTMLAttributes<HTMLInputElement>;
  muteButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  volumeBarProps?: CustomVolumeBarProps;
  videoProps?: VideoHTMLAttributes<HTMLVideoElement>;
  canvasProps?: CanvasHTMLAttributes<HTMLCanvasElement>;
  maxCanvasWidth: number;
  maxCanvasHeight: number;
  dar?: number;
  par?: number;
  integerScaling?: boolean;
}

export default function RGBScaler(props: RGBScalerProps) {
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
    integerScaling = false,
    style,
    ...rest
  } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [seekTime, setSeekTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { canvasRef, render, cancelRender } = useRGBScaler(
    videoRef.current,
    maxCanvasWidth,
    maxCanvasHeight,
    dar,
    par,
    integerScaling
  );

  const onVideoTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    if (event.currentTarget.duration > 0) {
      setSeekTime((event.currentTarget.currentTime * 100) / event.currentTarget.duration);
    }
  };

  function handlePlayPauseClick() {
    setIsPlaying((currentIsPlaying) => {
      if (currentIsPlaying) {
        videoRef.current?.pause();
        cancelRender();
      } else {
        videoRef.current?.play();
        requestAnimationFrame(render);
      }
      return !currentIsPlaying;
    });
  }

  function handleVideoLoaded() {
    cancelRender();
    videoRef.current?.pause();
    setIsPlaying(false);
  }

  return (
    <div style={{ display: 'inline-block', ...style }} {...rest}>
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        playsInline
        style={{ display: 'none' }}
        onTimeUpdate={onVideoTimeUpdate}
        onLoadedMetadata={handleVideoLoaded}
        {...videoProps}
      />
      <SeekBar videoRef={videoRef} seekTime={seekTime} {...seekBarProps} />
      <MuteButton videoRef={videoRef} {...muteButtonProps} />
      <VolumeBar videoRef={videoRef} {...volumeBarProps} />
      <button type="button" onClick={handlePlayPauseClick} {...playPauseButtonProps}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <canvas ref={canvasRef} style={{ display: 'block' }} {...canvasProps} />
    </div>
  );
}
