# react-rgbscaler
A React component which uses a WebGL2 Canvas to upscale video with algorithms tuned for retro pixel art game footage
Built for use among the TASVideos and RetroRGB communities for precision playback of archival quality video on the web

## Summary
This component as used on rgbscaler.com demonstrates a viable method for playing back pixel art footage from retro game consoles at larger sizes in web browsers. Through storing lossless footage from retro game consoles at very small sizes with full chroma and before PAR correction, game footage can be kept very small and still displayed its sharpest on the web at archival levels of quality.

## Usage
```ts
<RGBScaler
  videoProps={{src: '/example.mp4'}}
  maxCanvasWidth={width}
  maxCanvasHeight={height}
  dar={dar}
  par={par}

  //optional
  canvasProps={canvasProps}
  playPauseButtonProps={playPauseButtonProps}
/>
```

### videoProps: 
The props to pass to the hidden HTML5 video element. A src must be provided for basic functionality.

### maxCanvasWidth
The maximum width desired for the upscaled video on the canvas

### maxCanvasHeight
The maximum height desired for the upscaled video on the canvas

### dar
A desired display aspect ratio, in other words this forces a final aspect ratio regardless of the ratio of the source footage. Set this to 4/3 for most game footage that was displayed on CRT televisions.

### par
A desired pixel aspect ratio. Setting DAR to anything other than the default 1 will ignore this value. Set this if you want to aspect correct based on a known PAR for your source footage instead of correcting to a desired DAR.

### canvasProps
Any additional props to customize the HTML5 canvas where the updscaled vidoeo is displayed

### playPauseButtonProps
Props to customize the included play/pause button

## Player Details

Under the hood RGBScaler uses an HTML5 video element to deliver frames to a canvas. The `src` provided to the video element must either be on the same site or be hosted on a site that validates CORS anonymously, otherwise the browser will block the canvas from being able to read the video element's frames as a texture due to security measures. By default the proxy video player is hidden to only display the canvas upscale but you can adjust it as needed through videoProps. RGBScaler also contains a basic play/pause button which is necessary to start and stop the canvas' rendering loop. Future updates to the library are intended to finish out the other custom controls for mute, volume, and progress seeking.

## Provided Video prerequisites

This technique is intended for use with archival quality low resolution video. Source videos should be compressed either losslessly in 4:4:4 which would be viewable in Chrome, or alternatively they can be encoded in a lossy mode with a low CRF and 4:2:0 at double resolution to maximize compatibility at the cost of much larger video size. The video should not have aspect ratio correction, it should be encoded with square pixels and the intended output aspect ratio adjusted by providing a DAR or PAR to RGBScaler's props.
