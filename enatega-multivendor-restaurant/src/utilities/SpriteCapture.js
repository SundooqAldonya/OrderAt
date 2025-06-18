import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback
} from 'react'
import html2canvas from 'html2canvas'

const SpriteCapture = forwardRef(
  ({ style, width = 384, height = 600, children }, ref) => {
    const containerRef = useRef(null)

    const captureElement = useCallback(
      async format => {
        if (!containerRef.current) {
          throw new Error('Container ref not available')
        }

        const element = containerRef.current
        // Dynamically calculate full scroll height
        const fullHeight = element.scrollHeight

        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          width: width,
          height: fullHeight,
          scale: 2, // Higher resolution
          useCORS: true,
          allowTaint: true,
          ignoreElements: el =>
            el.tagName === 'STYLE' || el.tagName === 'SCRIPT'
        })

        if (format === 'base64') {
          // drop the "data:image/png;base64," prefix
          return canvas.toDataURL('image/png').split(',')[1]
        } else {
          // return an object URL for the Blob
          return new Promise((resolve, reject) => {
            canvas.toBlob(
              blob => {
                if (blob) {
                  const url = URL.createObjectURL(blob)
                  resolve(url)
                } else {
                  reject(new Error('Failed to create blob from canvas'))
                }
              },
              'image/png',
              1.0
            )
          })
        }
      },
      [width]
    )

    useImperativeHandle(
      ref,
      () => ({
        captureFile: () => captureElement('blob'),
        captureBase64: () => captureElement('base64')
      }),
      [captureElement]
    )

    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          backgroundColor: '#ffffff',
          overflow: 'visible',
          padding: 10,
          ...style
        }}>
        {children}
      </div>
    )
  }
)

SpriteCapture.displayName = 'SpriteCapture'

export default SpriteCapture
