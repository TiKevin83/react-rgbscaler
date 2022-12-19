import { ButtonHTMLAttributes, RefObject, useState } from 'react';

interface MuteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  videoRef: RefObject<HTMLVideoElement> | null;
}

function MuteButton(props: MuteButtonProps) {
  const { videoRef } = props;
  const [muteLabel, setMuteLabel] = useState('Mute');

  const onMuteClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    if (videoRef.current.muted) {
      videoRef.current.muted = false;
      setMuteLabel('Mute');
    } else {
      videoRef.current.muted = true;
      setMuteLabel('Unmute');
    }
  };

  return (
    <button type="button" id="mute" onClick={onMuteClick}>
      {muteLabel}
    </button>
  );
}

export default MuteButton;
