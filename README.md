# react-rgbscaler

A React component which uses a WebGL2 Canvas to upscale video with algorithms tuned for retro pixel art game footage.

Built for use among the TASVideos and RetroRGB communities for precision playback of archival quality video on the web

## Summary

This component as used on rgbscaler.com demonstrates a viable method for playing back pixel art footage from retro game consoles at larger sizes in web browsers. Through storing lossless footage from retro game consoles at very small sizes with full chroma and before PAR correction, game footage can be kept very small and still displayed its sharpest on the web at archival levels of quality.

## Installation

```sh
npm i @tikevin83/react-rgbscaler
```

### Local Development

For local development of react-rgbscaler, multiple copies of React may conflict between the component library and the app running it. To fix and speed up local development you'll need to use `npm link` to create some symlinks between rgbscaler and the app's copy of react, and between the app's copy of react-rgbscaler and the local install:

In the react-rgbscaler local copy:

```sh
npm link
npm link ../your-app/node_modules/react
```

In your app:

```sh
npm link @tikevin83/react-rgbscaler
```

Additionally, install react-rgbscaler as a filepath in your app's package.json by setting the version to `"file:../react-rgbscaler"

## Usage

```ts
<RGBScaler
  videoProps={{ src: '/example.mp4' }}
  maxCanvasWidth={width}
  maxCanvasHeight={height}
  //optional
  canvasProps={canvasProps}
  playPauseButtonProps={playPauseButtonProps}
  dar={dar}
  par={par}
  maskIntensity={maskIntensity}
  scanlineIntensity={scanlineIntensity}
/>
```

### REQUIRED

#### `videoProps`

The props to pass to the hidden HTML5 video element. A src must be provided for basic functionality.

#### `maxCanvasWidth`

The maximum width desired for the upscaled video on the canvas

#### `maxCanvasHeight`

The maximum height desired for the upscaled video on the canvas

### OPTIONAL

Several custom controls are necessary due to the necessary hiding of the original video element, props for which can be customized.

#### props in general

The RGBScaler component takes any props that a div can take so that you can style the component's wrapper div as a whole.

#### `dar`

A desired display aspect ratio, in other words this forces a final aspect ratio regardless of the ratio of the source footage. Set this to 4/3 for most game footage that was displayed on CRT televisions.

#### `par`

A desired pixel aspect ratio. Setting DAR to anything other than the default 1 will ignore this value. Set this if you want to aspect correct based on a known PAR for your source footage instead of correcting to a desired DAR.

#### `maskIntensity`

The desired intensity of the slot mask effect. This effect treats pixels in the source video as discrete subpixels with a layout similar to a CRT's slot mask. An intensity of 1 fully applies the effect, and 0 disables the effect. Values between 0 and 1 help increase brightness and can look more natural than the perfect slot mask. This effect relies on the video having the original dimensions of the console's output with square pixels and using DAR or PAR to correct the aspect ratio.

#### `scanlineIntensity`

The desired intensity of the scanline effect. This effect recreates gaps between each horizontal line of pixels to recreate the CRT scanline process. An intensity of 0 will not recreate any scanlines and 1 will apply a fully defined gap between lines. As with the slot mask effect, values between 0 and 1 help tune the tradeoff with overall brightness and can look more natural. This effect relies on the video having the original dimensions of the console's output with square pixels and using DAR or PAR to correct the aspect ratio.

#### `integerScaling`

Forces RGBScaler to try to limit its upscaling to the largest integer multiple of the source video's dimensions that will fit within the requested max canvas width and height. This tends to not be as relevant an option with this player because using the intended client side aspect correction by setting DAR or PAR will often necessitate a non-integer width multiple.

#### `canvasProps`

Any additional props to customize the HTML5 canvas where the updscaled vidoeo is displayed

#### `seekBarProps`

Props to customize the seek bar that controls the time of the video

#### `muteButtonProps`

Props to customize the button that mutes/unmutes the video

#### `volumeBarProps`

Props to customize the volume bar that controls the volume of the video. A volume prop can be passed in for the default volume

#### `playPauseButtonProps`

Props to customize the included play/pause button

#### `fullscreenButtonProps`

Props to customize the included fullscreen button

## Player Details

Under the hood RGBScaler uses an HTML5 video element to deliver frames to a canvas. The `src` provided to the video element must either be on the same site or be hosted on a site that validates CORS anonymously, otherwise the browser will block the canvas from being able to read the video element's frames as a texture due to security measures. By default the proxy video player is hidden to only display the canvas upscale but you can adjust it as needed through videoProps. RGBScaler also contains a basic play/pause button which is necessary to start and stop the canvas' rendering loop.

## Provided Video prerequisites

This technique is intended for use with archival quality low resolution video. Source videos should be compressed either losslessly in 4:4:4 which would be viewable in Chrome, or alternatively they can be encoded in a lossy mode with a low CRF and 4:2:0 at double resolution to maximize compatibility at the cost of much larger video size and incompatibility with the CRT effects. The video should not have aspect ratio correction, it should be encoded with square pixels and the intended output aspect ratio adjusted by providing a DAR or PAR to RGBScaler's props.
