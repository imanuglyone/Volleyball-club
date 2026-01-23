# Volleyball Club Booking (Next.js 14 + Supabase)

## ��� ������
- ��������� ������ �� ���������� � ����������.
- �����-������ ��� ���������� � �������.
- Supabase Postgres + Auth.
- Telegram-����������� ��� ������ � ������.

## ������� �����

### 1) ���������� �����������
```bash
npm install
```

### 2) ���������� ���������
�������� `.env.local` �� ������ `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### 3) Supabase: ���� + RLS
- �������� ������ Supabase.
- �������� ���������� `pgcrypto` (� �������� ��� ����).
- ��������� SQL �� `sql/001_init.sql` � SQL Editor Supabase.

### 4) ������� ��������������
� Supabase Auth �������� ������������ (email/password). ����������� ����� UI �� �������������.

### 5) ������
```bash
npm run dev
```

## �����������
- ��������� �������:
  - `GET /api/trainings?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - `GET /api/trainings/by-date?date=YYYY-MM-DD`
  - `POST /api/bookings`
- ��� ������ ��������� ����� ��������� ���� � RPC `create_booking`.
- ������� �������� middleware � Supabase Auth.

## ������ �������
- ������ ������ insert ��� bookings �������������� ���, ��� ������� ���� ������ ����� API � ��������� ����.
- `create_booking` �������� �� ����� � ������ �� ������ ��.
- Telegram ��������� ������������ ����� Bot API.

## �������� ����
- `/` � ��������� ������.
- `/admin` � ������ ����������.
- `/admin/trainings/new` � �������� ����������.
- `/admin/trainings/[id]/edit` � ��������������.
- `/admin/trainings/[id]/bookings` � ������ �� ����������.

## ��������� ���������
- �������� rate limit �� ������ Redis.
- ������� ��������� ������ � ��������� ���� � env.