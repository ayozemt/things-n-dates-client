import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.value;
    if (!password || password.length < 6) {
      return { passwordLength: true };
    }
    // Verifica si la contraseña contiene al menos un número, una letra minúscula y una letra mayúscula
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return { passwordRequirements: true };
    }
    return null;
  };
}
