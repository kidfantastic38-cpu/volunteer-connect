-- Align opportunity/application status vocabulary without deleting rows.
UPDATE opportunities SET status = 'published' WHERE status = 'open';
UPDATE applications SET status = 'submitted' WHERE status = 'applied';
UPDATE applications SET status = 'under_review' WHERE status = 'interview';
UPDATE applications SET status = 'accepted' WHERE status = 'offer';
