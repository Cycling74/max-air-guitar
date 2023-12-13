# max-air-guitar
Strum on your air guitar in Max. Uses [MediaPipe](https://developers.google.com/mediapipe) and [mi-gen~](http://www.mi-creative.eu/tool_migen.html).

## Setup
There shouldn't be anything you need to do here. Simply open the Max project at `max-air-guitar/max-air-guitar.maxproj` and you should be good to go. 

## Rebuilding the interface
This project uses a simple webpage hosted in a `jweb` object for hand tracking. If you'd like to change the behavior of the page, then you'll need to recompile the TypeScript code at [ts/handpose.ts](./ts/handpose.ts). You'll need to run some basic `npm` commands to get set up.

```sh
npm install
npm run pack
```

This will install the MediaPipe dependencies and rebuild the JS bundle.
