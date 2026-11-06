package br.com.codex.shared.validation;

public final class DocumentValidatorUtil {

    private DocumentValidatorUtil() {
    }

    public static String normalizeDigits(String input) {
        return input == null ? "" : input.replaceAll("[^0-9]", "");
    }

    public static String normalizeIsbn(String input) {
        return input == null ? "" : input.replaceAll("[^0-9Xx]", "").toUpperCase();
    }

    public static boolean isCpfValido(String cpf) {
        if (cpf == null) return false;
        String cleanCpf = normalizeDigits(cpf);

        if (cleanCpf.length() != 11 || cleanCpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        try {
            int[] numbers = new int[11];
            for (int i = 0; i < 11; i++) {
                numbers[i] = Character.getNumericValue(cleanCpf.charAt(i));
            }

            int sum = 0;
            for (int i = 0; i < 9; i++) {
                sum += numbers[i] * (10 - i);
            }
            int firstVerifier = 11 - (sum % 11);
            if (firstVerifier > 9) firstVerifier = 0;
            if (numbers[9] != firstVerifier) return false;

            sum = 0;
            for (int i = 0; i < 10; i++) {
                sum += numbers[i] * (11 - i);
            }
            int secondVerifier = 11 - (sum % 11);
            if (secondVerifier > 9) secondVerifier = 0;

            return numbers[10] == secondVerifier;
        } catch (RuntimeException e) {
            return false;
        }
    }

    public static boolean isIsbnValido(String isbn) {
        if (isbn == null) return false;
        String cleanIsbn = normalizeIsbn(isbn);

        return switch (cleanIsbn.length()) {
            case 13 -> validateIsbn13(cleanIsbn);
            case 10 -> validateIsbn10(cleanIsbn);
            default -> false;
        };
    }

    private static boolean validateIsbn13(String cleanIsbn) {
        if (!cleanIsbn.matches("\\d{13}")) return false;
        int total = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(cleanIsbn.charAt(i));
            total += (i % 2 == 0) ? digit : digit * 3;
        }
        int checkDigit = 10 - (total % 10);
        if (checkDigit == 10) checkDigit = 0;
        return checkDigit == Character.getNumericValue(cleanIsbn.charAt(12));
    }

    private static boolean validateIsbn10(String cleanIsbn) {
        int total = 0;
        for (int i = 0; i < 10; i++) {
            char c = cleanIsbn.charAt(i);
            int digit = (c == 'X') ? 10 : Character.getNumericValue(c);
            if (digit < 0 || (digit == 10 && i != 9)) return false;
            total += digit * (10 - i);
        }
        return total % 11 == 0;
    }
}

