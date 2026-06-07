from typing import List, Dict, Optional
from app.utils.auth import hash_password


class TrainerService:
    def __init__(self, storage):
        self.storage = storage

    def get_all_trainers(self, active_only: Optional[bool] = None) -> List[Dict]:
        """Get all trainers"""
        trainers = self.storage.get_trainers(active_only=active_only)
        # Remove password hashes from response
        return [{k: v for k, v in t.items() if k != "passwordHash"} for t in trainers]

    def get_trainer(self, trainer_id: str) -> Optional[Dict]:
        """Get trainer by ID"""
        trainer = self.storage.get_trainer(trainer_id)
        if trainer:
            # Remove password hash
            return {k: v for k, v in trainer.items() if k != "passwordHash"}
        return None

    def create_trainer(self, data: Dict) -> Dict:
        """Create a new trainer"""
        # Check if username already exists
        existing = self.storage.get_trainer_by_username(data["username"])
        if existing:
            raise ValueError("Username already exists")

        # Hash password
        password = data.pop("password")
        data["passwordHash"] = hash_password(password)

        # Create trainer
        trainer = self.storage.create_trainer(data)

        # Remove password hash from response
        return {k: v for k, v in trainer.items() if k != "passwordHash"}

    def update_trainer(self, trainer_id: str, data: Dict) -> Optional[Dict]:
        """Update trainer"""
        # Get current trainer to check if name is changing
        current_trainer = self.storage.get_trainer(trainer_id)
        if not current_trainer:
            return None

        old_name = current_trainer.get("name")
        new_name = data.get("name")

        # If password is being updated, hash it
        if "password" in data and data["password"]:
            password = data.pop("password")
            data["passwordHash"] = hash_password(password)
        elif "password" in data:
            # Remove empty password field
            data.pop("password")

        # Check if username is being changed and if it conflicts
        if "username" in data:
            existing = self.storage.get_trainer_by_username(data["username"])
            if existing and existing["id"] != trainer_id:
                raise ValueError("Username already exists")

        trainer = self.storage.update_trainer(trainer_id, data)

        # If name changed, update all attendance records with this trainer
        if trainer and new_name and old_name != new_name:
            self._update_attendance_trainer_name(trainer_id, new_name)

        if trainer:
            return {k: v for k, v in trainer.items() if k != "passwordHash"}
        return None

    def _update_attendance_trainer_name(self, trainer_id: str, new_name: str):
        """Update trainer name in all attendance records across all years"""
        try:
            # Get all years
            years = self.storage.get_years()

            for year in years:
                year_key = year["yearKey"]
                year_data = self.storage.get_year_data(year_key)

                if not year_data or "attendance" not in year_data:
                    continue

                # Update attendance records
                attendance = year_data["attendance"]
                updated = False

                for record in attendance:
                    if record.get("trainerId") == trainer_id:
                        record["trainerName"] = new_name
                        updated = True

                # Save if any records were updated
                if updated:
                    self.storage.save_year_data(year_key, year_data)
        except Exception as e:
            # Log error but don't fail the trainer update
            print(f"Error updating attendance trainer names: {e}")

    def delete_trainer(self, trainer_id: str) -> bool:
        """Delete trainer"""
        # Don't allow deleting if it's the only admin
        trainer = self.storage.get_trainer(trainer_id)
        if trainer and trainer.get("role") == "admin":
            admins = [t for t in self.storage.get_trainers() if t.get("role") == "admin"]
            if len(admins) <= 1:
                raise ValueError("Cannot delete the only admin trainer")

        return self.storage.delete_trainer(trainer_id)

    def update_credentials(self, trainer_id: str, username: str, password: str) -> bool:
        """Update trainer credentials"""
        # Check if username conflicts
        existing = self.storage.get_trainer_by_username(username)
        if existing and existing["id"] != trainer_id:
            raise ValueError("Username already exists")

        password_hash = hash_password(password)
        trainer = self.storage.update_trainer(trainer_id, {
            "username": username,
            "passwordHash": password_hash
        })
        return trainer is not None

    def get_trainer_stats(self, trainer_id: str, year_key: str) -> Dict:
        """Get trainer statistics for a year"""
        year_data = self.storage.get_year_data(year_key)
        if not year_data:
            return {
                "totalClasses": 0,
                "totalParticipants": 0,
                "monthlyStats": []
            }

        attendance = year_data.get("attendance", [])

        # Group by class (date + time) and filter by trainer
        from collections import defaultdict
        from datetime import datetime

        classes = defaultdict(set)  # {(date, time): set of member_ids}
        monthly_data = defaultdict(lambda: {"classes": set(), "participants": set()})

        for record in attendance:
            if record.get("trainerId") == trainer_id:
                class_key = (record["date"], record["time"])
                classes[class_key].add(record["memberId"])

                # Monthly aggregation
                try:
                    date_obj = datetime.fromisoformat(record["date"].replace("Z", "+00:00"))
                    month = date_obj.month
                    month_names = {
                        1: "ינואר", 2: "פברואר", 3: "מרץ", 4: "אפריל",
                        5: "מאי", 6: "יוני", 7: "יולי", 8: "אוגוסט",
                        9: "ספטמבר", 10: "אוקטובר", 11: "נובמבר", 12: "דצמבר"
                    }
                    month_name = month_names.get(month, str(month))
                    monthly_data[month_name]["classes"].add(class_key)
                    monthly_data[month_name]["participants"].add(record["memberId"])
                except:
                    pass

        # Calculate totals
        total_classes = len(classes)
        total_participants = sum(len(members) for members in classes.values())

        # Format monthly stats
        monthly_stats = [
            {
                "month": month,
                "classes": len(data["classes"]),
                "participants": len(data["participants"])
            }
            for month, data in sorted(monthly_data.items())
        ]

        return {
            "totalClasses": total_classes,
            "totalParticipants": total_participants,
            "monthlyStats": monthly_stats
        }
