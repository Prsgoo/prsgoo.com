// Typed shapes for the YAML data files imported via @rollup/plugin-yaml.

declare module "*/data/site.yaml" {
  interface Localized {
    en: string;
    es: string;
  }

  interface Site {
    name: string;
    role: Localized;
    tagline: Localized;
    location: Localized;
    github: string;
    linkedin: string;
  }

  const site: Site;
  export default site;
}
