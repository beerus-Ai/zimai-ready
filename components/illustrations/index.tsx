import { BrainSpark, CertificateRibbon, ChatBubbles, GrowthPath, MagnifierSprout, MapPins, RocketChart, ShieldHands } from './Scenes';
import { FarmerPhone, LaptopWorker, NurseTablet, TeacherBoard, TeamIdeas } from './People';

/**
 * ZimAI Ready hand-drawn illustration library.
 * Every component scales to its container (size it with className) and accepts `animated` (default true).
 */
export { GhostMascot, GHOST_BODY, type GhostMood } from './GhostMascot';
export { Squiggle, Sparkle } from './Decor';
export type { IllustrationProps } from './shared';
export { MagnifierSprout, LaptopWorker, FarmerPhone, NurseTablet, TeacherBoard, TeamIdeas, CertificateRibbon, GrowthPath, ShieldHands, ChatBubbles, RocketChart, BrainSpark, MapPins };

export const ILLUSTRATIONS = {
  MagnifierSprout,
  LaptopWorker,
  FarmerPhone,
  NurseTablet,
  TeacherBoard,
  TeamIdeas,
  CertificateRibbon,
  GrowthPath,
  ShieldHands,
  ChatBubbles,
  RocketChart,
  BrainSpark,
  MapPins,
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

export function Illustration({ name, className, animated }: { name: IllustrationName; className?: string; animated?: boolean }) {
  const Comp = ILLUSTRATIONS[name];
  return <Comp className={className} animated={animated} />;
}
