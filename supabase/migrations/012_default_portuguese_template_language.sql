ALTER TABLE message_templates
  ALTER COLUMN language SET DEFAULT 'pt_PT';

ALTER TABLE broadcasts
  ALTER COLUMN template_language SET DEFAULT 'pt_PT';
