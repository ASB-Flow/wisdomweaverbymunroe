export type DesignId = "gold-dark" | "ivory" | "royal" | "emerald" | "sunset";

export interface DesignPreset {
  id: DesignId;
  label: string;
  /** CSS background used when there is no AI image */
  background: string;
  /** Overlay applied on top of the AI image to keep text readable */
  overlay: string;
  text: string;
  accent: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
  /** Prompt fragment sent to the image model */
  prompt: string;
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: "gold-dark",
    label: "Or & Nuit",
    background: "linear-gradient(160deg, #0b1020 0%, #131a2e 55%, #1c2136 100%)",
    overlay: "linear-gradient(180deg, rgba(6,9,18,0.72) 0%, rgba(6,9,18,0.55) 45%, rgba(6,9,18,0.88) 100%)",
    text: "#F7F3EA",
    accent: "#D9A94C",
    muted: "rgba(247,243,234,0.7)",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    prompt:
      "deep midnight navy background with warm golden light rays, subtle bokeh, luxurious and spiritual atmosphere",
  },
  {
    id: "ivory",
    label: "Ivoire",
    background: "linear-gradient(165deg, #FBF7F0 0%, #F1E9DC 100%)",
    overlay: "linear-gradient(180deg, rgba(251,247,240,0.82) 0%, rgba(251,247,240,0.68) 45%, rgba(241,233,220,0.92) 100%)",
    text: "#1D1B16",
    accent: "#A9772B",
    muted: "rgba(29,27,22,0.65)",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    prompt:
      "soft ivory and cream paper texture background, warm natural daylight, minimal editorial aesthetic, gentle shadows",
  },
  {
    id: "royal",
    label: "Royal",
    background: "linear-gradient(160deg, #2A1B4E 0%, #3D2A6B 50%, #1B1533 100%)",
    overlay: "linear-gradient(180deg, rgba(20,12,40,0.7) 0%, rgba(20,12,40,0.5) 45%, rgba(20,12,40,0.9) 100%)",
    text: "#F4EFFF",
    accent: "#C9A7FF",
    muted: "rgba(244,239,255,0.72)",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    prompt:
      "royal purple and violet gradient background with soft velvet texture and subtle light beams, majestic and regal mood",
  },
  {
    id: "emerald",
    label: "Émeraude",
    background: "linear-gradient(160deg, #06231C 0%, #0C3A2C 55%, #051914 100%)",
    overlay: "linear-gradient(180deg, rgba(3,20,16,0.72) 0%, rgba(3,20,16,0.5) 45%, rgba(3,20,16,0.9) 100%)",
    text: "#EAF7F1",
    accent: "#6FD9A8",
    muted: "rgba(234,247,241,0.72)",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    prompt:
      "deep emerald green background with organic botanical shadows and soft teal glow, serene and grounded atmosphere",
  },
  {
    id: "sunset",
    label: "Coucher de soleil",
    background: "linear-gradient(160deg, #3A1220 0%, #7A2E2A 45%, #C4713C 100%)",
    overlay: "linear-gradient(180deg, rgba(35,10,16,0.68) 0%, rgba(35,10,16,0.45) 45%, rgba(35,10,16,0.9) 100%)",
    text: "#FFF3E6",
    accent: "#F2B457",
    muted: "rgba(255,243,230,0.75)",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    prompt:
      "warm african sunset sky gradient from deep crimson to amber, silhouetted horizon, dusty golden haze, cinematic",
  },
];

export const getDesign = (id: string): DesignPreset =>
  DESIGN_PRESETS.find((d) => d.id === id) ?? DESIGN_PRESETS[0];

export interface StorySlideData {
  heading: string;
  body: string;
  /** downscaled JPEG data URL of the AI generated background */
  image?: string;
}
