#!/usr/bin/env python3
"""
Script to create test data for YFit Fin Management
- 10 members
- Each member buys 1-2 packages
- 20 classes in March-April 2026
- Members assigned to classes
"""

import json
import os
import random
from datetime import datetime, timedelta
from pathlib import Path

# Paths
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

MEMBERS_FILE = DATA_DIR / "members.json"
YEAR_2026_FILE = DATA_DIR / "2026.json"

# Test data
FIRST_NAMES = ["דוד", "שרה", "יוסי", "מיכל", "אבי", "רונית", "עמית", "נועה", "תומר", "ליאת"]
LAST_NAMES = ["כהן", "לוי", "מזרחי", "פרץ", "ביטון", "אברהם", "שלום", "אוחנה", "דהן", "אזולאי"]

PACKAGE_TYPES = {
    "single": {"name": "שיעור בודד", "classes": 1, "price": 60},
    "10pack": {"name": "כרטיסייה 10", "classes": 10, "price": 500},
    "20pack": {"name": "כרטיסייה 20", "classes": 20, "price": 900},
    "monthly": {"name": "מנוי חודשי", "classes": 12, "price": 600}
}

PAYMENT_METHODS = ["מזומן", "אשראי", "ביט", "העברה בנקאית"]

def generate_phone():
    """Generate Israeli phone number"""
    return f"05{random.randint(0, 9)}-{random.randint(1000000, 9999999)}"

def generate_dob():
    """Generate date of birth (age 20-50)"""
    years_ago = random.randint(20, 50)
    dob = datetime.now() - timedelta(days=years_ago * 365)
    return dob.strftime("%Y-%m-%d")

def create_members():
    """Create 10 test members"""
    members = []

    for i in range(10):
        member_id = f"member_{i+1:03d}"
        member = {
            "id": member_id,
            "name": f"{FIRST_NAMES[i]} {LAST_NAMES[i]}",
            "phone": generate_phone(),
            "dateOfBirth": generate_dob(),
            "isArchived": False,
            "createdAt": "2026-01-01T10:00:00Z"
        }
        members.append(member)

    # Save members
    with open(MEMBERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(members, f, ensure_ascii=False, indent=2)

    print(f"✅ Created {len(members)} members")
    return members

def create_packages(members):
    """Create package purchases for each member (1-2 packages each)"""
    packages = []
    package_id = 1

    for member in members:
        # Each member buys 1-2 packages
        num_packages = random.randint(1, 2)

        for _ in range(num_packages):
            package_type = random.choice(list(PACKAGE_TYPES.keys()))
            package_info = PACKAGE_TYPES[package_type]

            # Random purchase date in Jan-March 2026
            days_offset = random.randint(0, 90)
            purchase_date = datetime(2026, 1, 1) + timedelta(days=days_offset)

            package = {
                "id": f"pkg_{package_id:04d}",
                "memberId": member["id"],
                "memberName": member["name"],
                "packageType": package_type,
                "classCount": package_info["classes"],
                "amountPaid": package_info["price"],
                "paymentMethod": random.choice(PAYMENT_METHODS),
                "purchaseDate": purchase_date.strftime("%Y-%m-%d"),
                "createdAt": purchase_date.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            packages.append(package)
            package_id += 1

    print(f"✅ Created {len(packages)} package purchases")
    return packages

def create_classes_and_attendance(members):
    """Create 20 classes in March-April 2026 with member attendance"""
    attendance = []
    attendance_id = 1

    # Create 20 classes - 10 in March, 10 in April
    # Times: 07:00, 09:00, 17:00, 19:00
    class_times = ["07:00", "09:00", "17:00", "19:00"]

    # March classes (10 classes)
    march_dates = []
    for day in [5, 7, 10, 12, 15, 19, 21, 24, 26, 28]:
        march_dates.append(f"2026-03-{day:02d}")

    # April classes (10 classes)
    april_dates = []
    for day in [2, 4, 7, 9, 11, 14, 16, 18, 21, 23]:
        april_dates.append(f"2026-04-{day:02d}")

    all_dates = march_dates + april_dates

    for date in all_dates:
        time = random.choice(class_times)

        # Randomly select 4-8 members for this class
        num_attendees = random.randint(4, 8)
        attending_members = random.sample(members, num_attendees)

        for member in attending_members:
            record = {
                "id": f"att_{attendance_id:05d}",
                "memberId": member["id"],
                "memberName": member["name"],
                "date": date,
                "time": time,
                "createdAt": f"{date}T{time}:00Z"
            }
            attendance.append(record)
            attendance_id += 1

    print(f"✅ Created {len(all_dates)} classes with {len(attendance)} attendance records")
    return attendance

def create_year_data():
    """Create year 2026 data file"""
    print("\n🔧 Creating test data for 2026...")

    # Create members
    members = create_members()

    # Create packages
    packages = create_packages(members)

    # Create classes and attendance
    attendance = create_classes_and_attendance(members)

    # Create year data structure
    year_data = {
        "year": "2026",
        "packages": packages,
        "refunds": [],  # No refunds in test data
        "attendance": attendance
    }

    # Save year data
    with open(YEAR_2026_FILE, 'w', encoding='utf-8') as f:
        json.dump(year_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Year 2026 data saved to {YEAR_2026_FILE}")

    # Print summary
    print("\n📊 Test Data Summary:")
    print(f"   • Members: {len(members)}")
    print(f"   • Package Purchases: {len(packages)}")
    print(f"   • Total Revenue: ₪{sum(p['amountPaid'] for p in packages):,}")
    print(f"   • Classes: 20 (10 in March, 10 in April)")
    print(f"   • Attendance Records: {len(attendance)}")
    print(f"   • Average Attendance per Class: {len(attendance) / 20:.1f} members")

    return year_data

if __name__ == "__main__":
    print("🎯 YFit Fin Management - Test Data Generator")
    print("=" * 50)

    # Create all test data
    year_data = create_year_data()

    print("\n✨ Test data created successfully!")
    print("\n🚀 Start your servers and login to see the data:")
    print("   Backend:  cd backend && python -m uvicorn main:app --reload")
    print("   Frontend: cd frontend && npm run dev")
    print("   Login:    http://localhost:5173 (admin/admin123)")
