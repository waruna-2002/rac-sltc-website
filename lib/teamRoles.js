/**
 * Role definitions, hierarchy tiers, and sorting helpers for Rotaract SLTC.
 * 
 * Hierarchy order:
 * 1. President (prisidetnt)
 * 2. Secretary (secutry)
 * 3. Treasurer (treshara)
 * 4. Vice President (vice prisident)
 * 5. Sergeant at Arms (sajant at ams)
 * 6. Editor
 * 7. Avenue Secretary (Directerta kalin)
 * 8. Avenue Treasurer (Directerta kalin)
 * 9. Director
 * 10. Assistant Director
 * 11. Assistant Secretary
 * 12. Assistant Treasurer
 * ... followed by remaining members
 * 
 * Members with the same role are grouped immediately next to each other.
 */

export const TEAM_ROLE_OPTIONS = [
  "President",
  "Secretary",
  "Treasurer",
  "Vice President",
  "Sergeant at Arms",
  "Editor",
  "Avenue Secretary",
  "Avenue Treasurer",
  "Director",
  "Assistant Director",
  "Assistant Secretary",
  "Assistant Treasurer",
];

export function normalizeRole(role) {
  if (!role) return "";
  return String(role).trim().toLowerCase();
}

/**
 * Leadership hierarchy tier (1 to 10) for Our People page layers:
 * 1: President
 * 2: Secretary
 * 3: Treasurer
 * 4: Vice President
 * 5: Sergeant-at-Arms
 * 6: Editor
 * 7: Avenue Secretary (comes before Director)
 * 8: Avenue Treasurer (comes before Director)
 * 9: Directors
 * 10: Remaining members (Assistant Director, Assistant Secretary, Assistant Treasurer, etc.)
 */
export function getRoleTier(role) {
  if (!role) return 10;
  const r = normalizeRole(role);

  // 1: President (excluding Vice President & Assistant)
  if (r === "president" || (r.includes("president") && !r.includes("vice") && !r.includes("assistant"))) {
    return 1;
  }

  // 2: Secretary (Club Secretary, excluding Avenue Secretary & Assistant Secretary)
  if (r === "secretary" || (r.includes("secretary") && !r.includes("avenue") && !r.includes("assistant"))) {
    return 2;
  }

  // 3: Treasurer (Club Treasurer, excluding Avenue Treasurer & Assistant Treasurer)
  if (
    r === "treasurer" ||
    r === "treasure" ||
    ((r.includes("treasurer") || r.includes("treasure")) && !r.includes("avenue") && !r.includes("assistant"))
  ) {
    return 3;
  }

  // 4: Vice President
  if (r.includes("vice president") || r === "vp" || r.includes("vice-president")) {
    return 4;
  }

  // 5: Sergeant-at-Arms (handling common typos & variations)
  if (
    r.includes("sergeant") ||
    r.includes("sargent") ||
    r.includes("sajant") ||
    r.includes("sgt")
  ) {
    return 5;
  }

  // 6: Editor
  if (r.includes("editor") && !r.includes("assistant")) {
    return 6;
  }

  // 7: Avenue Secretary (comes before Director)
  if (r.includes("avenue secretary") || (r.includes("secretary") && r.includes("avenue"))) {
    return 7;
  }

  // 8: Avenue Treasurer (comes before Director)
  if (
    r.includes("avenue treasurer") ||
    r.includes("avenue treasure") ||
    ((r.includes("treasurer") || r.includes("treasure")) && r.includes("avenue"))
  ) {
    return 8;
  }

  // 9: Directors
  if (r.includes("director") && !r.includes("assistant") && !r.includes("associate")) {
    return 9;
  }

  // 10: Remaining roles
  return 10;
}

/**
 * Returns granular rank for deep sorting across all defined roles
 */
export function getRoleDetailedRank(role) {
  if (!role) return 99;
  const r = normalizeRole(role);

  // 1: President
  if (r === "president" || (r.includes("president") && !r.includes("vice") && !r.includes("assistant"))) {
    return 1;
  }

  // 2: Secretary
  if (r === "secretary" || (r.includes("secretary") && !r.includes("avenue") && !r.includes("assistant"))) {
    return 2;
  }

  // 3: Treasurer
  if (
    r === "treasurer" ||
    r === "treasure" ||
    ((r.includes("treasurer") || r.includes("treasure")) && !r.includes("avenue") && !r.includes("assistant"))
  ) {
    return 3;
  }

  // 4: Vice President
  if (r.includes("vice president") || r === "vp" || r.includes("vice-president")) {
    return 4;
  }

  // 5: Sergeant-at-Arms
  if (
    r.includes("sergeant") ||
    r.includes("sargent") ||
    r.includes("sajant") ||
    r.includes("sgt")
  ) {
    return 5;
  }

  // 6: Editor
  if (r.includes("editor") && !r.includes("assistant")) {
    return 6;
  }

  // 7: Avenue Secretary (BEFORE Director)
  if (r.includes("avenue secretary") || (r.includes("secretary") && r.includes("avenue"))) {
    return 7;
  }

  // 8: Avenue Treasurer (BEFORE Director)
  if (
    r.includes("avenue treasurer") ||
    r.includes("avenue treasure") ||
    ((r.includes("treasurer") || r.includes("treasure")) && r.includes("avenue"))
  ) {
    return 8;
  }

  // 9: Director
  if (r.includes("director") && !r.includes("assistant") && !r.includes("associate")) {
    return 9;
  }

  // 10: Assistant Director
  if (r.includes("assistant director") || r.includes("associate director")) {
    return 10;
  }

  // 11: Assistant Secretary
  if (r.includes("assistant secretary")) {
    return 11;
  }

  // 12: Assistant Treasurer
  if (r.includes("assistant treasurer") || r.includes("assistant treasure")) {
    return 12;
  }

  return 99;
}

/**
 * Comparator that sorts by role hierarchy and groups members with identical roles together
 */
export function compareTeamMembers(a, b) {
  const rankA = getRoleDetailedRank(a?.role);
  const rankB = getRoleDetailedRank(b?.role);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // Same rank: group identical role strings together!
  const roleA = normalizeRole(a?.role);
  const roleB = normalizeRole(b?.role);
  if (roleA !== roleB) {
    return roleA.localeCompare(roleB);
  }

  // If roles are identical, sort by avenue
  const aveA = normalizeRole(a?.avenue);
  const aveB = normalizeRole(b?.avenue);
  if (aveA !== aveB) {
    return aveA.localeCompare(aveB);
  }

  // If order was explicitly set
  if (typeof a?.order === "number" && typeof b?.order === "number" && a.order !== b.order) {
    return a.order - b.order;
  }

  // Finally sort alphabetically by name
  return String(a?.name || "").localeCompare(String(b?.name || ""));
}

/**
 * Sorts array of team members:
 * 1. Top leadership: President -> Secretary -> Treasurer -> Vice President -> Sergeant-at-Arms
 * 2. Avenue Officers: Avenue Secretary -> Avenue Treasurer (both before Director)
 * 3. Directors -> Assistant Directors -> Assistant Secretaries -> Assistant Treasurers -> others
 * 4. Members with the same role are grouped immediately next to each other
 */
export function sortTeamByRoleTier(members = []) {
  if (!Array.isArray(members)) return [];
  return [...members].sort(compareTeamMembers);
}

/**
 * Checks if a role is an Executive Committee (ExCo) role
 */
export function isExcoRole(role) {
  if (!role) return false;
  const r = normalizeRole(role);
  return (
    r === "president" ||
    (r.includes("president") && !r.includes("vice") && !r.includes("assistant")) ||
    (r.includes("secretary") && !r.includes("avenue") && !r.includes("assistant")) ||
    (r.includes("treasurer") && !r.includes("avenue") && !r.includes("assistant")) ||
    (r.includes("treasure") && !r.includes("avenue") && !r.includes("assistant")) ||
    r.includes("vice president") ||
    r === "vp" ||
    r.includes("sergeant") ||
    r.includes("sargent") ||
    r.includes("sajant") ||
    r.includes("sgt") ||
    (r.includes("editor") && !r.includes("assistant"))
  );
}
