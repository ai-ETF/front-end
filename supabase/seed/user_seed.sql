INSERT INTO auth.users (
    id,
    email,
    banned_until,
    created_at,
    confirmation_sent_at,
    is_anonymous,
    is_sso_user,
    invited_at,
    last_sign_in_at,
    phone,
    raw_app_meta_data,
    raw_user_meta_data,
    updated_at
) VALUES (
    'b978e5f5-2908-4dc5-991e-5c4371cb60b0',
    'lpqst@outlook.com',
    NULL,
    '2025-10-28 05:16:13.879914+00',
    NULL,
    false,
    false,
    NULL,
    '2026-01-07 05:24:01.536678+00',
    NULL,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"email_verified":true}'::jsonb,
    '2026-01-07 05:24:01.560611+00'
);
