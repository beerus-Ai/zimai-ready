import {
  Activity, Award, BadgeCheck, BarChart3, BookOpen, Bot, Brain, Briefcase, Bug, Building, Building2, Calculator,
  ClipboardCheck, ClipboardList, CloudSun, Code2, Cog, Compass, Cpu, Crown, Database, Factory, FileText, GitBranch,
  GraduationCap, Handshake, HardHat, Headset, HeartHandshake, HeartPulse, Landmark, Layers, Leaf, Lightbulb, LineChart,
  Lock, Map, Megaphone, MessageSquareText, MessagesSquare, Microscope, PackageSearch, Palmtree, PenTool, PieChart,
  Pickaxe, Presentation, RadioTower, Radar, Rocket, Route, Scale, School, SearchCheck, Server, Settings2, Shapes,
  ShieldAlert, ShieldCheck, ShoppingBag, Smile, Sparkles, Sprout, Stethoscope, Target, Tractor, TrendingUp, Trophy,
  Truck, UserCog, UserSearch, Users, Wheat, Workflow, Wrench, Zap, type LucideIcon,
} from 'lucide-react';

/** Curated icon registry so data files can reference icons by name (tree-shake friendly). */
export const ICONS: Record<string, LucideIcon> = {
  Activity, Award, BadgeCheck, BarChart3, BookOpen, Bot, Brain, Briefcase, Bug, Building, Building2, Calculator,
  ClipboardCheck, ClipboardList, CloudSun, Code2, Cog, Compass, Cpu, Crown, Database, Factory, FileText, GitBranch,
  GraduationCap, Handshake, HardHat, Headset, HeartHandshake, HeartPulse, Landmark, Layers, Leaf, Lightbulb, LineChart,
  Lock, Map, Megaphone, MessageSquareText, MessagesSquare, Microscope, PackageSearch, Palmtree, PenTool, PieChart,
  Pickaxe, Presentation, RadioTower, Radar, Rocket, Route, Scale, School, SearchCheck, Server, Settings2, Shapes,
  ShieldAlert, ShieldCheck, ShoppingBag, Smile, Sparkles, Sprout, Stethoscope, Target, Tractor, TrendingUp, Trophy,
  Truck, UserCog, UserSearch, Users, Wheat, Workflow, Wrench, Zap,
};

export function Icon({ name, className, size, strokeWidth }: { name: string; className?: string; size?: number; strokeWidth?: number }) {
  const C = ICONS[name] ?? Sparkles;
  return <C className={className} size={size} strokeWidth={strokeWidth} aria-hidden />;
}
