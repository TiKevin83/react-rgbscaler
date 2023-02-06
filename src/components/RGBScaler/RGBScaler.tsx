import {
  ButtonHTMLAttributes,
  CanvasHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  SourceHTMLAttributes,
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
  sourceProps?: SourceHTMLAttributes<HTMLSourceElement>[];
  canvasProps?: CanvasHTMLAttributes<HTMLCanvasElement>;
  maxCanvasWidth: number;
  maxCanvasHeight: number;
  dar?: number;
  par?: number;
  maskIntensity?: number;
  scanlineIntensity?: number;
  integerScaling?: boolean;
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
    sourceProps,
    maxCanvasWidth,
    maxCanvasHeight,
    dar,
    par,
    maskIntensity = 0,
    scanlineIntensity = 0,
    integerScaling = false,
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
    maskIntensity,
    scanlineIntensity,
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

  function handleVideoEnded() {
    cancelRender();
    setIsPlaying(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1em',
        ...style,
      }}
      {...rest}
    >
      <video
        ref={newVideoRef => setVideoRef(newVideoRef)}
        crossOrigin="anonymous"
        playsInline
        style={{ display: 'none' }}
        onTimeUpdate={onVideoTimeUpdate}
        onLoadedMetadata={handleVideoLoaded}
        onEnded={handleVideoEnded}
        {...videoProps}
      >
        {sourceProps ? sourceProps.map((thisSourceProps) => <source key={thisSourceProps.src} {...thisSourceProps} />) : null}
      </video>
      <button type="button" onClick={handlePlayPauseClick} {...playPauseButtonProps}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <SeekBar videoRef={videoRef} seekTime={seekTime} {...seekBarProps} />
      <MuteButton videoRef={videoRef} {...muteButtonProps} />
      <VolumeBar videoRef={videoRef} {...volumeBarProps} />
      <button type="button" onClick={handleFullscreenClick} {...fullscreenButtonProps} >FullScreen</button>
      <div style={{flexBasis: "100%", height: 0}} />
      <canvas ref={canvasRef} style={{ display: 'block' }} {...canvasProps} />
    </div>
  );
}
