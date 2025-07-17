// src/components/SpriteCapture.js
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, PixelRatio } from 'react-native';
import ViewShot from 'react-native-view-shot';

const SpriteCapture = forwardRef(({ style, width, height, children }, ref) => {
  const shotRef = useRef(null);

  useImperativeHandle(ref, () => ({
    captureFile: () =>
      shotRef.current.capture({
        result: 'tmpfile',
        format: 'png',
        quality: 1,
        width: 384 * PixelRatio.get(),
      }),
    captureBase64: () =>
      shotRef.current.capture({
        result: 'base64',
        format: 'png',
        quality: 1,
        width: 384 * PixelRatio.get(), // match printer width
      }),
  }), []);

  return (
    <View style={[{ position: 'absolute', left: -9999, top: -9999 }, style]}>
      <ViewShot
        ref={shotRef}
        options={{ format: 'png', quality: 1 }}
        style={{ width, height, backgroundColor: '#fff' }}
      >
        {children}
      </ViewShot>
    </View>
  );
});

export default SpriteCapture;
