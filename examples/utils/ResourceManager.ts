export class ResourceManager {
  /**
   * 加载图片
   */
  static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const imageEl = new Image();
      imageEl.src = url;
      imageEl.onload = () => {
        resolve(imageEl);
      };
      imageEl.onerror = () => {
        reject(`未能加载图片: ${url}`);
      };
    });
  }
}
