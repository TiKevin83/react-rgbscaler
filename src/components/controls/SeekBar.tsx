import { InputHTMLAttributes, RefObject } from "react";

interface SeekBarProps extends InputHTMLAttributes<HTMLInputElement> {
  videoRef: RefObject<HTMLVideoElement> | null,
  seekTime: number,
}

function SeekBar(props: SeekBarProps) {
  const {videoRef, seekTime} = props;

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

  return (
    <>
      <label htmlFor="seek-bar">Seek</label>
      <input
        type="range"
        id="seek-bar"
        value={seekTime}
        onChange={onSeekBarChange}
        onMouseDown={onSeekBarMouseDown}
        onMouseUp={onSeekBarMouseUp}
      ></input>
    </>
  );
}

export default SeekBar;
