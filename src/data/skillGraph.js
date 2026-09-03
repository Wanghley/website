// ─── Skill adjacency data for SkillField's force graph ─────────────────────
// Plain data, not JSX, so it can be edited without touching the renderer.
//
// SKILL_LINKS — which skills are commonly used together / in the same
// technical domain. This is general domain knowledge about the tools
// themselves (e.g. "PyTorch and TensorFlow are both deep-learning
// frameworks"), not a claim about which specific project used which
// specific tool — that distinction matters because the site's telemetry
// vocabulary carries an explicit honesty rule (see the redesign plan):
// every readout must map to something true. Verified against the live CMS
// (fetchFeaturedSkills()) at the time this was written — 20 featured
// skills across 5 categories (Software, Data, DevOps, Engineering, Other).
// Keys are matched case-insensitively against skill.name; unknown names
// are ignored, never thrown on.
export const SKILL_LINKS = {
  'c++': ['python', 'altium', 'autodesk eagle', 'linux'],
  python: ['pytorch', 'tensorflow', 'keras', 'c++', 'react', 'dagster', 'postgresql'],
  javascript: ['react', 'python'],
  react: ['javascript', 'figma', 'python'],
  java: ['python', 'postgresql'],
  pytorch: ['python', 'tensorflow', 'keras', 'dagster'],
  tensorflow: ['python', 'pytorch', 'keras'],
  keras: ['tensorflow', 'pytorch', 'python'],
  postgresql: ['python', 'dagster', 'java'],
  dagster: ['python', 'postgresql', 'pytorch'],
  docker: ['kubernetes', 'aws ec2', 'linux'],
  kubernetes: ['docker', 'aws ec2', 'linux'],
  'aws ec2': ['docker', 'kubernetes', 'linux'],
  linux: ['docker', 'kubernetes', 'c++', 'python'],
  altium: ['autodesk eagle', 'fusion 360', 'c++'],
  'autodesk eagle': ['altium', 'fusion 360'],
  'fusion 360': ['altium', 'autodesk eagle', 'simulink'],
  simulink: ['fusion 360', 'python'],
  figma: ['react'],
};

// SKILL_PROJECTS — skill name → project slug(s) that used it. Deliberately
// left empty: the CMS has no skill↔project relation field (verified
// against src/api/projects.js and every consumer — only Title/Teaser/
// Category/slug/Featured are populated), so any entry here would be a
// guess about which specific tool a specific project used, not a fact.
// The UI is built to skip this row entirely when a skill has no entry
// (see SkillField.js) — populate real entries here once a verified
// mapping exists (e.g. a `Technologies` relation added in Strapi), or by
// hand once each project's actual stack has been confirmed.
export const SKILL_PROJECTS = {};

const norm = (s) => (s || '').trim().toLowerCase();

export function getLinkedSkillNames(skillName) {
  return SKILL_LINKS[norm(skillName)] || [];
}

export function getProjectSlugs(skillName) {
  return SKILL_PROJECTS[norm(skillName)] || [];
}
