import { ButtonHTMLAttributes, useState } from 'react';

interface MuteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  videoRef: HTMLVideoElement | null;
}

function MuteButton(props: MuteButtonProps) {
  const { videoRef } = props;
  const [muteLabel, setMuteLabel] = useState('Mute');

  const onMuteClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (!videoRef) {
      return;
    }
    if (videoRef.muted) {
      videoRef.muted = false;
      setMuteLabel('Mute');
    } else {
      videoRef.muted = true;
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
