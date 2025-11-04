declare module "pica" {
  interface ResizeOptions {
    alpha?: boolean
    unsharpAmount?: number
    unsharpRadius?: number
    unsharpThreshold?: number
    transferable?: boolean
    quality?: number
  }

  interface PicaInstance {
    resize(
      from: HTMLCanvasElement | HTMLImageElement,
      to: HTMLCanvasElement,
      options?: ResizeOptions,
    ): Promise<HTMLCanvasElement>
    toBlob(canvas: HTMLCanvasElement, mimeType?: string, quality?: number): Promise<Blob>
  }

  interface PicaConstructor {
    new (): PicaInstance
    resize(
      from: HTMLCanvasElement | HTMLImageElement,
      to: HTMLCanvasElement,
      options?: ResizeOptions,
    ): Promise<HTMLCanvasElement>
    toBlob(canvas: HTMLCanvasElement, mimeType?: string, quality?: number): Promise<Blob>
  }

  const Pica: PicaConstructor
  export default Pica
}
