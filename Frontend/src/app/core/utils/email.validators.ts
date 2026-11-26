import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function hospitalEmailValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value: unknown = control.value;
  if (
    typeof value === 'string' &&
    /^[^\s@]+@[^\s@]+\.local$/i.test(value.trim())
  ) {
    return null;
  }

  return Validators.email(control);
}
