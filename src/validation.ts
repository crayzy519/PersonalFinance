import { PlannerInputs } from './types';

export function validateInputs(inputs: PlannerInputs): string[] {
  const errors: string[] = [];

  if (inputs.deathAge <= inputs.currentAge) {
    errors.push('Death age must be greater than current age.');
  }

  if (inputs.freelanceAge < inputs.currentAge) {
    errors.push('Freelance age must be greater than or equal to current age.');
  }

  if (inputs.retirementAge < inputs.freelanceAge) {
    errors.push('Retirement age cannot be less than freelance age.');
  }

  if (inputs.retirementAge > inputs.deathAge) {
    errors.push('Retirement age must be less than or equal to death age.');
  }

  if (inputs.gapYearsAfterLeavingJob < 0) {
    errors.push('Gap years cannot be negative.');
  }

  const gapEnd = inputs.freelanceAge + inputs.gapYearsAfterLeavingJob;
  if (gapEnd > inputs.retirementAge) {
    errors.push('Gap period cannot extend past retirement age.');
  }

  if (inputs.assumedAnnualReturn <= -1) {
    errors.push('Assumed annual return must be greater than -100%.');
  }

  return errors;
}
