import { InputHTMLAttributes } from 'react';

interface SeekBarProps extends InputHTMLAttributes<HTMLInputElement> {
  videoRef: HTMLVideoElement | null;
  seekTime: number;
}

function SeekBar(props: SeekBarProps) {
  const { videoRef, seekTime } = props;

  const onSeekBarChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!videoRef || !videoRef) {
      return;
    }
    videoRef.currentTime = videoRef.duration * (parseInt(event.currentTarget.value, 10) / 100);
  };

  const onSeekBarMouseDown: React.MouseEventHandler<HTMLInputElement> = () => {
    if (!videoRef || !videoRef) {
      return;
    }
    videoRef.pause();
  };

  const onSeekBarMouseUp: React.MouseEventHandler<HTMLInputElement> = () => {
    if (!videoRef || !videoRef) {
      return;
    }
    videoRef.play();
  };

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
      />
    </>
  );
}

export default SeekBar;
