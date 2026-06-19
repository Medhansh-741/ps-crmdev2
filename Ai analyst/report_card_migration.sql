-- ====================================================================
-- JanSamadhan Universal Report Card Schema & Dynamic Scoring Triggers
-- ====================================================================

BEGIN;

-- 1. Create Report Cards Table
CREATE TABLE IF NOT EXISTS public.report_cards (
    entity_type TEXT NOT NULL CHECK (entity_type IN ('department', 'worker', 'authority', 'ward', 'category')),
    entity_id TEXT NOT NULL,
    speed_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    quality_score NUMERIC(5,2) NOT NULL DEFAULT 80.00,  -- Default neutral rating
    volume_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    sla_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    composite_score NUMERIC(5,2) NOT NULL DEFAULT 94.00, -- Weighted base average
    grade TEXT NOT NULL DEFAULT 'A',
    total_complaints INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (entity_type, entity_id)
);

-- 2. Create Rules Registries (Decoupling yaml/logic from trigger code)
CREATE TABLE IF NOT EXISTS public.report_card_rules (
    rule_key TEXT PRIMARY KEY,
    score_type TEXT NOT NULL CHECK (score_type IN ('sla', 'quality', 'speed', 'volume')),
    impact NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS public.report_card_speed_rules (
    transition TEXT NOT NULL,
    min_hours NUMERIC NOT NULL,
    max_hours NUMERIC NOT NULL,
    impact NUMERIC NOT NULL,
    PRIMARY KEY (transition, min_hours, max_hours)
);

-- 3. Seed Rule Values from report_cards.yaml
INSERT INTO public.report_card_rules (rule_key, score_type, impact) VALUES
    ('sla_resolved_on_time', 'sla', 20.00),
    ('sla_resolved_breached', 'sla', -40.00),
    ('sla_became_overdue', 'sla', -10.00),
    ('quality_reopened', 'quality', -30.00),
    ('quality_escalated', 'quality', -15.00),
    ('quality_rejected_no_reason', 'quality', -25.00),
    ('volume_resolution_bonus', 'volume', 5.00)
ON CONFLICT (rule_key) DO UPDATE SET impact = EXCLUDED.impact;

INSERT INTO public.report_card_speed_rules (transition, min_hours, max_hours, impact) VALUES
    ('submitted_to_assigned', 0, 12, 10.00),
    ('submitted_to_assigned', 12, 24, 0.00),
    ('submitted_to_assigned', 24, 48, -15.00),
    ('submitted_to_assigned', 48, 999999, -30.00),
    ('assigned_to_in_progress', 0, 6, 5.00),
    ('assigned_to_in_progress', 6, 24, 0.00),
    ('assigned_to_in_progress', 24, 999999, -10.00),
    ('in_progress_to_resolved', 0, 24, 20.00),
    ('in_progress_to_resolved', 24, 48, 0.00),
    ('in_progress_to_resolved', 48, 72, -20.00),
    ('in_progress_to_resolved', 72, 999999, -40.00)
ON CONFLICT (transition, min_hours, max_hours) DO UPDATE SET impact = EXCLUDED.impact;

-- 4. Unified Update & Grade Function
CREATE OR REPLACE FUNCTION public.update_report_card_metrics(
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_speed_delta NUMERIC,
    p_quality_delta NUMERIC,
    p_volume_delta NUMERIC,
    p_sla_delta NUMERIC,
    p_complaint_increment INT
) RETURNS VOID AS $$
DECLARE
    v_speed NUMERIC;
    v_quality NUMERIC;
    v_volume NUMERIC;
    v_sla NUMERIC;
    v_composite NUMERIC;
    v_grade TEXT;
BEGIN
    -- Exclude UNASSIGNED entries to prevent skewed data
    IF p_entity_id = 'UNASSIGNED' OR p_entity_id IS NULL OR p_entity_id = '' THEN
        RETURN;
    END IF;

    -- Upsert base card if not exists
    INSERT INTO public.report_cards (entity_type, entity_id)
    VALUES (p_entity_type, p_entity_id)
    ON CONFLICT (entity_type, entity_id) DO NOTHING;

    -- Retrieve current scores
    SELECT speed_score, quality_score, volume_score, sla_score
    INTO v_speed, v_quality, v_volume, v_sla
    FROM public.report_cards
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id;

    -- Calculate new bounded scores (0 to 100)
    v_speed   := LEAST(100.00, GREATEST(0.00, v_speed + p_speed_delta));
    v_quality := LEAST(100.00, GREATEST(0.00, v_quality + p_quality_delta));
    v_volume  := LEAST(100.00, GREATEST(0.00, v_volume + p_volume_delta));
    v_sla     := LEAST(100.00, GREATEST(0.00, v_sla + p_sla_delta));

    -- Calculate composite score using weights (40% SLA, 30% Quality, 20% Speed, 10% Volume)
    v_composite := (v_sla * 0.40) + (v_quality * 0.30) + (v_speed * 0.20) + (v_volume * 0.10);

    -- Grade lookup (Policy-defined limits from report_cards.yaml)
    IF v_composite >= 90.00 THEN v_grade := 'A';
    ELSIF v_composite >= 75.00 THEN v_grade := 'B';
    ELSIF v_composite >= 60.00 THEN v_grade := 'C';
    ELSIF v_composite >= 45.00 THEN v_grade := 'D';
    ELSE v_grade := 'F';
    END IF;

    -- Update row
    UPDATE public.report_cards
    SET speed_score = v_speed,
        quality_score = v_quality,
        volume_score = v_volume,
        sla_score = v_sla,
        composite_score = v_composite,
        grade = v_grade,
        total_complaints = total_complaints + p_complaint_increment,
        last_updated = now()
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger Handler Function for complaints updates
CREATE OR REPLACE FUNCTION public.process_complaint_report_card_change()
RETURNS TRIGGER AS $$
DECLARE
    v_hours NUMERIC;
    v_speed_impact NUMERIC := 0.00;
    v_quality_impact NUMERIC := 0.00;
    v_volume_impact NUMERIC := 0.00;
    v_sla_impact NUMERIC := 0.00;
    v_total_increment INT := 0;
    
    -- Entities to update
    v_dept TEXT;
    v_worker TEXT;
    v_ward TEXT;
    v_category TEXT;
BEGIN
    -- Resolve affected entities
    v_dept := COALESCE(NEW.assigned_department, OLD.assigned_department);
    v_worker := COALESCE(NEW.assigned_worker_id::TEXT, OLD.assigned_worker_id::TEXT);
    v_ward := COALESCE(NEW.ward_name, OLD.ward_name);
    v_category := COALESCE(NEW.category_id::TEXT, OLD.category_id::TEXT);

    -- CASE 1: New Ticket Registered
    IF TG_OP = 'INSERT' THEN
        v_total_increment := 1;
        -- New workload active count triggers volume check
        PERFORM public.update_report_card_metrics('department', v_dept, 0, 0, 0, 0, 1);
        IF v_worker IS NOT NULL THEN
            PERFORM public.update_report_card_metrics('worker', v_worker, 0, 0, 0, 0, 1);
        END IF;
        PERFORM public.update_report_card_metrics('ward', v_ward, 0, 0, 0, 0, 1);
        PERFORM public.update_report_card_metrics('category', v_category, 0, 0, 0, 0, 1);
        RETURN NEW;
    END IF;

    -- CASE 2: Update Transitions
    IF TG_OP = 'UPDATE' THEN
        -- Handle Reassignments (Department / Worker / Ward / Category change)
        IF OLD.assigned_department IS DISTINCT FROM NEW.assigned_department THEN
            IF OLD.assigned_department IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('department', OLD.assigned_department, 0, 0, 0, 0, -1);
            END IF;
            IF NEW.assigned_department IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('department', NEW.assigned_department, 0, 0, 0, 0, 1);
            END IF;
        END IF;

        IF OLD.assigned_worker_id IS DISTINCT FROM NEW.assigned_worker_id THEN
            IF OLD.assigned_worker_id IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('worker', OLD.assigned_worker_id::TEXT, 0, 0, 0, 0, -1);
            END IF;
            IF NEW.assigned_worker_id IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('worker', NEW.assigned_worker_id::TEXT, 0, 0, 0, 0, 1);
            END IF;
        END IF;

        IF OLD.ward_name IS DISTINCT FROM NEW.ward_name THEN
            IF OLD.ward_name IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('ward', OLD.ward_name, 0, 0, 0, 0, -1);
            END IF;
            IF NEW.ward_name IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('ward', NEW.ward_name, 0, 0, 0, 0, 1);
            END IF;
        END IF;

        IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
            IF OLD.category_id IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('category', OLD.category_id::TEXT, 0, 0, 0, 0, -1);
            END IF;
            IF NEW.category_id IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('category', NEW.category_id::TEXT, 0, 0, 0, 0, 1);
            END IF;
        END IF;

        -- 2.1 Transition: submitted -> assigned
        IF OLD.status = 'submitted' AND NEW.status = 'assigned' THEN
            v_hours := EXTRACT(EPOCH FROM (NEW.created_at - OLD.created_at))/3600.0; -- Default placeholder check
            SELECT impact INTO v_speed_impact FROM public.report_card_speed_rules 
            WHERE transition = 'submitted_to_assigned' AND v_hours >= min_hours AND v_hours < max_hours LIMIT 1;
        END IF;

        -- 2.2 Transition: assigned -> in_progress
        IF OLD.status = 'assigned' AND NEW.status = 'in_progress' THEN
            -- Check assignment-to-inprogress delay duration
            v_hours := EXTRACT(EPOCH FROM (now() - OLD.created_at))/3600.0; -- time since assigned
            SELECT impact INTO v_speed_impact FROM public.report_card_speed_rules 
            WHERE transition = 'assigned_to_in_progress' AND v_hours >= min_hours AND v_hours < max_hours LIMIT 1;
        END IF;

        -- 2.3 Transition: -> resolved / rejected
        IF OLD.status <> NEW.status AND NEW.status IN ('resolved', 'rejected', 'spam') THEN
            -- Speed Impact
            v_hours := EXTRACT(EPOCH FROM (now() - NEW.created_at))/3600.0;
            SELECT impact INTO v_speed_impact FROM public.report_card_speed_rules 
            WHERE transition = 'in_progress_to_resolved' AND v_hours >= min_hours AND v_hours < max_hours LIMIT 1;
            
            -- SLA Impact
            IF NEW.sla_breached = TRUE THEN
                SELECT impact INTO v_sla_impact FROM public.report_card_rules WHERE rule_key = 'sla_resolved_breached';
            ELSE
                SELECT impact INTO v_sla_impact FROM public.report_card_rules WHERE rule_key = 'sla_resolved_on_time';
            END IF;

            -- Volume Impact
            SELECT impact INTO v_volume_impact FROM public.report_card_rules WHERE rule_key = 'volume_resolution_bonus';
        END IF;

        -- 2.4 Reopen Penalty
        IF NEW.reopen_count > OLD.reopen_count THEN
            SELECT impact INTO v_quality_impact FROM public.report_card_rules WHERE rule_key = 'quality_reopened';
        END IF;

        -- 2.5 Escalation Penalty
        IF NEW.escalation_level > OLD.escalation_level THEN
            SELECT impact INTO v_quality_impact FROM public.report_card_rules WHERE rule_key = 'quality_escalated';
        END IF;

        -- Trigger updates to all affected categories
        IF v_speed_impact <> 0 OR v_quality_impact <> 0 OR v_volume_impact <> 0 OR v_sla_impact <> 0 THEN
            PERFORM public.update_report_card_metrics('department', v_dept, v_speed_impact, v_quality_impact, v_volume_impact, v_sla_impact, 0);
            IF v_worker IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('worker', v_worker, v_speed_impact, v_quality_impact, v_volume_impact, v_sla_impact, 0);
            END IF;
            PERFORM public.update_report_card_metrics('ward', v_ward, v_speed_impact, v_quality_impact, v_volume_impact, v_sla_impact, 0);
            PERFORM public.update_report_card_metrics('category', v_category, v_speed_impact, v_quality_impact, v_volume_impact, v_sla_impact, 0);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger Handler Function for review submissions
CREATE OR REPLACE FUNCTION public.process_review_report_card_change()
RETURNS TRIGGER AS $$
DECLARE
    v_complaint RECORD;
    v_quality_impact NUMERIC := 0.00;
    v_rating_pct NUMERIC;
    v_dept TEXT;
    v_worker TEXT;
    v_ward TEXT;
    v_category TEXT;
BEGIN
    -- Fetch associated complaint metadata
    SELECT assigned_department, assigned_worker_id, ward_name, category_id
    INTO v_complaint
    FROM public.complaints
    WHERE id = NEW.complaint_id;

    IF FOUND THEN
        v_dept := v_complaint.assigned_department;
        v_worker := v_complaint.assigned_worker_id::TEXT;
        v_ward := v_complaint.ward_name;
        v_category := v_complaint.category_id::TEXT;

        -- Quality impact rating conversion: rating 1-5 is converted to positive/negative shift
        v_rating_pct := (NEW.rating::NUMERIC / 5.0) * 100.0;
        
        -- Let citizen ratings directly guide quality increments
        -- Subtract penalty for low ratings (< 3), add bonus for high ratings (>= 4)
        IF NEW.rating >= 4 THEN
            v_quality_impact := 15.00;
        ELSIF NEW.rating <= 2 THEN
            v_quality_impact := -25.00;
        END IF;

        IF v_quality_impact <> 0 THEN
            PERFORM public.update_report_card_metrics('department', v_dept, 0, v_quality_impact, 0, 0, 0);
            IF v_worker IS NOT NULL THEN
                PERFORM public.update_report_card_metrics('worker', v_worker, 0, v_quality_impact, 0, 0, 0);
            END IF;
            PERFORM public.update_report_card_metrics('ward', v_ward, 0, v_quality_impact, 0, 0, 0);
            PERFORM public.update_report_card_metrics('category', v_category, 0, v_quality_impact, 0, 0, 0);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Register Triggers
DROP TRIGGER IF EXISTS trg_complaint_report_card ON public.complaints;
CREATE TRIGGER trg_complaint_report_card
    AFTER INSERT OR UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.process_complaint_report_card_change();

DROP TRIGGER IF EXISTS trg_review_report_card ON public.reviews;
CREATE TRIGGER trg_review_report_card
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.process_review_report_card_change();

COMMIT;
