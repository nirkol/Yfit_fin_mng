#!/usr/bin/env python3
"""
Migration Script: Add Trainer Information to Existing Attendance Records

This script backfills trainer information (trainerId and trainerName) to all
existing attendance records that don't have trainer information.

It assigns the default trainer "יפעת קול" (trainer_001) to all existing classes.

Usage:
    python migrate_add_trainer_to_attendance.py [--dry-run]

Options:
    --dry-run    Show what would be changed without actually modifying data
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Default trainer information
DEFAULT_TRAINER_ID = "trainer_001"
DEFAULT_TRAINER_NAME = "יפעת קול"


def load_json(file_path):
    """Load JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {file_path}: {e}")
        return None


def save_json(file_path, data):
    """Save JSON file with backup"""
    # Create backup
    backup_path = f"{file_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            backup_data = f.read()
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(backup_data)
        print(f"✅ Created backup: {backup_path}")

    # Save new data
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def migrate_attendance_records(data_dir, dry_run=False):
    """Migrate attendance records in all year files"""
    years_dir = os.path.join(data_dir, 'years')

    if not os.path.exists(years_dir):
        print(f"❌ Years directory not found: {years_dir}")
        return False

    year_files = [f for f in os.listdir(years_dir) if f.endswith('.json')]

    if not year_files:
        print("⚠️  No year files found")
        return True

    total_records = 0
    total_updated = 0

    for year_file in sorted(year_files):
        year_path = os.path.join(years_dir, year_file)
        year_key = year_file.replace('.json', '')

        print(f"\n📅 Processing year: {year_key}")

        year_data = load_json(year_path)
        if not year_data:
            continue

        attendance = year_data.get('attendance', [])
        if not attendance:
            print(f"   ℹ️  No attendance records in {year_key}")
            continue

        records_updated = 0

        for record in attendance:
            total_records += 1

            # Check if record already has trainer info
            if 'trainerId' in record and record['trainerId']:
                continue

            # Add trainer info
            record['trainerId'] = DEFAULT_TRAINER_ID
            record['trainerName'] = DEFAULT_TRAINER_NAME
            records_updated += 1
            total_updated += 1

        if records_updated > 0:
            print(f"   ✏️  Updated {records_updated} / {len(attendance)} records")

            if not dry_run:
                save_json(year_path, year_data)
                print(f"   ✅ Saved changes to {year_file}")
        else:
            print(f"   ✓  All {len(attendance)} records already have trainer info")

    return total_records, total_updated


def verify_trainers_file(data_dir):
    """Verify that trainers.json exists with default trainer"""
    trainers_path = os.path.join(data_dir, 'trainers.json')

    if not os.path.exists(trainers_path):
        print(f"⚠️  Warning: {trainers_path} not found")
        print("   The backend will create it automatically on first run")
        return True

    trainers = load_json(trainers_path)
    if not trainers:
        return False

    # Check if default trainer exists
    default_trainer = next((t for t in trainers if t['id'] == DEFAULT_TRAINER_ID), None)

    if not default_trainer:
        print(f"⚠️  Warning: Default trainer {DEFAULT_TRAINER_ID} not found in trainers.json")
        print(f"   Expected trainer: {DEFAULT_TRAINER_NAME}")
        return False

    print(f"✅ Default trainer found: {default_trainer['name']} (ID: {default_trainer['id']})")
    return True


def main():
    """Main migration function"""
    dry_run = '--dry-run' in sys.argv

    print("=" * 60)
    print("🔄 Attendance Records Migration: Add Trainer Information")
    print("=" * 60)

    if dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
        print()

    # Determine data directory
    script_dir = Path(__file__).parent.parent
    data_dir = script_dir / 'data'

    if not data_dir.exists():
        print(f"❌ Data directory not found: {data_dir}")
        print("   Make sure you're running this script from the backend directory")
        return 1

    print(f"📂 Data directory: {data_dir}")
    print()

    # Verify trainers file
    print("1️⃣  Verifying trainers.json...")
    if not verify_trainers_file(data_dir):
        print("❌ Trainers file verification failed")
        return 1
    print()

    # Migrate attendance records
    print("2️⃣  Migrating attendance records...")
    result = migrate_attendance_records(data_dir, dry_run)

    if result is False:
        return 1

    total_records, total_updated = result

    print()
    print("=" * 60)
    print("📊 Migration Summary")
    print("=" * 60)
    print(f"Total attendance records processed: {total_records}")
    print(f"Records updated with trainer info: {total_updated}")
    print(f"Records already had trainer info: {total_records - total_updated}")

    if dry_run:
        print()
        print("🔍 DRY RUN - No changes were made")
        print("   Run without --dry-run to apply changes")
    else:
        print()
        print("✅ Migration completed successfully!")
        print("   Backup files were created with timestamp suffix")

    print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
