import {
  ButtonHTMLAttributes,
  CanvasHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
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
  fullscreenButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
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
  crtMode?: boolean;
}

export default function RGBScaler(props: RGBScalerProps) {
  const {
    playPauseButtonProps,
    fullscreenButtonProps,
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
    crtMode = false,
    style,
    ...rest
  } = props;
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [seekTime, setSeekTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { canvasRef, render, cancelRender, handleResize, fullscreenCanvas } = useRGBScaler(
    videoRef,
    maxCanvasWidth,
    maxCanvasHeight,
    dar,
    par,
    integerScaling,
    crtMode,
  );

  const onVideoTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    if (event.currentTarget.duration > 0) {
      setSeekTime((event.currentTarget.currentTime * 100) / event.currentTarget.duration);
    }
  };

  function handlePlayPauseClick() {
    setIsPlaying((currentIsPlaying) => {
      if (currentIsPlaying) {
        videoRef?.pause();
        cancelRender();
      } else {
        videoRef?.play();
        requestAnimationFrame(render);
      }
      return !currentIsPlaying;
    });
  }

  function handleFullscreenClick() {
    fullscreenCanvas();
  }

  function handleVideoLoaded() {
    cancelRender();
    videoRef?.pause();
    setIsPlaying(false);
    handleResize();
  }

  return (
    <div style={{ display: 'inline-block', ...style }} {...rest}>
      <video
        ref={newVideoRef => setVideoRef(newVideoRef)}
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
      <button type="button" onClick={handleFullscreenClick} {...fullscreenButtonProps} >FullScreen</button>
      <canvas ref={canvasRef} style={{ display: 'block' }} {...canvasProps} />
    </div>
  );
}
