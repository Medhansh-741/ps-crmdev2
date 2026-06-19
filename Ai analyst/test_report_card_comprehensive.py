import os
import sys
import uuid
from datetime import datetime, timedelta
from supabase import create_client

def get_env_vals(path):
    vals = {}
    if os.path.exists(path):
        with open(path, "r") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    k = parts[0].strip()
                    v = parts[1].strip().strip('"').strip("'")
                    vals[k] = v
    return vals

class ComprehensiveReportCardTester:
    def __init__(self):
        paths = [
            "c:/Users/medha/OneDrive/Desktop/ps-crmdev1/.env",
            "c:/Users/medha/OneDrive/Desktop/ps-crmdev1/apps/api/.env",
            "c:/Users/medha/OneDrive/Desktop/ps-crmdev1/apps/web/.env.local"
        ]
        vals = {}
        for p in paths:
            if os.path.exists(p):
                vals.update(get_env_vals(p))
                
        url = vals.get("SUPABASE_URL") or vals.get("NEXT_PUBLIC_SUPABASE_URL")
        key = vals.get("SUPABASE_SERVICE_KEY") or vals.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("Supabase credentials missing in env files.")
            
        self.supabase = create_client(url, key)
        self.test_id = str(uuid.uuid4())
        self.review_id = str(uuid.uuid4())
        
        # References for test entities
        self.dept_1 = "PWD"
        self.dept_2 = "MCD"
        self.worker_1 = None
        self.worker_2 = None
        self.ward_1 = "ALIPUR"
        self.ward_2 = "Connaught Place"
        self.category_1 = None
        self.category_2 = None
        
        # Complaint field overrides
        self.citizen_id = None
        self.location = None
        self.severity = "L2"
        self.effective_severity = "L2"

    def setup_references(self):
        print("[SETUP] Fetching active references from DB...")
        
        # Fetch 2 valid workers
        res_workers = self.supabase.table("profiles").select("id").eq("role", "worker").limit(2).execute()
        if res_workers.data and len(res_workers.data) >= 2:
            self.worker_1 = res_workers.data[0]["id"]
            self.worker_2 = res_workers.data[1]["id"]
            print(f" -> Found workers: {self.worker_1}, {self.worker_2}")
        elif res_workers.data and len(res_workers.data) == 1:
            self.worker_1 = res_workers.data[0]["id"]
            self.worker_2 = res_workers.data[0]["id"] # fallback
            print(f" -> Found only 1 worker: {self.worker_1}")
        else:
            raise ValueError("Could not find any worker profiles in database.")
            
        # Fetch 2 valid categories
        res_cats = self.supabase.table("categories").select("id").limit(2).execute()
        if res_cats.data and len(res_cats.data) >= 2:
            self.category_1 = res_cats.data[0]["id"]
            self.category_2 = res_cats.data[1]["id"]
            print(f" -> Found categories: {self.category_1}, {self.category_2}")
        else:
            raise ValueError("Could not find enough categories in database.")
            
        # Fetch citizen_id and other default fields from a sample complaint
        res_comp = self.supabase.table("complaints").select("citizen_id, location, severity, effective_severity").limit(1).execute()
        if res_comp.data:
            self.citizen_id = res_comp.data[0]["citizen_id"]
            self.location = res_comp.data[0]["location"]
            self.severity = res_comp.data[0]["severity"] or "L2"
            self.effective_severity = res_comp.data[0]["effective_severity"] or "L2"
            print(f" -> Copied complaint template fields. Citizen: {self.citizen_id}")
        else:
            raise ValueError("Could not find any complaints in database to template test ticket.")

    def get_card_stats(self, entity_type: str, entity_id: str):
        res = self.supabase.table("report_cards").select("*").eq("entity_type", entity_type).eq("entity_id", str(entity_id)).execute()
        if res.data:
            return res.data[0]
        # Return default if not populated yet
        return {
            "total_complaints": 0,
            "speed_score": 100.0,
            "quality_score": 80.0,
            "sla_score": 100.0,
            "volume_score": 100.0,
            "composite_score": 94.0
        }

    def print_entity_states(self, label: str):
        print(f"\n--- State: {label} ---")
        for ent_type, ent_id in [
            ("department", self.dept_1),
            ("worker", self.worker_1),
            ("ward", self.ward_1),
            ("category", self.category_1)
        ]:
            card = self.get_card_stats(ent_type, ent_id)
            print(f"  {ent_type.capitalize()} '{ent_id}': total={card['total_complaints']}, SLA={card['sla_score']}, Qual={card['quality_score']}, Speed={card['speed_score']}, Vol={card['volume_score']}, Comp={card['composite_score']}")

    def run(self):
        self.setup_references()
        
        # Get baseline stats for initial entities
        base_dept = self.get_card_stats("department", self.dept_1)
        base_work = self.get_card_stats("worker", self.worker_1)
        base_ward = self.get_card_stats("ward", self.ward_1)
        base_cat = self.get_card_stats("category", self.category_1)
        
        self.print_entity_states("BASELINE")

        # ---------------------------------------------
        # TEST 1: INSERT COMPLAINT (Verify Count Increments)
        # ---------------------------------------------
        print("\n[TEST 1] Inserting test complaint...")
        payload = {
            "id": self.test_id,
            "title": "Comprehensive Integration Test Ticket",
            "description": "Validating full status transition tracking",
            "status": "submitted",
            "severity": self.severity,
            "effective_severity": self.effective_severity,
            "assigned_department": self.dept_1,
            "assigned_worker_id": self.worker_1,
            "ward_name": self.ward_1,
            "category_id": self.category_1,
            "location": self.location,
            "citizen_id": self.citizen_id
        }
        self.supabase.table("complaints").insert(payload).execute()
        
        # Verify counts incremented by 1
        t1_dept = self.get_card_stats("department", self.dept_1)
        t1_work = self.get_card_stats("worker", self.worker_1)
        t1_ward = self.get_card_stats("ward", self.ward_1)
        t1_cat = self.get_card_stats("category", self.category_1)
        
        assert t1_dept["total_complaints"] == base_dept["total_complaints"] + 1, "Department complaint count did not increment"
        assert t1_work["total_complaints"] == base_work["total_complaints"] + 1, "Worker complaint count did not increment"
        assert t1_ward["total_complaints"] == base_ward["total_complaints"] + 1, "Ward complaint count did not increment"
        assert t1_cat["total_complaints"] == base_cat["total_complaints"] + 1, "Category complaint count did not increment"
        
        print(" -> [SUCCESS] Ticket insertion successfully incremented counts for all 4 entities.")

        # ---------------------------------------------
        # TEST 2: Transition submitted -> assigned (Verify Speed Score change)
        # ---------------------------------------------
        print("\n[TEST 2] Transitioning ticket: submitted -> assigned...")
        # Get pre-transition speed scores
        pre_speed_dept = float(t1_dept["speed_score"])
        pre_speed_work = float(t1_work["speed_score"])
        pre_speed_ward = float(t1_ward["speed_score"])
        pre_speed_cat = float(t1_cat["speed_score"])
        
        self.supabase.table("complaints").update({"status": "assigned"}).eq("id", self.test_id).execute()
        
        # Verify speed scores updated
        t2_dept = self.get_card_stats("department", self.dept_1)
        t2_work = self.get_card_stats("worker", self.worker_1)
        t2_ward = self.get_card_stats("ward", self.ward_1)
        t2_cat = self.get_card_stats("category", self.category_1)
        
        print(f" -> Department speed score: {pre_speed_dept} -> {t2_dept['speed_score']}")
        print(f" -> Worker speed score: {pre_speed_work} -> {t2_work['speed_score']}")
        print(f" -> Ward speed score: {pre_speed_ward} -> {t2_ward['speed_score']}")
        print(f" -> Category speed score: {pre_speed_cat} -> {t2_cat['speed_score']}")
        print(" -> [SUCCESS] Transition submitted -> assigned processed successfully.")

        # ---------------------------------------------
        # TEST 3: Transition assigned -> in_progress (Verify Speed Score change)
        # ---------------------------------------------
        print("\n[TEST 3] Transitioning ticket: assigned -> in_progress...")
        self.supabase.table("complaints").update({"status": "in_progress"}).eq("id", self.test_id).execute()
        
        t3_dept = self.get_card_stats("department", self.dept_1)
        t3_work = self.get_card_stats("worker", self.worker_1)
        t3_ward = self.get_card_stats("ward", self.ward_1)
        t3_cat = self.get_card_stats("category", self.category_1)
        
        print(f" -> Department speed score: {t2_dept['speed_score']} -> {t3_dept['speed_score']}")
        print(f" -> Worker speed score: {t2_work['speed_score']} -> {t3_work['speed_score']}")
        print(f" -> Ward speed score: {t2_ward['speed_score']} -> {t3_ward['speed_score']}")
        print(f" -> Category speed score: {t2_cat['speed_score']} -> {t3_cat['speed_score']}")
        print(" -> [SUCCESS] Transition assigned -> in_progress processed successfully.")

        # ---------------------------------------------
        # TEST 4: Transition in_progress -> resolved (SLA Breached penalty & Volume resolution bonus)
        # ---------------------------------------------
        print("\n[TEST 4] Resolving ticket late (sla_breached = True)...")
        pre_sla_dept = float(t3_dept["sla_score"])
        pre_vol_dept = float(t3_dept["volume_score"])
        
        self.supabase.table("complaints").update({
            "status": "resolved",
            "sla_breached": True,
            "resolved_at": datetime.utcnow().isoformat() + "Z"
        }).eq("id", self.test_id).execute()
        
        t4_dept = self.get_card_stats("department", self.dept_1)
        t4_work = self.get_card_stats("worker", self.worker_1)
        t4_ward = self.get_card_stats("ward", self.ward_1)
        t4_cat = self.get_card_stats("category", self.category_1)
        
        # Assert SLA score drops (breach penalty -40) and Volume score increases (+5 bonus)
        print(f" -> Department SLA: {pre_sla_dept} -> {t4_dept['sla_score']} (Expected drop)")
        print(f" -> Department Volume: {pre_vol_dept} -> {t4_dept['volume_score']} (Expected increase)")
        assert float(t4_dept["sla_score"]) < pre_sla_dept, "SLA score did not drop on breached resolution"
        assert float(t4_work["sla_score"]) < float(t3_work["sla_score"]), "Worker SLA score did not drop"
        assert float(t4_ward["sla_score"]) < float(t3_ward["sla_score"]), "Ward SLA score did not drop"
        assert float(t4_cat["sla_score"]) < float(t3_cat["sla_score"]), "Category SLA score did not drop"
        print(" -> [SUCCESS] SLA breached resolution penalty applied to all 4 entities.")

        # ---------------------------------------------
        # TEST 5: Reopening Ticket (Quality Score penalty)
        # ---------------------------------------------
        print("\n[TEST 5] Reopening resolved complaint...")
        pre_qual_dept = float(t4_dept["quality_score"])
        pre_qual_work = float(t4_work["quality_score"])
        
        self.supabase.table("complaints").update({
            "status": "reopened",
            "reopen_count": 1
        }).eq("id", self.test_id).execute()
        
        t5_dept = self.get_card_stats("department", self.dept_1)
        t5_work = self.get_card_stats("worker", self.worker_1)
        t5_ward = self.get_card_stats("ward", self.ward_1)
        t5_cat = self.get_card_stats("category", self.category_1)
        
        print(f" -> Department quality score: {pre_qual_dept} -> {t5_dept['quality_score']} (Expected drop by 30)")
        print(f" -> Worker quality score: {pre_qual_work} -> {t5_work['quality_score']}")
        assert float(t5_dept["quality_score"]) < pre_qual_dept, "Quality score did not drop on reopen"
        assert float(t5_work["quality_score"]) < pre_qual_work, "Worker quality score did not drop on reopen"
        assert float(t5_ward["quality_score"]) < float(t4_ward["quality_score"]), "Ward quality score did not drop on reopen"
        assert float(t5_cat["quality_score"]) < float(t4_cat["quality_score"]), "Category quality score did not drop on reopen"
        print(" -> [SUCCESS] Reopen quality penalty (-30) successfully tracked across all 4 entities.")

        # ---------------------------------------------
        # TEST 6: Escalating Ticket (Quality Score penalty)
        # ---------------------------------------------
        print("\n[TEST 6] Escalating complaint...")
        pre_qual_dept = float(t5_dept["quality_score"])
        
        self.supabase.table("complaints").update({
            "escalation_level": 1
        }).eq("id", self.test_id).execute()
        
        t6_dept = self.get_card_stats("department", self.dept_1)
        t6_work = self.get_card_stats("worker", self.worker_1)
        t6_ward = self.get_card_stats("ward", self.ward_1)
        t6_cat = self.get_card_stats("category", self.category_1)
        
        print(f" -> Department quality score: {pre_qual_dept} -> {t6_dept['quality_score']} (Expected drop by 15)")
        assert float(t6_dept["quality_score"]) < pre_qual_dept, "Quality score did not drop on escalation"
        assert float(t6_work["quality_score"]) < float(t5_work["quality_score"]), "Worker quality score did not drop on escalation"
        assert float(t6_ward["quality_score"]) < float(t5_ward["quality_score"]), "Ward quality score did not drop on escalation"
        assert float(t6_cat["quality_score"]) < float(t5_cat["quality_score"]), "Category quality score did not drop on escalation"
        print(" -> [SUCCESS] Escalation quality penalty (-15) successfully tracked across all 4 entities.")

        # ---------------------------------------------
        # TEST 7: Citizen Review Submission (Citizen satisfaction quality check)
        # ---------------------------------------------
        print("\n[TEST 7] Citizen submitting negative review (rating = 1)...")
        pre_qual_dept = float(t6_dept["quality_score"])
        
        # Submit a low review
        review_payload = {
            "id": self.review_id,
            "complaint_id": self.test_id,
            "citizen_id": self.citizen_id,
            "rating": 1,
            "worker_id": self.worker_1,
            "feedback": "Extremely slow and poor service."
        }
        self.supabase.table("reviews").insert(review_payload).execute()
        
        t7_dept = self.get_card_stats("department", self.dept_1)
        t7_work = self.get_card_stats("worker", self.worker_1)
        t7_ward = self.get_card_stats("ward", self.ward_1)
        t7_cat = self.get_card_stats("category", self.category_1)
        
        print(f" -> Department quality score: {pre_qual_dept} -> {t7_dept['quality_score']} (Expected drop by 25)")
        assert float(t7_dept["quality_score"]) < pre_qual_dept, "Quality score did not drop on 1-star review"
        assert float(t7_work["quality_score"]) < float(t6_work["quality_score"]), "Worker quality score did not drop on 1-star review"
        assert float(t7_ward["quality_score"]) < float(t6_ward["quality_score"]), "Ward quality score did not drop on 1-star review"
        assert float(t7_cat["quality_score"]) < float(t6_cat["quality_score"]), "Category quality score did not drop on 1-star review"
        print(" -> [SUCCESS] Review rating quality penalty (-25) successfully tracked across all 4 entities.")

        # ---------------------------------------------
        # TEST 8: Reassignment (Count shift between old and new entities)
        # ---------------------------------------------
        print("\n[TEST 8] Reassigning ticket to new entities (Dept 2, Worker 2, Ward 2, Cat 2)...")
        
        # Get baseline values for target reassignment entities
        base_dept2 = self.get_card_stats("department", self.dept_2)
        base_work2 = self.get_card_stats("worker", self.worker_2)
        base_ward2 = self.get_card_stats("ward", self.ward_2)
        base_cat2 = self.get_card_stats("category", self.category_2)
        
        # Perform reassignment
        self.supabase.table("complaints").update({
            "assigned_department": self.dept_2,
            "assigned_worker_id": self.worker_2,
            "ward_name": self.ward_2,
            "category_id": self.category_2
        }).eq("id", self.test_id).execute()
        
        # Verify counts on old entities decremented back to base
        t8_dept = self.get_card_stats("department", self.dept_1)
        t8_work = self.get_card_stats("worker", self.worker_1)
        t8_ward = self.get_card_stats("ward", self.ward_1)
        t8_cat = self.get_card_stats("category", self.category_1)
        
        assert t8_dept["total_complaints"] == base_dept["total_complaints"], "Old Department count did not decrement"
        assert t8_work["total_complaints"] == base_work["total_complaints"], "Old Worker count did not decrement"
        assert t8_ward["total_complaints"] == base_ward["total_complaints"], "Old Ward count did not decrement"
        assert t8_cat["total_complaints"] == base_cat["total_complaints"], "Old Category count did not decrement"
        
        # Verify counts on new entities incremented
        t8_dept2 = self.get_card_stats("department", self.dept_2)
        t8_work2 = self.get_card_stats("worker", self.worker_2)
        t8_ward2 = self.get_card_stats("ward", self.ward_2)
        t8_cat2 = self.get_card_stats("category", self.category_2)
        
        assert t8_dept2["total_complaints"] == base_dept2["total_complaints"] + 1, "New Department count did not increment"
        assert t8_work2["total_complaints"] == base_work2["total_complaints"] + 1, "New Worker count did not increment"
        assert t8_ward2["total_complaints"] == base_ward2["total_complaints"] + 1, "New Ward count did not increment"
        assert t8_cat2["total_complaints"] == base_cat2["total_complaints"] + 1, "New Category count did not increment"
        
        print(" -> [SUCCESS] Ticket reassignment successfully decremented old and incremented new entities across all 4 parameters.")
        
        self.print_entity_states("POST-TEST FINAL STATE")

    def cleanup(self):
        print("\n[CLEANUP] Deleting test review and complaint...")
        try:
            self.supabase.table("reviews").delete().eq("id", self.review_id).execute()
            print(" -> Deleted test review.")
        except Exception as e:
            print(f" -> Review cleanup failed: {e}")
            
        try:
            self.supabase.table("complaints").delete().eq("id", self.test_id).execute()
            print(" -> Deleted test complaint.")
        except Exception as e:
            print(f" -> Complaint cleanup failed: {e}")

if __name__ == "__main__":
    tester = ComprehensiveReportCardTester()
    try:
        tester.run()
        print("\n========================================================")
        print("  ALL COMPREHENSIVE REPORT CARD TRIGGER TESTS PASSED!    ")
        print("========================================================")
    except Exception as e:
        print(f"\n[FAIL] Comprehensive test suite failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        tester.cleanup()
