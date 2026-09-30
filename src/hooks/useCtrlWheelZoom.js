import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/** Leave ordinary wheel scrolling to the page; reserve Ctrl + wheel for 3D zoom. */
export const useCtrlWheelZoom = () => {
  const canvas = useThree(state => state.gl.domElement);
  useEffect(() => {
    const requireCtrl = event => {
      // Capture before either camera controller can cancel the page's scrolling.
      if (!event.ctrlKey) event.stopImmediatePropagation();
    };
    canvas.addEventListener('wheel', requireCtrl, { capture: true, passive: true });
    return () => canvas.removeEventListener('wheel', requireCtrl, true);
  }, [canvas]);
};