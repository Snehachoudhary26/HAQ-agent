const schemes = require("./data/schemes.json");

function checkEligibility(profile) {
  const results = [];

  for (const scheme of schemes) {
    const reasons = [];
    let eligible = true;

    const rule = scheme.eligibility;
    const ageOverrideApplies =
      rule.minAgeOverride !== undefined && profile.age >= rule.minAgeOverride;

    if (rule.occupation && !rule.occupation.includes(profile.occupation)) {
      eligible = false;
    }
    if (rule.gender && rule.gender !== profile.gender) {
      eligible = false;
    }
    if (rule.ownsLand !== undefined && profile.ownsLand !== rule.ownsLand) {
      eligible = false;
      reasons.push("Requires owning cultivable agricultural land");
    }
    if (rule.incomeTaxPayer === false && profile.incomeTaxPayer === true) {
      eligible = false;
      reasons.push("Income tax payers are excluded");
    }
    if (rule.minAge !== undefined) {
      const ageOk = profile.age >= rule.minAge || ageOverrideApplies;
      if (!ageOk) eligible = false;
    }
    if (ageOverrideApplies) {
      reasons.push(`Automatically eligible — age ${profile.age} meets the ${rule.minAgeOverride}+ universal coverage rule`);
    }
    if (rule.belowPovertyLine !== undefined && profile.belowPovertyLine !== rule.belowPovertyLine) {
      if (!ageOverrideApplies) {
        eligible = false;
      }
    }
    if (rule.seccListed !== undefined && profile.seccListed !== rule.seccListed) {
      if (!ageOverrideApplies) {
        eligible = false;
      }
    }
    if (rule.maxFamilyIncome !== undefined) {
      const income = profile.familyIncome ?? profile.annualIncome ?? Infinity;
      if (income > rule.maxFamilyIncome) {
        eligible = false;
        reasons.push(`Family income exceeds ₹${rule.maxFamilyIncome.toLocaleString("en-IN")}/year limit`);
      }
    }
    if (rule.courseType && profile.courseType && rule.courseType !== profile.courseType) {
      eligible = false;
      reasons.push("Course type does not match (must be technical diploma/degree)");
    }

    if (eligible) {
      if (reasons.length === 0) {
        reasons.push("Profile matches all eligibility conditions for this scheme");
      }
      results.push({
        schemeId: scheme.id,
        name: scheme.name,
        category: scheme.category,
        amount: scheme.amount,
        documents: scheme.documents,
        reasons,
      });
    }
  }

  return results;
}

module.exports = { checkEligibility, schemes };
