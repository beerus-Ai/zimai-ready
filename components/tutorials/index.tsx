import type { ReactNode } from 'react';
import { TutorialPlayer } from '../motion';
import type { TutorialScene } from '../motion';
import { SceneCanvas } from './primitives';
import {
  AnalysingScene, AssessScene, CertifyScene, ConfidenceScene, DiscoverScene, IndustryScene, LearnScene, LessonDoneScene, LoopScene, PractiseScene,
  QuizScene, StepsScene, UseCaseScene,
} from './scenes-learner';
import {
  AdvisorScene, AnswerScene, AskScene, CapstoneScene, ContextScene, FinalScene, GapsScene, HeatmapScene, InviteScene, RequirementsScene, TestScene,
  VerifyScene,
} from './scenes-work';

/**
 * Animated, video-like tutorials built from live scenes (no media files). Each scene is a bespoke mini-UI
 * with a demo cursor, ghost-in staggers and the ghost mascot as a guide, scaled to fit the player stage.
 */

export interface TutorialProps {
  className?: string;
  dark?: boolean;
}

const scene = (visual: ReactNode, title: ReactNode, caption: ReactNode, duration?: number): TutorialScene => ({
  visual: <SceneCanvas>{visual}</SceneCanvas>,
  title,
  caption,
  duration,
});

export function HowItWorksTutorial({ className, dark }: TutorialProps) {
  return (
    <TutorialPlayer
      className={className}
      dark={dark}
      loop
      label="How ZimAI Ready works"
      scenes={[
        scene(<AssessScene />, 'Assess', 'Nine quick questions about your work.', 4200),
        scene(<DiscoverScene />, 'Discover', 'Your score, your exposure, your prescription.', 4600),
        scene(<LearnScene />, 'Learn', 'Lessons written for your actual job.', 4400),
        scene(<PractiseScene />, 'Practise', 'Real tasks. Instant AI feedback.', 4600),
        scene(<CertifyScene />, 'Certify', 'A certificate employers can verify.', 4400),
        scene(<LoopScene />, 'Keep ready', 'Reassess. Your path adapts.', 4400),
      ]}
    />
  );
}

export function AssessmentTutorial({ className, dark }: TutorialProps) {
  return (
    <TutorialPlayer
      className={className}
      dark={dark}
      label="How the AI readiness assessment works"
      scenes={[
        scene(<IndustryScene />, 'Your work', 'One question per screen.', 3800),
        scene(<UseCaseScene />, 'Your AI use', 'Tick all that apply.', 4000),
        scene(<ConfidenceScene />, 'Be honest', 'There are no wrong answers.', 3800),
        scene(<AnalysingScene />, 'Your profile', 'Scored, mapped and prescribed in seconds.', 4200),
      ]}
    />
  );
}

export function LessonTutorial({ className, dark }: TutorialProps) {
  return (
    <TutorialPlayer
      className={className}
      dark={dark}
      label="How lessons work"
      scenes={[
        scene(<StepsScene />, 'Short steps', 'Tap Next, or use arrow keys.', 3800),
        scene(<LearnScene start={700} />, 'Your examples', 'Every idea, shown in your work.', 4200),
        scene(<QuizScene />, 'Quick checks', 'Miss one? See why, try again.', 4600),
        scene(<LessonDoneScene />, 'Level up', 'Finish to raise your skill levels.', 4000),
      ]}
    />
  );
}

export function TutorTutorial({ className, dark }: TutorialProps) {
  return (
    <TutorialPlayer
      className={className}
      dark={dark}
      label="How the AI Tutor works"
      scenes={[
        scene(<AskScene />, 'Ask', 'Anything about your lesson or work.', 4000),
        scene(<ContextScene />, 'Context', 'It knows your role and lesson.', 3800),
        scene(<AnswerScene />, 'Answers', 'Tailored to the work you do.', 4000),
        scene(<TestScene />, 'Test yourself', 'It asks. You answer. Instant feedback.', 5200),
      ]}
    />
  );
}

export function CertificationTutorial({ className, dark }: TutorialProps) {
  return (
    <TutorialPlayer
      className={className}
      dark={dark}
      label="How certification works"
      scenes={[
        scene(<RequirementsScene />, 'Complete', 'Required modules and practicals.', 3800),
        scene(<FinalScene />, 'Pass', 'Score 70% or more.', 3800),
        scene(<CapstoneScene />, 'Prove', 'Solve a real workplace problem.', 4000),
        scene(<VerifyScene />, 'Verified', 'Anyone can scan to confirm.', 4200),
      ]}
    />
  );
}

export function EmployerTutorial({ className, dark }: TutorialProps) {
  return (
    <TutorialPlayer
      className={className}
      dark={dark}
      label="How ZimAI Ready works for employers"
      scenes={[
        scene(<InviteScene />, 'Invite', 'Add your team by email.', 4000),
        scene(<HeatmapScene />, 'See', 'Readiness by team and skill.', 4200),
        scene(<GapsScene />, 'Spot gaps', 'Where skills fall short.', 4000),
        scene(<AdvisorScene />, 'Act', 'AI recommends what to fix first.', 4800),
      ]}
    />
  );
}
