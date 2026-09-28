"""
Curated Medical Lab Test Glossary (60 Terms)
Simplified to Grade 5 reading level with everyday analogies for ordinary people.
"""

from typing import List, Dict, Any

CURATED_GLOSSARY: List[Dict[str, Any]] = [
    # --- Hematology / Complete Blood Count (CBC) ---
    {
        "term": "Hemoglobin",
        "aliases": ["hb", "hgb", "haemoglobin", "blood hemoglobin"],
        "category": "Hematology",
        "definition_simple": "Hemoglobin is like small delivery boats inside your red blood cells that carry fresh oxygen from your lungs to every part of your body.",
        "normal_function": "Gives you energy and healthy stamina."
    },
    {
        "term": "RBC Count",
        "aliases": ["rbc", "red blood cell count", "erythrocytes", "red blood cells"],
        "category": "Hematology",
        "definition_simple": "Red blood cells are the fleet of delivery trucks that hold hemoglobin and transport oxygen everywhere.",
        "normal_function": "Keeps your muscles, brain, and organs energized."
    },
    {
        "term": "WBC Count",
        "aliases": ["wbc", "white blood cell count", "total leukocyte count", "tlc", "leukocytes"],
        "category": "Hematology",
        "definition_simple": "White blood cells are your body's personal defense soldiers. They fight off bacteria, viruses, and illnesses.",
        "normal_function": "Protects you from infections and helps you recover when you get sick."
    },
    {
        "term": "Platelet Count",
        "aliases": ["platelets", "plt", "thrombocytes", "platelet count"],
        "category": "Hematology",
        "definition_simple": "Platelets are like tiny sticky band-aids inside your blood. When you get a cut, they plug the leak so you stop bleeding.",
        "normal_function": "Helps your blood clot safely when injured."
    },
    {
        "term": "Hematocrit",
        "aliases": ["pcv", "packed cell volume", "hct"],
        "category": "Hematology",
        "definition_simple": "Hematocrit measures what portion of your blood is made of red blood cells compared to liquid water.",
        "normal_function": "Shows whether your blood has the right thickness and hydration."
    },
    {
        "term": "MCV",
        "aliases": ["mean corpuscular volume"],
        "category": "Hematology",
        "definition_simple": "MCV checks the average physical size of your red blood cells.",
        "normal_function": "Helps your doctor see if your blood cells are normal size, too tiny, or unusually large."
    },
    {
        "term": "MCH",
        "aliases": ["mean corpuscular hemoglobin"],
        "category": "Hematology",
        "definition_simple": "MCH measures the average amount of oxygen-carrying hemoglobin inside each individual red blood cell.",
        "normal_function": "Reflects the color and oxygen capacity of your blood cells."
    },
    {
        "term": "MCHC",
        "aliases": ["mean corpuscular hemoglobin concentration"],
        "category": "Hematology",
        "definition_simple": "MCHC measures how densely packed the hemoglobin is within your red blood cells.",
        "normal_function": "Indicates blood cell concentration."
    },
    {
        "term": "Neutrophils",
        "aliases": ["neutrophil count", "segs", "polys"],
        "category": "Hematology",
        "definition_simple": "Neutrophils are front-line soldier cells that quickly rush to attack sudden bacterial infections.",
        "normal_function": "First responders against bacterial threats."
    },
    {
        "term": "Lymphocytes",
        "aliases": ["lymphocyte count", "lymphs"],
        "category": "Hematology",
        "definition_simple": "Lymphocytes are smart defense cells that recognize and create antibodies to fight viral infections.",
        "normal_function": "Remembers past infections so your body stays immune."
    },
    {
        "term": "Eosinophils",
        "aliases": ["eosinophil count", "eos"],
        "category": "Hematology",
        "definition_simple": "Eosinophils are specialized defense cells that respond to allergies, asthma, or tiny parasites.",
        "normal_function": "Helps your immune system handle allergic reactions."
    },
    {
        "term": "Monocytes",
        "aliases": ["monocyte count", "monos"],
        "category": "Hematology",
        "definition_simple": "Monocytes are garbage-cleanup cells that swallow up dead germs and damaged tissue after an infection.",
        "normal_function": "Cleans up infections and promotes tissue healing."
    },
    {
        "term": "Basophils",
        "aliases": ["basophil count", "basos"],
        "category": "Hematology",
        "definition_simple": "Basophils release histamine signals during allergic reactions, like when you get a bug bite.",
        "normal_function": "Triggers inflammation signals during immune responses."
    },
    {
        "term": "ESR",
        "aliases": ["erythrocyte sedimentation rate", "sed rate"],
        "category": "Hematology",
        "definition_simple": "ESR is a general test measuring how fast red blood cells settle to the bottom of a tube, indicating inflammation in the body.",
        "normal_function": "Shows general swelling or joint/body irritation."
    },

    # --- Blood Sugar / Diabetes ---
    {
        "term": "Fasting Blood Sugar",
        "aliases": ["fbs", "fasting glucose", "fasting blood glucose"],
        "category": "Diabetes",
        "definition_simple": "Fasting blood sugar measures the amount of sweet energy (glucose) in your bloodstream after sleeping and not eating overnight.",
        "normal_function": "Provides fuel for your brain and muscles."
    },
    {
        "term": "Postprandial Blood Sugar",
        "aliases": ["ppbs", "post prandial glucose", "2hr post glucose"],
        "category": "Diabetes",
        "definition_simple": "Postprandial blood sugar measures your blood sugar two hours after eating a normal meal.",
        "normal_function": "Shows how well your body processes sugar from your food."
    },
    {
        "term": "Random Blood Sugar",
        "aliases": ["rbs", "random glucose", "casual blood sugar"],
        "category": "Diabetes",
        "definition_simple": "Random blood sugar checks your sugar level at any unexpected time during the day, regardless of when you last ate.",
        "normal_function": "Quick check of overall glucose levels."
    },
    {
        "term": "HbA1c",
        "aliases": ["glycated hemoglobin", "a1c", "hemoglobin a1c"],
        "category": "Diabetes",
        "definition_simple": "HbA1c gives a 3-month average snapshot of your blood sugar levels, like a report card showing how steady your sugar has been over time.",
        "normal_function": "Long-term monitoring of blood sugar control."
    },

    # --- Kidney Function (Renal) ---
    {
        "term": "Serum Creatinine",
        "aliases": ["creatinine", "creat", "cr"],
        "category": "Renal",
        "definition_simple": "Creatinine is a natural waste product from muscle use. Your kidneys filter it out into urine like a kitchen sieve.",
        "normal_function": "Helps check how cleanly and smoothly your kidneys are filtering waste."
    },
    {
        "term": "Blood Urea Nitrogen",
        "aliases": ["bun", "urea", "blood urea"],
        "category": "Renal",
        "definition_simple": "Urea is waste made when your body breaks down protein from foods like dal, milk, or meat.",
        "normal_function": "Filtered out by healthy kidneys."
    },
    {
        "term": "Uric Acid",
        "aliases": ["serum uric acid", "urate"],
        "category": "Renal",
        "definition_simple": "Uric acid is a waste crystal. If it builds up too high, it can settle in joints (especially the big toe) and cause pain called gout.",
        "normal_function": "Normally passes harmlessly out through the kidneys."
    },
    {
        "term": "eGFR",
        "aliases": ["estimated gfr", "glomerular filtration rate"],
        "category": "Renal",
        "definition_simple": "eGFR is a score of how many milliliters of blood your kidneys clean every minute, like the speed rating of a water filter.",
        "normal_function": "A higher number means strong, healthy filtering power."
    },
    {
        "term": "Urine Albumin",
        "aliases": ["microalbumin", "urine protein", "proteinuria"],
        "category": "Renal",
        "definition_simple": "Albumin is an important protein that should stay inside your bloodstream. If it leaks into urine, the kidney filter may need attention.",
        "normal_function": "Healthy kidneys keep protein inside the blood."
    },

    # --- Liver Function Tests (LFT) ---
    {
        "term": "Total Bilirubin",
        "aliases": ["bilirubin", "t. bilirubin", "serum bilirubin"],
        "category": "Liver",
        "definition_simple": "Bilirubin is a natural yellow pigment made when old red blood cells are recycled. If it rises too high, eyes and skin turn yellowish.",
        "normal_function": "Processed by the liver and passed out safely in bile."
    },
    {
        "term": "Direct Bilirubin",
        "aliases": ["conjugated bilirubin", "d. bilirubin"],
        "category": "Liver",
        "definition_simple": "Direct bilirubin is yellow pigment that the liver has already processed and is ready to send to the digestive tract.",
        "normal_function": "Aids in fat digestion in the intestines."
    },
    {
        "term": "SGOT",
        "aliases": ["ast", "aspartate aminotransferase", "sgot/ast"],
        "category": "Liver",
        "definition_simple": "SGOT is an enzyme found inside liver and heart cells. When cells are irritated, small amounts leak into the blood.",
        "normal_function": "Helps your liver process amino acids and proteins."
    },
    {
        "term": "SGPT",
        "aliases": ["alt", "alanine aminotransferase", "sgpt/alt"],
        "category": "Liver",
        "definition_simple": "SGPT is an enzyme found mostly inside liver cells. It is one of the most direct tests of liver health.",
        "normal_function": "Helps convert food into energy inside the liver."
    },
    {
        "term": "Alkaline Phosphatase",
        "aliases": ["alp", "alk phos"],
        "category": "Liver",
        "definition_simple": "ALP is an enzyme found in the bile ducts of your liver and in growing bones.",
        "normal_function": "Shows whether bile fluid is flowing smoothly without blockage."
    },
    {
        "term": "Serum Albumin",
        "aliases": ["albumin", "s. albumin"],
        "category": "Liver",
        "definition_simple": "Albumin is the main sponge-like protein made by your liver that keeps water from leaking out of blood vessels into your legs or belly.",
        "normal_function": "Prevents swelling and carries nutrients."
    },
    {
        "term": "Total Protein",
        "aliases": ["serum protein", "total serum protein"],
        "category": "Liver",
        "definition_simple": "Total protein measures all the albumin and antibody proteins combined in your bloodstream.",
        "normal_function": "Builds and repairs tissues, muscles, and antibodies."
    },
    {
        "term": "Globulin",
        "aliases": ["serum globulin"],
        "category": "Liver",
        "definition_simple": "Globulin includes immune antibodies and carrier proteins produced by the liver and immune system.",
        "normal_function": "Defends against infections and transports vitamins."
    },

    # --- Lipid Profile (Cholesterol & Fats) ---
    {
        "term": "Total Cholesterol",
        "aliases": ["cholesterol", "serum cholesterol", "chol"],
        "category": "Lipid",
        "definition_simple": "Total cholesterol measures the total amount of waxy, fat-like substances circulating in your blood.",
        "normal_function": "Your body uses cholesterol to build cell walls and hormones, but too much can coat blood vessels."
    },
    {
        "term": "Triglycerides",
        "aliases": ["tg", "trigs", "serum triglycerides"],
        "category": "Lipid",
        "definition_simple": "Triglycerides are the main form of stored energy fat from the food you eat (like oils, sweets, and fried snacks).",
        "normal_function": "Stores energy between meals for your muscles."
    },
    {
        "term": "HDL Cholesterol",
        "aliases": ["hdl", "good cholesterol", "high density lipoprotein"],
        "category": "Lipid",
        "definition_simple": "HDL is known as the 'good helper' cholesterol. It acts like a street sweeper, picking up excess bad fat from arteries and bringing it back to the liver.",
        "normal_function": "Protects your heart and cleans your arteries."
    },
    {
        "term": "LDL Cholesterol",
        "aliases": ["ldl", "bad cholesterol", "low density lipoprotein"],
        "category": "Lipid",
        "definition_simple": "LDL is often called 'bad cholesterol'. If it gets too high, it can slowly stick to blood vessel walls like rust inside a pipe.",
        "normal_function": "Delivers cholesterol to cells, but needs to stay in a healthy range."
    },
    {
        "term": "VLDL Cholesterol",
        "aliases": ["vldl", "very low density lipoprotein"],
        "category": "Lipid",
        "definition_simple": "VLDL is a fat particle that carries triglycerides from your liver out into body tissues.",
        "normal_function": "Transports energy fats to muscles."
    },

    # --- Electrolytes & Minerals ---
    {
        "term": "Sodium",
        "aliases": ["na", "na+", "serum sodium"],
        "category": "Electrolytes",
        "definition_simple": "Sodium is the primary mineral salt that controls water balance throughout your body, blood pressure, and nerve signals.",
        "normal_function": "Keeps your cells hydrated and nerves functioning."
    },
    {
        "term": "Potassium",
        "aliases": ["k", "k+", "serum potassium"],
        "category": "Electrolytes",
        "definition_simple": "Potassium is an essential mineral that controls your heart's rhythm and helps muscles contract smoothly.",
        "normal_function": "Keeps your heartbeat regular and prevents muscle cramps."
    },
    {
        "term": "Chloride",
        "aliases": ["cl", "cl-", "serum chloride"],
        "category": "Electrolytes",
        "definition_simple": "Chloride works hand-in-hand with sodium to keep proper fluid pressure and stomach acid balance.",
        "normal_function": "Maintains stomach acidity and fluid balance."
    },
    {
        "term": "Calcium",
        "aliases": ["ca", "ca++", "serum calcium"],
        "category": "Electrolytes",
        "definition_simple": "Calcium is the building block of strong bones and teeth, and helps your heart pump and blood clot.",
        "normal_function": "Strengthens bones and supports nerve signaling."
    },
    {
        "term": "Phosphorus",
        "aliases": ["phosphate", "po4", "serum phosphorus"],
        "category": "Electrolytes",
        "definition_simple": "Phosphorus partners directly with calcium to create hard, sturdy bones and store energy in cells.",
        "normal_function": "Bone strength and cellular energy storage."
    },
    {
        "term": "Magnesium",
        "aliases": ["mg", "mg++", "serum magnesium"],
        "category": "Electrolytes",
        "definition_simple": "Magnesium is a calming mineral that powers more than 300 enzyme chemical reactions in muscles and nerves.",
        "normal_function": "Relaxes muscles, supports steady heartbeat, and calms nerves."
    },
    {
        "term": "Serum Iron",
        "aliases": ["iron", "fe", "serum fe"],
        "category": "Electrolytes",
        "definition_simple": "Iron is the mineral metal needed by your bone marrow to produce fresh hemoglobin delivery boats.",
        "normal_function": "Essential ingredient for making red blood cells."
    },
    {
        "term": "Serum Ferritin",
        "aliases": ["ferritin", "iron stores"],
        "category": "Electrolytes",
        "definition_simple": "Ferritin is the storage warehouse for iron in your body. It shows how much backup iron you have saved up.",
        "normal_function": "Long-term iron reserve for red blood cell creation."
    },

    # --- Thyroid & Hormones ---
    {
        "term": "TSH",
        "aliases": ["thyroid stimulating hormone", "tsh ultrasensitive"],
        "category": "Thyroid",
        "definition_simple": "TSH is a signal from the brain telling your neck's thyroid butterfly gland how fast to run your body's energy engine.",
        "normal_function": "Controls your metabolic speed, body heat, and heart rate."
    },
    {
        "term": "Free T3",
        "aliases": ["ft3", "triiodothyronine free"],
        "category": "Thyroid",
        "definition_simple": "Free T3 is the active thyroid hormone that directly tells cells how quickly to burn food for warmth and energy.",
        "normal_function": "Active metabolic hormone."
    },
    {
        "term": "Free T4",
        "aliases": ["ft4", "thyroxine free"],
        "category": "Thyroid",
        "definition_simple": "Free T4 is the main hormone released by the thyroid gland, which gets converted into active T3 as needed.",
        "normal_function": "Steadies your body's metabolism."
    },
    {
        "term": "Vitamin D",
        "aliases": ["25-hydroxy vitamin d", "25-oh vit d", "cholecalciferol"],
        "category": "Vitamins",
        "definition_simple": "Vitamin D is the 'sunshine vitamin' that allows your intestines to absorb calcium from food into your bones.",
        "normal_function": "Builds dense bones and strengthens immune defenses."
    },
    {
        "term": "Vitamin B12",
        "aliases": ["cobalamin", "b12", "cyanocobalamin"],
        "category": "Vitamins",
        "definition_simple": "Vitamin B12 is a key vitamin that keeps your nervous system tingling-free and helps make new red blood cells.",
        "normal_function": "Protects nerve coverings and supports clear thinking."
    },

    # --- Cardiac & Coagulation ---
    {
        "term": "Troponin I",
        "aliases": ["troponin", "trop i", "cardiac troponin"],
        "category": "Cardiac",
        "definition_simple": "Troponin is a special protein found only inside heart muscle fibers. If the heart muscle is stressed or injured, it leaks into the blood.",
        "normal_function": "Normally absent or very low in healthy individuals."
    },
    {
        "term": "CK-MB",
        "aliases": ["creatine kinase mb", "ckmb"],
        "category": "Cardiac",
        "definition_simple": "CK-MB is an enzyme released when heart muscle cells undergo severe strain or injury.",
        "normal_function": "Assists with energy production in heart muscle."
    },
    {
        "term": "PT/INR",
        "aliases": ["inr", "prothrombin time", "pt-inr"],
        "category": "Coagulation",
        "definition_simple": "INR measures how many seconds it takes for your blood to form a solid clot compared to standard time.",
        "normal_function": "Monitors blood-thinning balance and prevents dangerous clots."
    },
    {
        "term": "D-Dimer",
        "aliases": ["d dimer", "fibrin degradation"],
        "category": "Coagulation",
        "definition_simple": "D-Dimer measures tiny protein fragments leftover when your body dissolves an old internal blood clot.",
        "normal_function": "Shows whether your body is actively breaking down blood clots."
    },

    # --- Urine Routine ---
    {
        "term": "Urine Protein",
        "aliases": ["urine albumin", "urine dipstick protein"],
        "category": "Urine",
        "definition_simple": "Checks if valuable protein is escaping into your urine instead of staying inside your body.",
        "normal_function": "Healthy urine contains virtually no protein."
    },
    {
        "term": "Urine Sugar",
        "aliases": ["urine glucose"],
        "category": "Urine",
        "definition_simple": "Checks if sugar is spilling over from the blood into urine, which happens when blood glucose is very high.",
        "normal_function": "Normally negative in healthy urine."
    },
    {
        "term": "Urine Pus Cells",
        "aliases": ["urine wbc", "pus cells in urine"],
        "category": "Urine",
        "definition_simple": "Pus cells in urine are white blood cells that went into the urinary tract to fight off bacteria.",
        "normal_function": "Fights urinary bladder or kidney infections."
    },
    {
        "term": "Urine RBC",
        "aliases": ["red blood cells in urine", "hematuria"],
        "category": "Urine",
        "definition_simple": "Checks whether red blood cells are present in urine, which can happen with kidney stones or irritation.",
        "normal_function": "Normally absent from urine."
    },
    {
        "term": "Urine Specific Gravity",
        "aliases": ["sp. gravity", "sg"],
        "category": "Urine",
        "definition_simple": "Specific gravity measures how concentrated or diluted your urine is, showing how much water you drink.",
        "normal_function": "Reflects hydration and kidney concentration ability."
    }
]
