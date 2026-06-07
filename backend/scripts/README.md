# Migration Scripts

This directory contains migration scripts for updating the YFit Finance Management database.

## migrate_add_trainer_to_attendance.py

### Purpose
Backfills trainer information (`trainerId` and `trainerName`) to all existing attendance records that don't have this information.

### What It Does
- Scans all year data files in `backend/data/years/`
- Finds attendance records without trainer information
- Assigns the default trainer "יפעת קול" (trainer_001) to these records
- Creates backups before making changes

### When to Use
Run this migration **once** after implementing the trainer management system to update historical attendance data.

### Usage

**Dry Run (Preview Changes):**
```bash
cd backend
python scripts/migrate_add_trainer_to_attendance.py --dry-run
```

This shows what would be changed without actually modifying any files.

**Apply Migration:**
```bash
cd backend
python scripts/migrate_add_trainer_to_attendance.py
```

This will:
1. Verify that `trainers.json` exists with the default trainer
2. Process all year files
3. Create backup files with timestamp (e.g., `2026.json.backup_20260507_143022`)
4. Update attendance records with trainer information
5. Show a summary of changes

### Safety Features
- ✅ Always creates backups before modifying files
- ✅ Dry-run mode to preview changes
- ✅ Only updates records that don't have trainer info
- ✅ Validates trainer existence before migration
- ✅ Clear progress reporting

### Example Output

```
============================================================
🔄 Attendance Records Migration: Add Trainer Information
============================================================

📂 Data directory: /path/to/backend/data

1️⃣  Verifying trainers.json...
✅ Default trainer found: יפעת קול (ID: trainer_001)

2️⃣  Migrating attendance records...

📅 Processing year: 2026
   ✏️  Updated 150 / 150 records
   ✅ Created backup: /path/to/data/years/2026.json.backup_20260507_143022
   ✅ Saved changes to 2026.json

============================================================
📊 Migration Summary
============================================================
Total attendance records processed: 150
Records updated with trainer info: 150
Records already had trainer info: 0

✅ Migration completed successfully!
   Backup files were created with timestamp suffix
============================================================
```

### Recovery

If you need to restore from backup:
```bash
cd backend/data/years
cp 2026.json.backup_TIMESTAMP 2026.json
```

Replace `TIMESTAMP` with the actual backup timestamp.

### Requirements
- Python 3.6+
- No additional dependencies required (uses standard library only)

### Notes
- The migration is idempotent - running it multiple times is safe
- Records that already have trainer information are skipped
- The default trainer ID must exist in `trainers.json`
