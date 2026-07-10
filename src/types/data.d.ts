// Typed shapes for the YAML data files imported via @rollup/plugin-yaml.

declare module "*/data/site.yaml" {
  interface Site {
    name: string;
    role: string;
    tagline: string;
    location: string;
    github: string;
    linkedin: string;
  }

  const site: Site;
  export default site;
}
