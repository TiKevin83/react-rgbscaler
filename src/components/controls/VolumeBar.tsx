import { InputHTMLAttributes, RefObject, useEffect, useState } from "react";

interface VolumeBarProps extends InputHTMLAttributes<HTMLInputElement> {
  volume?: number,
  videoRef: RefObject<HTMLVideoElement> | null,
}

function VolumeBar(props: VolumeBarProps) {
  const { videoRef, volume: startingVolume } = props;
  const [volume, setVolume] = useState(startingVolume || 1);

  const onVolumeBarChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    const newVolume = parseFloat(event.currentTarget.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  }

  useEffect(() => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    videoRef.current.volume = volume;
  })

  return (
    <>
      <label htmlFor="volume-bar">Volume</label>
      <input
        type="range"
        id="volume-bar"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={onVolumeBarChange}
      ></input>
    </>
  );
}

export default VolumeBar;
