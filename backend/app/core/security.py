import hashlib
import hmac
import re
import secrets


_PBKDF2_PREFIX = "pbkdf2_sha256"
_PBKDF2_ITERATIONS = 600_000
_LEGACY_SHA256_PATTERN = re.compile(r"^[0-9a-fA-F]{64}$")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        _PBKDF2_ITERATIONS,
    )
    return f"{_PBKDF2_PREFIX}${_PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    if stored_hash.startswith(f"{_PBKDF2_PREFIX}$"):
        try:
            scheme, iteration_text, salt_text, digest_text = stored_hash.split("$")
            iterations = int(iteration_text)
            salt = bytes.fromhex(salt_text)
            expected_digest = bytes.fromhex(digest_text)
        except (ValueError, TypeError):
            return False

        if scheme != _PBKDF2_PREFIX or iterations <= 0 or not expected_digest:
            return False

        actual_digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            iterations,
        )
        return hmac.compare_digest(actual_digest, expected_digest)

    if _LEGACY_SHA256_PATTERN.fullmatch(stored_hash):
        legacy_digest = hashlib.sha256(password.encode("utf-8")).hexdigest()
        return hmac.compare_digest(legacy_digest, stored_hash.lower())

    return False
