export type NodeType = "upload" | "resize" | "grayscale" | "gaussian" | "median" | "mean" | "brightness" | "sobel" | "prewitt" | "laplacian" | "threshold";

export interface NodeData extends Record<string, unknown> {
  label: string;
  nodeType: NodeType;
  params?: Record<string, any>;
  inputImage?: string;
  outputImage?: string;
  customColor?: string;
}
