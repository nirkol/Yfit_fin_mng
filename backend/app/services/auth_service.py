from app.utils.auth import verify_password


class AuthService:
    def __init__(self, storage):
        self.storage = storage

    def authenticate(self, username: str, password: str) -> dict:
        """Authenticate a user and return trainer object with role"""
        # Try to find trainer by username
        trainer = self.storage.get_trainer_by_username(username)

        if trainer:
            # Check if trainer is active
            if not trainer.get("isActive", True):
                return None

            # Verify password
            if not verify_password(password, trainer["passwordHash"]):
                return None

            # Return trainer object (without password hash)
            return {
                "id": trainer["id"],
                "username": trainer["username"],
                "name": trainer["name"],
                "role": trainer.get("role", "trainer")
            }

        # If not found in trainers, check admin credentials
        admin_creds = self.storage.get_admin_credentials()
        if admin_creds and username == admin_creds["username"] and password == admin_creds["password"]:
            # Admin login successful - find or create admin trainer
            admin_trainer = self.storage.get_trainer_by_username(username)
            if admin_trainer:
                return {
                    "id": admin_trainer["id"],
                    "username": admin_trainer["username"],
                    "name": admin_trainer["name"],
                    "role": "admin"
                }
            else:
                # Return a virtual admin user
                return {
                    "id": "admin_temp",
                    "username": username,
                    "name": "מנהל מערכת",
                    "role": "admin"
                }

        return None

    def update_credentials(self, current_password: str, new_username: str, new_password: str) -> bool:
        """Update user credentials after verifying current password (deprecated)"""
        creds = self.storage.get_credentials()

        # Verify current password
        if not verify_password(current_password, creds["passwordHash"]):
            return False

        # Hash new password and update
        from app.utils.auth import hash_password
        new_hash = hash_password(new_password)
        return self.storage.update_credentials(new_username, new_hash)
