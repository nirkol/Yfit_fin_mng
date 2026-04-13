from app.utils.auth import verify_password


class AuthService:
    def __init__(self, storage):
        self.storage = storage

    def authenticate(self, username: str, password: str) -> bool:
        """Authenticate a user"""
        creds = self.storage.get_credentials()

        if creds["username"] != username:
            return False

        return verify_password(password, creds["passwordHash"])

    def update_credentials(self, current_password: str, new_username: str, new_password: str) -> bool:
        """Update user credentials after verifying current password"""
        creds = self.storage.get_credentials()

        # Verify current password
        if not verify_password(current_password, creds["passwordHash"]):
            return False

        # Hash new password and update
        from app.utils.auth import hash_password
        new_hash = hash_password(new_password)
        return self.storage.update_credentials(new_username, new_hash)
