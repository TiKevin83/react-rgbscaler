import { ButtonHTMLAttributes, CanvasHTMLAttributes, useRef, useState, VideoHTMLAttributes } from "react";
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
  const { playPauseButtonProps, canvasProps, videoProps, maxCanvasWidth, maxCanvasHeight, dar, par } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muteLabel, setMuteLabel] = useState("Mute");
  const [seekTime, setSeekTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const onVideoTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = event => {
    setSeekTime(event.currentTarget.currentTime * 100 / event.currentTarget.duration);
  }

  const onSeekBarChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    videoRef.current.currentTime = videoRef.current.duration * (parseInt(event.currentTarget.value) / 100);
  }

  const onSeekBarMouseDown: React.MouseEventHandler<HTMLInputElement> = () => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    videoRef.current.pause();
  }

  const onSeekBarMouseUp: React.MouseEventHandler<HTMLInputElement> = () => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    videoRef.current.play();
  }

  const onMuteClick: React.MouseEventHandler<HTMLButtonElement> = event => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    if (videoRef.current.muted) {
      videoRef.current.muted = false;
      setMuteLabel("Mute")
    } else {
      videoRef.current.muted = true;
      setMuteLabel("Unmute");
    }
  }

  const onVolumeBarChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    const newVolume = parseFloat(event.currentTarget.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  }

  return (
    <div style={{display: "inline-block"}}>
      <video
        ref={videoRef}
        crossOrigin='anonymous'
        playsInline={true}
        style={{display: "none"}}
        onTimeUpdate={onVideoTimeUpdate}
        {...videoProps}
      />
      <label htmlFor="seek-bar">Seek</label>
      <input type="range" id="seek-bar" value={seekTime} onChange={onSeekBarChange} onMouseDown={onSeekBarMouseDown} onMouseUp={onSeekBarMouseUp}></input>
      <button type="button" id="mute" onClick={onMuteClick}>{muteLabel}</button>
      <label htmlFor="volume-bar">Volume</label>
      <input type="range" id="volume-bar" min="0" max="1" step="0.1" value={volume} onChange={onVolumeBarChange}></input>
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
  )
}

export default RGBScaler;