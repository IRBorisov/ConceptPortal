import { projectRelativization } from '@rsconcept/domain/library/relativization';

export interface RelativizationRequest {
  source: Parameters<typeof projectRelativization>[0];
  options: Parameters<typeof projectRelativization>[1];
}

self.onmessage = ({ data }: MessageEvent<RelativizationRequest>) => {
  self.postMessage(projectRelativization(data.source, data.options));
};
