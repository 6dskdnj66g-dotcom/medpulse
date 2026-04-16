# MedPulse AI — Database Implementation Plan

## Architecture: Supabase (PostgreSQL + Auth + RLS)

### Tables:
1. **profiles** — بيانات المستخدمين المسجلين
2. **medical_sources** — مكتبة المصادر الطبية (200+ مصدر)
3. **user_progress** — تقدم المستخدم وجلسات التعلم
4. **visitor_logs** — تتبع الزوار والإحصائيات
5. **user_bookmarks** — مفضلة المصادر لكل مستخدم
6. **user_sessions** — جلسات العمل التفصيلية
