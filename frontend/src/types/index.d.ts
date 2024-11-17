interface Step {
  id: string;
  text: string;
  partIndex?: number;
  screenshot?: string;
}

interface PartInfo {
  partIndex: number;
  screenshot?: string;
} 