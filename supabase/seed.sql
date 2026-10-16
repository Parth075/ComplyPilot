-- ====================================================================
-- ComplyPilot Production Seed Data
-- Valid UUIDs only: hex digits [0-9, a-f]
-- ====================================================================

-- 1. Default Compliance Requirements
insert into public.compliance_requirements (id, title, group_name, applies_to_role, cadence, due_window, enabled)
values
  ('c0000001-0000-0000-0000-000000000001', 'Handbook acknowledgement', 'Policy acknowledgement', null, 'one_time', 'Within 5 days', true),
  ('c0000001-0000-0000-0000-000000000002', 'Workplace safety introduction', 'Required learning', null, 'one_time', 'Within 10 days', true),
  ('c0000001-0000-0000-0000-000000000003', 'Information care guidelines', 'Policy acknowledgement', null, 'annual', 'Every 12 months', true),
  ('c0000001-0000-0000-0000-000000000004', 'Manager check-in', 'People process', null, 'one_time', 'Within 7 days', false)
on conflict (id) do nothing;

-- 2. Default Published Workplace Policies
insert into public.policies (id, title, section, body, status, version)
values
  ('b0000001-0000-0000-0000-000000000001', 'Flexible work policy', 'Section 3.2 · Working arrangements', 'Teams agree on a working rhythm with their manager. Employees should keep their calendar current, join scheduled team meetings, and ask their manager about location-specific arrangements.', 'Published', 1),
  ('b0000001-0000-0000-0000-000000000002', 'Time away from work', 'Section 4.2 · Requesting time away', 'Submit a time-away request through the team process and discuss timing with your manager. The manager confirms coverage and follows up if more information is needed.', 'Published', 1),
  ('b0000001-0000-0000-0000-000000000003', 'Information care guidelines', 'Section 2.1 · Protecting information', 'Use approved tools for work information, keep sign-in details private, and report a concern to the People Operations team promptly.', 'Published', 1)
on conflict (id) do nothing;

-- 3. Default Onboarding Templates
insert into public.onboarding_templates (id, name, role_target, status)
values
  ('d0000001-0000-0000-0000-000000000001', 'New employee · Core plan', 'All teams', 'Active'),
  ('d0000001-0000-0000-0000-000000000002', 'People manager · First 30 days', 'Managers', 'Active'),
  ('d0000001-0000-0000-0000-000000000003', 'Remote team · Core plan', 'Remote employees', 'Draft')
on conflict (id) do nothing;

-- 4. Template Tasks for Core Plan
insert into public.template_tasks (id, template_id, title, category, description, due_offset_days, due_window, owner_role, required)
values
  ('a0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Complete personal & contact profile', 'Getting started', 'Fill in emergency contacts, preferred name, and personal communications preference.', 0, 'Day 1', 'Employee', true),
  ('a0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'Upload government photo identity', 'Documents', 'Upload valid passport or state ID for HR Form I-9 verification.', 0, 'Day 1', 'Employee', true),
  ('a0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001', 'Submit payroll & tax withholding details', 'Payroll', 'Provide direct deposit routing number and complete W-4 tax withholding form.', 0, 'Day 1', 'Employee', true),
  ('a0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000001', 'Acknowledge workplace employee handbook', 'Policies', 'Review the comprehensive company handbook and acknowledge understanding.', 5, 'Within 5 days', 'Employee', true),
  ('a0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000001', 'Review & sign code of conduct & ethics', 'Policies', 'Annual commitment to anti-harassment, ethics, and workplace standards.', 5, 'Within 5 days', 'Employee', true),
  ('a0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000001', 'Complete mandatory security awareness', 'Learning', 'SOC2 compliant training covering phishing, credential care, and device security.', 10, 'Within 10 days', 'Employee', true),
  ('a0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000001', 'Select health & wellness benefits plan', 'Benefits', 'Review medical, vision, 401(k) matching, and submit your elections before the 30-day window.', 14, 'Within 14 days', 'Employee', false),
  ('a0000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000001', 'Conduct first 1:1 check-in with manager', 'People', 'Discuss role expectations, 30-60-90 day milestone alignment, and ask questions.', 7, 'Within 7 days', 'Manager', true)
on conflict (id) do nothing;

-- 5. Seed Initial Policy Chunks for RAG index
insert into public.policy_chunks (id, policy_id, content, section_ref)
values
  ('f0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Flexible work policy: Teams agree on a working rhythm with their manager. Employees should keep their calendar current, join scheduled team meetings, and ask their manager about location-specific arrangements.', 'Section 3.2 · Working arrangements'),
  ('f0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'Time away from work: Submit a time-away request through the team process and discuss timing with your manager. The manager confirms coverage and follows up if more information is needed.', 'Section 4.2 · Requesting time away'),
  ('f0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', 'Information care guidelines: Use approved tools for work information, keep sign-in details private, and report a concern to the People Operations team promptly.', 'Section 2.1 · Protecting information')
on conflict (id) do nothing;
