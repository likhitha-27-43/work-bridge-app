import { Worker, Job, MatchBreakdown } from '@/types';

export function calculateJobMatch(worker: Worker, job: Job): MatchBreakdown {
  const reasons: string[] = [];

  // 1. Skill Match (Max 40 points)
  let skillPoints = 0;
  const workerSkillsLower = worker.skills.map((s) => s.toLowerCase());
  const jobSkillLower = job.skillNeeded.toLowerCase();

  const isExactPrimary = worker.primarySkill.toLowerCase().includes(jobSkillLower.split(' ')[0].toLowerCase()) ||
    jobSkillLower.includes(worker.primarySkill.split(' ')[0].toLowerCase());

  const hasSkill = workerSkillsLower.some((s) =>
    s.includes(jobSkillLower.split(' ')[0].toLowerCase()) || jobSkillLower.includes(s.split(' ')[0].toLowerCase())
  );

  if (isExactPrimary) {
    skillPoints = 40;
    reasons.push(`Exact Primary Skill Match: ${job.skillNeeded} (40/40 pts)`);
  } else if (hasSkill) {
    skillPoints = 32;
    reasons.push(`Secondary Skill Match: ${job.skillNeeded} (32/40 pts)`);
  } else {
    skillPoints = 10;
    reasons.push(`Related Practical Labor Trade (10/40 pts)`);
  }

  // 2. Distance Match (Max 25 points)
  // 0-2km -> 25 pts, 2-5km -> 22 pts, 5-10km -> 17 pts, 10-20km -> 10 pts, >20km -> 5 pts
  let distancePoints = 25;
  const dist = job.distanceKm ?? 3.0;
  if (dist <= 2.0) {
    distancePoints = 25;
    reasons.push(`Very Close: ${dist.toFixed(1)} km from your locality (25/25 pts)`);
  } else if (dist <= 5.0) {
    distancePoints = 22;
    reasons.push(`Nearby: ${dist.toFixed(1)} km away in district (22/25 pts)`);
  } else if (dist <= 10.0) {
    distancePoints = 17;
    reasons.push(`Commutable: ${dist.toFixed(1)} km travel distance (17/25 pts)`);
  } else {
    distancePoints = 10;
    reasons.push(`Regional: ${dist.toFixed(1)} km distance (10/25 pts)`);
  }

  // 3. Wage Match (Max 15 points)
  // If job wage >= expected daily wage -> 15 pts
  // If slightly below (within 15%) -> 10 pts
  // otherwise 6 pts
  let wagePoints = 15;
  const expectedWage = worker.expectedDailyWage || 700;
  const offeredWage = job.wageType === 'Hourly' ? job.wage * 8 : job.wage;

  if (offeredWage >= expectedWage) {
    wagePoints = 15;
    reasons.push(`Fair Wage: ₹${job.wage}/${job.wageType} meets or exceeds your ₹${expectedWage}/day expectation (15/15 pts)`);
  } else if (offeredWage >= expectedWage * 0.85) {
    wagePoints = 11;
    reasons.push(`Wage Near Target: ₹${job.wage}/${job.wageType} close to expected ₹${expectedWage} (11/15 pts)`);
  } else {
    wagePoints = 7;
    reasons.push(`Offered Wage ₹${job.wage}/${job.wageType} below expected ₹${expectedWage} (7/15 pts)`);
  }

  // 4. Availability Match (Max 10 points)
  let availabilityPoints = 10;
  if (worker.availableNow) {
    availabilityPoints = 10;
    reasons.push(`Availability: Ready to take work today/immediately (10/10 pts)`);
  } else {
    availabilityPoints = 4;
    reasons.push(`Availability: Currently marked busy, can schedule ahead (4/10 pts)`);
  }

  // 5. Duration Match (Max 10 points)
  let durationPoints = 9;
  if (job.duration.toLowerCase().includes('1 day') || job.duration.toLowerCase().includes('immediate')) {
    durationPoints = 10;
    reasons.push(`Duration: Quick turnaround daily work (${job.duration}) (10/10 pts)`);
  } else {
    durationPoints = 9;
    reasons.push(`Duration: Multi-day stable engagement (${job.duration}) (9/10 pts)`);
  }

  const totalMatch = Math.min(
    100,
    skillPoints + distancePoints + wagePoints + availabilityPoints + durationPoints
  );

  return {
    skillMatch: skillPoints,
    distanceMatch: distancePoints,
    wageMatch: wagePoints,
    availabilityMatch: availabilityPoints,
    durationMatch: durationPoints,
    totalMatch,
    reasons,
  };
}
