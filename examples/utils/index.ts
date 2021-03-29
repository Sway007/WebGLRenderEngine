export namespace device {
  /**
   * 物理尺寸通过style中的width/height属性设置，canvas本身的像素尺寸设置通过canvas.height/canvas.width进行设置，两者的比率需要设置成物理设备的像素比devicePixelRatio，否则会走样
   */
  export function setCanvasPixelRatio(canvas: HTMLCanvasElement) {
    canvas.width = canvas.clientWidth * Math.max(window.devicePixelRatio, 2);
    canvas.height = canvas.clientHeight * Math.max(window.devicePixelRatio, 2);
  }
}

export namespace math {
  export function degree2radius(degree: number) {
    return (Math.PI * degree) / 180;
  }
}

/**
 * 防抖
 */
export function debounce(cb: Function, delay: number) {
  let timer = null;
  return (...args: any) => {
    if (!timer) {
      timer = setTimeout(() => {
        cb(...args);
        timer = null;
      }, delay);
    }
  };
}

/**
 * 节流, delay时间只执行一次cb
 */
export function throttle(cb: Function, delay: number = 500) {
  let timer = null;
  return (...args: any) => {
    if (!timer) {
      cb(...args);
      timer = setTimeout(() => {
        timer = null;
      }, delay);
    }
  };
}
