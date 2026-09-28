"""
Bundled Clinical Drug-Drug Interaction Checker.
Evaluates severe and critical drug interactions according to clinical pharmacology guidelines.
"""

from typing import List, Tuple
from app.pipeline.prescription.schemas import DrugInteraction, PrescribedMedication


INTERACTION_RULES: List[Tuple[Tuple[str, ...], Tuple[str, ...], str, str, str]] = [
    (
        ("aspirin", "ecosprin", "disprin"),
        ("warfarin", "coumadin", "clopidogrel", "heparin", "dabigatran", "rivaroxaban"),
        "CRITICAL",
        "Concurrent use of Aspirin and anticoagulants greatly elevates risk of severe gastric hemorrhage and internal bleeding.",
        "Must only be combined under strict continuous monitoring and prescription by your cardiologist."
    ),
    (
        ("metformin", "glycomet"),
        ("contrast", "radiocontrast", "iodinated"),
        "CRITICAL",
        "Metformin combined with radiocontrast imaging dyes poses severe risk of renal impairment and lactic acidosis.",
        "Withhold Metformin 48 hours prior to contrast imaging and re-evaluate kidney function."
    ),
    (
        ("paracetamol", "crocin", "calpol", "dolo", "panadol"),
        ("acetaminophen", "tylenol", "combiflam"),
        "SEVERE",
        "Duplicate paracetamol/acetaminophen components can exceed the 4,000 mg safe daily maximum, leading to acute liver injury.",
        "Do not combine multiple pain or fever medications containing paracetamol."
    ),
    (
        ("lisinopril", "enalapril", "ramipril", "telmisartan", "losartan"),
        ("spironolactone", "potassium", "aldactone"),
        "SEVERE",
        "Combining ACE inhibitors/ARBs with potassium-sparing diuretics may induce life-threatening hyperkalemia (high blood potassium).",
        "Regularly check serum potassium levels with your treating physician."
    ),
    (
        ("sildenafil", "viagra", "tadalafil", "cialis"),
        ("nitroglycerin", "sorbitrate", "isosorbide", "nitrate"),
        "CRITICAL",
        "Co-administration of PDE5 inhibitors and nitrates triggers acute, life-threatening profound systemic hypotension.",
        "Absolute contraindication. Never take together under any circumstances."
    ),
    (
        ("amoxicillin", "ampicillin", "augmentin", "moxikind"),
        ("methotrexate",),
        "SEVERE",
        "Penicillin antibiotics reduce renal clearance of methotrexate, causing increased bone marrow toxicity.",
        "Monitor blood counts and adjust dosing strictly under medical supervision."
    ),
    (
        ("ciprofloxacin", "ciorox", "levofloxacin"),
        ("theophylline", "deriphyllin"),
        "SEVERE",
        "Fluoroquinolones elevate theophylline serum concentrations, risking cardiac arrhythmias and neurotoxicity.",
        "Dose reduction of theophylline and blood level monitoring required."
    ),
    (
        ("atorvastatin", "simvastatin", "rosuvastatin"),
        ("clarithromycin", "erythromycin", "ketoconazole"),
        "SEVERE",
        "Macrolide antibiotics inhibit CYP3A4 metabolism of statins, dramatically increasing risk of rhabdomyolysis (muscle breakdown).",
        "Temporarily hold statin while completing antibiotic course."
    ),
]


def check_drug_interactions(medications: List[PrescribedMedication]) -> List[DrugInteraction]:
    """
    Checks list of prescribed medications for any pairwise severe or critical drug interactions.
    """
    detected_interactions: List[DrugInteraction] = []
    med_names = [m.name.lower().strip() for m in medications]

    for i in range(len(med_names)):
        for j in range(i + 1, len(med_names)):
            name_a = med_names[i]
            name_b = med_names[j]

            for group_a, group_b, severity, desc, advice in INTERACTION_RULES:
                match_a_in_1 = any(drug in name_a for drug in group_a)
                match_b_in_2 = any(drug in name_b for drug in group_b)

                match_a_in_2 = any(drug in name_a for drug in group_b)
                match_b_in_1 = any(drug in name_b for drug in group_a)

                if (match_a_in_1 and match_b_in_2) or (match_a_in_2 and match_b_in_1):
                    detected_interactions.append(
                        DrugInteraction(
                            drug_a=medications[i].name,
                            drug_b=medications[j].name,
                            severity=severity,
                            description=desc,
                            clinical_advice=advice,
                        )
                    )

    return detected_interactions
