import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue = control.value;
    if (!rawValue) return null;

    const cpf = String(rawValue).replace(/[^0-9]/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return { invalidCpf: 'O CPF informado é inválido (verifique os 11 dígitos e o dígito verificador).' };
    }

    const digits = cpf.split('').map(Number);

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let firstVerifier = 11 - (sum % 11);
    if (firstVerifier > 9) firstVerifier = 0;
    if (digits[9] !== firstVerifier) {
      return { invalidCpf: 'O dígito verificador do CPF é inválido.' };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    let secondVerifier = 11 - (sum % 11);
    if (secondVerifier > 9) secondVerifier = 0;
    if (digits[10] !== secondVerifier) {
      return { invalidCpf: 'O dígito verificador do CPF é inválido.' };
    }

    return null;
  };
}

export function isbnValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue = control.value;
    if (!rawValue) return null;

    const cleanIsbn = String(rawValue).replace(/[^0-9Xx]/g, '').toUpperCase();

    if (cleanIsbn.length === 13) {
      if (!/^\d{13}$/.test(cleanIsbn)) {
        return { invalidIsbn: 'ISBN-13 deve conter apenas dígitos numéricos.' };
      }
      let total = 0;
      for (let i = 0; i < 12; i++) {
        const digit = Number(cleanIsbn[i]);
        total += i % 2 === 0 ? digit : digit * 3;
      }
      let checkDigit = 10 - (total % 10);
      if (checkDigit === 10) checkDigit = 0;
      if (checkDigit !== Number(cleanIsbn[12])) {
        return { invalidIsbn: 'Dígito verificador do ISBN-13 inválido.' };
      }
      return null;
    }

    if (cleanIsbn.length === 10) {
      let total = 0;
      for (let i = 0; i < 10; i++) {
        const char = cleanIsbn[i];
        const digit = char === 'X' ? 10 : Number(char);
        if (isNaN(digit) || (digit === 10 && i !== 9)) {
          return { invalidIsbn: 'Formato de ISBN-10 inválido.' };
        }
        total += digit * (10 - i);
      }
      if (total % 11 !== 0) {
        return { invalidIsbn: 'Dígito verificador do ISBN-10 inválido.' };
      }
      return null;
    }

    return { invalidIsbn: 'O ISBN deve possuir 10 ou 13 caracteres válidos.' };
  };
}

export function formatCpf(cpf: string): string {
  const digits = (cpf || '').replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

